import { describe, expect, it } from "vitest";
import {
  approxEqual,
  det2,
  eigen2x2,
  evaluate,
  polyDerivative,
  polyEval,
  polyToString,
  quadraticRoots,
  verifyDerivative,
} from "@/lib/agents/math-engine";

describe("expression evaluator", () => {
  it("handles arithmetic with precedence and parentheses", () => {
    expect(evaluate("2+3*4")).toBe(14);
    expect(evaluate("(2+3)*4")).toBe(20);
    expect(evaluate("2^3^2")).toBe(512); // right-associative
    expect(evaluate("-3^2")).toBe(9); // unary binds the base: (-3)^2
  });

  it("supports scientific notation and functions", () => {
    expect(evaluate("3e8/(1420e6)")).toBeCloseTo(0.2113, 3);
    expect(evaluate("sqrt(2*9.8*20)")).toBeCloseTo(19.799, 2);
    expect(evaluate("sin(pi/2)")).toBeCloseTo(1, 9);
    expect(evaluate("ln(e)")).toBeCloseTo(1, 9);
  });

  it("substitutes variables from the environment", () => {
    expect(evaluate("m*g*h", { m: 2, g: 9.8, h: 10 })).toBeCloseTo(196);
  });

  it("throws on malformed or unknown input", () => {
    expect(() => evaluate("2+*3")).toThrow();
    expect(() => evaluate("foo(2)")).toThrow();
    expect(() => evaluate("2+unknownvar")).toThrow();
  });
});

describe("polynomial calculus", () => {
  it("differentiates symbolically", () => {
    // 3x^3 + 2x - 5 → 9x^2 + 2
    expect(polyDerivative([-5, 2, 0, 3])).toEqual([2, 0, 9]);
  });

  it("verifies a correct derivative numerically", () => {
    const p = [-5, 2, 0, 3];
    expect(verifyDerivative(p, polyDerivative(p))).toBe(true);
  });

  it("rejects an incorrect derivative claim", () => {
    expect(verifyDerivative([-5, 2, 0, 3], [2, 0, 8])).toBe(false);
  });

  it("evaluates and pretty-prints", () => {
    expect(polyEval([1, 2, 3], 2)).toBe(17);
    expect(polyToString([0, -1, 2])).toContain("x^2");
  });
});

describe("roots and eigenvalues", () => {
  it("solves quadratics", () => {
    expect(quadraticRoots(1, -5, 6)).toEqual([2, 3]);
    expect(quadraticRoots(1, 0, 1)).toEqual([]); // complex → no real roots
  });

  it("computes 2×2 determinants and eigenvalues", () => {
    expect(det2(3, 1, 2, 4)).toBe(10);
    expect(eigen2x2(2, 0, 0, 3).sort()).toEqual([2, 3]);
  });
});

describe("approxEqual", () => {
  it("tolerates floating-point noise but rejects real differences", () => {
    expect(approxEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(approxEqual(1.0, 1.001)).toBe(false);
    expect(approxEqual(NaN, 1)).toBe(false);
  });
});
