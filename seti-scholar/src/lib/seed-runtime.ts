import type { PrismaClient } from "@prisma/client";
import { ALL_MODULES, CODING_CHALLENGES } from "./seed-content";

/**
 * Idempotently seeds the global learning content (modules, lessons, question
 * banks, coding challenges). Shared by the dev seed script and the
 * /api/jobs/bootstrap endpoint so a fresh production database can be
 * initialized with one authenticated HTTP call — no local tooling needed.
 */
export async function seedGlobalContent(db: PrismaClient) {
  let modules = 0;
  let lessons = 0;
  let questions = 0;

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
    modules++;

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
      lessons++;
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
        questions++;
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

  return { modules, lessons, questions, challenges: CODING_CHALLENGES.length };
}
