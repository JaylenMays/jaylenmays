/**
 * Small symbolic/numeric mathematics engine used by the Mathematical Validator
 * Agent to independently verify generated answers:
 *  - an expression parser/evaluator (numbers, + - * / ^, parens, functions)
 *  - polynomial calculus (symbolic differentiation/evaluation)
 *  - numeric equivalence checks (validate symbolic results at sample points)
 */

// ----------------------------------------------------------------------------
// Expression evaluator (recursive descent)
// ----------------------------------------------------------------------------

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

export function evaluate(expr: string, env: Record<string, number> = {}): number {
  let pos = 0;
  const s = expr.replace(/\s+/g, "");

  function peek(): string {
    return s[pos] ?? "";
  }
  function parseExpression(): number {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = s[pos++];
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }
  function parseTerm(): number {
    let value = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = s[pos++];
      const rhs = parseFactor();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }
  function parseFactor(): number {
    // Right-associative exponentiation.
    const base = parseUnary();
    if (peek() === "^") {
      pos++;
      const exponent = parseFactor();
      return Math.pow(base, exponent);
    }
    return base;
  }
  function parseUnary(): number {
    if (peek() === "-") {
      pos++;
      return -parseUnary();
    }
    if (peek() === "+") {
      pos++;
      return parseUnary();
    }
    return parseAtom();
  }
  function parseAtom(): number {
    if (peek() === "(") {
      pos++;
      const v = parseExpression();
      if (peek() !== ")") throw new Error(`Expected ')' at ${pos} in "${expr}"`);
      pos++;
      return v;
    }
    // Number
    const numMatch = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(pos));
    if (numMatch) {
      pos += numMatch[0].length;
      return parseFloat(numMatch[0]);
    }
    // Identifier: function call, constant, or variable
    const idMatch = /^[a-zA-Z_][a-zA-Z_0-9]*/.exec(s.slice(pos));
    if (idMatch) {
      const name = idMatch[0];
      pos += name.length;
      if (peek() === "(") {
        const fn = FUNCTIONS[name];
        if (!fn) throw new Error(`Unknown function "${name}" in "${expr}"`);
        pos++;
        const arg = parseExpression();
        if (peek() !== ")") throw new Error(`Expected ')' after ${name}( in "${expr}"`);
        pos++;
        return fn(arg);
      }
      if (name in env) return env[name];
      if (name in CONSTANTS) return CONSTANTS[name];
      throw new Error(`Unknown identifier "${name}" in "${expr}"`);
    }
    throw new Error(`Unexpected character "${peek()}" at ${pos} in "${expr}"`);
  }

  const result = parseExpression();
  if (pos !== s.length) throw new Error(`Trailing input at ${pos} in "${expr}"`);
  return result;
}

export function approxEqual(a: number, b: number, relTol = 1e-6, absTol = 1e-9): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= Math.max(absTol, relTol * Math.max(Math.abs(a), Math.abs(b)));
}

// ----------------------------------------------------------------------------
// Polynomial calculus (coefficients low→high: [c0, c1, c2] = c0 + c1 x + c2 x²)
// ----------------------------------------------------------------------------

export type Poly = number[];

export function polyEval(p: Poly, x: number): number {
  let acc = 0;
  for (let i = p.length - 1; i >= 0; i--) acc = acc * x + p[i];
  return acc;
}

export function polyDerivative(p: Poly): Poly {
  if (p.length <= 1) return [0];
  return p.slice(1).map((c, i) => c * (i + 1));
}

export function polyToString(p: Poly, variable = "x"): string {
  const terms: string[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (c === 0) continue;
    const mag = Math.abs(c);
    const coeff = i === 0 || mag !== 1 ? String(mag) : "";
    const varPart = i === 0 ? "" : i === 1 ? variable : `${variable}^${i}`;
    const sign = c < 0 ? "-" : terms.length === 0 ? "" : "+";
    const spacedSign = terms.length === 0 ? sign : ` ${sign} `;
    terms.push(`${spacedSign}${coeff}${varPart}` || `${spacedSign}1`);
  }
  return terms.length ? terms.join("") : "0";
}

/**
 * Numerically verify that `claimed` is the derivative of `original` by
 * comparing against central difference quotients at sample points — the
 * validator's independent check on symbolic work.
 */
export function verifyDerivative(original: Poly, claimed: Poly, samples = [-2, -0.5, 0.7, 1.3, 3]): boolean {
  const h = 1e-5;
  return samples.every((x) => {
    const numeric = (polyEval(original, x + h) - polyEval(original, x - h)) / (2 * h);
    return approxEqual(numeric, polyEval(claimed, x), 1e-4, 1e-6);
  });
}

/** Solve ax² + bx + c = 0; returns real roots. */
export function quadraticRoots(a: number, b: number, c: number): number[] {
  if (a === 0) return b === 0 ? [] : [-c / b];
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) return [-b / (2 * a)];
  const sq = Math.sqrt(disc);
  return [(-b - sq) / (2 * a), (-b + sq) / (2 * a)].sort((x, y) => x - y);
}

/** det of 2×2 [[a,b],[c,d]] */
export function det2(a: number, b: number, c: number, d: number): number {
  return a * d - b * c;
}

/** Eigenvalues of a 2×2 matrix (real cases). */
export function eigen2x2(a: number, b: number, c: number, d: number): number[] {
  // λ² − (a+d)λ + (ad − bc) = 0
  return quadraticRoots(1, -(a + d), det2(a, b, c, d));
}

// Deterministic RNG so generated curricula are reproducible per seed.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}
