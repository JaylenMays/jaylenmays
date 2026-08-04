import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";

const startSchema = z.object({
  moduleKey: z.string().min(1),
  mode: z.enum(["practice", "quiz", "exam"]).default("quiz"),
  count: z.coerce.number().int().min(1).max(50).default(10),
});

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { moduleKey, mode, count } = await parseBody(req, startSchema);

  let questions;
  if (moduleKey === "__all__") {
    questions = await db.question.findMany({});
  } else {
    const module = await db.prepModule.findUnique({
      where: { key: moduleKey },
      include: { questions: true },
    });
    if (!module) return NextResponse.json({ error: "Unknown module" }, { status: 404 });
    questions = module.questions;
  }
  if (questions.length === 0) {
    return NextResponse.json({ error: "No questions available" }, { status: 404 });
  }

  // In exam mode prioritize the user's weak topics: previously missed questions first.
  const missed = await db.quizAnswer.findMany({
    where: { attempt: { userId }, isCorrect: false },
    select: { questionId: true },
  });
  const missedIds = new Set(missed.map((m) => m.questionId));

  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  if (mode === "exam") {
    shuffled.sort((a, b) => Number(missedIds.has(b.id)) - Number(missedIds.has(a.id)));
  }
  const selected = shuffled.slice(0, count);

  const attempt = await db.quizAttempt.create({
    data: { userId, moduleKey, mode, total: selected.length },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    mode,
    questions: selected.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices,
      topic: q.topic,
      difficulty: q.difficulty,
      // Practice mode reveals answers for instant per-question feedback;
      // quiz/exam answers stay server-side until submission.
      ...(mode === "practice"
        ? { correctIndex: q.correctIndex, explanation: q.explanation }
        : {}),
    })),
  });
});
