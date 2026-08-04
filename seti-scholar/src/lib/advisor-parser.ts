/**
 * Parses advisor-provided course lists and DARS-style degree audit text into
 * structured courses. Tolerant of common formats:
 *
 *   MAT 265 Calculus for Engineers I 3.0 A
 *   PHY 121 - University Physics I (4 credits)
 *   AST 111, Intro to Solar Systems, 4, Fall 2026
 *   FA26 MAT265 3.00 A- Calculus for Engineers I
 */

export interface ParsedCourse {
  code: string;
  title: string;
  credits: number;
  grade: string | null;
  semester: string | null;
  year: number | null;
}

const CODE_RE = /\b([A-Z]{2,4})\s?-?\s?(\d{3}[A-Z]?)\b/;
const GRADE_RE = /(?<![A-Za-z0-9])(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D|E|F)(?![A-Za-z0-9+\-])/;
const CREDITS_RE = /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:credits?|credit hours?|cr\.?|hours?)\b|\b(\d(?:\.\d{1,2})?)\b/;
const TERM_RE = /\b(Fall|Spring|Summer|Winter|FA|SP|SU|WI)\s?'?(\d{2}|\d{4})\b/i;

const TERM_MAP: Record<string, string> = {
  fa: "Fall",
  sp: "Spring",
  su: "Summer",
  wi: "Winter",
  fall: "Fall",
  spring: "Spring",
  summer: "Summer",
  winter: "Winter",
};

function parseTerm(line: string): { semester: string | null; year: number | null } {
  const m = line.match(TERM_RE);
  if (!m) return { semester: null, year: null };
  const semester = TERM_MAP[m[1].toLowerCase()] ?? null;
  let year = parseInt(m[2], 10);
  if (year < 100) year += 2000;
  return { semester, year };
}

export function parseAdvisorText(raw: string): ParsedCourse[] {
  const courses: ParsedCourse[] = [];
  const seen = new Set<string>();

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.length < 6) continue;

    const codeMatch = line.match(CODE_RE);
    if (!codeMatch) continue;
    const code = `${codeMatch[1]} ${codeMatch[2]}`;
    if (seen.has(code)) continue;

    const rest = line.replace(codeMatch[0], " ");
    const { semester, year } = parseTerm(rest);
    const withoutTerm = rest.replace(TERM_RE, " ");

    const gradeMatch = withoutTerm.match(GRADE_RE);
    const grade = gradeMatch ? gradeMatch[1] : null;

    let credits = 3;
    const explicit = withoutTerm.match(
      /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:credits?|credit hours?|cr\.?)\b/i,
    );
    if (explicit) {
      credits = parseFloat(explicit[1]);
    } else {
      // Fall back to a standalone small number (1-6) as a credit count.
      const nums = withoutTerm.match(/(?<![.\d])([1-6](?:\.\d{1,2})?)(?![.\d])/g);
      if (nums && nums.length > 0) credits = parseFloat(nums[nums.length - 1]);
    }

    // Title = the longest alphabetic run left after stripping metadata.
    const title =
      withoutTerm
        .replace(GRADE_RE, " ")
        .replace(/\b\d+(?:\.\d+)?\s*(?:credits?|credit hours?|cr\.?)\b/gi, " ")
        .replace(/[|,;()\-–]+/g, " ")
        .replace(/\b\d+(?:\.\d+)?\b/g, " ")
        .replace(/\s+/g, " ")
        .trim() || code;

    seen.add(code);
    courses.push({ code, title, credits, grade, semester, year });
  }

  return courses;
}

export function summarizeImport(courses: ParsedCourse[]) {
  const totalCredits = courses.reduce((a, c) => a + c.credits, 0);
  const graded = courses.filter((c) => c.grade);
  return {
    courseCount: courses.length,
    totalCredits,
    gradedCount: graded.length,
    codes: courses.map((c) => c.code),
  };
}
