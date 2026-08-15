import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobRequestAuthorized } from "@/lib/jobs-auth";

/**
 * Scheduled-job endpoint (call from cron, GitHub Actions, or `npm run
 * jobs:spaced-repetition`). For every user with reminders enabled it creates a
 * review StudyTask when cards are due, keeping the spaced-repetition loop alive
 * without requiring Redis. Authorized via the JOBS_SECRET bearer token.
 */
async function handle(req: Request) {
  if (!jobRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    include: { settings: true },
  });

  let created = 0;
  for (const user of users) {
    if (user.settings && !user.settings.remindersEnabled) continue;

    const dueCount = await db.reviewCard.count({
      where: { userId: user.id, dueAt: { lte: new Date() } },
    });
    if (dueCount === 0) continue;

    // One open reminder at a time per user.
    const openReminder = await db.studyTask.findFirst({
      where: { userId: user.id, kind: "review", completed: false },
    });
    if (openReminder) {
      await db.studyTask.update({
        where: { id: openReminder.id },
        data: { title: `Review ${dueCount} due card${dueCount === 1 ? "" : "s"}` },
      });
      continue;
    }

    await db.studyTask.create({
      data: {
        userId: user.id,
        title: `Review ${dueCount} due card${dueCount === 1 ? "" : "s"}`,
        kind: "review",
        dueAt: new Date(),
      },
    });
    created++;
  }

  return NextResponse.json({ ok: true, usersProcessed: users.length, remindersCreated: created });
}

// Vercel Cron invokes GET; manual schedulers may POST.
export const GET = handle;
export const POST = handle;
