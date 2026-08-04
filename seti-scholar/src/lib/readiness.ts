/**
 * Readiness scoring: how prepared is the student for a course/module,
 * blending lesson completion and quiz accuracy.
 */

export interface ModuleStats {
  moduleKey: string;
  category: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  quizQuestionsAnswered: number;
  quizQuestionsCorrect: number;
}

export function moduleReadiness(s: ModuleStats): number {
  const lessonPart = s.lessonsTotal > 0 ? s.lessonsCompleted / s.lessonsTotal : 0;
  const quizPart =
    s.quizQuestionsAnswered > 0 ? s.quizQuestionsCorrect / s.quizQuestionsAnswered : 0;
  // Lessons weigh 55%, demonstrated quiz mastery 45%. With no quiz data yet,
  // cap readiness at the lesson share so untested knowledge never reads as 100%.
  if (s.quizQuestionsAnswered === 0) return Math.round(lessonPart * 55);
  return Math.round(lessonPart * 55 + quizPart * 45);
}

export function overallReadiness(modules: ModuleStats[]): number {
  if (modules.length === 0) return 0;
  const sum = modules.reduce((acc, m) => acc + moduleReadiness(m), 0);
  return Math.round(sum / modules.length);
}

export function readinessByCategory(modules: ModuleStats[]): Record<string, number> {
  const byCat = new Map<string, ModuleStats[]>();
  for (const m of modules) {
    const list = byCat.get(m.category) ?? [];
    list.push(m);
    byCat.set(m.category, list);
  }
  const out: Record<string, number> = {};
  for (const [cat, list] of byCat) out[cat] = overallReadiness(list);
  return out;
}

export interface TopicAccuracy {
  topic: string;
  answered: number;
  correct: number;
}

/** Weakest topics = lowest accuracy among topics with enough attempts. */
export function weakestTopics(topics: TopicAccuracy[], minAttempts = 2, limit = 5): TopicAccuracy[] {
  return topics
    .filter((t) => t.answered >= minAttempts)
    .sort((a, b) => a.correct / a.answered - b.correct / b.answered)
    .slice(0, limit);
}

/** Current daily study streak from a set of study dates (UTC days). */
export function studyStreak(dates: Date[], now: Date = new Date()): number {
  const days = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date(now);
  // Today counts if studied; otherwise the streak may still be alive from yesterday.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
