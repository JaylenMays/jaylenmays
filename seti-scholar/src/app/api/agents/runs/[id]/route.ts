import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler<{ id: string }>(async (_req, params) => {
  const userId = await requireUserId();
  const run = await db.pipelineRun.findFirst({ where: { id: params.id, userId } });
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  return NextResponse.json({ run });
});
