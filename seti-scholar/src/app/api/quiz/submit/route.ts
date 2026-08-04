import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { quizSubmitSchema } from "@/lib/schemas";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { attemptId, answers } = await parseBody(req, quizSubmitSchema);

  const attempt = await db.quizAttempt.findFirst({
    where: { id: attemptId, userId },
  });
  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.completedAt) {
    return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await db.question.findMany({ where: { id: { in: questionIds } } });
  const byId = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  const results = [];
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const isCorrect = a.selectedIndex === q.correctIndex;
    if (isCorrect) score += 1;
    await db.quizAnswer.create({
      data: {
        attemptId,
        questionId: q.id,
        selectedIndex: a.selectedIndex,
        isCorrect,
      },
    });
    results.push({
      questionId: q.id,
      prompt: q.prompt,
      selectedIndex: a.selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
      topic: q.topic,
    });
  }

  await db.quizAttempt.update({
    where: { id: attemptId },
    data: { score, total: answers.length, completedAt: new Date() },
  });

  // Missed questions become spaced-repetition cards automatically (deduped by front text).
  const missed = results.filter((r) => !r.isCorrect);
  for (const m of missed) {
    const q = byId.get(m.questionId)!;
    const front = q.prompt;
    const existing = await db.reviewCard.findFirst({ where: { userId, front } });
    if (!existing) {
      await db.reviewCard.create({
        data: {
          userId,
          front,
          back: `${q.choices[q.correctIndex]}\n\n${q.explanation}`,
          topic: q.topic,
        },
      });
    }
  }

  // Log implied study time (~45s per question).
  await db.studySession.create({
    data: {
      userId,
      minutes: Math.max(1, Math.round((answers.length * 45) / 60)),
      subject: attempt.moduleKey,
    },
  });

  return NextResponse.json({
    score,
    total: answers.length,
    accuracy: answers.length ? Math.round((score / answers.length) * 100) : 0,
    newReviewCards: missed.length,
    results,
  });
});
