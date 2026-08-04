import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_MODULES, CODING_CHALLENGES } from "../src/lib/seed-content";
import { provisionNewUser } from "../src/lib/provision";

const db = new PrismaClient();

async function seedContent() {
  for (const mod of ALL_MODULES) {
    const module = await db.prepModule.upsert({
      where: { key: mod.key },
      update: {
        title: mod.title,
        description: mod.description,
        category: mod.category,
        sortOrder: mod.sortOrder,
      },
      create: {
        key: mod.key,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        sortOrder: mod.sortOrder,
      },
    });

    for (const [i, lesson] of mod.lessons.entries()) {
      await db.lesson.upsert({
        where: { slug: lesson.slug },
        update: {
          title: lesson.title,
          objectives: lesson.objectives,
          content: lesson.content,
          estimatedMinutes: lesson.minutes,
          sortOrder: i,
          moduleId: module.id,
        },
        create: {
          moduleId: module.id,
          slug: lesson.slug,
          title: lesson.title,
          objectives: lesson.objectives,
          content: lesson.content,
          estimatedMinutes: lesson.minutes,
          sortOrder: i,
        },
      });
    }

    const existingQuestions = await db.question.count({ where: { moduleId: module.id } });
    if (existingQuestions === 0) {
      for (const q of mod.questions) {
        const lesson = q.lessonSlug
          ? await db.lesson.findUnique({ where: { slug: q.lessonSlug } })
          : null;
        await db.question.create({
          data: {
            moduleId: module.id,
            lessonId: lesson?.id,
            prompt: q.prompt,
            choices: q.choices,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic: q.topic,
          },
        });
      }
    }
  }

  for (const ch of CODING_CHALLENGES) {
    await db.codingChallenge.upsert({
      where: { key: ch.key },
      update: {
        title: ch.title,
        track: ch.track,
        prompt: ch.prompt,
        starterCode: ch.starterCode,
        solution: ch.solution,
        hints: ch.hints,
        sortOrder: ch.sortOrder,
      },
      create: {
        key: ch.key,
        title: ch.title,
        track: ch.track,
        prompt: ch.prompt,
        starterCode: ch.starterCode,
        solution: ch.solution,
        hints: ch.hints,
        sortOrder: ch.sortOrder,
      },
    });
  }
}

async function seedDemoUser() {
  const email = "jaylen@setischolar.dev";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash("ad-astra-2026", 12);
  const user = await db.user.create({
    data: { name: "Jaylen Mays", email, passwordHash },
  });
  await provisionNewUser(user.id);
  console.log(`Demo user: ${email} / ad-astra-2026`);
  return user;
}

async function main() {
  console.log("Seeding learning content...");
  await seedContent();
  console.log("Seeding demo user...");
  await seedDemoUser();
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
