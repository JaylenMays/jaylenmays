import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { cardSchema, reviewSchema } from "@/lib/schemas";
import { ratingToQuality, sm2Review } from "@/lib/sm2";

/** GET: due cards. POST: record a review rating. PUT: create a card. */
export const GET = apiHandler(async () => {
  const userId = await requireUserId();
  const cards = await db.reviewCard.findMany({
    where: { userId, dueAt: { lte: new Date() } },
    orderBy: { dueAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ cards });
});

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { cardId, rating } = await parseBody(req, reviewSchema);

  const card = await db.reviewCard.findFirst({ where: { id: cardId, userId } });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const next = sm2Review(
    {
      easeFactor: card.easeFactor,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions,
      lapses: card.lapses,
    },
    ratingToQuality(rating),
  );

  await db.reviewCard.update({
    where: { id: card.id },
    data: {
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      lapses: next.lapses,
      dueAt: next.dueAt,
    },
  });
  await db.reviewLog.create({
    data: { cardId: card.id, rating: ratingToQuality(rating) },
  });

  return NextResponse.json({ ok: true, nextDue: next.dueAt, intervalDays: next.intervalDays });
});

export const PUT = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, cardSchema);
  const card = await db.reviewCard.create({
    data: { userId, front: data.front, back: data.back, topic: data.topic },
  });
  return NextResponse.json({ card });
});
