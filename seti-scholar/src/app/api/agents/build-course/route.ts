import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { runCourseBuilder } from "@/lib/agents/pipeline";

export const maxDuration = 300;

const buildSchema = z.object({ courseCode: z.string().min(2).max(20) });

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { courseCode } = await parseBody(req, buildSchema);
  const runId = await runCourseBuilder(userId, courseCode);
  return NextResponse.json({ runId });
});
