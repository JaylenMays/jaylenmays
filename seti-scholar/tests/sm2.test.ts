import { describe, expect, it } from "vitest";
import { ratingToQuality, sm2Review, type Sm2State } from "@/lib/sm2";

const fresh: Sm2State = { easeFactor: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 };
const NOW = new Date("2026-08-04T12:00:00Z");

describe("sm2Review", () => {
  it("first successful review schedules 1 day out", () => {
    const r = sm2Review(fresh, 4, NOW);
    expect(r.repetitions).toBe(1);
    expect(r.intervalDays).toBe(1);
    expect(r.dueAt.getTime()).toBe(NOW.getTime() + 24 * 3600 * 1000);
  });

  it("second successful review schedules 6 days out", () => {
    const first = sm2Review(fresh, 4, NOW);
    const second = sm2Review(first, 4, NOW);
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  it("third review multiplies interval by ease factor", () => {
    let s: Sm2State = fresh;
    s = sm2Review(s, 4, NOW);
    s = sm2Review(s, 4, NOW);
    const third = sm2Review(s, 4, NOW);
    expect(third.intervalDays).toBeGreaterThan(6);
    expect(third.intervalDays).toBeCloseTo(6 * third.easeFactor, 0);
  });

  it("failure resets repetitions, increments lapses, and reschedules within 10 minutes", () => {
    const learned = sm2Review(sm2Review(fresh, 5, NOW), 5, NOW);
    const failed = sm2Review(learned, 1, NOW);
    expect(failed.repetitions).toBe(0);
    expect(failed.lapses).toBe(1);
    expect(failed.dueAt.getTime()).toBe(NOW.getTime() + 10 * 60 * 1000);
  });

  it("ease factor never drops below 1.3", () => {
    let s: Sm2State = { ...fresh, easeFactor: 1.31 };
    for (let i = 0; i < 10; i++) s = sm2Review(s, 3, NOW);
    expect(s.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("perfect recall raises the ease factor", () => {
    const r = sm2Review(fresh, 5, NOW);
    expect(r.easeFactor).toBeGreaterThan(2.5);
  });

  it("clamps out-of-range quality values", () => {
    const r = sm2Review(fresh, 42, NOW);
    expect(r.repetitions).toBe(1); // treated as quality 5
  });
});

describe("ratingToQuality", () => {
  it("maps the four UI ratings onto the SM-2 scale", () => {
    expect(ratingToQuality("again")).toBeLessThan(3);
    expect(ratingToQuality("hard")).toBe(3);
    expect(ratingToQuality("good")).toBe(4);
    expect(ratingToQuality("easy")).toBe(5);
  });
});
