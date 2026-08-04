/**
 * Source quality rubric. Deterministic and explainable: every score is stored
 * per-criterion so the UI can show exactly why a source was selected.
 */

import { domainTier, isOpenLicense } from "./access-policy";

export interface SourceCandidate {
  title: string;
  url: string;
  provider: string;
  type: string;
  subject: string;
  description?: string;
  license: string;
  accessStatus: string;
  year?: number | null;
  authors?: string[];
}

export interface RubricScores {
  authority: number; // 0-10 official orgs > universities/open texts > publishers
  relevance: number; // 0-10 keyword alignment with the course/subject
  licensing: number; // 0-10 open full text > preview > metadata-only
  completeness: number; // 0-10 textbooks/courses > notes/docs > papers/videos
  recency: number; // 0-10 decays with age; docs/orgs assumed maintained
  clarity: number; // 0-10 educational-format prior by source type
  citationQuality: number; // 0-10 peer-reviewed/indexed sources score higher
  levelFit: number; // 0-10 fit for undergraduate preparation
}

export interface ScoredSource extends SourceCandidate {
  scores: RubricScores;
  qualityScore: number; // weighted 0-100
}

const TYPE_COMPLETENESS: Record<string, number> = {
  textbook: 10,
  course: 9,
  lecture_notes: 7,
  documentation: 8,
  problem_set: 6,
  simulation: 5,
  paper: 4,
  video: 5,
  dataset: 4,
};

const TYPE_CLARITY: Record<string, number> = {
  textbook: 9,
  course: 9,
  lecture_notes: 7,
  documentation: 7,
  problem_set: 8,
  simulation: 8,
  paper: 4,
  video: 7,
  dataset: 3,
};

const TYPE_CITATION: Record<string, number> = {
  paper: 9,
  textbook: 8,
  course: 7,
  documentation: 7,
  lecture_notes: 6,
  problem_set: 5,
  simulation: 5,
  video: 4,
  dataset: 6,
};

const MAINTAINED_TYPES = new Set(["documentation", "course", "simulation", "dataset"]);

export function relevanceScore(candidate: SourceCandidate, keywords: string[]): number {
  if (keywords.length === 0) return 5;
  const haystack = `${candidate.title} ${candidate.subject} ${candidate.description ?? ""}`.toLowerCase();
  const hits = keywords.filter((k) => haystack.includes(k.toLowerCase())).length;
  return Math.round((hits / keywords.length) * 10);
}

export function scoreSource(candidate: SourceCandidate, keywords: string[]): ScoredSource {
  const tier = domainTier(candidate.url);
  const authority = tier === 1 ? 10 : tier === 2 ? 8 : tier === 3 ? 5 : 0;

  const licensing =
    candidate.accessStatus === "open_full_text" && isOpenLicense(candidate.license)
      ? 10
      : candidate.accessStatus === "preview"
        ? 6
        : candidate.accessStatus === "commercial"
          ? 3
          : 2;

  const nowYear = new Date().getFullYear();
  let recency: number;
  if (MAINTAINED_TYPES.has(candidate.type) && !candidate.year) {
    recency = 9; // living documents assumed maintained
  } else if (!candidate.year) {
    recency = 5;
  } else {
    const age = Math.max(0, nowYear - candidate.year);
    recency = Math.max(1, Math.round(10 - age / 3));
  }

  const scores: RubricScores = {
    authority,
    relevance: relevanceScore(candidate, keywords),
    licensing,
    completeness: TYPE_COMPLETENESS[candidate.type] ?? 5,
    recency,
    clarity: TYPE_CLARITY[candidate.type] ?? 5,
    citationQuality: TYPE_CITATION[candidate.type] ?? 5,
    levelFit: candidate.type === "paper" ? 5 : 8, // papers skew advanced
  };

  // Weights sum to 10; final score is 0-100.
  const qualityScore = Math.round(
    scores.authority * 2.0 +
      scores.relevance * 2.0 +
      scores.licensing * 1.5 +
      scores.completeness * 1.0 +
      scores.recency * 1.0 +
      scores.clarity * 1.0 +
      scores.citationQuality * 0.75 +
      scores.levelFit * 0.75,
  );

  return { ...candidate, scores, qualityScore };
}

/** Verification gate: candidates below this floor are rejected. */
export const MIN_QUALITY = 45;

/** Selection: multiple strong sources, never a single book. */
export function selectSources(scored: ScoredSource[], max = 8): ScoredSource[] {
  const verified = scored.filter((s) => s.qualityScore >= MIN_QUALITY);
  const sorted = [...verified].sort((a, b) => b.qualityScore - a.qualityScore);
  // Diversity constraint: at most 3 of any one type so a curriculum never
  // leans on a single kind of material.
  const byType = new Map<string, number>();
  const picked: ScoredSource[] = [];
  for (const s of sorted) {
    const n = byType.get(s.type) ?? 0;
    if (n >= 3) continue;
    byType.set(s.type, n + 1);
    picked.push(s);
    if (picked.length >= max) break;
  }
  return picked;
}
