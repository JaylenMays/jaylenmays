import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { courseSchema } from "@/lib/schemas";
import { z } from "zod";

const updateSchema = courseSchema.partial().extend({
  sortOrder: z.coerce.number().int().optional(),
});

export const PATCH = apiHandler<{ id: string }>(async (req, params) => {
  const userId = await requireUserId();
  const data = await parseBody(req, updateSchema);

  const course = await db.course.findFirst({
    where: { id: params.id, degreePath: { userId } },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const updated = await db.course.update({
    where: { id: course.id },
    data: {
      ...(data.code !== undefined && { code: data.code }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.credits !== undefined && { credits: data.credits }),
      ...(data.semester !== undefined && { semester: data.semester }),
      ...(data.year !== undefined && { year: data.year }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.grade !== undefined && { grade: data.grade }),
      ...(data.plannedGrade !== undefined && { plannedGrade: data.plannedGrade }),
      ...(data.isTransfer !== undefined && { isTransfer: data.isTransfer }),
      ...(data.isGradPrereq !== undefined && { isGradPrereq: data.isGradPrereq }),
      ...(data.prerequisites !== undefined && { prerequisites: data.prerequisites }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
  return NextResponse.json({ course: updated });
});

export const DELETE = apiHandler<{ id: string }>(async (_req, params) => {
  const userId = await requireUserId();
  const course = await db.course.findFirst({
    where: { id: params.id, degreePath: { userId } },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  await db.course.delete({ where: { id: course.id } });
  return NextResponse.json({ ok: true });
});
