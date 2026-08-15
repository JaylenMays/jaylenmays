import { db } from "./db";
import { DEFAULT_CAREER_MILESTONES, PATH_TEMPLATES } from "./roadmap-templates";
import { STARTER_CARDS } from "./seed-content";

/**
 * Sets up a brand-new user with editable degree paths, career milestones,
 * starter review cards, a default research project, and initial study tasks.
 */
export async function provisionNewUser(userId: string) {
  await db.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const existingPaths = await db.degreePath.count({ where: { userId } });
  if (existingPaths === 0) {
    for (const tpl of PATH_TEMPLATES) {
      await db.degreePath.create({
        data: {
          userId,
          name: tpl.name,
          type: tpl.type,
          isActive: tpl.isActive,
          notes: tpl.notes,
          courses: {
            create: tpl.courses.map((c, i) => ({
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
      });
    }
  }

  const existingMilestones = await db.careerMilestone.count({ where: { userId } });
  if (existingMilestones === 0) {
    await db.careerMilestone.createMany({
      data: DEFAULT_CAREER_MILESTONES.map((m, i) => ({
        userId,
        title: m.title,
        description: m.description,
        sortOrder: i,
      })),
    });
  }

  const existingCards = await db.reviewCard.count({ where: { userId } });
  if (existingCards === 0) {
    await db.reviewCard.createMany({
      data: STARTER_CARDS.map((c) => ({
        userId,
        front: c.front,
        back: c.back,
        topic: c.topic,
      })),
    });
  }

  const existingProjects = await db.researchProject.count({ where: { userId } });
  if (existingProjects === 0) {
    await db.researchProject.create({
      data: {
        userId,
        title: "Breakthrough Listen open-data drift search",
        area: "technosignatures",
        description:
          "Download one public Breakthrough Listen cadence, load it with blimpy, run a de-doppler drift search (e.g. turboSETI), and validate candidates with on/off logic. Deliverable: a short write-up with waterfall plots.",
        milestones: [
          { title: "Set up Python environment (numpy, blimpy, turboSETI)", done: false },
          { title: "Download one ON/OFF cadence from the open archive", done: false },
          { title: "Plot waterfalls for all six pointings", done: false },
          { title: "Run drift search and collect hits", done: false },
          { title: "Apply on/off RFI rejection to hits", done: false },
          { title: "Write up results with figures", done: false },
        ],
      },
    });
  }

  const existingTasks = await db.studyTask.count({ where: { userId } });
  if (existingTasks === 0) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    await db.studyTask.createMany({
      data: [
        { userId, title: "Take the Algebra & Functions diagnostic quiz", kind: "quiz", dueAt: new Date(now + day) },
        { userId, title: "Complete 'Limits & Mathematical Notation'", kind: "study", dueAt: new Date(now + 2 * day) },
        { userId, title: "First spaced-repetition review session", kind: "review", dueAt: new Date(now + day) },
        { userId, title: "Paste your advisor course list into Advisor Import", kind: "study", dueAt: new Date(now + 7 * day) },
      ],
    });
  }
}
