import "server-only";
import { db } from "@/lib/db";
import {
  moduleReadiness,
  overallReadiness,
  readinessByCategory,
  studyStreak,
  weakestTopics,
  type ModuleStats,
  type TopicAccuracy,
} from "@/lib/readiness";
import { gpaFor, projectedGpa } from "@/lib/gpa";

export async function getModuleStats(userId: string): Promise<ModuleStats[]> {
  const modules = await db.prepModule.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: { select: { id: true } },
      questions: { select: { id: true } },
    },
  });

  const [progress, answers, attempts] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId, status: "completed" }, select: { lessonId: true } }),
    db.quizAnswer.findMany({
      where: { attempt: { userId } },
      select: { questionId: true, isCorrect: true },
    }),
    db.quizAttempt.findMany({ where: { userId }, select: { moduleKey: true } }),
  ]);
  void attempts;

  const completedLessonIds = new Set(progress.map((p) => p.lessonId));
  const answersByQuestion = answers;

  return modules.map((m) => {
    const questionIds = new Set(m.questions.map((q) => q.id));
    const moduleAnswers = answersByQuestion.filter((a) => questionIds.has(a.questionId));
    return {
      moduleKey: m.key,
      category: m.category,
      lessonsTotal: m.lessons.length,
      lessonsCompleted: m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
      quizQuestionsAnswered: moduleAnswers.length,
      quizQuestionsCorrect: moduleAnswers.filter((a) => a.isCorrect).length,
    };
  });
}

export async function getTopicAccuracy(userId: string): Promise<TopicAccuracy[]> {
  const answers = await db.quizAnswer.findMany({
    where: { attempt: { userId } },
    include: { question: { select: { topic: true } } },
  });
  const map = new Map<string, { answered: number; correct: number }>();
  for (const a of answers) {
    const t = map.get(a.question.topic) ?? { answered: 0, correct: 0 };
    t.answered += 1;
    if (a.isCorrect) t.correct += 1;
    map.set(a.question.topic, t);
  }
  return [...map.entries()].map(([topic, v]) => ({ topic, ...v }));
}

export async function getDashboardData(userId: string) {
  const [
    settings,
    activePath,
    moduleStats,
    topicAccuracy,
    dueCards,
    sessions,
    tasks,
    attempts,
    lessonsCompleted,
    researchProjects,
    milestones,
  ] = await Promise.all([
    db.userSettings.findUnique({ where: { userId } }),
    db.degreePath.findFirst({
      where: { userId, isActive: true },
      include: { courses: { orderBy: { sortOrder: "asc" } } },
    }),
    getModuleStats(userId),
    getTopicAccuracy(userId),
    db.reviewCard.count({ where: { userId, dueAt: { lte: new Date() } } }),
    db.studySession.findMany({
      where: { userId, date: { gte: new Date(Date.now() - 56 * 24 * 3600 * 1000) } },
      orderBy: { date: "asc" },
    }),
    db.studyTask.findMany({
      where: { userId, completed: false },
      orderBy: [{ dueAt: "asc" }],
      take: 6,
    }),
    db.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { startedAt: "asc" },
      take: 100,
    }),
    db.lessonProgress.count({ where: { userId, status: "completed" } }),
    db.researchProject.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    db.careerMilestone.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
  ]);

  const readiness = overallReadiness(moduleStats);
  const byCategory = readinessByCategory(moduleStats);
  const weakest = weakestTopics(topicAccuracy);

  const totalAnswered = topicAccuracy.reduce((a, t) => a + t.answered, 0);
  const totalCorrect = topicAccuracy.reduce((a, t) => a + t.correct, 0);
  const quizAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  const streak = studyStreak(sessions.map((s) => s.date));

  // Weekly study minutes (last 8 ISO weeks).
  const weeklyMinutes = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.date);
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    weeklyMinutes.set(key, (weeklyMinutes.get(key) ?? 0) + s.minutes);
  }
  const weekStart = (() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    return monday.toISOString().slice(0, 10);
  })();
  const thisWeekMinutes = weeklyMinutes.get(weekStart) ?? 0;

  const courses = activePath?.courses ?? [];
  const currentCourse =
    courses.find((c) => c.status === "PREPARING") ??
    courses.find((c) => c.status === "IN_PROGRESS") ??
    courses.find((c) => c.status === "PLANNED");

  const earnedGpa = gpaFor(courses.map((c) => ({ credits: c.credits, grade: c.grade })));
  const projGpa = projectedGpa(
    courses.map((c) => ({ credits: c.credits, grade: c.grade, plannedGrade: c.plannedGrade })),
  );

  // Recommended next lesson: first incomplete lesson in the module with the
  // lowest readiness that maps to the current course (fallback: overall lowest).
  const prepKeys = currentCourse?.prepSubjectKeys ?? [];
  const candidateModules = moduleStats
    .filter((m) => (prepKeys.length ? prepKeys.includes(m.moduleKey) : true))
    .sort((a, b) => moduleReadiness(a) - moduleReadiness(b));
  let recommendedLesson: { slug: string; title: string; moduleTitle: string } | null = null;
  for (const m of candidateModules) {
    const mod = await db.prepModule.findUnique({
      where: { key: m.moduleKey },
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
    });
    if (!mod) continue;
    const done = new Set(
      (
        await db.lessonProgress.findMany({
          where: { userId, status: "completed", lessonId: { in: mod.lessons.map((l) => l.id) } },
          select: { lessonId: true },
        })
      ).map((p) => p.lessonId),
    );
    const next = mod.lessons.find((l) => !done.has(l.id));
    if (next) {
      recommendedLesson = { slug: next.slug, title: next.title, moduleTitle: mod.title };
      break;
    }
  }

  const quizSeries = attempts.map((a) => ({
    date: (a.completedAt ?? a.startedAt).toISOString().slice(0, 10),
    accuracy: a.total ? Math.round((a.score / a.total) * 100) : 0,
    moduleKey: a.moduleKey,
  }));

  const weeklySeries = [...weeklyMinutes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, minutes]) => ({ week, hours: Math.round((minutes / 60) * 10) / 10 }));

  return {
    settings,
    activePath,
    currentCourse: currentCourse ?? null,
    readiness,
    byCategory,
    moduleStats,
    weakest,
    quizAccuracy,
    dueCards,
    streak,
    thisWeekMinutes,
    weeklySeries,
    quizSeries,
    tasks,
    lessonsCompleted,
    earnedGpa,
    projGpa,
    researchProjects,
    milestones,
    recommendedLesson,
  };
}
