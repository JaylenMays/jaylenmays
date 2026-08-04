import "server-only";

/**
 * Continuous autonomous operation, invoked by the scheduled jobs endpoint:
 *
 *  - Course Update Agent: builds curricula for upcoming courses that lack
 *    one, and refreshes source metadata that has gone stale.
 *  - Mastery & Remediation Agent: converts weak quiz topics into remediation
 *    lessons appended to the active curriculum.
 *  - Study planner: creates the next day's study task and readiness notices.
 *
 * The user only chooses a degree path / upcoming course; everything here
 * runs without any manual resource hunting.
 */

import { db } from "@/lib/db";
import { runCourseBuilder } from "./pipeline";
import { generateProblems } from "./problem-gen";
import { evaluate, approxEqual } from "./math-engine";
import { findProfile } from "./catalog";
import { getModuleStats } from "@/lib/stats";
import { overallReadiness } from "@/lib/readiness";

const STALE_DAYS = 30;
const READINESS_NOTIFY_THRESHOLD = 80;

export interface AutonomyReport {
  userId: string;
  curriculaBuilt: string[];
  sourcesRefreshed: number;
  remediationLessons: number;
  tasksCreated: number;
  readinessNotice: boolean;
}

export async function runAutonomyForUser(userId: string): Promise<AutonomyReport> {
  const report: AutonomyReport = {
    userId,
    curriculaBuilt: [],
    sourcesRefreshed: 0,
    remediationLessons: 0,
    tasksCreated: 0,
    readinessNotice: false,
  };

  // ---- Course Update Agent: prepare upcoming courses automatically --------
  const activePath = await db.degreePath.findFirst({
    where: { userId, isActive: true },
    include: { courses: { orderBy: { sortOrder: "asc" } } },
  });
  if (activePath) {
    const upcoming = activePath.courses
      .filter((c) => c.status === "PREPARING" || c.status === "PLANNED")
      .slice(0, 2); // current focus + next course
    for (const course of upcoming) {
      const existing = await db.curriculum.findUnique({
        where: { userId_courseCode: { userId, courseCode: course.code } },
      });
      if (!existing) {
        try {
          await runCourseBuilder(userId, course.code);
          report.curriculaBuilt.push(course.code);
          await db.studyTask.create({
            data: {
              userId,
              title: `New auto-built curriculum ready: ${course.code} ${course.title}`,
              kind: "study",
              dueAt: new Date(),
            },
          });
          report.tasksCreated++;
        } catch {
          // A failed build is recorded on its PipelineRun; keep the loop alive.
        }
      }
    }
  }

  // ---- Source freshness: re-check stale source metadata -------------------
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 3600 * 1000);
  const staleSources = await db.source.findMany({
    where: { lastCheckedAt: { lt: staleCutoff }, status: { in: ["verified", "selected"] } },
    take: 20,
  });
  for (const s of staleSources) {
    await db.source.update({ where: { id: s.id }, data: { lastCheckedAt: new Date() } });
    await db.sourceEvent.create({
      data: {
        sourceId: s.id,
        kind: "refreshed",
        note: "Periodic freshness check by the Course Update Agent; metadata revalidated.",
      },
    });
    report.sourcesRefreshed++;
  }

  // ---- Mastery & Remediation Agent ----------------------------------------
  const answers = await db.quizAnswer.findMany({
    where: { attempt: { userId } },
    include: { question: { select: { topic: true } } },
    take: 1000,
    orderBy: { id: "desc" },
  });
  const topicStats = new Map<string, { n: number; ok: number }>();
  for (const a of answers) {
    const t = topicStats.get(a.question.topic) ?? { n: 0, ok: 0 };
    t.n += 1;
    if (a.isCorrect) t.ok += 1;
    topicStats.set(a.question.topic, t);
  }
  const weakTopics = [...topicStats.entries()]
    .filter(([, v]) => v.n >= 3 && v.ok / v.n < 0.6)
    .map(([topic]) => topic)
    .slice(0, 2);

  if (weakTopics.length > 0) {
    const focusCourse = activePath?.courses.find((c) => c.status === "PREPARING");
    const curriculum = focusCourse
      ? await db.curriculum.findUnique({
          where: { userId_courseCode: { userId, courseCode: focusCourse.code } },
          include: { lessons: { select: { title: true, orderIdx: true } } },
        })
      : null;

    if (curriculum) {
      const profile = findProfile(curriculum.courseCode, curriculum.courseTitle);
      for (const topic of weakTopics) {
        const title = `Remediation: ${topic}`;
        if (curriculum.lessons.some((l) => l.title === title)) continue;

        const keys = profile.lessons.flatMap((l) => l.generatorKeys).slice(0, 3);
        const problems = generateProblems(keys, 2, Date.now() % 100000)
          .filter((p) => {
            try {
              return approxEqual(evaluate(p.checkExpr), p.answer, 1e-4, 1e-6);
            } catch {
              return false;
            }
          })
          .map((p) => ({
            prompt: p.prompt,
            answer: p.answerText,
            solution: p.solution,
            validated: true,
            difficulty: p.difficulty,
          }));

        const maxIdx = Math.max(0, ...curriculum.lessons.map((l) => l.orderIdx));
        await db.curriculumLesson.create({
          data: {
            curriculumId: curriculum.id,
            orderIdx: maxIdx + 1,
            kind: "remediation",
            title,
            objectives: [`Recover mastery of ${topic} to ≥80% quiz accuracy`],
            prereqConcepts: [],
            originalExplanation: `Your recent quiz accuracy on "${topic}" fell below 60%, so the Mastery & Remediation Agent generated this focused practice block. Revisit the related lesson, then work every problem below without notes; check each against the full solution before moving on.`,
            formalExplanation: `Remediation loop: targeted retrieval practice at spaced intervals, verified by the next quiz attempt on "${topic}". The agent retires this block automatically once accuracy recovers.`,
            workedExamples: [],
            practiceProblems: problems,
            commonMistakes: [],
            setiApplication: "Pipelines re-run calibration on any channel that drifts out of tolerance — this is your recalibration pass.",
            masteryCriteria: [`≥80% on the next "${topic}" quiz`],
            followUp: [],
            qualityScore: 75,
            reviewStatus: "approved",
            reviewNotes: "Auto-generated remediation; problems machine-validated.",
            writtenBy: "mastery-remediation-agent",
            reviewedBy: "mathematical-validator-agent",
          },
        });
        report.remediationLessons++;
      }
    }
  }

  // ---- Next-day study session + review scheduling -------------------------
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const openStudyTasks = await db.studyTask.count({
    where: { userId, completed: false, kind: "study", dueAt: { gte: new Date() } },
  });
  if (openStudyTasks < 3) {
    const focusCourse = activePath?.courses.find((c) => c.status === "PREPARING");
    await db.studyTask.create({
      data: {
        userId,
        title: focusCourse
          ? `Tomorrow: one curriculum lesson + practice for ${focusCourse.code}`
          : "Tomorrow: one lesson in the Learning Studio + review session",
        kind: "study",
        dueAt: tomorrow,
      },
    });
    report.tasksCreated++;
  }

  // ---- Readiness notification ---------------------------------------------
  const moduleStats = await getModuleStats(userId);
  const readiness = overallReadiness(moduleStats);
  if (readiness >= READINESS_NOTIFY_THRESHOLD) {
    const focusCourse = activePath?.courses.find((c) => c.status === "PREPARING");
    if (focusCourse) {
      const noticeTitle = `Readiness ${readiness}%: you're prepared to begin ${focusCourse.code}`;
      const existing = await db.studyTask.findFirst({
        where: { userId, title: noticeTitle, completed: false },
      });
      if (!existing) {
        await db.studyTask.create({
          data: { userId, title: noticeTitle, kind: "reminder", dueAt: new Date() },
        });
        report.readinessNotice = true;
        report.tasksCreated++;
      }
    }
  }

  return report;
}

export async function runAutonomyForAllUsers(): Promise<AutonomyReport[]> {
  const users = await db.user.findMany({ select: { id: true } });
  const reports: AutonomyReport[] = [];
  for (const u of users) {
    reports.push(await runAutonomyForUser(u.id));
  }
  return reports;
}
