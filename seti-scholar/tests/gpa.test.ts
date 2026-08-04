import { describe, expect, it } from "vitest";
import { gpaFor, projectedGpa, requiredAverageForTarget, letterForPoints } from "@/lib/gpa";

describe("gpaFor", () => {
  it("computes a credit-weighted GPA", () => {
    const gpa = gpaFor([
      { credits: 3, grade: "A" }, // 12
      { credits: 4, grade: "B" }, // 12
    ]);
    expect(gpa).toBeCloseTo(24 / 7, 2);
  });

  it("ignores ungraded and unknown grades", () => {
    expect(gpaFor([{ credits: 3, grade: null }, { credits: 3, grade: "W" }])).toBeNull();
  });

  it("handles plus/minus grades", () => {
    expect(gpaFor([{ credits: 3, grade: "A-" }])).toBeCloseTo(3.67, 2);
    expect(gpaFor([{ credits: 3, grade: "b+" }])).toBeCloseTo(3.33, 2); // case-insensitive
  });
});

describe("projectedGpa", () => {
  it("blends earned and planned grades", () => {
    const gpa = projectedGpa([
      { credits: 3, grade: "A", plannedGrade: null },
      { credits: 3, grade: null, plannedGrade: "B" },
    ]);
    expect(gpa).toBeCloseTo(3.5, 2);
  });
});

describe("requiredAverageForTarget", () => {
  it("computes the average needed on remaining credits", () => {
    // 3 credits of B (3.0); want 3.5 overall across 6 credits → need 4.0 on the rest.
    const needed = requiredAverageForTarget([{ credits: 3, grade: "B" }], 3, 3.5);
    expect(needed).toBeCloseTo(4.0, 2);
  });

  it("returns null with no remaining credits", () => {
    expect(requiredAverageForTarget([{ credits: 3, grade: "A" }], 0, 3.5)).toBeNull();
  });

  it("can exceed 4.33 when the target is unreachable", () => {
    const needed = requiredAverageForTarget([{ credits: 30, grade: "C" }], 3, 3.9)!;
    expect(needed).toBeGreaterThan(4.33);
  });
});

describe("letterForPoints", () => {
  it("maps points back to letters", () => {
    expect(letterForPoints(4.0)).toBe("A");
    expect(letterForPoints(3.7)).toBe("A-");
    expect(letterForPoints(0)).toBe("E");
  });
});
