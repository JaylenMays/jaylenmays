import { describe, expect, it } from "vitest";
import {
  moduleReadiness,
  overallReadiness,
  readinessByCategory,
  studyStreak,
  weakestTopics,
} from "@/lib/readiness";

describe("moduleReadiness", () => {
  it("caps at the lesson share when no quiz data exists", () => {
    const r = moduleReadiness({
      moduleKey: "m",
      category: "MATH",
      lessonsTotal: 2,
      lessonsCompleted: 2,
      quizQuestionsAnswered: 0,
      quizQuestionsCorrect: 0,
    });
    expect(r).toBe(55); // untested knowledge never reads as 100%
  });

  it("reaches 100 only with full lessons and perfect quiz accuracy", () => {
    const r = moduleReadiness({
      moduleKey: "m",
      category: "MATH",
      lessonsTotal: 2,
      lessonsCompleted: 2,
      quizQuestionsAnswered: 10,
      quizQuestionsCorrect: 10,
    });
    expect(r).toBe(100);
  });

  it("weights quiz mastery at 45%", () => {
    const r = moduleReadiness({
      moduleKey: "m",
      category: "MATH",
      lessonsTotal: 1,
      lessonsCompleted: 0,
      quizQuestionsAnswered: 10,
      quizQuestionsCorrect: 10,
    });
    expect(r).toBe(45);
  });
});

describe("overallReadiness / readinessByCategory", () => {
  const mods = [
    { moduleKey: "a", category: "MATH", lessonsTotal: 1, lessonsCompleted: 1, quizQuestionsAnswered: 4, quizQuestionsCorrect: 4 },
    { moduleKey: "b", category: "PHYSICS", lessonsTotal: 1, lessonsCompleted: 0, quizQuestionsAnswered: 0, quizQuestionsCorrect: 0 },
  ];

  it("averages across modules", () => {
    expect(overallReadiness(mods)).toBe(50);
  });

  it("groups by category", () => {
    const byCat = readinessByCategory(mods);
    expect(byCat.MATH).toBe(100);
    expect(byCat.PHYSICS).toBe(0);
  });

  it("returns 0 for empty input", () => {
    expect(overallReadiness([])).toBe(0);
  });
});

describe("weakestTopics", () => {
  it("ranks by accuracy ascending and respects minAttempts", () => {
    const topics = weakestTopics(
      [
        { topic: "limits", answered: 4, correct: 1 },
        { topic: "vectors", answered: 4, correct: 4 },
        { topic: "rare", answered: 1, correct: 0 },
      ],
      2,
    );
    expect(topics[0].topic).toBe("limits");
    expect(topics.find((t) => t.topic === "rare")).toBeUndefined();
  });
});

describe("studyStreak", () => {
  const now = new Date("2026-08-04T18:00:00Z");
  const day = (offset: number) => new Date(now.getTime() - offset * 24 * 3600 * 1000);

  it("counts consecutive days including today", () => {
    expect(studyStreak([day(0), day(1), day(2)], now)).toBe(3);
  });

  it("keeps the streak alive if today has no session yet", () => {
    expect(studyStreak([day(1), day(2)], now)).toBe(2);
  });

  it("breaks on a missed day", () => {
    expect(studyStreak([day(0), day(2)], now)).toBe(1);
    expect(studyStreak([day(3)], now)).toBe(0);
  });
});
