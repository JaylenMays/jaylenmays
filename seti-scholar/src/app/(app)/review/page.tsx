import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [due, upcoming, total] = await Promise.all([
    db.reviewCard.findMany({
      where: { userId, dueAt: { lte: new Date() } },
      orderBy: { dueAt: "asc" },
      take: 50,
    }),
    db.reviewCard.count({ where: { userId, dueAt: { gt: new Date() } } }),
    db.reviewCard.count({ where: { userId } }),
  ]);

  return (
    <ReviewClient
      dueCards={due.map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        topic: c.topic,
        intervalDays: c.intervalDays,
      }))}
      upcomingCount={upcoming}
      totalCount={total}
    />
  );
}
