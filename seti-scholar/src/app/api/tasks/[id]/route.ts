import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";

const toggleSchema = z.object({ completed: z.boolean() });

export const PATCH = apiHandler<{ id: string }>(async (req, params) => {
  const userId = await requireUserId();
  const { completed } = await parseBody(req, toggleSchema);
  const task = await db.studyTask.findFirst({ where: { id: params.id, userId } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const updated = await db.studyTask.update({
    where: { id: task.id },
    data: { completed },
  });
  return NextResponse.json({ task: updated });
});
