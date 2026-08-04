import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";

const progressSchema = z.object({
  status: z.enum(["in_progress", "completed"]),
  secondsSpent: z.coerce.number().int().min(0).max(60 * 60 * 8).default(0),
});

export const POST = apiHandler<{ slug: string }>(async (req, params) => {
  const userId = await requireUserId();
  const { status, secondsSpent } = await parseBody(req, progressSchema);

  const lesson = await db.lesson.findUnique({ where: { slug: params.slug } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const progress = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    create: {
      userId,
      lessonId: lesson.id,
      status,
      secondsSpent,
      completedAt: status === "completed" ? new Date() : null,
    },
    update: {
      status,
      secondsSpent: { increment: secondsSpent },
      completedAt: status === "completed" ? new Date() : undefined,
    },
  });

  if (status === "completed") {
    await db.studySession.create({
      data: {
        userId,
        minutes: Math.max(5, Math.round(lesson.estimatedMinutes / 2)),
        subject: params.slug,
      },
    });
  }

  return NextResponse.json({ progress });
});
