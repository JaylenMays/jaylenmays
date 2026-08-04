import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { submissionSchema } from "@/lib/schemas";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, submissionSchema);
  const challenge = await db.codingChallenge.findUnique({ where: { id: data.challengeId } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const submission = await db.challengeSubmission.create({
    data: {
      userId,
      challengeId: challenge.id,
      code: data.code,
      status: data.status,
    },
  });

  if (data.status === "solved") {
    await db.studySession.create({
      data: { userId, minutes: 15, subject: `coding:${challenge.track}` },
    });
  }

  return NextResponse.json({ submission });
});
