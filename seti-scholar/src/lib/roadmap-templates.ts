/**
 * Degree-path templates. The exact ASU degree is not yet confirmed by advising,
 * so several candidate paths are provisioned and all of them are fully editable
 * (add/remove/reorder courses, change prerequisites, semesters, grades).
 */

export type PathTypeKey =
  | "PHYSICS_BS"
  | "APS_BS"
  | "CUSTOM_ASTROPHYSICS"
  | "GRAD_PREP"
  | "SETI_RESEARCH"
  | "QUANTUM_SECONDARY";

export type CategoryKey =
  | "MATH"
  | "PHYSICS"
  | "ASTRONOMY"
  | "PROGRAMMING"
  | "RESEARCH"
  | "QUANTUM"
  | "GENERAL";

export interface CourseTemplate {
  code: string;
  title: string;
  category: CategoryKey;
  credits: number;
  prerequisites: string[];
  prepSubjectKeys: string[];
  isGradPrereq?: boolean;
  // Optional term placement / completion data (used by the official ASU map).
  semester?: "Fall" | "Spring" | "Summer";
  year?: number;
  grade?: string;
  isTransfer?: boolean;
  status?: "PLANNED" | "PREPARING" | "IN_PROGRESS" | "COMPLETED" | "TRANSFER";
}

import { ASU_APS_PATH, ASU_APS_REMAINING, ASU_TRANSFER_CREDITS } from "./asu-aps-map";

export interface PathTemplate {
  name: string;
  type: PathTypeKey;
  isActive: boolean;
  notes: string;
  courses: CourseTemplate[];
}

const MATH_CORE: CourseTemplate[] = [
  { code: "MAT 117", title: "College Algebra", category: "MATH", credits: 3, prerequisites: [], prepSubjectKeys: ["algebra-foundations"] },
  { code: "MAT 170", title: "Precalculus", category: "MATH", credits: 3, prerequisites: ["MAT 117"], prepSubjectKeys: ["algebra-foundations", "precalc-trig"] },
  { code: "MAT 171", title: "Trigonometry", category: "MATH", credits: 3, prerequisites: ["MAT 117"], prepSubjectKeys: ["precalc-trig"] },
  { code: "MAT 265", title: "Calculus for Engineers I", category: "MATH", credits: 3, prerequisites: ["MAT 170"], prepSubjectKeys: ["calc1-prep"], isGradPrereq: true },
  { code: "MAT 266", title: "Calculus for Engineers II", category: "MATH", credits: 3, prerequisites: ["MAT 265"], prepSubjectKeys: ["calc2-prep"], isGradPrereq: true },
  { code: "MAT 267", title: "Calculus for Engineers III", category: "MATH", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["calc3-prep"], isGradPrereq: true },
  { code: "MAT 275", title: "Differential Equations", category: "MATH", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["diffeq-prep"], isGradPrereq: true },
  { code: "MAT 342", title: "Linear Algebra", category: "MATH", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["linear-algebra-prep"], isGradPrereq: true },
  { code: "STP 420", title: "Probability & Statistics", category: "MATH", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["prob-stats-prep"], isGradPrereq: true },
  { code: "MAT 243", title: "Discrete Mathematics", category: "MATH", credits: 3, prerequisites: ["MAT 170"], prepSubjectKeys: ["algebra-foundations"] },
  { code: "MAT 420", title: "Numerical Methods", category: "MATH", credits: 3, prerequisites: ["MAT 342", "CSE 110"], prepSubjectKeys: ["scientific-python-prep"] },
];

const PHYSICS_CORE: CourseTemplate[] = [
  { code: "PHY 121", title: "University Physics I: Mechanics (with Lab)", category: "PHYSICS", credits: 4, prerequisites: ["MAT 265"], prepSubjectKeys: ["physics1-prep"], isGradPrereq: true },
  { code: "PHY 131", title: "University Physics II: E&M (with Lab)", category: "PHYSICS", credits: 4, prerequisites: ["PHY 121", "MAT 266"], prepSubjectKeys: ["physics2-prep"], isGradPrereq: true },
  { code: "PHY 201", title: "Modern Physics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 131"], prepSubjectKeys: ["modern-physics-prep"], isGradPrereq: true },
  { code: "PHY 302", title: "Classical Mechanics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 121", "MAT 275"], prepSubjectKeys: ["physics1-prep", "diffeq-prep"], isGradPrereq: true },
  { code: "PHY 311", title: "Electricity & Magnetism", category: "PHYSICS", credits: 3, prerequisites: ["PHY 131", "MAT 267"], prepSubjectKeys: ["physics2-prep", "calc3-prep"], isGradPrereq: true },
  { code: "PHY 320", title: "Thermodynamics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 131", "MAT 267"], prepSubjectKeys: ["modern-physics-prep"] },
  { code: "PHY 441", title: "Statistical Mechanics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 320"], prepSubjectKeys: ["prob-stats-prep"], isGradPrereq: true },
  { code: "PHY 314", title: "Quantum Mechanics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 201", "MAT 342"], prepSubjectKeys: ["quantum-prep"], isGradPrereq: true },
  { code: "PHY 334", title: "Optics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 131"], prepSubjectKeys: ["physics2-prep"] },
  { code: "PHY 465", title: "Experimental Physics", category: "PHYSICS", credits: 3, prerequisites: ["PHY 201"], prepSubjectKeys: ["scientific-python-prep"] },
];

const ASTRO_CORE: CourseTemplate[] = [
  { code: "AST 111", title: "Introduction to Astronomy", category: "ASTRONOMY", credits: 4, prerequisites: [], prepSubjectKeys: ["astronomy-prep"] },
  { code: "AST 113", title: "Solar System Astronomy", category: "ASTRONOMY", credits: 4, prerequisites: [], prepSubjectKeys: ["astronomy-prep"] },
  { code: "AST 112", title: "Stars, Galaxies & the Universe", category: "ASTRONOMY", credits: 4, prerequisites: [], prepSubjectKeys: ["astronomy-prep"] },
  { code: "AST 321", title: "Stellar Astrophysics", category: "ASTRONOMY", credits: 3, prerequisites: ["PHY 131", "AST 112"], prepSubjectKeys: ["stellar-prep"], isGradPrereq: true },
  { code: "AST 322", title: "Galactic Astrophysics", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 321"], prepSubjectKeys: ["stellar-prep"] },
  { code: "AST 421", title: "Extragalactic Astrophysics", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 322"], prepSubjectKeys: ["stellar-prep"] },
  { code: "AST 422", title: "Cosmology", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 322"], prepSubjectKeys: ["stellar-prep"] },
  { code: "AST 331", title: "Planetary Science", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 113", "PHY 121"], prepSubjectKeys: ["astronomy-prep"] },
  { code: "AST 431", title: "Exoplanets", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 321"], prepSubjectKeys: ["stellar-prep", "signal-processing-prep"] },
  { code: "AST 350", title: "Astrobiology", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 111"], prepSubjectKeys: ["astronomy-prep"] },
  { code: "AST 460", title: "Observational Astronomy", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 112"], prepSubjectKeys: ["astronomy-prep", "scientific-python-prep"] },
  { code: "AST 440", title: "Computational Astrophysics", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 321", "CSE 110"], prepSubjectKeys: ["scientific-python-prep"], isGradPrereq: true },
  { code: "AST 470", title: "Radio Astronomy", category: "ASTRONOMY", credits: 3, prerequisites: ["PHY 131"], prepSubjectKeys: ["radio-seti-prep", "signal-processing-prep"] },
];

const PROGRAMMING_CORE: CourseTemplate[] = [
  { code: "CSE 110", title: "Python Fundamentals", category: "PROGRAMMING", credits: 3, prerequisites: [], prepSubjectKeys: ["python-prep"], isGradPrereq: true },
  { code: "CSE 210", title: "Scientific Python (NumPy & SciPy)", category: "PROGRAMMING", credits: 3, prerequisites: ["CSE 110"], prepSubjectKeys: ["scientific-python-prep"] },
  { code: "DAT 310", title: "Data Analysis & Visualization", category: "PROGRAMMING", credits: 3, prerequisites: ["CSE 210"], prepSubjectKeys: ["scientific-python-prep", "prob-stats-prep"] },
  { code: "CSE 445", title: "Machine Learning for Science", category: "PROGRAMMING", credits: 3, prerequisites: ["CSE 210", "MAT 342"], prepSubjectKeys: ["ml-prep"] },
];

const SETI_RESEARCH_COURSES: CourseTemplate[] = [
  { code: "SIG 401", title: "Signal Processing & Fourier Analysis", category: "RESEARCH", credits: 3, prerequisites: ["MAT 275", "CSE 210"], prepSubjectKeys: ["signal-processing-prep"] },
  { code: "SETI 410", title: "Technosignatures & SETI Methods", category: "RESEARCH", credits: 3, prerequisites: ["AST 470", "SIG 401"], prepSubjectKeys: ["radio-seti-prep"] },
  { code: "SETI 420", title: "Radio-Frequency Interference & Validation", category: "RESEARCH", credits: 3, prerequisites: ["SETI 410"], prepSubjectKeys: ["radio-seti-prep"] },
  { code: "SETI 490", title: "Independent SETI Research Project", category: "RESEARCH", credits: 3, prerequisites: ["SETI 410"], prepSubjectKeys: ["radio-seti-prep", "ml-prep"] },
];

const QUANTUM_COURSES: CourseTemplate[] = [
  { code: "QC 301", title: "Foundations of Quantum Computing", category: "QUANTUM", credits: 3, prerequisites: ["MAT 342"], prepSubjectKeys: ["quantum-computing-prep"] },
  { code: "QC 310", title: "Quantum Algorithms", category: "QUANTUM", credits: 3, prerequisites: ["QC 301"], prepSubjectKeys: ["quantum-computing-prep"] },
  { code: "QC 410", title: "Quantum Information & Error Correction", category: "QUANTUM", credits: 3, prerequisites: ["QC 310"], prepSubjectKeys: ["quantum-computing-prep"] },
  { code: "QC 420", title: "Quantum Machine Learning", category: "QUANTUM", credits: 3, prerequisites: ["QC 310", "CSE 445"], prepSubjectKeys: ["quantum-computing-prep", "ml-prep"] },
];

export const PATH_TEMPLATES: PathTemplate[] = [
  {
    name: "Astrophysics Preparation Pathway",
    type: "CUSTOM_ASTROPHYSICS",
    isActive: false,
    notes:
      "Customized preparation pathway toward SETI astrophysics — supplemental subject equivalents beyond the official ASU degree plan.",
    courses: [...MATH_CORE, ...PHYSICS_CORE, ...ASTRO_CORE, ...PROGRAMMING_CORE],
  },
  {
    name: "ASU Online Physics BS (draft)",
    type: "PHYSICS_BS",
    isActive: false,
    notes:
      "Draft plan modeled on the ASU Online Physics BS. Confirm exact requirements with your ASU advisor before enrolling.",
    courses: [
      ...MATH_CORE.filter((c) => !["MAT 243", "MAT 420"].includes(c.code)),
      ...PHYSICS_CORE,
      ...PROGRAMMING_CORE.slice(0, 2),
      ...ASTRO_CORE.filter((c) => ["AST 112", "AST 321"].includes(c.code)),
    ],
  },
  {
    name: ASU_APS_PATH.name,
    type: "APS_BS",
    isActive: true,
    notes: ASU_APS_PATH.notes,
    courses: [
      ...ASU_TRANSFER_CREDITS.map(
        (t): CourseTemplate => ({
          code: t.code,
          title: `${t.title} — satisfies: ${t.satisfies}`,
          category: t.code.startsWith("MAT")
            ? "MATH"
            : t.code.startsWith("AST")
              ? "ASTRONOMY"
              : "GENERAL",
          credits: t.credits,
          prerequisites: [],
          prepSubjectKeys: [],
          semester: t.semester,
          year: t.year,
          grade: t.grade,
          isTransfer: true,
          status: "TRANSFER",
        }),
      ),
      ...ASU_APS_REMAINING,
    ],
  },
  {
    name: "Graduate School Prerequisites",
    type: "GRAD_PREP",
    isActive: false,
    notes:
      "The physics/astro coursework most astrophysics PhD programs expect. Anything here missing from your degree plan is a gap to close before applying.",
    courses: [
      ...MATH_CORE.filter((c) => c.isGradPrereq),
      ...PHYSICS_CORE.filter((c) => c.isGradPrereq),
      ...ASTRO_CORE.filter((c) => c.isGradPrereq),
      ...PROGRAMMING_CORE.filter((c) => c.isGradPrereq),
    ],
  },
  {
    name: "SETI Research Specialization",
    type: "SETI_RESEARCH",
    isActive: false,
    notes:
      "Radio astronomy, signal processing, technosignatures, and research-methods work targeted at SETI Institute-style research.",
    courses: [
      ...PROGRAMMING_CORE,
      ...ASTRO_CORE.filter((c) => ["AST 460", "AST 440", "AST 470"].includes(c.code)),
      ...SETI_RESEARCH_COURSES,
    ],
  },
  {
    name: "Quantum Computing Secondary Specialization",
    type: "QUANTUM_SECONDARY",
    isActive: false,
    notes:
      "Secondary specialization — complements (never replaces) the astronomy/physics pathway. Useful for quantum-enhanced signal processing and scientific computing.",
    courses: [
      ...MATH_CORE.filter((c) => ["MAT 342", "STP 420"].includes(c.code)),
      ...PHYSICS_CORE.filter((c) => ["PHY 201", "PHY 314"].includes(c.code)),
      ...QUANTUM_COURSES,
    ],
  },
];

export const DEFAULT_CAREER_MILESTONES = [
  { title: "Confirm ASU degree plan with advisor", description: "Decide between Physics BS and Astronomical & Planetary Sciences BS; import the official plan into the roadmap." },
  { title: "Master calculus & physics core", description: "Complete Calculus I–III and University Physics I–II with A grades." },
  { title: "Become fluent in scientific Python", description: "Python, NumPy, SciPy, matplotlib — comfortable analyzing real datasets." },
  { title: "Complete a radio-astronomy data project", description: "Analyze open data (e.g. Breakthrough Listen public archive) end-to-end: load, clean, search, validate." },
  { title: "Join a research experience", description: "REU-style program, ASU research group, or an open SETI/radio-astronomy collaboration." },
  { title: "Present or publish a first result", description: "Poster, conference talk, or co-authored paper on a technosignature/radio analysis." },
  { title: "Take the physics GRE / finalize grad applications", description: "Applications targeting astrophysics programs with SETI-adjacent research groups." },
  { title: "Graduate school in astrophysics", description: "PhD program with radio astronomy / technosignature research opportunities." },
  { title: "SETI Institute research role", description: "The mission: astrophysicist working on technosignatures, radio astronomy, and signal processing." },
];
