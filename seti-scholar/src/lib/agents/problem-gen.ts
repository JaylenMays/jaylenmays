/**
 * Parametric problem generators. Each generator produces a problem whose
 * answer is computed programmatically AND carries an independent `checkExpr`
 * that the Mathematical Validator Agent re-evaluates with the expression
 * engine — a genuinely separate verification path from the generator's own
 * arithmetic.
 */

import {
  det2,
  eigen2x2,
  mulberry32,
  polyDerivative,
  polyEval,
  polyToString,
  quadraticRoots,
  randInt,
  type Poly,
} from "./math-engine";

export interface GeneratedProblem {
  generatorKey: string;
  prompt: string;
  answer: number; // canonical numeric answer (rounded for display separately)
  answerText: string; // what the student should produce
  solution: string; // full worked solution
  checkExpr: string; // independent expression the validator evaluates
  checkEnv?: Record<string, number>;
  difficulty: 1 | 2 | 3;
}

type Generator = (rng: () => number) => GeneratedProblem;

const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;

const GENERATORS: Record<string, Generator> = {
  "derivative-poly": (rng) => {
    const p: Poly = [randInt(rng, -5, 5), randInt(rng, -6, 6), randInt(rng, 1, 5), randInt(rng, 1, 4)];
    const d = polyDerivative(p);
    const x0 = randInt(rng, -2, 3);
    const ans = polyEval(d, x0);
    return {
      generatorKey: "derivative-poly",
      prompt: `Let f(x) = ${polyToString(p)}. Compute f'(${x0}).`,
      answer: ans,
      answerText: `f'(x) = ${polyToString(d)}, so f'(${x0}) = ${ans}`,
      solution: `Differentiate term by term with the power rule: f'(x) = ${polyToString(d)}. Substitute x = ${x0}: f'(${x0}) = ${ans}.`,
      checkExpr: d.map((c, i) => `(${c})*(${x0})^${i}`).join("+"),
      difficulty: 1,
    };
  },

  "derivative-chain": (rng) => {
    const a = randInt(rng, 2, 5);
    const n = randInt(rng, 2, 3);
    const x0 = randInt(rng, 0, 2);
    // f(x) = (a x + 1)^n → f'(x) = n a (a x + 1)^(n-1)
    const ans = n * a * Math.pow(a * x0 + 1, n - 1);
    return {
      generatorKey: "derivative-chain",
      prompt: `Let f(x) = (${a}x + 1)^${n}. Compute f'(${x0}) using the chain rule.`,
      answer: ans,
      answerText: `f'(x) = ${n}·${a}·(${a}x+1)^${n - 1}; f'(${x0}) = ${ans}`,
      solution: `Outer derivative: ${n}(${a}x+1)^${n - 1}; inner derivative: ${a}. Multiply: f'(x) = ${n * a}(${a}x+1)^${n - 1}. At x = ${x0}: ${ans}.`,
      checkExpr: `${n}*${a}*(${a}*${x0}+1)^${n - 1}`,
      difficulty: 2,
    };
  },

  "limit-rational": (rng) => {
    const r = randInt(rng, 1, 5);
    // (x² − r²)/(x − r) → limit x→r is 2r
    return {
      generatorKey: "limit-rational",
      prompt: `Evaluate lim (x→${r}) (x² − ${r * r}) / (x − ${r}).`,
      answer: 2 * r,
      answerText: `${2 * r}`,
      solution: `Direct substitution gives 0/0. Factor the numerator: (x−${r})(x+${r})/(x−${r}) = x + ${r} for x ≠ ${r}. The limit is ${r} + ${r} = ${2 * r}.`,
      checkExpr: `${r}+${r}`,
      difficulty: 1,
    };
  },

  "optimize-quadratic": (rng) => {
    const a = -randInt(rng, 1, 4);
    const b = randInt(rng, 4, 12);
    // f(x) = a x² + b x → max at x* = −b/2a
    const xStar = -b / (2 * a);
    return {
      generatorKey: "optimize-quadratic",
      prompt: `A projectile's height is h(x) = ${a}x² + ${b}x (meters, x in seconds). At what time x is the height maximized?`,
      answer: xStar,
      answerText: `x = ${round(xStar)} s`,
      solution: `Set h'(x) = ${2 * a}x + ${b} = 0 → x = ${b}/${-2 * a} = ${round(xStar)}. Since h'' = ${2 * a} < 0 this is a maximum.`,
      checkExpr: `(${-b})/(2*(${a}))`,
      difficulty: 2,
    };
  },

  "algebra-linear": (rng) => {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, -10, 10);
    const c = randInt(rng, -10, 20);
    const ans = (c - b) / a;
    return {
      generatorKey: "algebra-linear",
      prompt: `Solve for x: ${a}x ${b >= 0 ? "+ " + b : "− " + Math.abs(b)} = ${c}.`,
      answer: ans,
      answerText: `x = ${round(ans)}`,
      solution: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${round(ans)}.`,
      checkExpr: `(${c}-(${b}))/${a}`,
      difficulty: 1,
    };
  },

  "algebra-quadratic": (rng) => {
    const r1 = randInt(rng, -4, 3);
    const r2 = randInt(rng, r1 + 1, 6);
    const b = -(r1 + r2);
    const c = r1 * r2;
    return {
      generatorKey: "algebra-quadratic",
      prompt: `Find the larger root of x² ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)} = 0.`,
      answer: r2,
      answerText: `x = ${r2} (the roots are ${r1} and ${r2})`,
      solution: `Factor: (x − ${r1})(x − ${r2}) = 0, or use the quadratic formula with a=1, b=${b}, c=${c}. Roots: ${r1}, ${r2}; the larger is ${r2}.`,
      checkExpr: `(-(${b})+sqrt((${b})^2-4*1*(${c})))/2`,
      difficulty: 2,
    };
  },

  "trig-eval": (rng) => {
    const cases = [
      { deg: 30, fn: "sin", val: 0.5, txt: "1/2" },
      { deg: 60, fn: "cos", val: 0.5, txt: "1/2" },
      { deg: 45, fn: "sin", val: Math.SQRT1_2, txt: "√2/2" },
      { deg: 90, fn: "sin", val: 1, txt: "1" },
      { deg: 0, fn: "cos", val: 1, txt: "1" },
      { deg: 30, fn: "cos", val: Math.sqrt(3) / 2, txt: "√3/2" },
    ];
    const c = cases[randInt(rng, 0, cases.length - 1)];
    const rad = (c.deg * Math.PI) / 180;
    return {
      generatorKey: "trig-eval",
      prompt: `Evaluate ${c.fn}(${c.deg}°) exactly, and give its decimal value.`,
      answer: c.val,
      answerText: `${c.txt} ≈ ${round(c.val)}`,
      solution: `${c.deg}° = ${round(rad)} rad. From the unit circle, ${c.fn}(${c.deg}°) = ${c.txt} ≈ ${round(c.val)}.`,
      checkExpr: `${c.fn}(${rad})`,
      difficulty: 1,
    };
  },

  "matrix-det": (rng) => {
    const [a, b, c, d] = [randInt(rng, -5, 5), randInt(rng, -5, 5), randInt(rng, -5, 5), randInt(rng, -5, 5)];
    const ans = det2(a, b, c, d);
    return {
      generatorKey: "matrix-det",
      prompt: `Compute the determinant of [[${a}, ${b}], [${c}, ${d}]]. Is the matrix invertible?`,
      answer: ans,
      answerText: `det = ${ans}; ${ans !== 0 ? "invertible" : "NOT invertible"}`,
      solution: `det = ad − bc = (${a})(${d}) − (${b})(${c}) = ${ans}. ${ans !== 0 ? "Nonzero, so the matrix is invertible." : "Zero, so the matrix is singular."}`,
      checkExpr: `${a}*${d}-(${b})*(${c})`,
      difficulty: 1,
    };
  },

  "eigen-2x2": (rng) => {
    // Triangular matrix → eigenvalues are the diagonal; unambiguous and checkable.
    const a = randInt(rng, -3, 5);
    const d = randInt(rng, a + 1, a + 6);
    const b = randInt(rng, -4, 4);
    const eig = eigen2x2(a, b, 0, d);
    return {
      generatorKey: "eigen-2x2",
      prompt: `Find the larger eigenvalue of the (upper-triangular) matrix [[${a}, ${b}], [0, ${d}]].`,
      answer: Math.max(...eig),
      answerText: `λ = ${d} (eigenvalues ${a} and ${d})`,
      solution: `det(A − λI) = (${a} − λ)(${d} − λ) − 0 = 0 → λ = ${a} or λ = ${d}. A triangular matrix's eigenvalues are its diagonal entries. Larger: ${d}.`,
      checkExpr: `(${a}+${d}+abs(${d}-${a}))/2`,
      difficulty: 2,
    };
  },

  "kinematics-freefall": (rng) => {
    const t = randInt(rng, 2, 6);
    const ans = 0.5 * 9.8 * t * t;
    return {
      generatorKey: "kinematics-freefall",
      prompt: `An object is dropped from rest. How far does it fall in ${t} s? (g = 9.8 m/s², ignore air resistance.)`,
      answer: ans,
      answerText: `${round(ans, 1)} m`,
      solution: `Δy = ½gt² = 0.5 × 9.8 × ${t}² = ${round(ans, 1)} m.`,
      checkExpr: `0.5*9.8*${t}^2`,
      difficulty: 1,
    };
  },

  "vector-ops": (rng) => {
    const v = [randInt(rng, -4, 4), randInt(rng, -4, 4), randInt(rng, -4, 4)];
    const w = [randInt(rng, -4, 4), randInt(rng, -4, 4), randInt(rng, -4, 4)];
    const dot = v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
    return {
      generatorKey: "vector-ops",
      prompt: `Compute the dot product of a = (${v.join(", ")}) and b = (${w.join(", ")}). Are they perpendicular?`,
      answer: dot,
      answerText: `a·b = ${dot}; ${dot === 0 ? "perpendicular" : "not perpendicular"}`,
      solution: `a·b = ${v[0]}·${w[0]} + ${v[1]}·${w[1]} + ${v[2]}·${w[2]} = ${dot}. ${dot === 0 ? "Zero dot product → perpendicular." : "Nonzero → not perpendicular."}`,
      checkExpr: `${v[0]}*${w[0]}+${v[1]}*${w[1]}+${v[2]}*${w[2]}`,
      difficulty: 1,
    };
  },

  "newton-force": (rng) => {
    const m = randInt(rng, 2, 20) * 100;
    const F = randInt(rng, 2, 9) * 50;
    const ans = F / m;
    return {
      generatorKey: "newton-force",
      prompt: `A ${m} kg probe fires a thruster producing ${F} N. What is its acceleration?`,
      answer: ans,
      answerText: `${round(ans)} m/s²`,
      solution: `a = F/m = ${F}/${m} = ${round(ans)} m/s².`,
      checkExpr: `${F}/${m}`,
      difficulty: 1,
    };
  },

  "energy-conservation": (rng) => {
    const h = randInt(rng, 5, 45);
    const ans = Math.sqrt(2 * 9.8 * h);
    return {
      generatorKey: "energy-conservation",
      prompt: `A ball is dropped from ${h} m. Using energy conservation, find its speed just before impact (g = 9.8 m/s²).`,
      answer: ans,
      answerText: `${round(ans, 2)} m/s`,
      solution: `mgh = ½mv² → v = √(2gh) = √(2 × 9.8 × ${h}) = ${round(ans, 2)} m/s. Mass cancels.`,
      checkExpr: `sqrt(2*9.8*${h})`,
      difficulty: 2,
    };
  },

  "coulomb-force": (rng) => {
    const q1 = randInt(rng, 1, 5); // μC
    const q2 = randInt(rng, 1, 5);
    const r = randInt(rng, 1, 4); // m
    const ans = (8.99e9 * q1 * 1e-6 * q2 * 1e-6) / (r * r);
    return {
      generatorKey: "coulomb-force",
      prompt: `Two charges of ${q1} μC and ${q2} μC are ${r} m apart. Find the magnitude of the force between them (k = 8.99×10⁹ N·m²/C²).`,
      answer: ans,
      answerText: `${ans.toExponential(2)} N`,
      solution: `F = kq₁q₂/r² = (8.99×10⁹)(${q1}×10⁻⁶)(${q2}×10⁻⁶)/${r}² = ${ans.toExponential(2)} N.`,
      checkExpr: `8.99e9*${q1}e-6*${q2}e-6/${r}^2`,
      difficulty: 2,
    };
  },

  "circuit-ohm": (rng) => {
    const V = randInt(rng, 3, 24);
    const R = randInt(rng, 2, 12);
    const ans = (V / R) * V; // power
    return {
      generatorKey: "circuit-ohm",
      prompt: `A ${V} V battery drives current through a ${R} Ω resistor. Find the current and the power dissipated.`,
      answer: ans,
      answerText: `I = ${round(V / R, 2)} A; P = ${round(ans, 2)} W`,
      solution: `I = V/R = ${V}/${R} = ${round(V / R, 2)} A. P = IV = V²/R = ${round(ans, 2)} W.`,
      checkExpr: `${V}^2/${R}`,
      difficulty: 1,
    };
  },

  "wave-freq": (rng) => {
    const fMHz = [408, 611, 1420, 2380, 4850][randInt(rng, 0, 4)];
    const ans = 3e8 / (fMHz * 1e6);
    return {
      generatorKey: "wave-freq",
      prompt: `A radio telescope observes at ${fMHz} MHz. What is the wavelength? (c = 3×10⁸ m/s)`,
      answer: ans,
      answerText: `${round(ans, 3)} m`,
      solution: `λ = c/f = 3×10⁸ / ${fMHz}×10⁶ = ${round(ans, 3)} m.${fMHz === 1420 ? " (The 21 cm hydrogen line.)" : ""}`,
      checkExpr: `3e8/(${fMHz}e6)`,
      difficulty: 1,
    };
  },

  "photon-energy": (rng) => {
    const fGHz = randInt(rng, 1, 10);
    const ans = 6.626e-34 * fGHz * 1e9;
    return {
      generatorKey: "photon-energy",
      prompt: `Compute the energy of a single ${fGHz} GHz radio photon (h = 6.626×10⁻³⁴ J·s).`,
      answer: ans,
      answerText: `${ans.toExponential(3)} J`,
      solution: `E = hf = 6.626×10⁻³⁴ × ${fGHz}×10⁹ = ${ans.toExponential(3)} J — extraordinarily small, which is why radio astronomy is receiver-noise limited rather than photon-counting limited.`,
      checkExpr: `6.626e-34*${fGHz}e9`,
      difficulty: 1,
    };
  },

  "doppler-shift": (rng) => {
    const v = randInt(rng, 10, 300); // km/s
    const ans = (v / 3e5) * 500; // shift of 500 nm line in nm
    return {
      generatorKey: "doppler-shift",
      prompt: `A star recedes at ${v} km/s. By how much is its 500.0 nm spectral line shifted (non-relativistic Doppler)?`,
      answer: ans,
      answerText: `Δλ = ${round(ans, 3)} nm toward the red`,
      solution: `Δλ/λ = v/c → Δλ = 500 × (${v}/300000) = ${round(ans, 3)} nm, redshifted since the star recedes.`,
      checkExpr: `500*${v}/300000`,
      difficulty: 2,
    };
  },

  "kepler-orbit": (rng) => {
    const a = [2, 3, 4, 5, 9][randInt(rng, 0, 4)];
    const ans = Math.sqrt(a * a * a);
    return {
      generatorKey: "kepler-orbit",
      prompt: `An asteroid orbits the Sun with semi-major axis ${a} AU. Find its orbital period in years (Kepler's third law).`,
      answer: ans,
      answerText: `${round(ans, 2)} years`,
      solution: `T² = a³ (Sun, years, AU) → T = √(${a}³) = √${a * a * a} = ${round(ans, 2)} yr.`,
      checkExpr: `sqrt(${a}^3)`,
      difficulty: 1,
    };
  },

  "gravity-force": (rng) => {
    const r = randInt(rng, 2, 6);
    const ans = 1 / (r * r);
    return {
      generatorKey: "gravity-force",
      prompt: `If a planet is moved ${r}× farther from its star, by what factor does the gravitational force change?`,
      answer: ans,
      answerText: `1/${r * r} of the original`,
      solution: `F ∝ 1/r², so scaling r by ${r} scales F by 1/${r}² = 1/${r * r}.`,
      checkExpr: `1/${r}^2`,
      difficulty: 1,
    };
  },

  "telescope-res": (rng) => {
    const D = [10, 25, 64, 100][randInt(rng, 0, 3)];
    const lambda = 0.21;
    const ans = (1.22 * lambda) / D;
    return {
      generatorKey: "telescope-res",
      prompt: `Estimate the diffraction-limited angular resolution (radians) of a ${D} m radio dish observing the 21 cm hydrogen line.`,
      answer: ans,
      answerText: `θ ≈ ${ans.toExponential(2)} rad (≈ ${round((ans * 180 * 60) / Math.PI, 1)} arcmin)`,
      solution: `θ = 1.22λ/D = 1.22 × 0.21/${D} = ${ans.toExponential(2)} rad. Long wavelengths make even large dishes coarse — the case for interferometry.`,
      checkExpr: `1.22*0.21/${D}`,
      difficulty: 2,
    };
  },

  "nyquist-calc": (rng) => {
    const fs = [2, 4, 8, 16][randInt(rng, 0, 3)];
    const ans = (fs / 2) * 1000;
    return {
      generatorKey: "nyquist-calc",
      prompt: `A digitizer samples at ${fs} kHz. What is the highest frequency it can faithfully capture?`,
      answer: ans,
      answerText: `${fs / 2} kHz`,
      solution: `Nyquist: f_max = f_s/2 = ${fs}/2 = ${fs / 2} kHz. Anything higher aliases to a lower apparent frequency.`,
      checkExpr: `${fs}*1000/2`,
      difficulty: 1,
    };
  },

  "fft-resolution": (rng) => {
    const T = [10, 100, 1000][randInt(rng, 0, 2)];
    const ans = 1 / T;
    return {
      generatorKey: "fft-resolution",
      prompt: `An observation lasts ${T} s. What frequency resolution can its FFT achieve?`,
      answer: ans,
      answerText: `Δf = ${ans} Hz`,
      solution: `Δf = 1/T = 1/${T} = ${ans} Hz. Long integrations buy narrow channels — the route to Hz-wide SETI channels.`,
      checkExpr: `1/${T}`,
      difficulty: 1,
    };
  },

  "snr-integrate": (rng) => {
    const factor = [4, 9, 16, 25][randInt(rng, 0, 3)];
    const ans = Math.sqrt(factor);
    return {
      generatorKey: "snr-integrate",
      prompt: `A steady signal is integrated ${factor}× longer. By what factor does the SNR improve?`,
      answer: ans,
      answerText: `×${ans}`,
      solution: `SNR ∝ √t, so ${factor}× longer → √${factor} = ${ans}× improvement.`,
      checkExpr: `sqrt(${factor})`,
      difficulty: 1,
    };
  },

  "drift-rate": (rng) => {
    const drift = randInt(rng, 1, 8) / 2; // Hz/s
    const T = randInt(rng, 2, 6) * 100; // s
    const ans = drift * T;
    return {
      generatorKey: "drift-rate",
      prompt: `A narrowband signal drifts at ${drift} Hz/s. How far does it move in frequency during a ${T} s observation, and why does a search need to correct for this?`,
      answer: ans,
      answerText: `${ans} Hz — without de-drifting, the signal smears across ${ans} channels (at 1 Hz resolution) and its SNR collapses`,
      solution: `Δf = (df/dt)·T = ${drift} × ${T} = ${ans} Hz. A de-doppler search shifts each time step by the trial drift so the signal adds coherently in one channel.`,
      checkExpr: `${drift}*${T}`,
      difficulty: 2,
    };
  },

  "numpy-shape": (rng) => {
    const rows = randInt(rng, 4, 64);
    const cols = [256, 512, 1024][randInt(rng, 0, 2)];
    return {
      generatorKey: "numpy-shape",
      prompt: `A waterfall array has shape (${rows}, ${cols}) — ${rows} time steps × ${cols} channels. What is the shape of arr.mean(axis=0), and what does it represent?`,
      answer: cols,
      answerText: `(${cols},) — the time-averaged spectrum, one value per frequency channel`,
      solution: `axis=0 collapses the first dimension (time), leaving one mean per channel: shape (${cols},). This is the integrated spectrum used for detection.`,
      checkExpr: `${cols}`,
      difficulty: 1,
    };
  },

  "qubit-prob": (rng) => {
    const pairs = [
      [0.6, 0.8],
      [0.8, 0.6],
      [Math.SQRT1_2, Math.SQRT1_2],
      [0.28, 0.96],
    ];
    const [alpha, beta] = pairs[randInt(rng, 0, pairs.length - 1)];
    const ans = beta * beta;
    return {
      generatorKey: "qubit-prob",
      prompt: `A qubit is in state |ψ⟩ = ${round(alpha, 3)}|0⟩ + ${round(beta, 3)}|1⟩. What is the probability of measuring 1?`,
      answer: ans,
      answerText: `P(1) = ${round(ans, 3)}`,
      solution: `Born rule: P(1) = |β|² = (${round(beta, 3)})² = ${round(ans, 3)}. Check normalization: |α|²+|β|² = ${round(alpha * alpha + beta * beta, 3)} ≈ 1.`,
      checkExpr: `(${beta})^2`,
      difficulty: 1,
    };
  },

  "zscore-calc": (rng) => {
    const sigma = randInt(rng, 1, 4);
    const x = sigma * randInt(rng, 4, 8);
    const ans = x / sigma;
    return {
      generatorKey: "zscore-calc",
      prompt: `Detector noise has mean 0 and standard deviation ${sigma}. A spike of ${x} appears. What is its z-score, and does it clear a 5σ discovery threshold?`,
      answer: ans,
      answerText: `z = ${ans}; ${ans >= 5 ? "yes — above 5σ" : "no — below 5σ"}`,
      solution: `z = (x − μ)/σ = ${x}/${sigma} = ${ans}. ${ans >= 5 ? "Above" : "Below"} the 5σ convention — though in a billion-channel search, even 5σ requires re-observation.`,
      checkExpr: `${x}/${sigma}`,
      difficulty: 1,
    };
  },

  "prob-independent": (rng) => {
    const p = randInt(rng, 1, 3) / 10;
    const ans = p * p;
    return {
      generatorKey: "prob-independent",
      prompt: `Two independent detectors each miss a real signal with probability ${p}. What is the probability BOTH miss it?`,
      answer: ans,
      answerText: `${round(ans, 3)}`,
      solution: `Independent probabilities multiply: ${p} × ${p} = ${round(ans, 3)}. This is why multi-site coincidence checks are so powerful against false negatives and RFI alike.`,
      checkExpr: `${p}*${p}`,
      difficulty: 1,
    };
  },
};

export function availableGenerators(): string[] {
  return Object.keys(GENERATORS);
}

export function generateProblems(
  keys: string[],
  countPerKey: number,
  seed: number,
): GeneratedProblem[] {
  const rng = mulberry32(seed);
  const out: GeneratedProblem[] = [];
  for (const key of keys) {
    const gen = GENERATORS[key];
    if (!gen) continue;
    for (let i = 0; i < countPerKey; i++) out.push(gen(rng));
  }
  return out;
}
