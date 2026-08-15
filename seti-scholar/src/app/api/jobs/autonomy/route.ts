import { NextResponse } from "next/server";
import { runAutonomyForAllUsers } from "@/lib/agents/autonomy";
import { jobRequestAuthorized } from "@/lib/jobs-auth";

export const maxDuration = 300;

/**
 * Continuous-operation endpoint: builds curricula for upcoming courses,
 * refreshes stale sources, generates remediation lessons for weak topics,
 * schedules the next study session, and posts readiness notices.
 * Schedule alongside /api/jobs/spaced-repetition (cron, Vercel Cron, etc.).
 */
async function handle(req: Request) {
  if (!jobRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reports = await runAutonomyForAllUsers();
  return NextResponse.json({
    ok: true,
    usersProcessed: reports.length,
    curriculaBuilt: reports.flatMap((r) => r.curriculaBuilt),
    sourcesRefreshed: reports.reduce((a, r) => a + r.sourcesRefreshed, 0),
    remediationLessons: reports.reduce((a, r) => a + r.remediationLessons, 0),
    tasksCreated: reports.reduce((a, r) => a + r.tasksCreated, 0),
  });
}

// Vercel Cron invokes GET; manual schedulers may POST.
export const GET = handle;
export const POST = handle;
