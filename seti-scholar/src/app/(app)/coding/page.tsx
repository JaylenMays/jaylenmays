import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CodingClient } from "./coding-client";

export const dynamic = "force-dynamic";

export default async function CodingPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [challenges, submissions] = await Promise.all([
    db.codingChallenge.findMany({ orderBy: { sortOrder: "asc" } }),
    db.challengeSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const solved = new Set(
    submissions.filter((s) => s.status === "solved").map((s) => s.challengeId),
  );
  const latestCode = new Map<string, string>();
  for (const s of submissions) {
    if (!latestCode.has(s.challengeId)) latestCode.set(s.challengeId, s.code);
  }

  return (
    <CodingClient
      challenges={challenges.map((c) => ({
        id: c.id,
        key: c.key,
        title: c.title,
        track: c.track,
        prompt: c.prompt,
        starterCode: latestCode.get(c.id) ?? c.starterCode,
        solution: c.solution,
        hints: c.hints,
        solved: solved.has(c.id),
      }))}
    />
  );
}
