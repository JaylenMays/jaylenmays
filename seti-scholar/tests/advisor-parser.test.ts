import { describe, expect, it } from "vitest";
import { parseAdvisorText, summarizeImport } from "@/lib/advisor-parser";

describe("parseAdvisorText", () => {
  it("parses a typical advisor course list", () => {
    const parsed = parseAdvisorText(`
MAT 265 Calculus for Engineers I 3 A- Fall 2025
PHY 121 - University Physics I (4 credits) Spring 2026
AST 111, Introduction to Astronomy, 4
`);
    expect(parsed).toHaveLength(3);

    const mat = parsed.find((c) => c.code === "MAT 265")!;
    expect(mat.grade).toBe("A-");
    expect(mat.semester).toBe("Fall");
    expect(mat.year).toBe(2025);
    expect(mat.title).toContain("Calculus");

    const phy = parsed.find((c) => c.code === "PHY 121")!;
    expect(phy.credits).toBe(4);
    expect(phy.grade).toBeNull();
    expect(phy.semester).toBe("Spring");
  });

  it("handles DARS-style abbreviated terms", () => {
    const [c] = parseAdvisorText("FA25 ENG101 3.00 B+ First-Year Composition");
    expect(c.code).toBe("ENG 101");
    expect(c.semester).toBe("Fall");
    expect(c.year).toBe(2025);
    expect(c.grade).toBe("B+");
  });

  it("skips lines without a course code and dedupes repeats", () => {
    const parsed = parseAdvisorText(`
Total credits: 45
MAT 265 Calculus I 3
MAT 265 Calculus I 3
`);
    expect(parsed).toHaveLength(1);
  });

  it("defaults credits to 3 when nothing is stated", () => {
    const [c] = parseAdvisorText("HST 100 World History");
    expect(c.credits).toBe(3);
  });
});

describe("summarizeImport", () => {
  it("totals credits and counts graded courses", () => {
    const s = summarizeImport([
      { code: "A 1", title: "x", credits: 3, grade: "A", semester: null, year: null },
      { code: "B 2", title: "y", credits: 4, grade: null, semester: null, year: null },
    ]);
    expect(s.courseCount).toBe(2);
    expect(s.totalCredits).toBe(7);
    expect(s.gradedCount).toBe(1);
  });
});
