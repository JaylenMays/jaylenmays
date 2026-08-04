import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { advisorImportSchema } from "@/lib/schemas";
import { parseAdvisorText, summarizeImport } from "@/lib/advisor-parser";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { text, targetPathId, markCompleted } = await parseBody(req, advisorImportSchema);

  const parsed = parseAdvisorText(text);
  const summary = summarizeImport(parsed);

  const record = await db.advisorImport.create({
    data: { userId, rawText: text, summary },
  });

  let importedCount = 0;
  if (targetPathId && parsed.length > 0) {
    const path = await db.degreePath.findFirst({
      where: { id: targetPathId, userId },
      include: { courses: { select: { code: true, id: true } } },
    });
    if (!path) return NextResponse.json({ error: "Target path not found" }, { status: 404 });

    const existingCodes = new Map(path.courses.map((c) => [c.code, c.id]));
    const maxOrder = await db.course.aggregate({
      where: { degreePathId: path.id },
      _max: { sortOrder: true },
    });
    let order = (maxOrder._max.sortOrder ?? 0) + 1;

    for (const c of parsed) {
      const status = c.grade || markCompleted ? "COMPLETED" : "PLANNED";
      const existingId = existingCodes.get(c.code);
      if (existingId) {
        // Update in place: grades and terms from the advisor report win.
        await db.course.update({
          where: { id: existingId },
          data: {
            grade: c.grade ?? undefined,
            semester: c.semester ?? undefined,
            year: c.year ?? undefined,
            ...(c.grade ? { status: "COMPLETED" as const } : {}),
          },
        });
      } else {
        await db.course.create({
          data: {
            degreePathId: path.id,
            code: c.code,
            title: c.title,
            credits: c.credits,
            grade: c.grade,
            semester: c.semester,
            year: c.year,
            status,
            sortOrder: order++,
          },
        });
      }
      importedCount++;
    }
  }

  return NextResponse.json({
    importId: record.id,
    parsed,
    summary,
    importedCount,
  });
});
