import "server-only";

/**
 * Course Builder pipeline — the required review chain:
 *
 *   Source Discovery → Source Verification → Curriculum Design →
 *   Lesson Generation → Assessment Generation → Mathematical Validation →
 *   Scientific Accuracy Review → Citation Validation → Publication
 *
 * Independence rule enforced structurally: the Lesson Writer and the
 * Scientific Accuracy Reviewer are distinct agents, and the reviewer throws
 * if asked to review its own writing.
 */

import { db } from "@/lib/db";
import { findProfile } from "./catalog";
import { purchaseLookupUrl } from "./access-policy";
import {
  runSourceDiscovery,
  runSourceVerification,
  runCurriculumArchitect,
  runLessonWriter,
  runAssessmentGenerator,
  runMathValidator,
  runAccuracyReviewer,
  runCitationAgent,
  AGENT_LESSON_WRITER,
  AGENT_ACCURACY_REVIEWER,
  type PipelineContext,
} from "./agents";

interface StageDef {
  key: string;
  title: string;
  run: (ctx: PipelineContext) => Promise<void>;
}

const STAGES: StageDef[] = [
  { key: "source-discovery", title: "Source Discovery", run: runSourceDiscovery },
  { key: "source-verification", title: "Source Verification", run: runSourceVerification },
  { key: "curriculum-design", title: "Curriculum Design", run: runCurriculumArchitect },
  { key: "lesson-generation", title: "Lesson Generation", run: runLessonWriter },
  { key: "assessment-generation", title: "Assessment Generation", run: runAssessmentGenerator },
  { key: "math-validation", title: "Mathematical Validation", run: runMathValidator },
  { key: "accuracy-review", title: "Scientific Accuracy Review", run: runAccuracyReviewer },
  { key: "citation-validation", title: "Citation Validation", run: runCitationAgent },
];

// Structural independence check at module load: writer and reviewer must differ.
if ((AGENT_LESSON_WRITER as string) === (AGENT_ACCURACY_REVIEWER as string)) {
  throw new Error("Pipeline misconfiguration: lesson writer must not be its own reviewer");
}

export async function runCourseBuilder(userId: string, courseCode: string): Promise<string> {
  const course = await db.course.findFirst({
    where: { code: courseCode, degreePath: { userId } },
  });
  const courseTitle = course?.title ?? courseCode;

  const run = await db.pipelineRun.create({
    data: { userId, courseCode, status: "running", currentStage: STAGES[0].key },
  });

  const logEntries: { stage: string; agent: string; status: string; summary: string; at: string }[] = [];
  let currentStageKey = STAGES[0].key;

  const ctx: PipelineContext = {
    userId,
    courseCode,
    courseTitle,
    // Deterministic per user+course so rebuilding reproduces the same problems.
    seed: hashCode(`${userId}:${courseCode}`),
    profile: findProfile(courseCode, courseTitle),
    candidates: [],
    verified: [],
    selected: [],
    rejectedCount: 0,
    networkCount: 0,
    objectives: [],
    prereqConcepts: [],
    weakTopics: [],
    lessons: [],
    log: async (agent, status, summary) => {
      logEntries.push({ stage: currentStageKey, agent, status, summary, at: new Date().toISOString() });
      await db.pipelineRun.update({
        where: { id: run.id },
        data: { log: logEntries, currentStage: currentStageKey },
      });
    },
  };

  try {
    for (const stage of STAGES) {
      currentStageKey = stage.key;
      await db.pipelineRun.update({
        where: { id: run.id },
        data: { currentStage: stage.key },
      });
      await stage.run(ctx);
    }

    // Publication stage.
    currentStageKey = "publication";
    await publish(ctx, run.id);
    await ctx.log("publication", "passed", `Curriculum published: ${ctx.lessons.length} units, ${ctx.selected.length} cited sources, ${ctx.profile.books.length} book recommendations.`);

    await db.pipelineRun.update({
      where: { id: run.id },
      data: { status: "completed", completedAt: new Date(), log: logEntries },
    });
  } catch (err) {
    await db.pipelineRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown pipeline error",
        completedAt: new Date(),
        log: logEntries,
      },
    });
    throw err;
  }

  return run.id;
}

async function publish(ctx: PipelineContext, runId: string): Promise<void> {
  const sourceRows = await db.source.findMany({
    where: { url: { in: ctx.selected.map((s) => s.url) }, subject: ctx.profile.key },
  });
  const sourceIdByUrl = new Map(sourceRows.map((s) => [s.url, s.id]));

  // Upsert so a rebuild replaces content but keeps a stable curriculum id
  // (open links and history survive a rebuild).
  const curriculum = await db.curriculum.upsert({
    where: { userId_courseCode: { userId: ctx.userId, courseCode: ctx.courseCode } },
    create: {
      userId: ctx.userId,
      courseCode: ctx.courseCode,
      courseTitle: ctx.courseTitle,
      status: "published",
      objectives: ctx.objectives,
      prereqConcepts: ctx.prereqConcepts,
      sourceIds: sourceRows.map((s) => s.id),
      runId,
    },
    update: {
      courseTitle: ctx.courseTitle,
      status: "published",
      objectives: ctx.objectives,
      prereqConcepts: ctx.prereqConcepts,
      sourceIds: sourceRows.map((s) => s.id),
      runId,
    },
  });
  // Replace prior generated content wholesale.
  await db.curriculumLesson.deleteMany({ where: { curriculumId: curriculum.id } });
  await db.bookRecommendation.deleteMany({ where: { curriculumId: curriculum.id } });
  await db.contradiction.deleteMany({ where: { curriculumId: curriculum.id } });

  // Lessons in pedagogical order: diagnostic first, lessons, readiness exam last.
  const ordered = [
    ...ctx.lessons.filter((l) => l.kind === "diagnostic"),
    ...ctx.lessons.filter((l) => l.kind === "lesson" || l.kind === "remediation"),
    ...ctx.lessons.filter((l) => l.kind === "readiness_exam"),
  ];

  for (const [i, lesson] of ordered.entries()) {
    const created = await db.curriculumLesson.create({
      data: {
        curriculumId: curriculum.id,
        orderIdx: i,
        kind: lesson.kind,
        title: lesson.title,
        objectives: lesson.objectives,
        prereqConcepts: lesson.prereqConcepts,
        originalExplanation: lesson.originalExplanation,
        formalExplanation: lesson.formalExplanation,
        workedExamples: lesson.workedExamples as unknown as object,
        practiceProblems: lesson.practiceProblems.map((p) => ({
          prompt: p.prompt,
          answer: p.answer,
          solution: p.solution,
          validated: p.validated,
          difficulty: p.difficulty,
        })) as unknown as object,
        commonMistakes: lesson.commonMistakes,
        setiApplication: lesson.setiApplication,
        masteryCriteria: lesson.masteryCriteria,
        followUp: lesson.followUp as unknown as object,
        qualityScore: lesson.qualityScore,
        reviewStatus: lesson.reviewStatus,
        reviewNotes: lesson.reviewNotes,
        writtenBy: lesson.writtenBy,
        reviewedBy: lesson.reviewedBy,
      },
    });
    for (const c of lesson.citations) {
      const sourceId = sourceIdByUrl.get(c.sourceUrl);
      if (sourceId) {
        await db.lessonCitation.create({
          data: { lessonId: created.id, sourceId, note: c.note },
        });
      }
    }
  }

  // Book recommendations, with legitimate purchase/library paths for
  // commercial titles (never links to unauthorized copies).
  for (const book of ctx.profile.books) {
    await db.bookRecommendation.create({
      data: {
        curriculumId: curriculum.id,
        title: book.title,
        author: book.author,
        edition: book.edition,
        year: book.year,
        subject: book.subject,
        difficulty: book.difficulty,
        prereqLevel: book.prereqLevel,
        url: book.url,
        license: book.license,
        accessStatus: book.accessStatus,
        openFullText: book.openFullText,
        relevantChapters: book.relevantChapters,
        rationale: book.rationale,
        role: book.role,
        purchasePath: book.openFullText ? "" : purchaseLookupUrl(book.title, book.author),
      },
    });
  }

  // Documented disagreements between sources, with explanations.
  for (const c of ctx.profile.contradictions) {
    await db.contradiction.create({
      data: {
        curriculumId: curriculum.id,
        topic: c.topic,
        description: c.description,
        resolution: c.resolution,
        sourceATitle: c.sourceATitle,
        sourceBTitle: c.sourceBTitle,
      },
    });
  }
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
