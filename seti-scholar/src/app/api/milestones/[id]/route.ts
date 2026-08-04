import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";

const toggleSchema = z.object({ completed: z.boolean() });

export const PATCH = apiHandler<{ id: string }>(async (req, params) => {
  const userId = await requireUserId();
  const { completed } = await parseBody(req, toggleSchema);
  const milestone = await db.careerMilestone.findFirst({
    where: { id: params.id, userId },
  });
  if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  const updated = await db.careerMilestone.update({
    where: { id: milestone.id },
    data: { completed },
  });
  return NextResponse.json({ milestone: updated });
});
