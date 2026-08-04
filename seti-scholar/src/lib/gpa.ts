/** GPA math shared by the GPA planner, dashboard, and analytics. */

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.33,
  A: 4.0,
  "A-": 3.67,
  "B+": 3.33,
  B: 3.0,
  "B-": 2.67,
  "C+": 2.33,
  C: 2.0,
  "C-": 1.67,
  "D+": 1.33,
  D: 1.0,
  E: 0.0,
  F: 0.0,
};

export interface GradedCourse {
  credits: number;
  grade: string | null;
}

export function gpaFor(courses: GradedCourse[]): number | null {
  let points = 0;
  let credits = 0;
  for (const c of courses) {
    if (!c.grade) continue;
    const gp = GRADE_POINTS[c.grade.toUpperCase().trim()];
    if (gp === undefined) continue;
    points += gp * c.credits;
    credits += c.credits;
  }
  if (credits === 0) return null;
  return Math.round((points / credits) * 1000) / 1000;
}

/**
 * Projected GPA = earned grades plus planned grades for remaining courses.
 * Courses with neither grade are ignored.
 */
export function projectedGpa(
  courses: { credits: number; grade: string | null; plannedGrade: string | null }[],
): number | null {
  return gpaFor(
    courses.map((c) => ({ credits: c.credits, grade: c.grade ?? c.plannedGrade })),
  );
}

/**
 * Minimum average grade points needed on remaining credits to hit a target GPA.
 * Returns null when there are no remaining credits.
 */
export function requiredAverageForTarget(
  earned: GradedCourse[],
  remainingCredits: number,
  targetGpa: number,
): number | null {
  if (remainingCredits <= 0) return null;
  let points = 0;
  let credits = 0;
  for (const c of earned) {
    if (!c.grade) continue;
    const gp = GRADE_POINTS[c.grade.toUpperCase().trim()];
    if (gp === undefined) continue;
    points += gp * c.credits;
    credits += c.credits;
  }
  const needed =
    (targetGpa * (credits + remainingCredits) - points) / remainingCredits;
  return Math.round(needed * 1000) / 1000;
}

export function letterForPoints(points: number): string {
  const entries = Object.entries(GRADE_POINTS).sort((a, b) => b[1] - a[1]);
  for (const [letter, gp] of entries) {
    if (points >= gp) return letter;
  }
  return "F";
}
