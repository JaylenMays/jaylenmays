/**
 * SM-2 spaced-repetition scheduler.
 *
 * Quality ratings follow the classic SuperMemo scale:
 *   0-2 → lapse (card resets, shown again soon)
 *   3   → recalled with difficulty
 *   4   → recalled after hesitation
 *   5   → perfect recall
 */

export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export interface Sm2Result extends Sm2State {
  dueAt: Date;
}

const MIN_EASE = 1.3;

export function sm2Review(state: Sm2State, quality: number, now: Date = new Date()): Sm2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let { easeFactor, intervalDays, repetitions, lapses } = state;

  if (q < 3) {
    // Lapse: reset repetition count, shrink interval, show again in 10 minutes.
    repetitions = 0;
    intervalDays = 0;
    lapses += 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
    return {
      easeFactor,
      intervalDays,
      repetitions,
      lapses,
      dueAt: new Date(now.getTime() + 10 * 60 * 1000),
    };
  }

  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  repetitions += 1;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(intervalDays * easeFactor * 100) / 100;
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    lapses,
    dueAt: new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000),
  };
}

/** Map the app's 3-button review UI onto SM-2 quality values. */
export function ratingToQuality(rating: "again" | "hard" | "good" | "easy"): number {
  switch (rating) {
    case "again":
      return 1;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}
