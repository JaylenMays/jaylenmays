import { describe, expect, it } from "vitest";
import { availableGenerators, generateProblems } from "@/lib/agents/problem-gen";
import { approxEqual, evaluate } from "@/lib/agents/math-engine";
import { SUBJECT_PROFILES, GENERIC_PROFILE, findProfile } from "@/lib/agents/catalog";
import { isApprovedUrl } from "@/lib/agents/access-policy";

describe("problem generators", () => {
  it("every generator's answer survives independent re-evaluation of checkExpr", () => {
    // This is exactly the Mathematical Validator Agent's check, across all
    // generators and many seeds.
    for (const seed of [1, 42, 999, 123456]) {
      const problems = generateProblems(availableGenerators(), 2, seed);
      expect(problems.length).toBeGreaterThan(40);
      for (const p of problems) {
        const value = evaluate(p.checkExpr);
        expect(
          approxEqual(value, p.answer, 1e-4, 1e-6),
          `${p.generatorKey}: checkExpr "${p.checkExpr}" → ${value}, claimed ${p.answer}`,
        ).toBe(true);
      }
    }
  });

  it("is deterministic for a fixed seed", () => {
    const a = generateProblems(["derivative-poly"], 3, 77);
    const b = generateProblems(["derivative-poly"], 3, 77);
    expect(a).toEqual(b);
  });

  it("produces different problems for different seeds", () => {
    const a = generateProblems(["kepler-orbit", "zscore-calc"], 2, 1);
    const b = generateProblems(["kepler-orbit", "zscore-calc"], 2, 2);
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it("every problem ships a prompt, solution, and answer text", () => {
    for (const p of generateProblems(availableGenerators(), 1, 5)) {
      expect(p.prompt.length).toBeGreaterThan(10);
      expect(p.solution.length).toBeGreaterThan(10);
      expect(p.answerText.length).toBeGreaterThan(0);
    }
  });
});

describe("curated catalog integrity", () => {
  const profiles = [...SUBJECT_PROFILES, GENERIC_PROFILE];

  it("every catalog source uses an approved domain", () => {
    for (const p of profiles) {
      for (const s of p.sources) {
        expect(isApprovedUrl(s.url), `${p.key}: ${s.url}`).toBe(true);
      }
    }
  });

  it("never claims open full text without an open license", () => {
    const openLike = /public domain|cc |cc-|open access|bsd|apache|psf|free to read|open data/i;
    for (const p of profiles) {
      for (const s of p.sources) {
        if (s.accessStatus === "open_full_text") {
          expect(openLike.test(s.license), `${p.key}: ${s.title} (${s.license})`).toBe(true);
        }
      }
      for (const b of p.books) {
        if (b.openFullText) {
          expect(openLike.test(b.license), `${p.key}: book ${b.title} (${b.license})`).toBe(true);
        }
      }
    }
  });

  it("commercial book recommendations are metadata-only with a rationale", () => {
    for (const p of profiles) {
      for (const b of p.books) {
        if (b.accessStatus === "commercial") {
          expect(b.openFullText).toBe(false);
          expect(b.rationale.length).toBeGreaterThan(20);
        }
      }
    }
  });

  it("every lesson seed references only real generators", () => {
    const known = new Set(availableGenerators());
    for (const p of profiles) {
      for (const l of p.lessons) {
        for (const k of l.generatorKeys) {
          expect(known.has(k), `${p.key}/${l.title}: unknown generator "${k}"`).toBe(true);
        }
      }
    }
  });

  it("matches courses to the right subject profiles", () => {
    expect(findProfile("MAT 265", "Calculus for Engineers I").key).toBe("calculus-1");
    expect(findProfile("PHY 121", "University Physics I: Mechanics (with Lab)").key).toBe("physics-mechanics");
    expect(findProfile("AST 470", "Radio Astronomy").key).toBe("radio-seti");
    expect(findProfile("QC 301", "Foundations of Quantum Computing").key).toBe("quantum-computing");
    expect(findProfile("XYZ 999", "Underwater Basket Weaving").key).toBe("generic");
  });

  it("every profile ships lessons and at least two selectable sources", () => {
    for (const p of SUBJECT_PROFILES) {
      expect(p.lessons.length, p.key).toBeGreaterThanOrEqual(1);
      expect(p.sources.length, p.key).toBeGreaterThanOrEqual(2);
    }
  });
});
