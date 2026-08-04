import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RoadmapClient } from "./roadmap-client";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const session = await auth();
  const paths = await db.degreePath.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
    include: { courses: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <RoadmapClient
      paths={paths.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isActive: p.isActive,
        notes: p.notes,
        courses: p.courses.map((c) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          category: c.category,
          credits: c.credits,
          semester: c.semester,
          year: c.year,
          sortOrder: c.sortOrder,
          status: c.status,
          grade: c.grade,
          plannedGrade: c.plannedGrade,
          isTransfer: c.isTransfer,
          isGradPrereq: c.isGradPrereq,
          prerequisites: c.prerequisites,
        })),
      }))}
    />
  );
}
