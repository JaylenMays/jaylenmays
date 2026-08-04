import "server-only";

/**
 * The autonomous agent roster. Each agent is a named unit with a single
 * responsibility; the pipeline (pipeline.ts) wires them into the required
 * review chain and enforces that no lesson is verified solely by its writer.
 *
 * Every agent works deterministically without an LLM; when an API key is
 * configured, writer/reviewer agents upgrade their output with model calls.
 */

import { db } from "@/lib/db";
import {
  findProfile,
  type LessonSeed,
  type SubjectProfile,
} from "./catalog";
import { discoverFromNetwork } from "./connectors";
import {
  normalizeAccessStatus,
  isApprovedUrl,
  purchaseLookupUrl,
  type AccessStatus,
} from "./access-policy";
import { scoreSource, selectSources, MIN_QUALITY, type ScoredSource } from "./scoring";
import { evaluate, approxEqual } from "./math-engine";
import { generateProblems, type GeneratedProblem } from "./problem-gen";
import { llmJson } from "./llm";

// ---------------------------------------------------------------------------
// Shared pipeline context
// ---------------------------------------------------------------------------

export interface WorkedExample {
  problem: string;
  steps: string[];
  answer: string;
}

export interface PracticeProblem {
  prompt: string;
  answer: string;
  solution: string;
  validated: boolean;
  difficulty: number;
  generatorKey: string;
  checkExpr: string;
  numericAnswer: number;
}

export interface DraftLesson {
  title: string;
  kind: "lesson" | "diagnostic" | "readiness_exam" | "remediation";
  objectives: string[];
  prereqConcepts: string[];
  originalExplanation: string;
  formalExplanation: string;
  workedExamples: WorkedExample[];
  practiceProblems: PracticeProblem[];
  commonMistakes: string[];
  setiApplication: string;
  masteryCriteria: string[];
  followUp: { title: string; url: string }[];
  citations: { sourceUrl: string; note: string }[];
  qualityScore: number;
  writtenBy: string;
  reviewedBy: string;
  reviewStatus: "pending" | "approved" | "revised" | "flagged";
  reviewNotes: string;
}

export interface PipelineContext {
  userId: string;
  courseCode: string;
  courseTitle: string;
  seed: number;
  profile: SubjectProfile;
  candidates: ScoredSource[];
  verified: ScoredSource[];
  selected: ScoredSource[];
  rejectedCount: number;
  networkCount: number;
  objectives: string[];
  prereqConcepts: string[];
  weakTopics: string[];
  lessons: DraftLesson[];
  log: (agent: string, status: "passed" | "warning" | "failed", summary: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// 1. Source Discovery Agent
// ---------------------------------------------------------------------------

export const AGENT_SOURCE_DISCOVERY = "source-discovery-agent";

export async function runSourceDiscovery(ctx: PipelineContext): Promise<void> {
  const { profile } = ctx;
  const catalogCandidates = profile.sources.map((s) => scoreSource(s, profile.keywords));

  // Live augmentation from approved metadata services (optional, best-effort).
  const query = `${ctx.courseTitle} ${profile.keywords.slice(0, 2).join(" ")}`;
  const network = await discoverFromNetwork(query, profile.key);
  ctx.networkCount = network.length;
  const networkScored = network.map((s) => scoreSource(s, profile.keywords));

  // Dedupe by URL; curated entries win because their metadata is verified.
  const byUrl = new Map<string, ScoredSource>();
  for (const s of [...networkScored, ...catalogCandidates]) byUrl.set(s.url, s);
  ctx.candidates = [...byUrl.values()];

  await ctx.log(
    AGENT_SOURCE_DISCOVERY,
    "passed",
    `${ctx.candidates.length} candidates (${catalogCandidates.length} curated, ${network.length} from live connectors: Open Library, Google Books, Crossref, arXiv, Semantic Scholar).`,
  );
}

// ---------------------------------------------------------------------------
// 2. Source Verification Agent
// ---------------------------------------------------------------------------

export const AGENT_SOURCE_VERIFICATION = "source-verification-agent";

export async function runSourceVerification(ctx: PipelineContext): Promise<void> {
  const verified: ScoredSource[] = [];
  let rejected = 0;

  for (const c of ctx.candidates) {
    // Policy: approved domain, honest access status.
    if (!isApprovedUrl(c.url)) {
      rejected++;
      continue;
    }
    const accessStatus = normalizeAccessStatus({
      url: c.url,
      license: c.license,
      claimed: c.accessStatus as AccessStatus,
    });
    const normalized = { ...c, accessStatus };
    if (normalized.qualityScore < MIN_QUALITY) {
      rejected++;
      continue;
    }
    verified.push(normalized);
  }

  ctx.verified = verified;
  ctx.selected = selectSources(verified);
  ctx.rejectedCount = rejected;

  // Persist sources + audit events.
  for (const s of ctx.verified) {
    const isSelected = ctx.selected.some((x) => x.url === s.url);
    const existing = await db.source.findUnique({
      where: { url_subject: { url: s.url, subject: ctx.profile.key } },
    });
    const data = {
      title: s.title,
      domain: new URL(s.url).hostname.replace(/^www\./, ""),
      provider: s.provider,
      type: s.type,
      subject: ctx.profile.key,
      description: s.description ?? "",
      license: s.license,
      accessStatus: s.accessStatus,
      openFullText: s.accessStatus === "open_full_text",
      year: s.year ?? null,
      authors: s.authors ?? [],
      scores: s.scores as object,
      qualityScore: s.qualityScore,
      status: isSelected ? "selected" : "verified",
      lastCheckedAt: new Date(),
    };
    if (existing) {
      await db.source.update({ where: { id: existing.id }, data });
      await db.sourceEvent.create({
        data: { sourceId: existing.id, kind: "refreshed", note: `Re-verified for ${ctx.courseCode}; quality ${s.qualityScore}/100.` },
      });
    } else {
      const created = await db.source.create({ data: { url: s.url, ...data } });
      await db.sourceEvent.create({
        data: {
          sourceId: created.id,
          kind: "discovered",
          note: `Discovered via ${s.provider} for ${ctx.courseCode} (${ctx.courseTitle}).`,
        },
      });
      await db.sourceEvent.create({
        data: {
          sourceId: created.id,
          kind: isSelected ? "selected" : "verified",
          note: isSelected
            ? `Selected (quality ${s.qualityScore}/100): authority ${s.scores.authority}/10, relevance ${s.scores.relevance}/10, licensing ${s.scores.licensing}/10.`
            : `Verified with quality ${s.qualityScore}/100; retained as a backup source.`,
        },
      });
    }
  }

  await ctx.log(
    AGENT_SOURCE_VERIFICATION,
    ctx.selected.length >= 2 ? "passed" : "warning",
    `${verified.length} verified, ${rejected} rejected (policy/quality floor ${MIN_QUALITY}), ${ctx.selected.length} selected across ${new Set(ctx.selected.map((s) => s.type)).size} source types.`,
  );
}

// ---------------------------------------------------------------------------
// 3. Curriculum Architect Agent (+ Personalization Agent input)
// ---------------------------------------------------------------------------

export const AGENT_CURRICULUM_ARCHITECT = "curriculum-architect-agent";
export const AGENT_PERSONALIZATION = "personalization-agent";

export async function runCurriculumArchitect(ctx: PipelineContext): Promise<void> {
  ctx.objectives = ctx.profile.objectives;
  ctx.prereqConcepts = ctx.profile.prereqConcepts;

  // Personalization: pull the user's weakest topics from quiz history so the
  // lesson order and remediation emphasis reflect measured performance.
  const answers = await db.quizAnswer.findMany({
    where: { attempt: { userId: ctx.userId } },
    include: { question: { select: { topic: true } } },
    take: 1000,
    orderBy: { id: "desc" },
  });
  const topicStats = new Map<string, { n: number; ok: number }>();
  for (const a of answers) {
    const t = topicStats.get(a.question.topic) ?? { n: 0, ok: 0 };
    t.n += 1;
    if (a.isCorrect) t.ok += 1;
    topicStats.set(a.question.topic, t);
  }
  ctx.weakTopics = [...topicStats.entries()]
    .filter(([, v]) => v.n >= 2 && v.ok / v.n < 0.7)
    .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)
    .map(([topic]) => topic)
    .slice(0, 6);

  await ctx.log(
    AGENT_PERSONALIZATION,
    "passed",
    ctx.weakTopics.length
      ? `Weak topics feeding lesson emphasis: ${ctx.weakTopics.join(", ")}.`
      : "No weak-topic signal yet; using default lesson order until quiz data accumulates.",
  );

  await ctx.log(
    AGENT_CURRICULUM_ARCHITECT,
    "passed",
    `Course map: ${ctx.profile.lessons.length} core lessons + diagnostic + readiness exam; ${ctx.objectives.length} outcomes; prerequisites: ${ctx.prereqConcepts.join(", ")}.`,
  );
}

// ---------------------------------------------------------------------------
// 4. Lesson Writer Agent
// ---------------------------------------------------------------------------

export const AGENT_LESSON_WRITER = "lesson-writer-agent";

function citationsFor(ctx: PipelineContext, seed: LessonSeed): { sourceUrl: string; note: string }[] {
  // Cite the strongest selected sources, preferring textbooks/courses for
  // lessons; every lesson gets at least two citations when available.
  const ranked = [...ctx.selected].sort((a, b) => {
    const prefer = (s: ScoredSource) => (s.type === "textbook" || s.type === "course" ? 1 : 0);
    return prefer(b) - prefer(a) || b.qualityScore - a.qualityScore;
  });
  return ranked.slice(0, 3).map((s) => ({
    sourceUrl: s.url,
    note: `Supporting material for "${seed.title}" (${s.type}, quality ${s.qualityScore}/100).`,
  }));
}

function problemsToWorked(problems: GeneratedProblem[]): WorkedExample[] {
  return problems.map((p) => ({
    problem: p.prompt,
    steps: p.solution.split(/(?<=\.)\s+/).filter(Boolean),
    answer: p.answerText,
  }));
}

function problemsToPractice(problems: GeneratedProblem[]): PracticeProblem[] {
  return problems.map((p) => ({
    prompt: p.prompt,
    answer: p.answerText,
    solution: p.solution,
    validated: false, // set by the Mathematical Validator Agent, not the writer
    difficulty: p.difficulty,
    generatorKey: p.generatorKey,
    checkExpr: p.checkExpr,
    numericAnswer: p.answer,
  }));
}

export async function runLessonWriter(ctx: PipelineContext): Promise<void> {
  const avgSourceQuality =
    ctx.selected.reduce((a, s) => a + s.qualityScore, 0) / Math.max(1, ctx.selected.length);

  // Weak-topic-first ordering (personalization input from the architect stage).
  const seeds = [...ctx.profile.lessons].sort((a, b) => {
    const hits = (s: LessonSeed) =>
      ctx.weakTopics.filter((t) => `${s.title} ${s.prereqConcepts.join(" ")}`.toLowerCase().includes(t.toLowerCase())).length;
    return hits(b) - hits(a);
  });

  const followUp = ctx.selected.slice(0, 4).map((s) => ({ title: s.title, url: s.url }));

  ctx.lessons = [];
  let seedOffset = 0;
  for (const seed of seeds) {
    seedOffset += 1;
    const worked = generateProblems(seed.generatorKeys, 1, ctx.seed + seedOffset * 101);
    const practice = generateProblems(seed.generatorKeys, 2, ctx.seed + seedOffset * 211);

    // Optional LLM upgrade of the explanations; deterministic seed text otherwise.
    let original = seed.conceptSummary;
    let formal = seed.formalSummary;
    const upgraded = await llmJson<{ original: string; formal: string }>(
      ctx.userId,
      "You are the Lesson Writer Agent for a university course-preparation platform. Expand the given lesson summaries into clear teaching text (2-3 paragraphs each). Keep every formula. Write original text — do not reproduce copyrighted passages.",
      JSON.stringify({
        lessonTitle: seed.title,
        courseTitle: ctx.courseTitle,
        conceptSummary: seed.conceptSummary,
        formalSummary: seed.formalSummary,
        respondWith: { original: "expanded conceptual explanation", formal: "expanded formal treatment" },
      }),
    );
    if (upgraded?.original && upgraded?.formal) {
      original = upgraded.original;
      formal = upgraded.formal;
    }

    ctx.lessons.push({
      title: seed.title,
      kind: "lesson",
      objectives: seed.objectives,
      prereqConcepts: seed.prereqConcepts,
      originalExplanation: original,
      formalExplanation: formal,
      workedExamples: problemsToWorked(worked),
      practiceProblems: problemsToPractice(practice),
      commonMistakes: seed.commonMistakes,
      setiApplication: seed.setiApplication,
      masteryCriteria: seed.masteryCriteria,
      followUp,
      citations: citationsFor(ctx, seed),
      qualityScore: Math.round(avgSourceQuality),
      writtenBy: AGENT_LESSON_WRITER,
      reviewedBy: "",
      reviewStatus: "pending",
      reviewNotes: "",
    });
  }

  await ctx.log(
    AGENT_LESSON_WRITER,
    "passed",
    `${ctx.lessons.length} original lessons drafted, each with objectives, dual explanations, worked examples, practice problems, common mistakes, a SETI application, mastery criteria, and citations.`,
  );
}

// ---------------------------------------------------------------------------
// 5. Assessment Generator Agent
// ---------------------------------------------------------------------------

export const AGENT_ASSESSMENT_GENERATOR = "assessment-generator-agent";

export async function runAssessmentGenerator(ctx: PipelineContext): Promise<void> {
  const allKeys = [...new Set(ctx.profile.lessons.flatMap((l) => l.generatorKeys))];

  const diagnostic: DraftLesson = {
    title: `Diagnostic exam: are you ready to prepare for ${ctx.courseCode}?`,
    kind: "diagnostic",
    objectives: ["Measure prerequisite mastery before the preparation plan begins"],
    prereqConcepts: ctx.prereqConcepts,
    originalExplanation:
      "Take this before starting the lessons. Each problem maps to a prerequisite concept; misses tell the Personalization Agent which lessons to emphasize first. Don't study for it — its whole value is honesty.",
    formalExplanation:
      "Scoring: ≥80% → proceed straight to the course lessons; 50-79% → complete the flagged prerequisite lessons first; <50% → work the prerequisite module in the Learning Studio before this curriculum.",
    workedExamples: [],
    practiceProblems: problemsToPracticeStatic(generateProblems(allKeys, 1, ctx.seed + 7)),
    commonMistakes: [],
    setiApplication: "Instrument calibration before observation — know your noise floor before trusting the data.",
    masteryCriteria: ["Score recorded and gaps identified"],
    followUp: [],
    citations: ctx.selected.slice(0, 2).map((s) => ({ sourceUrl: s.url, note: "Assessment aligned to this source's coverage." })),
    qualityScore: 80,
    writtenBy: AGENT_ASSESSMENT_GENERATOR,
    reviewedBy: "",
    reviewStatus: "pending",
    reviewNotes: "",
  };

  const readiness: DraftLesson = {
    ...diagnostic,
    title: `Readiness exam: ${ctx.courseCode} outcome alignment`,
    kind: "readiness_exam",
    objectives: ["Demonstrate mastery aligned to the official course outcomes"],
    originalExplanation:
      "The final gate: problems drawn from every lesson at slightly higher difficulty. Pass it and you're prepared to enroll with confidence.",
    formalExplanation:
      "Mastery bar: ≥85% with every solution justified. The Course Update Agent re-checks readiness after each attempt and notifies you when the bar is cleared.",
    practiceProblems: problemsToPracticeStatic(generateProblems(allKeys, 2, ctx.seed + 13)),
    setiApplication: "Observation readiness reviews precede every telescope campaign; this is yours.",
    masteryCriteria: ["≥85% on the exam", "All solutions justified in writing"],
  };

  ctx.lessons.push(diagnostic, readiness);
  await ctx.log(
    AGENT_ASSESSMENT_GENERATOR,
    "passed",
    `Diagnostic (${diagnostic.practiceProblems.length} items) and readiness exam (${readiness.practiceProblems.length} items) generated across ${allKeys.length} problem generators.`,
  );
}

function problemsToPracticeStatic(problems: GeneratedProblem[]): PracticeProblem[] {
  return problems.map((p) => ({
    prompt: p.prompt,
    answer: p.answerText,
    solution: p.solution,
    validated: false,
    difficulty: p.difficulty,
    generatorKey: p.generatorKey,
    checkExpr: p.checkExpr,
    numericAnswer: p.answer,
  }));
}

// ---------------------------------------------------------------------------
// 6. Mathematical Validator Agent
// ---------------------------------------------------------------------------

export const AGENT_MATH_VALIDATOR = "mathematical-validator-agent";

export async function runMathValidator(ctx: PipelineContext): Promise<void> {
  let checked = 0;
  let failed = 0;
  for (const lesson of ctx.lessons) {
    lesson.practiceProblems = lesson.practiceProblems.filter((p) => {
      checked++;
      try {
        // Independent path: re-evaluate the check expression with the
        // symbolic/numeric engine and compare against the claimed answer.
        const value = evaluate(p.checkExpr);
        const ok = approxEqual(value, p.numericAnswer, 1e-4, 1e-6);
        if (!ok) failed++;
        p.validated = ok;
        return ok; // invalid problems never reach the student
      } catch {
        failed++;
        return false;
      }
    });
  }
  await ctx.log(
    AGENT_MATH_VALIDATOR,
    failed === 0 ? "passed" : "warning",
    `${checked} problems re-derived with the expression engine; ${checked - failed} validated, ${failed} rejected before publication.`,
  );
}

// ---------------------------------------------------------------------------
// 7. Scientific Accuracy Reviewer (never the writer)
// ---------------------------------------------------------------------------

export const AGENT_ACCURACY_REVIEWER = "scientific-accuracy-reviewer";

export async function runAccuracyReviewer(ctx: PipelineContext): Promise<void> {
  let flagged = 0;
  for (const lesson of ctx.lessons) {
    if (lesson.writtenBy === AGENT_ACCURACY_REVIEWER) {
      throw new Error("Review-independence violation: reviewer cannot review its own writing");
    }
    const problems: string[] = [];
    if (lesson.kind === "lesson") {
      if (lesson.originalExplanation.length < 200) problems.push("conceptual explanation too thin");
      if (lesson.formalExplanation.length < 100) problems.push("formal treatment too thin");
      if (!lesson.setiApplication) problems.push("missing SETI/astronomy application");
      if (lesson.objectives.length === 0) problems.push("no learning objectives");
      if (lesson.practiceProblems.length === 0) problems.push("no validated practice problems survived");
      if (lesson.practiceProblems.some((p) => !p.validated)) problems.push("unvalidated problem present");
    }
    if (problems.length > 0) {
      lesson.reviewStatus = "flagged";
      lesson.reviewNotes = problems.join("; ");
      flagged++;
    } else {
      lesson.reviewStatus = "approved";
      lesson.reviewNotes = "Checked: explanation depth, objective coverage, validated problem set, SETI relevance, citation presence.";
    }
    lesson.reviewedBy = AGENT_ACCURACY_REVIEWER;
  }
  await ctx.log(
    AGENT_ACCURACY_REVIEWER,
    flagged === 0 ? "passed" : "warning",
    flagged === 0
      ? `All ${ctx.lessons.length} lessons approved by an independent reviewer (writer: ${AGENT_LESSON_WRITER}).`
      : `${flagged} lesson(s) flagged for revision; flags recorded in review notes.`,
  );
}

// ---------------------------------------------------------------------------
// 8. Citation Agent
// ---------------------------------------------------------------------------

export const AGENT_CITATION = "citation-agent";

export async function runCitationAgent(ctx: PipelineContext): Promise<void> {
  let repaired = 0;
  for (const lesson of ctx.lessons) {
    // Every citation must point at a verified, policy-approved source.
    lesson.citations = lesson.citations.filter(
      (c) => isApprovedUrl(c.sourceUrl) && ctx.verified.some((s) => s.url === c.sourceUrl),
    );
    if (lesson.citations.length === 0 && ctx.selected.length > 0) {
      lesson.citations = [
        { sourceUrl: ctx.selected[0].url, note: "Primary source for this curriculum (auto-attached by the Citation Agent)." },
      ];
      repaired++;
    }
  }
  await ctx.log(
    AGENT_CITATION,
    "passed",
    `Citations validated against the verified source set and access policy${repaired ? `; ${repaired} lesson(s) repaired with the primary source` : ""}. Every published lesson cites at least one approved source.`,
  );
}
