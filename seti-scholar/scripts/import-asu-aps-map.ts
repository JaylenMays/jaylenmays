/**
 * Applies the official ASU LAASTPLABS plan (eAdvisor Major Map + DARS audit)
 * to an existing account: replaces the user's APS_BS path with the official
 * course list, records the transfer credits, activates the path, and sets
 * MAT 265 (the first critical requirement, Fall 2026) as the current focus.
 *
 *   npm run import:asu-map            # applies to the demo user
 *   npx tsx scripts/import-asu-aps-map.ts you@example.com
 */

import { PrismaClient } from "@prisma/client";
import { PATH_TEMPLATES } from "../src/lib/roadmap-templates";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? "jaylen@setischolar.dev";
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const template = PATH_TEMPLATES.find((t) => t.type === "APS_BS");
  if (!template) throw new Error("APS_BS template missing");

  // Replace any existing APS path with the official plan.
  await db.degreePath.deleteMany({ where: { userId: user.id, type: "APS_BS" } });
  await db.degreePath.updateMany({ where: { userId: user.id }, data: { isActive: false } });

  const path = await db.degreePath.create({
    data: {
      userId: user.id,
      name: template.name,
      type: "APS_BS",
      isActive: true,
      notes: template.notes,
      courses: {
        create: template.courses.map((c, i) => ({
          code: c.code,
          title: c.title,
          category: c.category,
          credits: c.credits,
          sortOrder: i,
          prerequisites: c.prerequisites,
          prepSubjectKeys: c.prepSubjectKeys,
          isGradPrereq: c.isGradPrereq ?? false,
          semester: c.semester ?? null,
          year: c.year ?? null,
          grade: c.grade ?? null,
          isTransfer: c.isTransfer ?? false,
          status: c.status ?? "PLANNED",
        })),
      },
    },
    include: { courses: true },
  });

  // First critical requirement (Fall 2026) becomes the current focus.
  await db.course.updateMany({
    where: { degreePathId: path.id, code: "MAT 265" },
    data: { status: "PREPARING" },
  });

  const transfer = path.courses.filter((c) => c.isTransfer).length;
  console.log(
    `Applied official ASU APS (Astrophysics) plan for ${email}: ` +
      `${path.courses.length} rows (${transfer} transfer credits), active path set, MAT 265 in focus.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
