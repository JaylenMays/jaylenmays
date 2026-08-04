import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { degreePathSchema } from "@/lib/schemas";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, degreePathSchema);
  const path = await db.degreePath.create({
    data: { userId, name: data.name, type: data.type, notes: data.notes },
  });
  return NextResponse.json({ path });
});

const activateSchema = z.object({ pathId: z.string() });

export const PATCH = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { pathId } = await parseBody(req, activateSchema);
  const path = await db.degreePath.findFirst({ where: { id: pathId, userId } });
  if (!path) return NextResponse.json({ error: "Path not found" }, { status: 404 });
  await db.degreePath.updateMany({ where: { userId }, data: { isActive: false } });
  await db.degreePath.update({ where: { id: pathId }, data: { isActive: true } });
  return NextResponse.json({ ok: true });
});

const deleteSchema = z.object({ pathId: z.string() });

export const DELETE = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { pathId } = await parseBody(req, deleteSchema);
  const path = await db.degreePath.findFirst({ where: { id: pathId, userId } });
  if (!path) return NextResponse.json({ error: "Path not found" }, { status: 404 });
  await db.degreePath.delete({ where: { id: pathId } });
  return NextResponse.json({ ok: true });
});
