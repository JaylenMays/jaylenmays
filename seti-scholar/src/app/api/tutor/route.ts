import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { tutorMessageSchema } from "@/lib/schemas";
import { buildTutorSystemPrompt, generateTutorReply, type ChatTurn } from "@/lib/ai/provider";
import { weakestTopics } from "@/lib/readiness";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { conversationId, message, context } = await parseBody(req, tutorMessageSchema);

  const [user, settings] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    db.userSettings.findUnique({ where: { userId } }),
  ]);

  let conversation = conversationId
    ? await db.tutorConversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 30 } },
      })
    : null;

  if (!conversation) {
    conversation = await db.tutorConversation.create({
      data: {
        userId,
        title: message.slice(0, 60),
        context: context ?? null,
      },
      include: { messages: true },
    });
  }

  await db.tutorMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  // Pull weak topics from quiz history to personalize the tutor.
  const answers = await db.quizAnswer.findMany({
    where: { attempt: { userId } },
    include: { question: { select: { topic: true } } },
    take: 500,
    orderBy: { id: "desc" },
  });
  const topicMap = new Map<string, { answered: number; correct: number }>();
  for (const a of answers) {
    const t = topicMap.get(a.question.topic) ?? { answered: 0, correct: 0 };
    t.answered += 1;
    if (a.isCorrect) t.correct += 1;
    topicMap.set(a.question.topic, t);
  }
  const weak = weakestTopics(
    [...topicMap.entries()].map(([topic, v]) => ({ topic, ...v })),
  ).map((t) => t.topic);

  const activeCourse = await db.course.findFirst({
    where: { degreePath: { userId, isActive: true }, status: "PREPARING" },
  });

  const history: ChatTurn[] = [
    ...conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const reply = await generateTutorReply({
    provider: (settings?.aiProvider as "anthropic" | "openai" | "offline") ?? "offline",
    model: settings?.aiModel ?? "claude-sonnet-5",
    system: buildTutorSystemPrompt({
      studentName: user.name,
      tutorStyle: settings?.tutorStyle ?? "socratic",
      contextLabel: context ?? conversation.context ?? undefined,
      weakTopics: weak,
      currentCourse: activeCourse ? `${activeCourse.code} ${activeCourse.title}` : undefined,
    }),
    messages: history,
  });

  const saved = await db.tutorMessage.create({
    data: { conversationId: conversation.id, role: "assistant", content: reply.content },
  });
  await db.tutorConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    message: { id: saved.id, role: "assistant", content: reply.content },
    provider: reply.provider,
  });
});
