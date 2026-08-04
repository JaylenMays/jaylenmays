import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { courseSchema } from "@/lib/schemas";

const addSchema = courseSchema.extend({ pathId: z.string() });

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, addSchema);
  const path = await db.degreePath.findFirst({ where: { id: data.pathId, userId } });
  if (!path) return NextResponse.json({ error: "Path not found" }, { status: 404 });

  const max = await db.course.aggregate({
    where: { degreePathId: path.id },
    _max: { sortOrder: true },
  });

  const course = await db.course.create({
    data: {
      degreePathId: path.id,
      code: data.code,
      title: data.title,
      category: data.category,
      credits: data.credits,
      semester: data.semester ?? null,
      year: data.year ?? null,
      status: data.status,
      grade: data.grade ?? null,
      plannedGrade: data.plannedGrade ?? null,
      isTransfer: data.isTransfer,
      isGradPrereq: data.isGradPrereq,
      prerequisites: data.prerequisites,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json({ course });
});
