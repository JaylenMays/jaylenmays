import type { SeedModule } from "./seed-content-types";

/** Math + physics preparation modules. */
export const MODULES_1: SeedModule[] = [
  {
    key: "algebra-foundations",
    title: "Algebra & Functions Foundations",
    description:
      "The algebra fluency every later course assumes: manipulating expressions, solving equations, and reading functions and graphs.",
    category: "MATH",
    sortOrder: 1,
    lessons: [
      {
        slug: "algebra-expressions-equations",
        title: "Expressions, Equations & Fearless Manipulation",
        minutes: 25,
        objectives: [
          "Simplify and factor algebraic expressions",
          "Solve linear and quadratic equations",
          "Rearrange formulas to isolate any variable",
        ],
        content: `# Expressions, Equations & Fearless Manipulation

Physics and astronomy constantly ask you to *rearrange* formulas. The skill isn't memorizing steps — it's knowing that any operation applied to both sides preserves equality.

## The golden rules
- Whatever you do to one side of an equation, do to the other.
- Factoring and expanding are inverse skills: \`x^2 + 5x + 6 = (x + 2)(x + 3)\`.
- Dividing by an expression is only legal when it isn't zero.

## Solving quadratics
For \`ax^2 + bx + c = 0\`, the quadratic formula always works:

\`x = (-b ± sqrt(b^2 - 4ac)) / (2a)\`

The discriminant \`b^2 - 4ac\` tells you how many real solutions exist (positive → 2, zero → 1, negative → none). In physics, a negative discriminant often means "this event never happens" — e.g. a projectile that never reaches a given height.

## Rearranging formulas (the physics superpower)
Kepler's third law: \`T^2 = (4π^2 / GM) a^3\`. Solve for the mass of the central star:

1. Multiply both sides by \`GM\`: \`GM T^2 = 4π^2 a^3\`
2. Divide by \`T^2\`: \`GM = 4π^2 a^3 / T^2\`
3. Divide by \`G\`: \`M = 4π^2 a^3 / (G T^2)\`

This exact manipulation is how astronomers weigh stars using their planets — including exoplanet host stars in SETI target catalogs.

## Practice mindset
When a manipulation feels risky, test it with small numbers. If \`(a + b)^2 = a^2 + b^2\` were true, then \`(1 + 2)^2 = 9\` would equal \`1 + 4 = 5\`. It doesn't — so it isn't.`,
      },
      {
        slug: "algebra-functions-graphs",
        title: "Functions & Graphs: Reading the Language of Science",
        minutes: 25,
        objectives: [
          "Interpret function notation f(x) and composition",
          "Recognize linear, polynomial, exponential and log graphs",
          "Connect graph features to physical meaning",
        ],
        content: `# Functions & Graphs

A function is a rule that assigns exactly one output to each input. Nearly every physical law you'll meet is a function: position as a function of time, brightness as a function of wavelength, signal power as a function of frequency.

## Notation
- \`f(x) = x^2 - 3\` means "the function f takes x and returns x squared minus 3."
- \`f(2) = 1\` — substitute completely, then evaluate.
- Composition \`f(g(x))\` means apply g first, then f. Order matters.

## The graph zoo you must recognize on sight
| Shape | Function | Where it appears |
|---|---|---|
| Straight line | \`y = mx + b\` | constant velocity motion |
| Parabola | \`y = ax^2\` | projectile motion, kinetic energy |
| Exponential | \`y = e^{kx}\` | radioactive decay, atmosphere density |
| Logarithm | \`y = log(x)\` | stellar magnitudes, decibels, signal-to-noise |
| Inverse square | \`y = 1/x^2\` | gravity, light intensity, radio flux |

The inverse-square curve matters enormously for SETI: a transmitter twice as far away is four times fainter. That single function shapes every argument about detectability.

## Reading graphs like a physicist
- **Slope** = rate of change. On a position-time graph, slope is velocity.
- **Intercepts** = boundary conditions (where things start or vanish).
- **Asymptotes** = limiting behavior (what happens "eventually").

## Logarithms deserve special respect
\`log10(1000) = 3\` — logs count zeros. Astronomers use them because the universe spans ~40 orders of magnitude. Key rules: \`log(ab) = log a + log b\`, \`log(a^n) = n log a\`.`,
      },
    ],
    questions: [
      {
        prompt: "Solve for M in Kepler's third law T^2 = (4π^2/GM)a^3.",
        choices: ["M = 4π^2 a^3 / (G T^2)", "M = G T^2 / (4π^2 a^3)", "M = 4π^2 T^2 / (G a^3)", "M = a^3 T^2 / (4π^2 G)"],
        correctIndex: 0,
        explanation: "Multiply both sides by GM, then divide by T^2 and G: M = 4π^2 a^3 / (G T^2).",
        difficulty: 2,
        topic: "algebraic manipulation",
      },
      {
        prompt: "What is the discriminant of 2x^2 - 4x + 5 = 0, and how many real solutions does the equation have?",
        choices: ["-24; no real solutions", "56; two real solutions", "0; one real solution", "-4; no real solutions"],
        correctIndex: 0,
        explanation: "b^2 - 4ac = 16 - 40 = -24. A negative discriminant means no real solutions.",
        difficulty: 1,
        topic: "quadratics",
      },
      {
        prompt: "If f(x) = x^2 + 1 and g(x) = 3x, what is f(g(2))?",
        choices: ["37", "13", "12", "49"],
        correctIndex: 0,
        explanation: "g(2) = 6 first, then f(6) = 36 + 1 = 37. Apply the inner function first.",
        difficulty: 1,
        topic: "functions",
      },
      {
        prompt: "A radio source is moved 3× farther away. By the inverse-square law its received flux becomes:",
        choices: ["1/9 of the original", "1/3 of the original", "1/6 of the original", "unchanged"],
        correctIndex: 0,
        explanation: "Flux ∝ 1/d^2, so tripling distance divides flux by 3^2 = 9.",
        difficulty: 1,
        topic: "inverse-square law",
      },
      {
        prompt: "Simplify: log10(100 · x^3) assuming x > 0.",
        choices: ["2 + 3·log10(x)", "5·log10(x)", "3 + 2·log10(x)", "log10(100) · 3 log10(x)"],
        correctIndex: 0,
        explanation: "log(ab) = log a + log b and log(x^3) = 3 log x, so the result is 2 + 3 log10(x).",
        difficulty: 2,
        topic: "logarithms",
      },
    ],
  },
  {
    key: "precalc-trig",
    title: "Precalculus & Trigonometry",
    description:
      "Angles, triangles, the unit circle, and periodic functions — the mathematics of waves, orbits, and telescope pointing.",
    category: "MATH",
    sortOrder: 2,
    lessons: [
      {
        slug: "trig-unit-circle",
        title: "The Unit Circle & Trig Functions",
        minutes: 30,
        objectives: [
          "Define sin, cos, tan from the unit circle",
          "Convert between degrees and radians",
          "Evaluate trig functions at special angles",
        ],
        content: `# The Unit Circle & Trig Functions

Trigonometry starts as triangle geometry but becomes the mathematics of *anything that repeats* — waves, orbits, alternating signals.

## Radians: the natural angle unit
A radian is the angle whose arc length equals the radius. Full circle = 2π rad = 360°, so **180° = π rad**. Calculus and physics formulas assume radians; forgetting this is a classic exam disaster.

## Unit-circle definitions
Place a point on a circle of radius 1 at angle θ from the positive x-axis:
- \`cos θ\` = x-coordinate
- \`sin θ\` = y-coordinate
- \`tan θ = sin θ / cos θ\` = slope of the radius line

This is why sin and cos live in [-1, 1] and why \`sin^2 θ + cos^2 θ = 1\` (it's just the Pythagorean theorem).

## Special angles worth memorizing
| θ | sin θ | cos θ |
|---|---|---|
| 0 | 0 | 1 |
| π/6 (30°) | 1/2 | √3/2 |
| π/4 (45°) | √2/2 | √2/2 |
| π/3 (60°) | √3/2 | 1/2 |
| π/2 (90°) | 1 | 0 |

## Why astronomers care
Telescope pointing uses angles (right ascension, declination). The *small-angle approximation* — for small θ in radians, \`sin θ ≈ tan θ ≈ θ\` — underlies angular-size distance calculations: a crater 1 km across seen at angle θ radians is at distance d ≈ 1 km / θ.`,
      },
      {
        slug: "trig-waves-identities",
        title: "Periodic Functions, Waves & Key Identities",
        minutes: 30,
        objectives: [
          "Read amplitude, period, frequency and phase from y = A sin(ωt + φ)",
          "Use the core trig identities",
          "Connect sinusoids to physical waves and radio signals",
        ],
        content: `# Periodic Functions & Waves

## Anatomy of a sinusoid
\`y(t) = A sin(ωt + φ)\`
- **A** — amplitude (max displacement)
- **ω** — angular frequency in rad/s; ordinary frequency \`f = ω / 2π\` in Hz
- **T = 1/f** — period, seconds per cycle
- **φ** — phase, where in its cycle the wave starts

A 1420 MHz radio wave — the famous hydrogen line frequency where many SETI searches listen — completes 1.42 billion cycles per second. Every antenna voltage in a radio telescope is a sum of sinusoids like this; Fourier analysis (later module) is how we take them apart.

## Identities you will actually use
- \`sin^2 θ + cos^2 θ = 1\`
- \`sin(a ± b) = sin a cos b ± cos a sin b\`
- \`cos(a ± b) = cos a cos b ∓ sin a sin b\`
- Double angle: \`sin 2θ = 2 sin θ cos θ\`, \`cos 2θ = 1 - 2 sin^2 θ\`

The angle-addition formulas explain *beats* and signal mixing: multiplying two sinusoids produces sum and difference frequencies. Radio receivers exploit exactly this ("heterodyning") to shift a 1420 MHz sky signal down to frequencies electronics can digitize.

## Inverse trig
\`arcsin(x)\` answers "what angle has this sine?" Ranges matter: arcsin returns values in [-π/2, π/2]. When solving triangles or pointing problems, check whether the *other* solution (π - θ) is the physical one.`,
      },
    ],
    questions: [
      {
        prompt: "Convert 240° to radians.",
        choices: ["4π/3", "3π/4", "2π/3", "5π/6"],
        correctIndex: 0,
        explanation: "240° × (π/180°) = 4π/3 radians.",
        difficulty: 1,
        topic: "radians",
      },
      {
        prompt: "What is cos(π/3)?",
        choices: ["1/2", "√3/2", "√2/2", "0"],
        correctIndex: 0,
        explanation: "π/3 = 60°, and cos 60° = 1/2.",
        difficulty: 1,
        topic: "unit circle",
      },
      {
        prompt: "A signal is y(t) = 3 sin(2π · 50 t). What are its amplitude and frequency?",
        choices: ["Amplitude 3, frequency 50 Hz", "Amplitude 50, frequency 3 Hz", "Amplitude 3, frequency 2π·50 Hz", "Amplitude 6, frequency 25 Hz"],
        correctIndex: 0,
        explanation: "Compare with A sin(2πft): A = 3 and f = 50 Hz. ω = 2πf = 100π rad/s.",
        difficulty: 2,
        topic: "waves",
      },
      {
        prompt: "Using the small-angle approximation, a feature spanning 0.001 rad at distance 384,000 km (the Moon) is about how large?",
        choices: ["384 km", "3840 km", "38.4 km", "0.384 km"],
        correctIndex: 0,
        explanation: "size ≈ distance × angle = 384,000 km × 0.001 = 384 km.",
        difficulty: 2,
        topic: "small-angle approximation",
      },
      {
        prompt: "Simplify sin 2θ using a double-angle identity.",
        choices: ["2 sin θ cos θ", "sin^2 θ - cos^2 θ", "2 cos^2 θ - 1", "sin θ + cos θ"],
        correctIndex: 0,
        explanation: "The double-angle identity: sin 2θ = 2 sin θ cos θ.",
        difficulty: 1,
        topic: "identities",
      },
    ],
  },
  {
    key: "calc1-prep",
    title: "Calculus I Preparation",
    description:
      "Limits, mathematical notation, and the derivative concept — everything you need in place before day one of Calculus I.",
    category: "MATH",
    sortOrder: 3,
    lessons: [
      {
        slug: "limits-and-notation",
        title: "Limits & Mathematical Notation",
        minutes: 30,
        objectives: [
          "Read and write limit notation fluently",
          "Evaluate limits numerically, graphically and algebraically",
          "Recognize when limits fail to exist",
        ],
        content: `# Limits & Mathematical Notation

Calculus is built on one idea: what value does a function *approach*? The notation

\`lim (x → a) f(x) = L\`

reads "as x gets arbitrarily close to a, f(x) gets arbitrarily close to L." The function never needs to *reach* L — or even be defined at a.

## Three ways to evaluate a limit
1. **Substitute.** If f is continuous at a, the limit is just f(a).
2. **Simplify first.** \`lim (x→2) (x^2 - 4)/(x - 2)\`: substitution gives 0/0, but factoring gives (x+2)(x-2)/(x-2) = x + 2 → limit is 4.
3. **Squeeze / compare.** The classic \`lim (θ→0) sin θ / θ = 1\` (θ in radians!) is the reason the small-angle approximation works.

## When limits don't exist
- Left and right limits disagree (a jump).
- The function blows up (vertical asymptote): we write \`lim (x→0+) 1/x = ∞\` as shorthand.
- Endless oscillation: \`sin(1/x)\` near 0.

## Notation that saves you later
- Interval notation: [a, b] closed, (a, b) open.
- Greek letters: Δ (change), δ and ε (small quantities), Σ (sum).
- \`f'(x)\`, \`df/dx\`, and \`ẋ\` all denote derivatives — physics uses all three.

## The punchline
The derivative you'll meet next is *defined* as a limit:

\`f'(x) = lim (h→0) [f(x+h) - f(x)] / h\`

— the limiting slope of secant lines. Every velocity, acceleration, and rate in physics is this limit in disguise.`,
      },
      {
        slug: "derivative-concept",
        title: "The Derivative as Rate of Change",
        minutes: 30,
        objectives: [
          "Interpret derivatives as slopes and rates",
          "Compute derivatives of polynomials with the power rule",
          "Connect motion graphs to derivatives",
        ],
        content: `# The Derivative as Rate of Change

## The idea
The derivative f'(a) is the slope of the tangent line to y = f(x) at x = a — the *instantaneous* rate of change. On a position–time graph, that slope is velocity; on a velocity–time graph, it's acceleration.

## Power rule (your workhorse)
If \`f(x) = x^n\`, then \`f'(x) = n·x^(n-1)\`.

Combined with linearity — derivatives of sums are sums of derivatives, constants factor out — you can differentiate any polynomial:

\`d/dt (4.9t^2) = 9.8t\`

That's free-fall: position \`y = 4.9t^2\` meters gives velocity \`v = 9.8t\` m/s, which is g·t. You just derived a physics formula.

## Reading motion graphs
- Position curving upward → speeding up.
- Flat position graph → zero velocity.
- Straight-line position graph → constant velocity, zero acceleration.
- Velocity graph's slope → acceleration; its *area* under the curve → displacement (that's the integral, coming in Calc I).

## Other derivatives worth previewing
- \`d/dx sin x = cos x\`, \`d/dx cos x = -sin x\` (radians only!)
- \`d/dx e^x = e^x\` — the function equal to its own rate of change; why exponentials rule growth and decay.

## Why this matters for your mission
Doppler drift — the slow change of a radio signal's frequency as the Earth rotates — is a derivative: df/dt. SETI pipelines literally search a grid of df/dt values to find narrowband signals from rotating, orbiting worlds. Rates of change are the family business.`,
      },
    ],
    questions: [
      {
        prompt: "Evaluate lim (x→3) (x^2 - 9)/(x - 3).",
        choices: ["6", "0", "Does not exist", "9"],
        correctIndex: 0,
        explanation: "Factor: (x-3)(x+3)/(x-3) = x + 3 → 6 as x → 3.",
        difficulty: 1,
        topic: "limits",
      },
      {
        prompt: "What is lim (θ→0) sin θ / θ (θ in radians)?",
        choices: ["1", "0", "∞", "π"],
        correctIndex: 0,
        explanation: "This fundamental limit equals 1 and justifies the small-angle approximation sin θ ≈ θ.",
        difficulty: 1,
        topic: "limits",
      },
      {
        prompt: "Differentiate f(x) = 3x^4 - 2x + 7.",
        choices: ["12x^3 - 2", "12x^3 + 7", "3x^3 - 2", "4x^3 - 2x"],
        correctIndex: 0,
        explanation: "Power rule term by term: 12x^3 - 2 + 0.",
        difficulty: 1,
        topic: "derivatives",
      },
      {
        prompt: "An object's position is y = 4.9t^2 m. Its velocity at t = 3 s is:",
        choices: ["29.4 m/s", "44.1 m/s", "9.8 m/s", "14.7 m/s"],
        correctIndex: 0,
        explanation: "v = dy/dt = 9.8t, so at t = 3, v = 29.4 m/s.",
        difficulty: 2,
        topic: "derivatives",
      },
      {
        prompt: "On a position–time graph, a horizontal (flat) segment means:",
        choices: ["The object is at rest", "The object moves at constant velocity", "The object accelerates", "The object's position is undefined"],
        correctIndex: 0,
        explanation: "Slope of position–time is velocity; zero slope means zero velocity.",
        difficulty: 1,
        topic: "motion graphs",
      },
    ],
  },
  {
    key: "calc2-prep",
    title: "Calculus II Preparation",
    description: "Integration as accumulation, basic techniques, and an introduction to infinite series.",
    category: "MATH",
    sortOrder: 4,
    lessons: [
      {
        slug: "integration-accumulation",
        title: "Integration: Accumulation & the Fundamental Theorem",
        minutes: 30,
        objectives: [
          "Interpret definite integrals as accumulated change and area",
          "Use the Fundamental Theorem of Calculus",
          "Compute basic antiderivatives",
        ],
        content: `# Integration: Accumulation & the Fundamental Theorem

## The idea
A definite integral \`∫[a to b] f(x) dx\` adds up infinitely many infinitesimal contributions f(x)·dx. Geometrically it's the signed area under the curve; physically it's *accumulated change*:
- velocity integrated over time → displacement
- power integrated over time → energy
- flux integrated over a telescope's collecting area and bandwidth → detected signal energy

## The Fundamental Theorem of Calculus
If F'(x) = f(x), then \`∫[a to b] f(x) dx = F(b) - F(a)\`.

Differentiation and integration are inverse operations. This is the single most important theorem in the course.

## Antiderivatives to know cold
- \`∫ x^n dx = x^(n+1)/(n+1) + C\` (n ≠ -1)
- \`∫ 1/x dx = ln|x| + C\`
- \`∫ e^x dx = e^x + C\`
- \`∫ cos x dx = sin x + C\`, \`∫ sin x dx = -cos x + C\`

Never forget +C on indefinite integrals — it's a real point on every exam and encodes the initial condition in physics problems.

## Example with units
A telescope receives power P(t) = 2 + 0.5t nanowatts over t ∈ [0, 4] s:
\`E = ∫[0 to 4] (2 + 0.5t) dt = [2t + 0.25t^2] from 0 to 4 = 8 + 4 = 12 nJ\`

Integration turns an instantaneous reading into a total — exactly how radio astronomers "integrate" on a source to build signal-to-noise.`,
      },
      {
        slug: "series-preview",
        title: "Sequences, Series & Why They Matter",
        minutes: 25,
        objectives: [
          "Distinguish sequences from series",
          "Test geometric series for convergence",
          "Preview Taylor series as polynomial approximations",
        ],
        content: `# Sequences, Series & Why They Matter

## Sequences vs. series
A **sequence** is an ordered list a_1, a_2, a_3, … A **series** is its running sum Σ a_n. The central question: does the sum settle to a finite value (converge) or grow without bound (diverge)?

## The geometric series
\`Σ (n=0 to ∞) r^n = 1/(1 - r)\` when |r| < 1, and diverges otherwise.

Example: 1 + 1/2 + 1/4 + 1/8 + … = 2. Infinitely many terms, finite sum.

## The harmonic warning
\`Σ 1/n = 1 + 1/2 + 1/3 + …\` diverges even though its terms shrink to zero. Terms → 0 is *necessary* but not *sufficient* for convergence.

## Taylor series: functions as polynomials
Near x = 0:
- \`e^x ≈ 1 + x + x^2/2! + x^3/3! + …\`
- \`sin x ≈ x - x^3/3! + …\`
- \`cos x ≈ 1 - x^2/2! + …\`

Truncating sin x at its first term gives the small-angle approximation — now you know where it comes from. Physicists Taylor-expand *constantly*: nearly every "approximately equals" in your textbooks is a truncated Taylor series.

## Where you'll meet series again
Fourier series (a signal as a sum of sinusoids) power all of radio astronomy signal processing. The convergence intuition you build in Calc II is the foundation.`,
      },
    ],
    questions: [
      {
        prompt: "Compute ∫[0 to 2] 3x^2 dx.",
        choices: ["8", "12", "6", "4"],
        correctIndex: 0,
        explanation: "Antiderivative x^3 evaluated 0→2 gives 8.",
        difficulty: 1,
        topic: "integration",
      },
      {
        prompt: "Does the series Σ (1/2)^n for n = 0 to ∞ converge, and to what?",
        choices: ["Yes, to 2", "Yes, to 1", "No, it diverges", "Yes, to 1/2"],
        correctIndex: 0,
        explanation: "Geometric with r = 1/2: sum = 1/(1 - 1/2) = 2.",
        difficulty: 1,
        topic: "series",
      },
      {
        prompt: "The first two nonzero terms of the Taylor series of sin x about 0 are:",
        choices: ["x - x^3/6", "1 - x^2/2", "x + x^2/2", "x - x^2/2"],
        correctIndex: 0,
        explanation: "sin x = x - x^3/3! + … = x - x^3/6 + …",
        difficulty: 2,
        topic: "Taylor series",
      },
      {
        prompt: "Velocity is v(t) = 6t m/s. Displacement from t = 0 to t = 3 is:",
        choices: ["27 m", "18 m", "54 m", "9 m"],
        correctIndex: 0,
        explanation: "∫ 6t dt = 3t^2; from 0 to 3 → 27 m.",
        difficulty: 1,
        topic: "integration",
      },
    ],
  },
  {
    key: "calc3-prep",
    title: "Calculus III Preparation",
    description: "Vectors in 3D, dot and cross products, and partial derivatives — the language of fields and orbits.",
    category: "MATH",
    sortOrder: 5,
    lessons: [
      {
        slug: "vectors-3d",
        title: "Vectors in Three Dimensions",
        minutes: 30,
        objectives: [
          "Add, scale and decompose 3D vectors",
          "Compute dot and cross products and interpret them geometrically",
          "Find magnitudes and unit vectors",
        ],
        content: `# Vectors in Three Dimensions

A vector has magnitude and direction: **v** = (v_x, v_y, v_z). Its length is \`|v| = sqrt(v_x^2 + v_y^2 + v_z^2)\`.

## Dot product — "how aligned?"
\`a · b = a_x b_x + a_y b_y + a_z b_z = |a||b| cos θ\`

- Zero → perpendicular.
- Work in physics: W = F · d — only the aligned part of a force does work.
- In SETI signal processing, the dot product *is* correlation: matching a received time series against a template signal.

## Cross product — "perpendicular and how much area?"
\`a × b\` is perpendicular to both a and b, with magnitude |a||b| sin θ (the parallelogram area), direction by the right-hand rule.

- Torque: τ = r × F
- Angular momentum: L = r × p — the conserved quantity that keeps planets orbiting in a plane.

## Decomposition
Any vector splits into components along coordinate axes: **v** = v_x **î** + v_y **ĵ** + v_z **k̂**. Choosing smart axes (e.g. along an inclined plane) is half of every mechanics problem.`,
      },
      {
        slug: "partial-derivatives",
        title: "Functions of Several Variables & Partial Derivatives",
        minutes: 25,
        objectives: [
          "Evaluate functions of two/three variables",
          "Compute partial derivatives",
          "Interpret the gradient as steepest ascent",
        ],
        content: `# Partial Derivatives & the Gradient

Physical quantities usually depend on several variables: temperature T(x, y, z), radio power P(frequency, time), gravitational potential Φ(x, y, z).

## Partial derivatives
\`∂f/∂x\` = derivative with respect to x, holding all other variables fixed.

If \`f(x, y) = x^2 y + 3y\`, then \`∂f/∂x = 2xy\` and \`∂f/∂y = x^2 + 3\`.

## The gradient
\`∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)\` points in the direction of steepest increase, with magnitude equal to the steepness. Physics loves its negative: force is minus the gradient of potential energy, \`F = -∇U\` — objects "roll downhill" in energy.

## A waterfall-plot example
SETI dynamic spectra are functions P(f, t): power vs. frequency and time. ∂P/∂t at fixed frequency asks "is this channel brightening?" A drifting narrowband signal shows structure in *both* partials — which is exactly what drift-rate search algorithms exploit.

## Chain rule preview
For f(x(t), y(t)): \`df/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt)\`. Rates compose along every path a variable enters.`,
      },
    ],
    questions: [
      {
        prompt: "For a = (1, 2, 2), what is |a|?",
        choices: ["3", "5", "9", "√5"],
        correctIndex: 0,
        explanation: "sqrt(1 + 4 + 4) = 3.",
        difficulty: 1,
        topic: "vectors",
      },
      {
        prompt: "a = (1, 0, 0), b = (0, 1, 0). What is a × b?",
        choices: ["(0, 0, 1)", "(0, 0, -1)", "(1, 1, 0)", "0"],
        correctIndex: 0,
        explanation: "î × ĵ = k̂ by the right-hand rule.",
        difficulty: 2,
        topic: "cross product",
      },
      {
        prompt: "If a · b = 0 and neither vector is zero, the vectors are:",
        choices: ["Perpendicular", "Parallel", "Equal", "Opposite"],
        correctIndex: 0,
        explanation: "Dot product |a||b|cos θ = 0 forces cos θ = 0 → θ = 90°.",
        difficulty: 1,
        topic: "dot product",
      },
      {
        prompt: "For f(x, y) = x^2 y + 3y, what is ∂f/∂y?",
        choices: ["x^2 + 3", "2xy", "2xy + 3", "x^2"],
        correctIndex: 0,
        explanation: "Treat x as constant: derivative of x^2·y is x^2, of 3y is 3.",
        difficulty: 2,
        topic: "partial derivatives",
      },
    ],
  },
  {
    key: "linear-algebra-prep",
    title: "Linear Algebra Preparation",
    description: "Systems of equations, vectors, matrices, and transformations — the backbone of quantum mechanics and machine learning.",
    category: "MATH",
    sortOrder: 6,
    lessons: [
      {
        slug: "systems-matrices",
        title: "Systems of Equations & Matrices",
        minutes: 30,
        objectives: [
          "Solve small linear systems by elimination",
          "Multiply matrices and understand when it's defined",
          "Recognize identity and inverse matrices",
        ],
        content: `# Systems of Equations & Matrices

## Linear systems
Two equations, two unknowns:
\`\`\`
2x + y = 5
x - y  = 1
\`\`\`
Add them: 3x = 6 → x = 2, y = 1. **Elimination** — adding multiples of equations to cancel variables — scales up to any size and becomes Gaussian elimination on matrices.

## Matrices
A matrix is a rectangular grid of numbers; an m×n matrix times an n×1 column vector produces an m×1 vector. Row-times-column:

\`\`\`
[2 1] [x]   [2x + y]
[1 -1][y] = [x - y]
\`\`\`

So a system is just **Ax = b** — one matrix equation. Matrix multiplication is defined only when inner dimensions match (m×n times n×p → m×p), and in general **AB ≠ BA**.

## Identity and inverse
The identity I has 1s on the diagonal and leaves vectors unchanged. If A has an inverse A⁻¹ with A⁻¹A = I, the system solves as x = A⁻¹b. A 2×2 matrix [[a,b],[c,d]] is invertible exactly when its determinant ad - bc ≠ 0.

## Why you'll live here
Quantum states are vectors; quantum gates and observables are matrices. Machine-learning models are chains of matrix multiplications. Fitting a straight line through noisy telescope data? A least-squares matrix equation. Linear algebra is the most *used* math in your entire pathway.`,
      },
      {
        slug: "transformations-eigen",
        title: "Linear Transformations & Eigenvectors (Preview)",
        minutes: 25,
        objectives: [
          "Interpret matrices as transformations of space",
          "Compute the action of rotation and scaling matrices",
          "Understand eigenvectors as invariant directions",
        ],
        content: `# Linear Transformations & Eigenvectors

## Matrices move space
Multiplying by a matrix transforms vectors: rotations, stretches, reflections, shears.

Rotation by angle θ:
\`\`\`
R(θ) = [cos θ  -sin θ]
       [sin θ   cos θ]
\`\`\`
Check: R(90°) sends (1,0) → (0,1). The determinant tells you how areas scale (rotation: det = 1, area preserved).

## Eigenvectors: directions that don't turn
For some special vectors, A**v** = λ**v** — the transformation only *scales* them, by the eigenvalue λ. Those invariant directions are the skeleton of the transformation.

Example: [[2, 0], [0, 3]] has eigenvectors (1,0) with λ=2 and (0,1) with λ=3.

## Why eigen-things run the universe
- Quantum mechanics: measurable quantities (energy, spin) are eigenvalues of operators; stationary states are eigenvectors. The Schrödinger equation Hψ = Eψ *is* an eigenvalue problem.
- Vibrations and waves: normal modes are eigenvectors.
- Machine learning: PCA finds the eigenvectors of a dataset's covariance matrix — the directions of maximum variance — used to compress and de-noise data, including radio spectrograms.

You'll compute these properly in the course; for now, internalize the picture: **a matrix is a machine that moves vectors, and eigenvectors are the directions it can't rotate.**`,
      },
    ],
    questions: [
      {
        prompt: "Solve the system: 2x + y = 5, x - y = 1.",
        choices: ["x = 2, y = 1", "x = 1, y = 3", "x = 3, y = -1", "x = 2, y = -1"],
        correctIndex: 0,
        explanation: "Adding the equations eliminates y: 3x = 6, so x = 2 and y = 1.",
        difficulty: 1,
        topic: "linear systems",
      },
      {
        prompt: "The determinant of [[3, 1], [2, 4]] is:",
        choices: ["10", "14", "12", "5"],
        correctIndex: 0,
        explanation: "ad - bc = 12 - 2 = 10.",
        difficulty: 1,
        topic: "determinants",
      },
      {
        prompt: "For matrices A (2×3) and B (3×4), the product AB is:",
        choices: ["A 2×4 matrix", "A 3×3 matrix", "A 4×2 matrix", "Undefined"],
        correctIndex: 0,
        explanation: "Inner dimensions (3) match; result takes outer dimensions 2×4.",
        difficulty: 1,
        topic: "matrices",
      },
      {
        prompt: "If Av = 5v for a nonzero vector v, then v is:",
        choices: ["An eigenvector of A with eigenvalue 5", "The inverse of A", "Orthogonal to A", "A row of A"],
        correctIndex: 0,
        explanation: "Av = λv is the definition of an eigenvector; here λ = 5.",
        difficulty: 2,
        topic: "eigenvectors",
      },
      {
        prompt: "A rotation matrix R(θ) always has determinant:",
        choices: ["1", "0", "-1", "cos θ"],
        correctIndex: 0,
        explanation: "cos²θ + sin²θ = 1 — rotations preserve area and orientation.",
        difficulty: 2,
        topic: "transformations",
      },
    ],
  },
  {
    key: "diffeq-prep",
    title: "Differential Equations Preparation",
    description: "Reading and solving the equations that describe change — decay, oscillation, and orbital motion.",
    category: "MATH",
    sortOrder: 7,
    lessons: [
      {
        slug: "what-is-a-diffeq",
        title: "What a Differential Equation Says",
        minutes: 25,
        objectives: [
          "Translate physical statements into differential equations",
          "Verify solutions by substitution",
          "Solve separable first-order equations",
        ],
        content: `# What a Differential Equation Says

A differential equation relates a function to its own derivatives — it describes a *rule of change*, and solving it recovers the function.

## The two most important ODEs in physics

**Exponential change:** \`dy/dt = k·y\` ("the rate is proportional to the amount"). Solution: \`y = y_0 e^{kt}\`. Radioactive decay (k < 0), population growth, RC circuits.

**Simple harmonic motion:** \`d²x/dt² = -ω² x\` ("acceleration opposes displacement"). Solution: \`x = A cos(ωt) + B sin(ωt)\`. Springs, pendulums, LC circuits, and the electric field of every radio wave your future telescopes receive.

## Verifying a solution
Claim: y = e^{3t} solves dy/dt = 3y. Check: dy/dt = 3e^{3t} = 3y ✓. Verification by substitution is always available and always worth doing.

## Separable equations
When you can sort variables to opposite sides, integrate both:

\`dy/dt = ky → dy/y = k dt → ln|y| = kt + C → y = y_0 e^{kt}\`

## Initial conditions
A differential equation has a *family* of solutions; the initial condition (y at t = 0) picks the physical one. Newton's second law F = ma is a second-order ODE — which is why launching a spacecraft needs both a position *and* a velocity.`,
      },
    ],
    questions: [
      {
        prompt: "Which function solves dy/dt = -2y with y(0) = 5?",
        choices: ["y = 5e^{-2t}", "y = 5e^{2t}", "y = -2e^{5t}", "y = 5 - 2t"],
        correctIndex: 0,
        explanation: "dy/dt = ky has solution y0·e^{kt}; here k = -2, y0 = 5.",
        difficulty: 1,
        topic: "differential equations",
      },
      {
        prompt: "The equation d²x/dt² = -9x describes oscillation with angular frequency:",
        choices: ["3 rad/s", "9 rad/s", "81 rad/s", "1/3 rad/s"],
        correctIndex: 0,
        explanation: "Compare with d²x/dt² = -ω²x: ω² = 9 → ω = 3.",
        difficulty: 2,
        topic: "harmonic motion",
      },
      {
        prompt: "Which physical situation matches dy/dt = ky with k negative?",
        choices: ["Radioactive decay", "Uniform acceleration", "Circular orbit", "Constant velocity"],
        correctIndex: 0,
        explanation: "Negative k means the quantity shrinks at a rate proportional to itself — exponential decay.",
        difficulty: 1,
        topic: "differential equations",
      },
    ],
  },
  {
    key: "prob-stats-prep",
    title: "Probability & Statistics Preparation",
    description: "Distributions, uncertainty, and hypothesis thinking — how scientists decide whether a signal is real.",
    category: "MATH",
    sortOrder: 8,
    lessons: [
      {
        slug: "probability-distributions",
        title: "Probability, Distributions & the Normal Curve",
        minutes: 30,
        objectives: [
          "Compute probabilities for independent events",
          "Interpret mean and standard deviation",
          "Use the normal distribution and z-scores",
        ],
        content: `# Probability, Distributions & the Normal Curve

## Basics
P(event) ∈ [0, 1]. For independent events, probabilities multiply: two fair coins both landing heads is 1/2 × 1/2 = 1/4. "At least one" problems flip to complements: P(at least one) = 1 - P(none).

## Describing data
- **Mean** μ — the balance point.
- **Standard deviation** σ — typical distance from the mean.

## The normal (Gaussian) distribution
The bell curve appears whenever many small independent effects add up (the Central Limit Theorem) — which is why *noise* in nearly every instrument is Gaussian. Rules of thumb: ~68% of values within 1σ, ~95% within 2σ, ~99.7% within 3σ.

A **z-score** counts how many σ a value sits from the mean: z = (x - μ)/σ.

## The "5-sigma" culture of physics
A z of 5 corresponds to about a 3-in-10-million chance of arising from noise. Particle physics requires 5σ to claim a discovery. SETI is even stricter in spirit: a candidate technosignature must clear high significance *and* survive re-observation, because with billions of frequency channels examined, rare noise spikes are guaranteed to appear somewhere — the "look-elsewhere effect."

## Expectation values
The expected value of a die roll is (1+2+…+6)/6 = 3.5 — never an actual outcome, but the long-run average. Quantum mechanics is built on expectation values; you'll meet ⟨x⟩ and ⟨E⟩ constantly.`,
      },
    ],
    questions: [
      {
        prompt: "In a Gaussian distribution, roughly what fraction of values falls within 2σ of the mean?",
        choices: ["95%", "68%", "99.7%", "50%"],
        correctIndex: 0,
        explanation: "The 68–95–99.7 rule: about 95% within 2 standard deviations.",
        difficulty: 1,
        topic: "normal distribution",
      },
      {
        prompt: "Noise has mean 0 and σ = 2. A spike of 12 has z-score:",
        choices: ["6", "24", "10", "3"],
        correctIndex: 0,
        explanation: "z = (12 - 0)/2 = 6 — well beyond the 5σ discovery threshold.",
        difficulty: 1,
        topic: "z-scores",
      },
      {
        prompt: "Why do SETI searches demand extremely high significance before claiming a detection?",
        choices: [
          "Billions of channels are searched, so rare noise spikes are inevitable somewhere",
          "Radio noise is never Gaussian",
          "The speed of light delays confirmation",
          "Telescopes cannot measure power accurately",
        ],
        correctIndex: 0,
        explanation: "With enormous numbers of trials, the look-elsewhere effect guarantees outliers; thresholds and re-observation guard against false positives.",
        difficulty: 2,
        topic: "statistical validation",
      },
      {
        prompt: "Two independent detectors each miss a signal with probability 0.1. The probability both miss it is:",
        choices: ["0.01", "0.2", "0.1", "0.81"],
        correctIndex: 0,
        explanation: "Independent probabilities multiply: 0.1 × 0.1 = 0.01.",
        difficulty: 1,
        topic: "probability",
      },
    ],
  },
  {
    key: "physics1-prep",
    title: "University Physics I Preparation",
    description: "Units, vectors, kinematics, and Newton's laws — with the math tools (trig, derivatives) already in hand.",
    category: "PHYSICS",
    sortOrder: 9,
    lessons: [
      {
        slug: "units-dimensional-analysis",
        title: "Units, Estimation & Dimensional Analysis",
        minutes: 25,
        objectives: [
          "Use SI units and convert between unit systems",
          "Check equations with dimensional analysis",
          "Make order-of-magnitude estimates",
        ],
        content: `# Units, Estimation & Dimensional Analysis

## SI base units you'll use daily
meter (m), kilogram (kg), second (s), ampere (A), kelvin (K). Everything else is built from them: newton = kg·m/s², joule = N·m, watt = J/s, hertz = 1/s.

## Unit conversion without tears
Multiply by fractions equal to 1: \`90 km/h × (1000 m/km) × (1 h/3600 s) = 25 m/s\`. Keep units in every step; cancel them like algebra.

## Dimensional analysis — the free error detector
Both sides of any valid equation must carry the same units. Is \`v = sqrt(2gh)\` plausible? \`sqrt((m/s²)(m)) = sqrt(m²/s²) = m/s\` ✓. If your derived formula fails this check, it is wrong — no exceptions. Physicists run this check reflexively; make it a habit now.

## Order-of-magnitude estimation
Fermi problems train scientific judgment: How many stars does a radio survey cover? Roughly: (beam solid angle) × (stars per unit solid angle) — get each factor to the nearest power of ten and multiply. Estimation tells you whether a precise calculation is even worth doing, and it is a *core* skill in observational proposal writing.

## Significant figures
Report no more precision than you have. 2.5 cm × 3.15 cm = 7.9 cm² (two sig figs, from the least precise input).`,
      },
      {
        slug: "kinematics-newtons-laws",
        title: "Kinematics & Newton's Laws",
        minutes: 35,
        objectives: [
          "Apply the constant-acceleration equations",
          "Draw and use free-body diagrams",
          "State and apply Newton's three laws",
        ],
        content: `# Kinematics & Newton's Laws

## Constant-acceleration kinematics
With initial velocity v₀ and acceleration a:
- \`v = v₀ + at\`
- \`x = x₀ + v₀t + (1/2)at²\`
- \`v² = v₀² + 2a(x - x₀)\`

These are just calculus: a is the derivative of v, v the derivative of x. Free fall near Earth: a = g ≈ 9.8 m/s² downward, independent of mass (Galileo's insight).

## Newton's three laws
1. **Inertia:** with no net force, velocity is constant. Motion needs no cause; *changes* in motion do.
2. **F = ma:** net force equals mass times acceleration. It's a vector equation — apply it per axis.
3. **Action–reaction:** forces come in equal-and-opposite pairs acting on *different* bodies. The Earth pulls you down; you pull the Earth up.

## Free-body diagrams: the ritual that prevents errors
1. Isolate one object.
2. Draw every force acting *on it* (gravity, normal, tension, friction, thrust).
3. Choose axes (align one with acceleration).
4. Write ΣF = ma along each axis.

Most lost points in Physics I are skipped steps here, not hard math.

## A spacefaring example
A 1000 kg probe fires a thruster producing 250 N. Acceleration: a = F/m = 0.25 m/s². After one day (86,400 s): Δv = at ≈ 21.6 km/s — gentle thrust, long time, huge speed. This is why ion drives (tiny F, months of t) work, and it's the same Δv bookkeeping used in mission design for probes that might one day sample interstellar objects.`,
      },
    ],
    questions: [
      {
        prompt: "Convert 72 km/h to m/s.",
        choices: ["20 m/s", "72 m/s", "7.2 m/s", "36 m/s"],
        correctIndex: 0,
        explanation: "72 × 1000/3600 = 20 m/s.",
        difficulty: 1,
        topic: "units",
      },
      {
        prompt: "A ball is dropped from rest. How far does it fall in 3 s (g = 9.8 m/s²)?",
        choices: ["44.1 m", "29.4 m", "88.2 m", "14.7 m"],
        correctIndex: 0,
        explanation: "x = ½gt² = 0.5 × 9.8 × 9 = 44.1 m.",
        difficulty: 1,
        topic: "kinematics",
      },
      {
        prompt: "A 1000 kg probe with a 250 N thruster accelerates at:",
        choices: ["0.25 m/s²", "4 m/s²", "250 m/s²", "2.5 m/s²"],
        correctIndex: 0,
        explanation: "a = F/m = 250/1000 = 0.25 m/s².",
        difficulty: 1,
        topic: "Newton's laws",
      },
      {
        prompt: "Which quantity has units of kg·m/s²?",
        choices: ["Force (newton)", "Energy (joule)", "Power (watt)", "Momentum"],
        correctIndex: 0,
        explanation: "F = ma → kg × m/s² defines the newton.",
        difficulty: 1,
        topic: "dimensional analysis",
      },
      {
        prompt: "You push a wall with 50 N and it doesn't move. The wall pushes back with:",
        choices: ["Exactly 50 N on you", "0 N", "More than 50 N", "50 N only if the wall accelerates"],
        correctIndex: 0,
        explanation: "Newton's third law: forces come in equal-and-opposite pairs regardless of motion.",
        difficulty: 1,
        topic: "Newton's laws",
      },
    ],
  },
  {
    key: "physics2-prep",
    title: "University Physics II Preparation",
    description: "Charge, fields, circuits, and electromagnetic waves — the physics that makes radio astronomy possible.",
    category: "PHYSICS",
    sortOrder: 10,
    lessons: [
      {
        slug: "charge-fields",
        title: "Charge, Coulomb's Law & Fields",
        minutes: 30,
        objectives: [
          "Apply Coulomb's law",
          "Describe electric and magnetic fields",
          "Explain how accelerating charges make electromagnetic waves",
        ],
        content: `# Charge, Fields & Electromagnetic Waves

## Coulomb's law
Two charges attract or repel with force \`F = k q₁q₂ / r²\` (k ≈ 9×10⁹ N·m²/C²). Another inverse-square law — the same 1/r² geometry as gravity and light.

## Fields: action at a distance, made local
Instead of "charge A forces charge B," physics says charge A fills space with an **electric field** E, and B feels F = qE. Moving charges (currents) create **magnetic fields** B. Fields aren't bookkeeping tricks — they carry energy and momentum, and they're what actually travels from a distant transmitter to your telescope.

## The punchline of the whole course
Maxwell's equations show that a *changing* electric field creates a magnetic field and vice versa. The result: self-sustaining ripples of E and B — **electromagnetic waves** — traveling at c ≈ 3×10⁸ m/s. Radio, microwave, infrared, visible light, X-rays: one phenomenon, different frequencies (c = fλ).

An antenna is just a wire where electrons are shaken at some frequency; a receiving antenna is a wire where an arriving wave shakes electrons, inducing a tiny voltage. Every SETI observation ever made is this effect, amplified and digitized.

## Circuit vocabulary you'll need
- Current I (A): charge flow rate. Voltage V: energy per charge. Resistance R: V = IR (Ohm's law).
- Power P = IV — why radio astronomers speak of received *power* (in watts, often 10⁻²⁰ W or less!).

The hydrogen line at 1420.4 MHz (λ = 21 cm) is a natural "magic frequency" — many SETI programs search near it, reasoning that any radio-capable civilization discovers it early.`,
      },
    ],
    questions: [
      {
        prompt: "Doubling the distance between two charges changes the Coulomb force by a factor of:",
        choices: ["1/4", "1/2", "2", "4"],
        correctIndex: 0,
        explanation: "Inverse-square: F ∝ 1/r², so doubling r quarters the force.",
        difficulty: 1,
        topic: "Coulomb's law",
      },
      {
        prompt: "The wavelength of a 1420 MHz radio wave (c = 3×10⁸ m/s) is about:",
        choices: ["21 cm", "2.1 m", "1.4 mm", "4.7 m"],
        correctIndex: 0,
        explanation: "λ = c/f = 3×10⁸ / 1.42×10⁹ ≈ 0.21 m — the famous hydrogen line.",
        difficulty: 2,
        topic: "electromagnetic waves",
      },
      {
        prompt: "A 12 V battery drives 2 A through a resistor. The resistance and power are:",
        choices: ["6 Ω and 24 W", "24 Ω and 6 W", "6 Ω and 12 W", "12 Ω and 24 W"],
        correctIndex: 0,
        explanation: "R = V/I = 6 Ω; P = IV = 24 W.",
        difficulty: 1,
        topic: "circuits",
      },
      {
        prompt: "Electromagnetic waves are generated by:",
        choices: ["Accelerating electric charges", "Static charges", "Constant currents only", "Neutral atoms at rest"],
        correctIndex: 0,
        explanation: "Accelerated (shaken) charges radiate — the operating principle of every antenna.",
        difficulty: 2,
        topic: "electromagnetic waves",
      },
    ],
  },
];
