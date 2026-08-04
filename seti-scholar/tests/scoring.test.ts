import { describe, expect, it } from "vitest";
import { scoreSource, selectSources, MIN_QUALITY, type SourceCandidate } from "@/lib/agents/scoring";

const base: SourceCandidate = {
  title: "OpenStax Calculus Volume 1",
  url: "https://openstax.org/details/books/calculus-volume-1",
  provider: "openstax",
  type: "textbook",
  subject: "calculus",
  description: "limits derivatives calculus",
  license: "CC BY 4.0",
  accessStatus: "open_full_text",
  year: 2016,
};

describe("scoreSource", () => {
  it("gives open, official, relevant textbooks high scores", () => {
    const s = scoreSource(base, ["calculus", "limits", "derivatives"]);
    expect(s.qualityScore).toBeGreaterThan(70);
    expect(s.scores.licensing).toBe(10);
    expect(s.scores.authority).toBe(8);
  });

  it("scores tier-1 official organizations highest on authority", () => {
    const nasa = scoreSource(
      { ...base, url: "https://science.nasa.gov/universe/", provider: "nasa" },
      ["calculus"],
    );
    expect(nasa.scores.authority).toBe(10);
  });

  it("gives unapproved domains zero authority", () => {
    const s = scoreSource({ ...base, url: "https://randomblog.example/calc" }, ["calculus"]);
    expect(s.scores.authority).toBe(0);
  });

  it("penalizes commercial/metadata-only access", () => {
    const commercial = scoreSource(
      { ...base, url: "https://www.cengage.com/x", license: "Commercial", accessStatus: "commercial" },
      ["calculus"],
    );
    expect(commercial.scores.licensing).toBeLessThan(scoreSource(base, ["calculus"]).scores.licensing);
  });

  it("treats living documentation as maintained (high recency without a year)", () => {
    const docs = scoreSource(
      { ...base, url: "https://numpy.org/doc/stable/", type: "documentation", year: null },
      ["calculus"],
    );
    expect(docs.scores.recency).toBeGreaterThanOrEqual(8);
  });
});

describe("selectSources", () => {
  it("rejects sources below the quality floor", () => {
    const junk = scoreSource(
      {
        ...base,
        url: "https://unknown.example/blog",
        license: "unknown",
        accessStatus: "metadata_only",
        description: "",
        title: "random notes",
      },
      ["quantum", "entanglement"],
    );
    expect(junk.qualityScore).toBeLessThan(MIN_QUALITY);
    expect(selectSources([junk])).toHaveLength(0);
  });

  it("selects multiple strong sources and caps any single type at 3", () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      scoreSource({ ...base, url: `https://openstax.org/book-${i}`, title: `Calculus book ${i}` }, ["calculus"]),
    );
    const course = scoreSource(
      { ...base, url: "https://ocw.mit.edu/courses/18-01/", type: "course", title: "MIT calculus course" },
      ["calculus"],
    );
    const picked = selectSources([...many, course]);
    expect(picked.filter((s) => s.type === "textbook").length).toBeLessThanOrEqual(3);
    expect(picked.some((s) => s.type === "course")).toBe(true);
    expect(picked.length).toBeGreaterThanOrEqual(2); // never one book
  });
});
