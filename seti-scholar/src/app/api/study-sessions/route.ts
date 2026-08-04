import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { studySessionSchema } from "@/lib/schemas";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, studySessionSchema);
  const session = await db.studySession.create({
    data: { userId, minutes: data.minutes, subject: data.subject },
  });
  return NextResponse.json({ session });
});
