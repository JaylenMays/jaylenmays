/**
 * The OFFICIAL ASU degree plan, transcribed from Jaylen's eAdvisor Major Map
 * and DARS audit (LA APS-A BS — Astronomical and Planetary Sciences,
 * Astrophysics concentration, ASU Online, Fall 2026 / 2026-27 catalog).
 *
 * Credit hours and requirement structure come from the DARS audit
 * (prepared 08/15/2026). Term placement follows the 8-term major map,
 * assuming a Fall 2026 start (Term 1 = Fall 2026, Term 2 = Spring 2027, …).
 * Course titles marked "(confirm title in ASU catalog)" are requirement slots
 * whose official titles weren't shown in the audit text.
 */

import type { CourseTemplate } from "./roadmap-templates";

export interface TransferCredit {
  code: string;
  title: string;
  credits: number;
  grade: string;
  semester: "Fall" | "Spring" | "Summer";
  year: number;
  satisfies: string; // which requirement bucket this filled
}

/** Transfer credits APPLIED to specific requirements or degree electives (DARS: 33.0 hrs applied of 67.5 accepted). */
export const ASU_TRANSFER_CREDITS: TransferCredit[] = [
  { code: "ENG 101", title: "English Composition I (transfer: UA Global ENG 121)", credits: 3, grade: "TB+", semester: "Spring", year: 2016, satisfies: "First-Year Composition" },
  { code: "ENG 102", title: "English Composition II (transfer: UA Global ENG 122)", credits: 3, grade: "TC", semester: "Summer", year: 2016, satisfies: "First-Year Composition" },
  { code: "MAT 170", title: "Precalculus (transfer: U of Kansas MATH 104)", credits: 3, grade: "TA", semester: "Fall", year: 2020, satisfies: "Gen Studies MATH + College math proficiency" },
  { code: "PHI 101", title: "Introduction to Philosophy (transfer: U of Kansas PHIL 140)", credits: 3, grade: "TA", semester: "Spring", year: 2017, satisfies: "Gen Studies HUAD (1 of 2)" },
  { code: "PHI 105", title: "Introduction to Ethics (transfer: U of Kansas PHIL 160)", credits: 3, grade: "TA", semester: "Fall", year: 2020, satisfies: "Gen Studies HUAD (2 of 2)" },
  { code: "PSY DEC", title: "Adult Development (transfer: UA Global PSY 202)", credits: 3, grade: "TC", semester: "Spring", year: 2016, satisfies: "Gen Studies SOBE" },
  { code: "COM 225", title: "Public Speaking (transfer: U of Kansas COMS 130)", credits: 3, grade: "TA", semester: "Fall", year: 2017, satisfies: "Gen Studies CIVI" },
  { code: "AST DEC", title: "Contemporary Astronomy (transfer: U of Kansas ASTR 191)", credits: 3, grade: "TA", semester: "Spring", year: 2017, satisfies: "Degree elective" },
  { code: "GEN 002", title: "Personal Dimensions of Education (transfer: UA Global EXP 105)", credits: 3, grade: "TB+", semester: "Spring", year: 2016, satisfies: "Degree elective" },
  { code: "GEN 004", title: "Computer Literacy (transfer: UA Global INF 103)", credits: 3, grade: "TA", semester: "Summer", year: 2016, satisfies: "Degree elective" },
  { code: "ABS DEC", title: "Intro to Environmental Science (transfer: UA Global ENV 100)", credits: 3, grade: "TC-", semester: "Fall", year: 2016, satisfies: "Degree elective" },
];

/**
 * Remaining requirements, in major-map term order (Fall 2026 start).
 * ASU 101 is waived (NOTFTF — not a first-time freshman).
 */
export const ASU_APS_REMAINING: CourseTemplate[] = [
  // ---- Term 1 · Fall 2026 -------------------------------------------------
  { code: "MAT 265", title: "Calculus for Engineers I (C minimum)", category: "MATH", credits: 3, prerequisites: ["MAT 170"], prepSubjectKeys: ["calc1-prep"], isGradPrereq: true, semester: "Fall", year: 2026 },
  { code: "AST 111", title: "Introduction to Solar Systems Astronomy (C minimum)", category: "ASTRONOMY", credits: 4, prerequisites: [], prepSubjectKeys: ["astronomy-prep"], semester: "Fall", year: 2026 },
  // ---- Term 2 · Spring 2027 ----------------------------------------------
  { code: "AST 112", title: "Introduction to Stars, Galaxies & the Universe (C minimum)", category: "ASTRONOMY", credits: 4, prerequisites: [], prepSubjectKeys: ["astronomy-prep", "stellar-prep"], semester: "Spring", year: 2027 },
  { code: "MAT 266", title: "Calculus for Engineers II (C minimum)", category: "MATH", credits: 3, prerequisites: ["MAT 265"], prepSubjectKeys: ["calc2-prep"], isGradPrereq: true, semester: "Spring", year: 2027 },
  { code: "PHY 121", title: "University Physics I: Mechanics (C minimum)", category: "PHYSICS", credits: 3, prerequisites: ["MAT 265"], prepSubjectKeys: ["physics1-prep"], isGradPrereq: true, semester: "Spring", year: 2027 },
  { code: "PHY 122", title: "University Physics Laboratory I (C minimum)", category: "PHYSICS", credits: 1, prerequisites: ["PHY 121"], prepSubjectKeys: ["physics1-prep"], semester: "Spring", year: 2027 },
  // ---- Term 3 · Fall 2027 -------------------------------------------------
  { code: "MAT 267", title: "Calculus for Engineers III (C minimum)", category: "MATH", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["calc3-prep"], isGradPrereq: true, semester: "Fall", year: 2027 },
  { code: "GS GCSI", title: "Global Communities, Societies & Individuals — gen studies (3 hrs)", category: "GENERAL", credits: 3, prerequisites: [], prepSubjectKeys: [], semester: "Fall", year: 2027 },
  { code: "PHY 131", title: "University Physics II: Electricity & Magnetism (C minimum)", category: "PHYSICS", credits: 3, prerequisites: ["PHY 121", "MAT 266"], prepSubjectKeys: ["physics2-prep"], isGradPrereq: true, semester: "Fall", year: 2027 },
  { code: "PHY 132", title: "University Physics Laboratory II (C minimum)", category: "PHYSICS", credits: 1, prerequisites: ["PHY 131"], prepSubjectKeys: ["physics2-prep"], semester: "Fall", year: 2027 },
  { code: "MAT 275", title: "Modern Differential Equations (C minimum)", category: "MATH", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["diffeq-prep"], isGradPrereq: true, semester: "Fall", year: 2027 },
  // ---- Term 4 · Spring 2028 ----------------------------------------------
  { code: "PHY 202", title: "Physics requirement — 1 hr (confirm title in ASU catalog)", category: "PHYSICS", credits: 1, prerequisites: ["PHY 121"], prepSubjectKeys: ["calc3-prep", "linear-algebra-prep"], semester: "Spring", year: 2028 },
  { code: "PHY 241", title: "University Physics III (C minimum)", category: "PHYSICS", credits: 3, prerequisites: ["PHY 131", "MAT 267"], prepSubjectKeys: ["modern-physics-prep"], isGradPrereq: true, semester: "Spring", year: 2028 },
  { code: "PHY 201", title: "Mathematical Methods in Physics (confirm title in ASU catalog)", category: "PHYSICS", credits: 3, prerequisites: ["MAT 266"], prepSubjectKeys: ["calc3-prep", "diffeq-prep", "linear-algebra-prep"], isGradPrereq: true, semester: "Spring", year: 2028 },
  { code: "SES 106", title: "Habitable Worlds (C minimum)", category: "ASTRONOMY", credits: 4, prerequisites: [], prepSubjectKeys: ["astronomy-prep"], semester: "Spring", year: 2028 },
  // ---- Term 5 · Fall 2028 -------------------------------------------------
  { code: "SES 350", title: "SESE core course (confirm title in ASU catalog; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 112"], prepSubjectKeys: ["astronomy-prep", "scientific-python-prep"], semester: "Fall", year: 2028 },
  { code: "S&S ELEC", title: "Science & Society elective (approved list; C minimum)", category: "GENERAL", credits: 3, prerequisites: [], prepSubjectKeys: [], semester: "Fall", year: 2028 },
  { code: "GS SUST", title: "Sustainability — gen studies (3 hrs)", category: "GENERAL", credits: 3, prerequisites: [], prepSubjectKeys: [], semester: "Fall", year: 2028 },
  // ---- Term 6 · Spring 2029 ----------------------------------------------
  { code: "AST 321", title: "Introduction to Planetary & Stellar Astrophysics (Session C; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 112", "PHY 121", "MAT 266"], prepSubjectKeys: ["stellar-prep"], isGradPrereq: true, semester: "Spring", year: 2029 },
  { code: "SES 376", title: "SESE core course (confirm title in ASU catalog; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["SES 106"], prepSubjectKeys: ["astronomy-prep"], semester: "Spring", year: 2029 },
  { code: "SES 377", title: "SESE core course (confirm title in ASU catalog; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["SES 106"], prepSubjectKeys: ["astronomy-prep"], semester: "Spring", year: 2029 },
  // ---- Term 7 · Fall 2029 -------------------------------------------------
  { code: "AST 322", title: "Introduction to Galactic & Extragalactic Astrophysics (Session C; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 321"], prepSubjectKeys: ["stellar-prep"], isGradPrereq: true, semester: "Fall", year: 2029 },
  { code: "SES 421", title: "SESE concentration course (confirm title in ASU catalog; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["SES 350"], prepSubjectKeys: ["stellar-prep", "scientific-python-prep"], semester: "Fall", year: 2029 },
  { code: "APS ELEC", title: "UD Concentration elective — pick from PHY 302/310/311/315/361/441, SES 499 (C min)", category: "PHYSICS", credits: 3, prerequisites: ["PHY 131"], prepSubjectKeys: ["physics2-prep", "quantum-prep"], semester: "Fall", year: 2029 },
  // ---- Term 8 · Spring 2030 ----------------------------------------------
  { code: "AST 421", title: "Advanced astrophysics (confirm title in ASU catalog; C minimum)", category: "ASTRONOMY", credits: 3, prerequisites: ["AST 322"], prepSubjectKeys: ["stellar-prep"], isGradPrereq: true, semester: "Spring", year: 2030 },
  { code: "GS AMIT", title: "American Institutions — gen studies (3 hrs)", category: "GENERAL", credits: 3, prerequisites: [], prepSubjectKeys: [], semester: "Spring", year: 2030 },
  { code: "UD S&S", title: "Upper-division Science & Society elective (C minimum)", category: "GENERAL", credits: 3, prerequisites: [], prepSubjectKeys: [], semester: "Spring", year: 2030 },
  { code: "GS QTRS", title: "Quantitative Reasoning — gen studies (3 hrs; often satisfied in-major — confirm with advisor)", category: "GENERAL", credits: 3, prerequisites: [], prepSubjectKeys: [], semester: "Spring", year: 2030 },
  { code: "UD ELEC", title: "Upper-division electives (~12 hrs toward the 45-hr UD minimum)", category: "GENERAL", credits: 12, prerequisites: [], prepSubjectKeys: [], semester: "Spring", year: 2030 },
];

export const ASU_APS_PATH = {
  name: "ASU APS (Astrophysics) BS — Official LAASTPLABS Plan",
  notes:
    "Transcribed from your eAdvisor Major Map + DARS audit (prepared 08/15/2026, Fall 2026 catalog). " +
    "Official DARS status: 67.5 transfer hours accepted, 33.0 applied to requirements; 52.5 hours remaining " +
    "(120 total, 45 UD minimum, 30 ASU-resident minimum). Some gen-studies rows below (SCIT, QTRS) typically " +
    "double-count with major courses like AST 111 and SES 106, so the app's credit estimate can read higher than " +
    "DARS — DARS is the official number. ASU 101 waived (not a first-time freshman). Note: the audit also shows " +
    "an Astronomy Minor block — confirm with your advisor whether that's an active declaration, since it overlaps " +
    "the major. Recommended concentration elective for the SETI goal: PHY 441 (Statistical Mechanics) or PHY 311.",
};
