import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobRequestAuthorized } from "@/lib/jobs-auth";
import { seedGlobalContent } from "@/lib/seed-runtime";

export const maxDuration = 300;

/**
 * One-call production bootstrap: seeds the global learning content into a
 * fresh database. Idempotent — safe to call again after upgrades to pull in
 * new modules/challenges. Authorize with Bearer JOBS_SECRET, or (for a
 * browser-only first-time setup) GET /api/jobs/bootstrap?token=<JOBS_SECRET>.
 */
async function handle(req: Request) {
  if (!jobRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await seedGlobalContent(db);
  return NextResponse.json({
    ok: true,
    ...result,
    next: "Register an account at /register — it will be auto-provisioned with the official ASU degree plan.",
  });
}

export const GET = handle;
export const POST = handle;
