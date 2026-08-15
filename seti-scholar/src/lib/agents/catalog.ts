/**
 * Curated catalog of vetted open educational resources, keyed by subject
 * profile. This is the discovery system's reliable backbone: live connectors
 * (Open Library, Google Books, Crossref, arXiv, Semantic Scholar) augment it
 * when the network is available, but the app remains fully autonomous without
 * them. Every entry uses an approved domain and an honest license/access
 * status — the access policy re-verifies both at ingestion time.
 */

import type { SourceCandidate } from "./scoring";

export interface CatalogBook {
  title: string;
  author: string;
  edition: string;
  year: number;
  subject: string;
  difficulty: "intro" | "undergraduate" | "advanced" | "graduate";
  prereqLevel: string;
  url: string;
  license: string;
  accessStatus: "open_full_text" | "preview" | "metadata_only" | "commercial";
  openFullText: boolean;
  relevantChapters: string[];
  rationale: string;
  role: "primary" | "supplemental";
}

export interface KnownContradiction {
  topic: string;
  description: string;
  resolution: string;
  sourceATitle: string;
  sourceBTitle: string;
}

export interface LessonSeed {
  title: string;
  objectives: string[];
  prereqConcepts: string[];
  conceptSummary: string; // seed for the original explanation
  formalSummary: string; // seed for the formal explanation
  commonMistakes: string[];
  setiApplication: string;
  masteryCriteria: string[];
  generatorKeys: string[]; // parametric problem generators to attach
}

export interface SubjectProfile {
  key: string;
  match: string[]; // matched against course code + title, lowercase
  keywords: string[]; // relevance scoring
  objectives: string[];
  prereqConcepts: string[];
  sources: SourceCandidate[];
  books: CatalogBook[];
  contradictions: KnownContradiction[];
  lessons: LessonSeed[];
}

const src = (
  s: Partial<SourceCandidate> & Pick<SourceCandidate, "title" | "url" | "type" | "subject">,
): SourceCandidate => ({
  provider: "catalog",
  description: "",
  license: "unknown",
  accessStatus: "metadata_only",
  ...s,
});

export const SUBJECT_PROFILES: SubjectProfile[] = [
  {
    key: "calculus-1",
    match: ["mat 265", "calculus i", "calculus for engineers i", "calculus 1"],
    keywords: ["calculus", "limits", "derivatives", "differentiation", "functions"],
    objectives: [
      "Evaluate limits analytically, numerically, and graphically",
      "Differentiate polynomial, trigonometric, exponential, and composite functions",
      "Apply derivatives to motion, optimization, and related rates",
      "Interpret the definite integral as accumulated change",
      "Use the Fundamental Theorem of Calculus",
    ],
    prereqConcepts: ["algebraic manipulation", "functions and graphs", "trigonometry", "exponentials and logarithms"],
    sources: [
      src({
        title: "OpenStax Calculus Volume 1",
        url: "https://openstax.org/details/books/calculus-volume-1",
        type: "textbook",
        subject: "calculus",
        provider: "openstax",
        description: "Peer-reviewed open textbook covering limits, derivatives, and integrals with full problem sets.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2016,
        authors: ["Gilbert Strang", "Edwin Herman"],
      }),
      src({
        title: "MIT OCW 18.01SC Single Variable Calculus",
        url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/",
        type: "course",
        subject: "calculus",
        provider: "mit-ocw",
        description: "Complete MIT course: lecture videos, notes, worked problems, and exams with solutions.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "LibreTexts Calculus (OpenStax adaptation and beyond)",
        url: "https://math.libretexts.org/Bookshelves/Calculus",
        type: "textbook",
        subject: "calculus",
        provider: "libretexts",
        description: "Curated open calculus bookshelf with alternative explanations and interactive elements.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Calculus Made Easy (Thompson, 1914)",
        url: "https://www.gutenberg.org/ebooks/33283",
        type: "textbook",
        subject: "calculus",
        provider: "gutenberg",
        description: "Classic public-domain text famous for building intuition before formalism.",
        license: "Public domain",
        accessStatus: "open_full_text",
        year: 1914,
        authors: ["Silvanus P. Thompson"],
      }),
      src({
        title: "OpenLearn: Introduction to differentiation",
        url: "https://www.open.edu/openlearn/science-maths-technology/introduction-differentiation",
        type: "course",
        subject: "calculus",
        provider: "openlearn",
        description: "Short, gentle Open University unit on derivative fundamentals.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Calculus Volume 1",
        author: "Gilbert Strang & Edwin Herman (OpenStax)",
        edition: "1st",
        year: 2016,
        subject: "calculus",
        difficulty: "undergraduate",
        prereqLevel: "college algebra + trigonometry",
        url: "https://openstax.org/details/books/calculus-volume-1",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["1. Functions and Graphs", "2. Limits", "3. Derivatives", "4. Applications of Derivatives", "5. Integration"],
        rationale: "Openly licensed, peer-reviewed, aligned chapter-for-chapter with a standard Calculus I syllabus; free full text makes it the natural primary source.",
        role: "primary",
      },
      {
        title: "Calculus: Early Transcendentals",
        author: "James Stewart, Daniel Clegg, Saleem Watson",
        edition: "9th",
        year: 2020,
        subject: "calculus",
        difficulty: "undergraduate",
        prereqLevel: "college algebra + trigonometry",
        url: "https://www.cengage.com/c/calculus-early-transcendentals-9e-stewart/",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["2. Limits and Derivatives", "3. Differentiation Rules", "4. Applications of Differentiation", "5. Integrals"],
        rationale: "The most widely assigned university calculus text; excellent graded problem sets. Not openly available, so it is metadata-only here: use the open primary sources for content and this as an optional purchase.",
        role: "supplemental",
      },
    ],
    contradictions: [
      {
        topic: "Definition style for the derivative",
        description:
          "Thompson's 'Calculus Made Easy' (1914) treats infinitesimals informally (dx as 'a little bit of x'), while OpenStax and MIT OCW define the derivative rigorously as a limit. The numerical answers agree, but the reasoning frameworks differ.",
        resolution:
          "Modern courses grade the limit definition; use Thompson for intuition and OpenStax/MIT for the definitions you'll be tested on. (Infinitesimals can be made rigorous — nonstandard analysis — but that's not what Calculus I assumes.)",
        sourceATitle: "Calculus Made Easy (Thompson, 1914)",
        sourceBTitle: "OpenStax Calculus Volume 1",
      },
    ],
    lessons: [
      {
        title: "Limits: the engine under every derivative",
        objectives: ["Evaluate limits by substitution, factoring, and comparison", "Recognize one-sided limits and asymptotes", "State the limit definition of the derivative"],
        prereqConcepts: ["functions", "factoring", "graph reading"],
        conceptSummary:
          "A limit asks what a function approaches, not what it equals. Most limits fall to three moves: substitute if continuous, simplify if you hit 0/0, and compare growth rates otherwise. The derivative is defined as the limit of slopes of secant lines, which is why limits come first in every calculus course.",
        formalSummary:
          "lim (x→a) f(x) = L means: for every ε > 0 there exists δ > 0 such that 0 < |x − a| < δ implies |f(x) − L| < ε. The derivative is f'(x) = lim (h→0) [f(x+h) − f(x)]/h when this limit exists; existence requires the left and right limits to agree.",
        commonMistakes: [
          "Substituting into a form like (x²−9)/(x−3) at x=3 and concluding the limit doesn't exist instead of factoring first",
          "Using degrees instead of radians, which breaks lim sin(θ)/θ = 1",
          "Confusing the value f(a) with the limit as x→a — they can differ or f(a) may not exist",
        ],
        setiApplication:
          "Doppler drift df/dt — the slow frequency change of a narrowband signal caused by planetary rotation — is a derivative, i.e. a limit of Δf/Δt over shrinking windows. SETI pipelines like turboSETI search a grid of these drift rates.",
        masteryCriteria: ["Solve 8/10 limit problems without hints", "Write the limit definition of the derivative from memory", "Explain in one paragraph why 0/0 forms require algebraic work"],
        generatorKeys: ["limit-rational", "derivative-poly"],
      },
      {
        title: "Differentiation rules and what they mean physically",
        objectives: ["Apply power, product, quotient, and chain rules", "Differentiate sin, cos, e^x, ln x", "Translate derivatives into rates and slopes"],
        prereqConcepts: ["limits", "function composition", "trigonometry"],
        conceptSummary:
          "The rules compress the limit definition into algebra you can do quickly: power rule for monomials, product/quotient rules for combinations, and the chain rule — the most important — for compositions. Physically, every derivative is a rate: position→velocity→acceleration.",
        formalSummary:
          "d/dx[x^n] = n·x^(n−1); (fg)' = f'g + fg'; (f/g)' = (f'g − fg')/g²; (f∘g)'(x) = f'(g(x))·g'(x). Trig/exponential: (sin x)' = cos x, (cos x)' = −sin x, (e^x)' = e^x, (ln x)' = 1/x, valid in radians.",
        commonMistakes: [
          "Forgetting the inner derivative in the chain rule",
          "Applying the power rule to e^x or 2^x as if the exponent were fixed",
          "Sign errors on (cos x)' = −sin x",
        ],
        setiApplication:
          "Radial velocity curves of exoplanet host stars are differentiated to find acceleration extremes, which fix the expected Doppler drift-rate window a SETI search must cover for that system.",
        masteryCriteria: ["Differentiate 10 mixed functions with ≥85% accuracy", "Solve one related-rates word problem end to end"],
        generatorKeys: ["derivative-poly", "derivative-chain"],
      },
      {
        title: "Applications: optimization, motion, and linear approximation",
        objectives: ["Find and classify critical points", "Solve optimization word problems", "Use tangent lines for approximation"],
        prereqConcepts: ["differentiation rules", "algebraic solving"],
        conceptSummary:
          "Setting f'(x) = 0 finds candidate maxima/minima; the second derivative classifies them. Optimization is the art of translating a word problem into a function of one variable, then applying this machinery. Linear approximation f(x) ≈ f(a) + f'(a)(x−a) is the germ of every Taylor series.",
        formalSummary:
          "If f'(c) = 0 and f''(c) > 0 then c is a local minimum (concave up); f''(c) < 0 gives a local maximum. Closed-interval extrema occur at critical points or endpoints (Extreme Value Theorem, requiring continuity).",
        commonMistakes: [
          "Forgetting to check endpoint values on a closed interval",
          "Reporting the x-value when the problem asks for the optimal quantity f(x)",
          "Skipping the constraint equation that reduces two variables to one",
        ],
        setiApplication:
          "Telescope scheduling is an optimization problem: maximize integrated observation time on target lists subject to elevation limits and slew constraints — the same critical-point reasoning at observatory scale.",
        masteryCriteria: ["Solve 3 optimization problems with correct units", "Classify critical points of a given cubic without a calculator"],
        generatorKeys: ["optimize-quadratic", "derivative-poly"],
      },
    ],
  },
  {
    key: "precalc-algebra",
    match: ["mat 117", "mat 170", "mat 171", "college algebra", "precalculus", "trigonometry"],
    keywords: ["algebra", "functions", "trigonometry", "precalculus", "graphs"],
    objectives: [
      "Manipulate algebraic expressions and solve equations fluently",
      "Analyze functions, transformations, and inverses",
      "Master the unit circle and trigonometric identities",
      "Model with exponential and logarithmic functions",
    ],
    prereqConcepts: ["arithmetic", "order of operations", "basic graphing"],
    sources: [
      src({
        title: "OpenStax Precalculus 2e",
        url: "https://openstax.org/details/books/precalculus-2e",
        type: "textbook",
        subject: "precalculus",
        provider: "openstax",
        description: "Comprehensive open precalculus text: functions, trig, and analytic geometry.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2021,
        authors: ["Jay Abramson"],
      }),
      src({
        title: "OpenStax College Algebra 2e",
        url: "https://openstax.org/details/books/college-algebra-2e",
        type: "textbook",
        subject: "algebra",
        provider: "openstax",
        description: "Open college algebra text with thousands of practice problems.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2021,
        authors: ["Jay Abramson"],
      }),
      src({
        title: "LibreTexts Precalculus bookshelf",
        url: "https://math.libretexts.org/Bookshelves/Precalculus",
        type: "textbook",
        subject: "precalculus",
        provider: "libretexts",
        description: "Multiple open precalculus texts with alternative presentations.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Precalculus 2e",
        author: "Jay Abramson (OpenStax)",
        edition: "2nd",
        year: 2021,
        subject: "precalculus",
        difficulty: "intro",
        prereqLevel: "high-school algebra",
        url: "https://openstax.org/details/books/precalculus-2e",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["1. Functions", "5. Trigonometric Functions", "7. Trigonometric Identities and Equations", "6. Exponential and Logarithmic Functions"],
        rationale: "Open, recent, complete coverage of every precalculus topic the calculus sequence assumes.",
        role: "primary",
      },
    ],
    contradictions: [],
    lessons: [
      {
        title: "Functions, transformations, and inverses",
        objectives: ["Evaluate and compose functions", "Shift/stretch/reflect graphs", "Find inverse functions"],
        prereqConcepts: ["algebraic manipulation"],
        conceptSummary:
          "A function is a machine with exactly one output per input. Transformations move its graph predictably: f(x−h)+k shifts right h and up k; af(bx) stretches. Inverses undo: reflect across y = x, swap domain and range.",
        formalSummary:
          "f: A → B assigns each a ∈ A exactly one f(a) ∈ B. f has an inverse iff it is one-to-one (horizontal line test); then f⁻¹(f(x)) = x. Composition (f∘g)(x) = f(g(x)) is generally non-commutative.",
        commonMistakes: ["Treating f⁻¹(x) as 1/f(x)", "Applying horizontal shifts in the wrong direction", "Composing in the wrong order"],
        setiApplication:
          "Telescope pointing converts between coordinate systems — (azimuth, elevation) ↔ (right ascension, declination) — which is function composition and inversion applied to the sky.",
        masteryCriteria: ["Sketch transformed graphs of 5 base functions", "Find inverses of linear and simple rational functions"],
        generatorKeys: ["algebra-linear", "algebra-quadratic"],
      },
      {
        title: "The unit circle and trigonometric identities",
        objectives: ["Evaluate trig functions at special angles", "Prove and apply Pythagorean and angle-sum identities", "Solve trig equations"],
        prereqConcepts: ["radians", "functions"],
        conceptSummary:
          "All of trigonometry lives on the unit circle: cos θ and sin θ are just the x and y coordinates at angle θ. Identities are geometry in disguise — sin²+cos²=1 is the Pythagorean theorem. Angle-sum formulas explain wave mixing and beats.",
        formalSummary:
          "sin²θ + cos²θ = 1; sin(a±b) = sin a cos b ± cos a sin b; cos(a±b) = cos a cos b ∓ sin a sin b. Periodicity: sin(θ+2π) = sin θ. Radians make arc length = rθ and unlock lim sin θ/θ = 1.",
        commonMistakes: ["Degree/radian mode errors", "Sign errors by quadrant", "Assuming sin(a+b) = sin a + sin b"],
        setiApplication:
          "Radio receivers shift sky frequencies down by multiplying signals (heterodyning); the angle-sum identities are exactly why multiplying two sinusoids produces sum and difference frequencies.",
        masteryCriteria: ["Fill a blank unit circle from memory", "Solve 5 trig equations on [0, 2π)"],
        generatorKeys: ["trig-eval"],
      },
    ],
  },
  {
    key: "linear-algebra",
    match: ["mat 342", "linear algebra", "phy 201", "phy 202", "mathematical methods"],
    keywords: ["linear algebra", "matrix", "vector", "eigenvalue", "transformation"],
    objectives: [
      "Solve linear systems with Gaussian elimination",
      "Compute matrix operations, determinants, and inverses",
      "Work with vector spaces, bases, and rank",
      "Find eigenvalues/eigenvectors and diagonalize matrices",
    ],
    prereqConcepts: ["systems of equations", "vectors", "algebraic fluency"],
    sources: [
      src({
        title: "MIT OCW 18.06 Linear Algebra (Strang)",
        url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        type: "course",
        subject: "linear algebra",
        provider: "mit-ocw",
        description: "Gilbert Strang's legendary course: full lecture videos, problem sets, and exams.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "LibreTexts Linear Algebra bookshelf",
        url: "https://math.libretexts.org/Bookshelves/Linear_Algebra",
        type: "textbook",
        subject: "linear algebra",
        provider: "libretexts",
        description: "Several complete open linear algebra texts at different levels of abstraction.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "NumPy linear algebra documentation (numpy.linalg)",
        url: "https://numpy.org/doc/stable/reference/routines.linalg.html",
        type: "documentation",
        subject: "linear algebra",
        provider: "numpy",
        description: "Official reference for computational linear algebra used throughout astronomy.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Introduction to Linear Algebra",
        author: "Gilbert Strang",
        edition: "6th",
        year: 2023,
        subject: "linear algebra",
        difficulty: "undergraduate",
        prereqLevel: "calculus helpful but not required",
        url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        license: "Commercial (companion course is CC BY-NC-SA)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["1. Vectors", "2. Solving Linear Equations", "3. Vector Spaces", "6. Eigenvalues and Eigenvectors"],
        rationale: "The canonical text; its companion MIT OCW course is fully open, so the course fills the content role while the book remains an optional purchase.",
        role: "supplemental",
      },
    ],
    contradictions: [
      {
        topic: "Row vectors vs. column vectors as the default",
        description:
          "Strang's materials treat vectors as columns acted on from the left (Ax), while NumPy stores 1-D arrays that behave as either depending on context, and some texts write row-vector conventions (xA).",
        resolution:
          "Both conventions are internally consistent; the math is transpose-symmetric. Pick the column convention for coursework (it matches quantum mechanics kets) and always check array shapes explicitly in NumPy.",
        sourceATitle: "MIT OCW 18.06 Linear Algebra (Strang)",
        sourceBTitle: "NumPy linear algebra documentation (numpy.linalg)",
      },
    ],
    lessons: [
      {
        title: "Linear systems and Gaussian elimination",
        objectives: ["Row-reduce matrices to echelon form", "Classify systems: unique/none/infinite", "Interpret pivots and free variables"],
        prereqConcepts: ["systems of equations"],
        conceptSummary:
          "Every linear system is Ax = b. Gaussian elimination applies reversible row operations to expose the answer's structure: pivots mark determined variables, free columns mark degrees of freedom, and an impossible row (0 = 1) marks an inconsistent system.",
        formalSummary:
          "Row operations (swap, scale by nonzero, add multiples) preserve the solution set. A system has a unique solution iff every column of A has a pivot; rank(A) = number of pivots; rank(A) < rank([A|b]) implies inconsistency.",
        commonMistakes: ["Arithmetic slips while row-reducing (check with substitution)", "Forgetting that scaling a row by 0 is illegal", "Misreading free variables as 'no solution'"],
        setiApplication:
          "Calibrating a radio interferometer solves a large linear system relating antenna gains to observed visibilities — Gaussian elimination (via least squares) at observatory scale.",
        masteryCriteria: ["Row-reduce a 3×4 augmented matrix accurately", "Classify 5 systems by solution type"],
        generatorKeys: ["matrix-det", "algebra-linear"],
      },
      {
        title: "Eigenvalues, eigenvectors, and diagonalization",
        objectives: ["Compute eigenvalues via the characteristic polynomial", "Find eigenvectors and eigenspaces", "Explain why eigen-structure matters physically"],
        prereqConcepts: ["determinants", "matrix multiplication"],
        conceptSummary:
          "Eigenvectors are the directions a matrix cannot rotate — it only stretches them by the eigenvalue. They are the skeleton of a transformation: diagonalize A = PDP⁻¹ and repeated application, differential equations, and quantum measurement all become easy.",
        formalSummary:
          "Av = λv with v ≠ 0 iff det(A − λI) = 0. An n×n matrix with n independent eigenvectors is diagonalizable. Symmetric (Hermitian) matrices have real eigenvalues and orthogonal eigenvectors — the spectral theorem that quantum mechanics is built on.",
        commonMistakes: ["Dropping the v ≠ 0 requirement", "Sign errors in det(A − λI)", "Assuming every matrix is diagonalizable"],
        setiApplication:
          "PCA — the eigen-decomposition of a covariance matrix — de-noises radio spectrograms and compresses candidate-signal feature spaces in machine-learning SETI pipelines.",
        masteryCriteria: ["Find eigenvalues/vectors of 2×2 and simple 3×3 matrices", "State the spectral theorem and one consequence"],
        generatorKeys: ["matrix-det", "eigen-2x2"],
      },
    ],
  },
  {
    key: "physics-mechanics",
    match: ["phy 121", "university physics i", "mechanics", "phy 302", "classical mechanics"],
    keywords: ["mechanics", "newton", "kinematics", "momentum", "energy", "physics"],
    objectives: [
      "Solve kinematics problems in one and two dimensions",
      "Apply Newton's laws with free-body diagrams",
      "Use work-energy and impulse-momentum theorems",
      "Analyze rotational motion and oscillations",
    ],
    prereqConcepts: ["vectors", "trigonometry", "derivatives", "units and dimensional analysis"],
    sources: [
      src({
        title: "OpenStax University Physics Volume 1",
        url: "https://openstax.org/details/books/university-physics-volume-1",
        type: "textbook",
        subject: "mechanics",
        provider: "openstax",
        description: "Calculus-based mechanics: kinematics through waves, with full solutions.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2016,
        authors: ["William Moebs", "Samuel Ling", "Jeff Sanny"],
      }),
      src({
        title: "MIT OCW 8.01SC Classical Mechanics",
        url: "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/",
        type: "course",
        subject: "mechanics",
        provider: "mit-ocw",
        description: "Full MIT mechanics course with videos, problem sets, and exams.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "The Feynman Lectures on Physics, Volume I",
        url: "https://www.feynmanlectures.caltech.edu/I_toc.html",
        type: "lecture_notes",
        subject: "mechanics",
        provider: "caltech",
        description: "Caltech's authorized free online edition of Feynman's legendary lectures.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
        year: 1964,
        authors: ["Richard Feynman", "Robert Leighton", "Matthew Sands"],
      }),
      src({
        title: "NASA Glenn: Beginner's Guide to Aeronautics — Newton's Laws",
        url: "https://www.grc.nasa.gov/www/k-12/airplane/newton.html",
        type: "lecture_notes",
        subject: "mechanics",
        provider: "nasa",
        description: "NASA's applied treatment of forces and motion.",
        license: "Public domain (US Government work)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "University Physics Volume 1",
        author: "Moebs, Ling & Sanny (OpenStax)",
        edition: "1st",
        year: 2016,
        subject: "mechanics",
        difficulty: "undergraduate",
        prereqLevel: "Calculus I (concurrent acceptable)",
        url: "https://openstax.org/details/books/university-physics-volume-1",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["3-4. Motion", "5-6. Newton's Laws", "7-8. Work and Energy", "9-11. Momentum and Rotation", "15. Oscillations"],
        rationale: "Open, calculus-based, and mapped to the standard University Physics I syllabus; the natural primary text.",
        role: "primary",
      },
      {
        title: "Fundamentals of Physics",
        author: "Halliday, Resnick & Walker",
        edition: "12th",
        year: 2021,
        subject: "physics",
        difficulty: "undergraduate",
        prereqLevel: "Calculus I",
        url: "https://www.wiley.com/en-us/Fundamentals+of+Physics%2C+12th+Edition-p-9781119801139",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["Ch. 2-11 (mechanics core)"],
        rationale: "A benchmark commercial text with exceptional problem variety. Metadata-only: the OpenStax volume covers the same objectives openly; buy or borrow this only if you want extra problems.",
        role: "supplemental",
      },
      {
        title: "Classical Mechanics",
        author: "John R. Taylor",
        edition: "1st",
        year: 2005,
        subject: "mechanics",
        difficulty: "advanced",
        prereqLevel: "University Physics I-II + Differential Equations",
        url: "https://uscibooks.com/product/classical-mechanics/",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["Lagrangian mechanics", "Oscillations", "Central-force orbits"],
        rationale: "The standard upper-division mechanics text (relevant to PHY 302, not PHY 121). Recommended for later; commercial, so metadata-only with a library path.",
        role: "supplemental",
      },
    ],
    contradictions: [
      {
        topic: "Is g exactly 9.8 m/s²?",
        description:
          "Textbook problems use g = 9.8 (or 9.81, or even 10) m/s², while NIST/geodesy sources give a standard value 9.80665 m/s² and measured local values varying from ~9.78 (equator) to ~9.83 (poles).",
        resolution:
          "g varies with latitude and altitude; 9.8 is a rounded convention for problem-solving. Use the course's stated value on exams and the measured local value in real experiments.",
        sourceATitle: "OpenStax University Physics Volume 1",
        sourceBTitle: "NIST reference on standard gravity",
      },
    ],
    lessons: [
      {
        title: "Kinematics: describing motion precisely",
        objectives: ["Use velocity and acceleration as derivatives", "Apply constant-acceleration equations", "Analyze projectile motion by components"],
        prereqConcepts: ["derivatives", "vectors", "trigonometry"],
        conceptSummary:
          "Kinematics describes motion without asking why. Velocity is the derivative of position, acceleration of velocity. With constant acceleration, three equations cover every case, and 2-D problems split into independent x and y components — the deepest trick in the chapter.",
        formalSummary:
          "v = v₀ + at; Δx = v₀t + ½at²; v² = v₀² + 2aΔx. Projectiles: aₓ = 0, a_y = −g; the horizontal and vertical motions share only time. Range on level ground: R = v₀² sin(2θ)/g.",
        commonMistakes: ["Mixing signs by not fixing a coordinate direction first", "Using constant-acceleration formulas when a varies", "Treating horizontal and vertical motion as coupled"],
        setiApplication:
          "The same component decomposition governs how observatories compute a source's apparent motion across the sky, and how spacecraft trajectories (e.g., toward interstellar object flybys) are propagated between thrust arcs.",
        masteryCriteria: ["Solve free-fall and projectile problems with correct signs", "Derive v² = v₀² + 2aΔx from the other two equations"],
        generatorKeys: ["kinematics-freefall", "vector-ops"],
      },
      {
        title: "Newton's laws and the free-body method",
        objectives: ["Draw complete free-body diagrams", "Apply ΣF = ma per axis", "Handle friction, tension, and inclines"],
        prereqConcepts: ["vectors", "kinematics"],
        conceptSummary:
          "Dynamics explains motion: forces cause acceleration, not velocity. The free-body diagram is a discipline — isolate one body, draw every force on it, choose axes along the acceleration — that converts physical situations into solvable algebra.",
        formalSummary:
          "ΣF = ma (vector; apply per axis). Third law: F(A on B) = −F(B on A) on different bodies. Static friction f ≤ μₛN; kinetic f = μₖN with N the normal force, which need not equal mg on inclines.",
        commonMistakes: ["Setting N = mg on an incline", "Putting action-reaction pairs on the same free-body diagram", "Believing motion requires a net force"],
        setiApplication:
          "A 100 m radio dish slewing to a new target is a rotational Newton's-law problem: motor torque against enormous moments of inertia sets the slew rate that observation schedulers must respect.",
        masteryCriteria: ["Solve incline + friction problems reliably", "Identify third-law pairs in 5 scenarios"],
        generatorKeys: ["newton-force", "kinematics-freefall"],
      },
      {
        title: "Energy, momentum, and conservation laws",
        objectives: ["Apply the work-energy theorem", "Use conservation of energy and momentum", "Decide which conservation law fits a problem"],
        prereqConcepts: ["Newton's laws", "integrals"],
        conceptSummary:
          "Conservation laws are physics' bookkeeping superpowers: when no external work or force intrudes, energy and momentum totals cannot change. Collisions conserve momentum always, kinetic energy only if elastic. Energy methods solve in one line problems that force methods make miserable.",
        formalSummary:
          "W = ∫F·dx = ΔKE; U_grav = mgh near Earth; E = KE + U conserved without friction. Momentum p = mv; Σp conserved when ΣF_ext = 0. Elastic collisions additionally conserve KE.",
        commonMistakes: ["Applying energy conservation across friction without accounting for heat", "Conserving KE in inelastic collisions", "Dropping the vector nature of momentum"],
        setiApplication:
          "E = Δm·c² in stellar fusion is energy conservation with mass on the ledger — the reason stars shine long enough for life, and civilizations, to arise around them.",
        masteryCriteria: ["Solve 2-body collision problems in 1-D", "Choose correctly between energy and force methods on 5 mixed problems"],
        generatorKeys: ["energy-conservation", "newton-force"],
      },
    ],
  },
  {
    key: "physics-em",
    match: ["phy 131", "university physics ii", "electricity", "magnetism", "phy 311", "phy 334", "optics"],
    keywords: ["electricity", "magnetism", "electromagnetic", "circuits", "fields", "optics", "waves"],
    objectives: [
      "Apply Coulomb's law and compute electric fields",
      "Use Gauss's law for symmetric charge distributions",
      "Analyze DC circuits with Kirchhoff's rules",
      "Describe magnetic forces and electromagnetic induction",
      "Connect Maxwell's equations to electromagnetic waves",
    ],
    prereqConcepts: ["mechanics", "calculus (integrals)", "vectors"],
    sources: [
      src({
        title: "OpenStax University Physics Volume 2",
        url: "https://openstax.org/details/books/university-physics-volume-2",
        type: "textbook",
        subject: "electromagnetism",
        provider: "openstax",
        description: "Calculus-based E&M: fields, circuits, induction, and Maxwell's equations.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2016,
      }),
      src({
        title: "MIT OCW 8.02 Physics II: Electricity and Magnetism",
        url: "https://ocw.mit.edu/courses/8-02sc-physics-ii-electricity-and-magnetism-fall-2010/",
        type: "course",
        subject: "electromagnetism",
        provider: "mit-ocw",
        description: "Complete MIT E&M course with visualizations and solved problems.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Feynman Lectures Volume II (Electromagnetism)",
        url: "https://www.feynmanlectures.caltech.edu/II_toc.html",
        type: "lecture_notes",
        subject: "electromagnetism",
        provider: "caltech",
        description: "Authorized free online edition; the field-first view of electromagnetism.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
        year: 1964,
      }),
      src({
        title: "NRAO: What are radio waves?",
        url: "https://public.nrao.edu/radio-astronomy/what-are-radio-waves/",
        type: "lecture_notes",
        subject: "electromagnetism",
        provider: "nrao",
        description: "The national radio observatory's public explanation of EM waves as used in astronomy.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "University Physics Volume 2",
        author: "OpenStax",
        edition: "1st",
        year: 2016,
        subject: "electromagnetism",
        difficulty: "undergraduate",
        prereqLevel: "University Physics I + Calculus II",
        url: "https://openstax.org/details/books/university-physics-volume-2",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["5-8. Electric fields and potential", "9-10. Current and circuits", "11-14. Magnetism and induction", "16. EM waves"],
        rationale: "Open, complete, calculus-based match for University Physics II.",
        role: "primary",
      },
      {
        title: "Introduction to Electrodynamics",
        author: "David J. Griffiths",
        edition: "5th",
        year: 2023,
        subject: "electromagnetism",
        difficulty: "advanced",
        prereqLevel: "University Physics II + vector calculus",
        url: "https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["2. Electrostatics", "5. Magnetostatics", "7. Electrodynamics", "9. EM Waves"],
        rationale: "The standard upper-division E&M text (for PHY 311). Famously clear; commercial, so metadata + library path only.",
        role: "supplemental",
      },
    ],
    contradictions: [
      {
        topic: "SI vs. Gaussian units in electromagnetism",
        description:
          "OpenStax and Griffiths use SI units (Coulomb's law with 1/4πε₀), while much of the older physics literature and some astrophysics papers use Gaussian units, where the same law has no 4πε₀ and fields carry different dimensions.",
        resolution:
          "Neither is wrong — they are different unit systems. Coursework is SI; when reading astrophysics literature, check the unit system before comparing formulas, and convert via published correspondence tables.",
        sourceATitle: "OpenStax University Physics Volume 2",
        sourceBTitle: "Classic astrophysics literature (Gaussian units)",
      },
    ],
    lessons: [
      {
        title: "Electric charge, fields, and potential",
        objectives: ["Compute forces with Coulomb's law", "Superpose fields of point charges", "Relate field and potential"],
        prereqConcepts: ["vectors", "inverse-square reasoning"],
        conceptSummary:
          "Charge creates a field; fields exert forces on other charges. Superposition means fields add as vectors. Potential is energy per charge — a scalar shortcut that often replaces messy vector addition, with E pointing downhill in potential.",
        formalSummary:
          "F = kq₁q₂/r² with k = 1/4πε₀ ≈ 9×10⁹ N·m²/C². E = F/q; V = kq/r for a point charge; E = −dV/dx. Field lines start on + and end on − charges; equipotentials cross field lines at right angles.",
        commonMistakes: ["Adding field magnitudes instead of vectors", "Confusing potential (scalar) with potential energy", "Sign errors with negative charges"],
        setiApplication:
          "An antenna works because an arriving EM wave's E field pushes charges in a conductor; the induced voltage — microvolts or less from interstellar distances — is the raw material of every radio SETI observation.",
        masteryCriteria: ["Compute superposed fields for 3-charge configurations", "Sketch field and equipotential lines for a dipole"],
        generatorKeys: ["coulomb-force", "vector-ops"],
      },
      {
        title: "Circuits, induction, and electromagnetic waves",
        objectives: ["Analyze series/parallel circuits with Ohm's and Kirchhoff's laws", "Apply Faraday's law of induction", "Explain how Maxwell's equations predict EM waves"],
        prereqConcepts: ["electric fields", "derivatives"],
        conceptSummary:
          "Circuits move energy with charge: V = IR locally, energy conservation (voltage law) and charge conservation (current law) globally. Faraday's discovery — changing magnetic flux induces voltage — plus Maxwell's completion yields self-propagating EM waves at speed c: light and radio are the same thing at different frequencies.",
        formalSummary:
          "Kirchhoff: Σ voltage drops around a loop = 0; Σ currents at a node = 0. Faraday: EMF = −dΦ_B/dt. Maxwell's equations couple changing E and B, giving wave solutions with speed c = 1/√(μ₀ε₀); c = fλ links frequency and wavelength.",
        commonMistakes: ["Adding parallel resistances directly instead of via reciprocals", "Dropping the minus sign (Lenz's law) in induction", "Thinking radio waves need a medium"],
        setiApplication:
          "The 21 cm hydrogen line at 1420.4 MHz falls in the quietest part of the radio spectrum — the 'water hole' — which is why classic SETI searches concentrate there.",
        masteryCriteria: ["Reduce mixed resistor networks", "Compute induced EMF for changing-flux scenarios", "Convert between f and λ fluently"],
        generatorKeys: ["circuit-ohm", "wave-freq"],
      },
    ],
  },
  {
    key: "quantum-modern",
    match: ["modern physics", "phy 314", "quantum mechanics", "phy 441", "statistical", "thermodynamics", "phy 320", "phy 241", "university physics iii"],
    keywords: ["quantum", "relativity", "photon", "wavefunction", "modern physics", "thermodynamics", "entropy"],
    objectives: [
      "Apply special relativity: time dilation, length contraction, E = mc²",
      "Use photon energy and de Broglie relations",
      "Interpret wavefunctions and the Born rule",
      "Solve the particle-in-a-box and interpret quantized energies",
    ],
    prereqConcepts: ["mechanics", "electromagnetism", "complex numbers", "linear algebra"],
    sources: [
      src({
        title: "OpenStax University Physics Volume 3",
        url: "https://openstax.org/details/books/university-physics-volume-3",
        type: "textbook",
        subject: "modern physics",
        provider: "openstax",
        description: "Optics, relativity, and quantum mechanics at the introductory calculus-based level.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2016,
      }),
      src({
        title: "MIT OCW 8.04 Quantum Physics I",
        url: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/",
        type: "course",
        subject: "quantum mechanics",
        provider: "mit-ocw",
        description: "Full quantum mechanics course: wavefunctions, Schrödinger equation, and bound states.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Feynman Lectures Volume III (Quantum Mechanics)",
        url: "https://www.feynmanlectures.caltech.edu/III_toc.html",
        type: "lecture_notes",
        subject: "quantum mechanics",
        provider: "caltech",
        description: "Authorized free online edition; amplitudes-first quantum mechanics.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
        year: 1964,
      }),
      src({
        title: "NIST: CODATA fundamental physical constants",
        url: "https://physics.nist.gov/cuu/Constants/",
        type: "dataset",
        subject: "modern physics",
        provider: "nist",
        description: "Authoritative values for h, c, e, and every constant used in coursework.",
        license: "Public domain (US Government work)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "University Physics Volume 3",
        author: "OpenStax",
        edition: "1st",
        year: 2016,
        subject: "modern physics",
        difficulty: "undergraduate",
        prereqLevel: "University Physics II",
        url: "https://openstax.org/details/books/university-physics-volume-3",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["5. Relativity", "6. Photons and Matter Waves", "7. Quantum Mechanics", "8. Atomic Structure"],
        rationale: "Open coverage of the standard Modern Physics syllabus.",
        role: "primary",
      },
      {
        title: "Introduction to Quantum Mechanics",
        author: "David J. Griffiths & Darrell F. Schroeter",
        edition: "3rd",
        year: 2018,
        subject: "quantum mechanics",
        difficulty: "advanced",
        prereqLevel: "Modern Physics + Linear Algebra + Differential Equations",
        url: "https://www.cambridge.org/highereducation/books/introduction-to-quantum-mechanics/",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["1. The Wave Function", "2. Time-Independent Schrödinger Equation", "3. Formalism", "4. QM in 3D"],
        rationale: "The standard upper-division QM text (for PHY 314). Commercial: metadata + library path; MIT 8.04 covers the objectives openly.",
        role: "supplemental",
      },
    ],
    contradictions: [
      {
        topic: "Interpretations of quantum measurement",
        description:
          "Introductory texts present measurement as 'collapse' of the wavefunction, while other reputable sources describe decoherence or many-worlds pictures in which no collapse occurs. The experimental predictions are identical; the narrative differs.",
        resolution:
          "This is a genuine, documented interpretational openness in physics — not an error in either source. Course exams use the collapse language of the textbook; know that the underlying debate is unresolved and doesn't affect calculations.",
        sourceATitle: "OpenStax University Physics Volume 3",
        sourceBTitle: "Feynman Lectures Volume III (Quantum Mechanics)",
      },
    ],
    lessons: [
      {
        title: "Photons, matter waves, and quantization",
        objectives: ["Compute photon energies E = hf", "Use de Broglie wavelength λ = h/p", "Explain the photoelectric effect"],
        prereqConcepts: ["waves", "energy", "electromagnetism"],
        conceptSummary:
          "Light behaves as quanta (photons) and matter as waves — measured facts, however strange. The photoelectric effect shows light's energy arrives in units of hf; electron diffraction shows particles interfere. Quantization of atomic energy levels follows, and with it the spectral fingerprints astronomy is built on.",
        formalSummary:
          "E = hf = hc/λ with h = 6.626×10⁻³⁴ J·s. Photoelectric: KE_max = hf − φ, with threshold frequency f₀ = φ/h. de Broglie: λ = h/p. Particle in a box: E_n = n²h²/8mL² — discrete because boundary conditions quantize the wave.",
        commonMistakes: ["Treating brightness (photon count) as photon energy", "Using wavelength where frequency belongs in E = hf", "Forgetting energy levels are discrete only for bound systems"],
        setiApplication:
          "A 1420 MHz radio photon carries ~10⁻²⁴ J — a million times less than an optical photon — which is why radio telescopes integrate billions of photons and why receiver noise, not photon counting, limits sensitivity.",
        masteryCriteria: ["Compute photon energies across the EM spectrum", "Solve photoelectric threshold problems", "State why bound systems quantize"],
        generatorKeys: ["photon-energy", "wave-freq"],
      },
    ],
  },
  {
    key: "astronomy-intro",
    match: ["ast 111", "ast 112", "ast 113", "ast 321", "ast 322", "ast 421", "ses 106", "ses 350", "ses 376", "ses 377", "ses 421", "introduction to astronomy", "solar system", "stars, galaxies", "habitable worlds", "astrophysics"],
    keywords: ["astronomy", "stars", "planets", "telescopes", "spectra", "orbits", "galaxies"],
    objectives: [
      "Use scientific notation and astronomical distance units fluently",
      "Read spectra: continuous, emission, absorption, and Doppler shifts",
      "Apply Kepler's and Newton's laws to orbits",
      "Explain telescope light-gathering and resolution",
      "Describe stellar life cycles and galactic structure",
    ],
    prereqConcepts: ["scientific notation", "basic algebra", "geometry"],
    sources: [
      src({
        title: "OpenStax Astronomy 2e",
        url: "https://openstax.org/details/books/astronomy-2e",
        type: "textbook",
        subject: "astronomy",
        provider: "openstax",
        description: "The standard open intro-astronomy survey text, updated 2022, with full imagery.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2022,
        authors: ["Andrew Fraknoi", "David Morrison", "Sidney Wolff"],
      }),
      src({
        title: "NASA Science: Universe",
        url: "https://science.nasa.gov/universe/",
        type: "course",
        subject: "astronomy",
        provider: "nasa",
        description: "Mission-fed explainers on stars, galaxies, exoplanets, and cosmology.",
        license: "Public domain (US Government work)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "ESA Science & Exploration",
        url: "https://www.esa.int/Science_Exploration",
        type: "course",
        subject: "astronomy",
        provider: "esa",
        description: "European Space Agency mission science: Gaia, JWST (joint), exoplanets.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "LibreTexts Astronomy & Cosmology bookshelf",
        url: "https://phys.libretexts.org/Bookshelves/Astronomy__Cosmology",
        type: "textbook",
        subject: "astronomy",
        provider: "libretexts",
        description: "Open astronomy texts including adaptations with problem sets.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "SETI Institute: Science research overview",
        url: "https://www.seti.org/our-work",
        type: "lecture_notes",
        subject: "astronomy",
        provider: "seti",
        description: "How the SETI Institute's astronomy, astrobiology, and technosignature work fits together.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Astronomy 2e",
        author: "Fraknoi, Morrison & Wolff (OpenStax)",
        edition: "2nd",
        year: 2022,
        subject: "astronomy",
        difficulty: "intro",
        prereqLevel: "high-school algebra",
        url: "https://openstax.org/details/books/astronomy-2e",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["3. Orbits and Gravity", "5. Radiation and Spectra", "6. Astronomical Instruments", "17-23. Stars", "25-28. Galaxies and Cosmology", "30. Life in the Universe"],
        rationale: "Recent, open, comprehensive, and written by leading astronomy educators — including a full chapter on life in the universe directly relevant to the SETI goal.",
        role: "primary",
      },
      {
        title: "An Introduction to Modern Astrophysics",
        author: "Bradley W. Carroll & Dale A. Ostlie",
        edition: "2nd",
        year: 2017,
        subject: "astrophysics",
        difficulty: "advanced",
        prereqLevel: "University Physics I-II + Calculus III",
        url: "https://www.cambridge.org/highereducation/books/an-introduction-to-modern-astrophysics/",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["Stellar atmospheres and interiors", "Stellar evolution", "Galactic structure"],
        rationale: "'BOB' — the standard quantitative astrophysics reference for upper-division courses and grad prep. Commercial: metadata + library path.",
        role: "supplemental",
      },
    ],
    contradictions: [
      {
        topic: "The Hubble constant tension",
        description:
          "Planck CMB analyses give H₀ ≈ 67.4 km/s/Mpc, while local distance-ladder measurements (SH0ES, Cepheids + supernovae) give ≈ 73 km/s/Mpc. The two precise measurements disagree by ~9%, well beyond stated uncertainties.",
        resolution:
          "This is an open problem in cosmology, not a mistake in either source. Textbooks may quote either value; know both, cite which measurement a number comes from, and watch for new physics or systematics to resolve it.",
        sourceATitle: "Planck Collaboration results (via NASA/ESA)",
        sourceBTitle: "SH0ES local distance-ladder results",
      },
    ],
    lessons: [
      {
        title: "Light and spectra: reading messages from the stars",
        objectives: ["Distinguish the three spectrum types", "Compute Doppler shifts", "Connect spectra to composition and motion"],
        prereqConcepts: ["scientific notation", "waves"],
        conceptSummary:
          "Almost everything astronomy knows arrives encoded in light. Kirchhoff's three spectrum types (continuous, emission, absorption) reveal what objects are made of; Doppler shifts of spectral lines reveal how they move. One spectrum can give composition, temperature, and velocity simultaneously.",
        formalSummary:
          "c = fλ. Wien: λ_peak ∝ 1/T. Doppler (v ≪ c): Δλ/λ = v/c, redshift receding, blueshift approaching. Each element's discrete energy levels produce a unique line pattern (E_photon = ΔE_levels).",
        commonMistakes: ["Confusing redshift (motion) with reddening (dust)", "Applying Δλ/λ = v/c at relativistic speeds", "Reading absorption lines as missing elements"],
        setiApplication:
          "Doppler drift is a technosignature filter: a transmitter on a rotating, orbiting planet must drift in frequency at a predictable rate; a perfectly steady narrowband signal is almost certainly local interference.",
        masteryCriteria: ["Classify spectra from descriptions", "Compute velocities from line shifts", "Explain spectral fingerprints in one paragraph"],
        generatorKeys: ["doppler-shift", "wave-freq"],
      },
      {
        title: "Gravity and orbits: from falling apples to exoplanets",
        objectives: ["Apply Newton's gravity and Kepler's laws", "Compute orbital speeds and periods", "Explain how orbits reveal masses"],
        prereqConcepts: ["Newton's laws", "algebraic manipulation"],
        conceptSummary:
          "One law — F = GMm/r² — runs the solar system, binary stars, and galaxies. Orbits are perpetual falling; Kepler's third law (T² ∝ a³) turns observed periods into central masses, which is how we weigh stars, find exoplanets, and detected the Milky Way's central black hole.",
        formalSummary:
          "v_circ = √(GM/r). Kepler III (SI): T² = 4π²a³/GM; in solar units (years, AU, M_sun): T² = a³/M. Vis-viva for ellipses: v² = GM(2/r − 1/a).",
        commonMistakes: ["Using degrees/wrong units in Kepler III (stick to yr-AU-M_sun or full SI)", "Thinking orbiting objects are weightless because gravity vanishes", "Confusing orbital speed with escape speed"],
        setiApplication:
          "Kepler's third law built the exoplanet catalog that SETI target lists draw from: transit periods → orbital radii → habitable-zone membership.",
        masteryCriteria: ["Weigh a star from a planet's period and orbit", "Explain why satellites don't fall down in two sentences"],
        generatorKeys: ["kepler-orbit", "gravity-force"],
      },
      {
        title: "Telescopes: photon buckets and angular vision",
        objectives: ["Compare light-gathering power", "Compute diffraction-limited resolution", "Contrast optical and radio instruments"],
        prereqConcepts: ["light", "geometry"],
        conceptSummary:
          "Telescopes do two jobs: collect photons (area ∝ D²) and resolve detail (θ ≈ 1.22 λ/D). Long radio wavelengths make single dishes fuzzy, which is why radio astronomy invented interferometry — linking dishes kilometers apart to synthesize one giant aperture.",
        formalSummary:
          "Light-gathering ∝ D². Rayleigh criterion: θ_min = 1.22 λ/D radians. An interferometer's resolution uses baseline B in place of D: θ ≈ λ/B, while sensitivity still scales with total collecting area.",
        commonMistakes: ["Equating magnification with quality", "Forgetting resolution worsens with longer λ", "Confusing sensitivity (area) with resolution (baseline)"],
        setiApplication:
          "The Allen Telescope Array — 42 small dishes built for SETI — trades single-dish size for interferometric flexibility, surveying many stars while rejecting local interference by position on the sky.",
        masteryCriteria: ["Rank telescopes by light-gathering and resolution", "Compute θ_min for optical vs. radio cases"],
        generatorKeys: ["telescope-res", "wave-freq"],
      },
    ],
  },
  {
    key: "radio-seti",
    match: ["ast 470", "radio astronomy", "seti 410", "seti 420", "seti 490", "technosignatures", "sig 401", "signal processing", "fourier"],
    keywords: ["radio astronomy", "seti", "technosignature", "fourier", "signal", "drift", "rfi", "interference"],
    objectives: [
      "Explain the radio telescope signal chain end to end",
      "Apply Fourier analysis: sampling, Nyquist, resolution",
      "Compute SNR and integration-time tradeoffs",
      "Run drift searches and RFI rejection logic",
      "Work with filterbank/HDF5 SETI data formats",
    ],
    prereqConcepts: ["electromagnetism", "trigonometry", "Python", "probability"],
    sources: [
      src({
        title: "Essential Radio Astronomy (Condon & Ransom, NRAO)",
        url: "https://www.cv.nrao.edu/~sransom/web/xxx.html",
        type: "textbook",
        subject: "radio astronomy",
        provider: "nrao",
        description: "NRAO's graduate radio astronomy course text, hosted free by the authors/observatory.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
        year: 2016,
        authors: ["James Condon", "Scott Ransom"],
      }),
      src({
        title: "Green Bank Observatory: education resources",
        url: "https://greenbankobservatory.org/education/",
        type: "course",
        subject: "radio astronomy",
        provider: "greenbank",
        description: "Educational material from the 100 m Green Bank Telescope, a primary Breakthrough Listen instrument.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Breakthrough Listen: open data archive",
        url: "https://seti.berkeley.edu/listen/",
        type: "dataset",
        subject: "seti",
        provider: "breakthrough-listen",
        description: "Petabytes of public radio SETI data plus the blimpy/turboSETI software ecosystem.",
        license: "Open data (public archive)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "SETI Institute: technosignatures overview",
        url: "https://www.seti.org/our-work/expanding-search-technosignatures",
        type: "lecture_notes",
        subject: "seti",
        provider: "seti",
        description: "The institute's own framing of modern technosignature research directions.",
        license: "Free to read (authorized)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "SciPy signal processing documentation (scipy.signal, scipy.fft)",
        url: "https://docs.scipy.org/doc/scipy/reference/signal.html",
        type: "documentation",
        subject: "signal processing",
        provider: "scipy",
        description: "Official reference for the FFT and filtering tools used in real SETI pipelines.",
        license: "BSD (open)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "arXiv: astro-ph instrumentation & methods (SETI searches)",
        url: "https://arxiv.org/list/astro-ph.IM/recent",
        type: "paper",
        subject: "seti",
        provider: "arxiv",
        description: "Preprints of current SETI search papers, including Breakthrough Listen data releases.",
        license: "Open access (arXiv)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Essential Radio Astronomy",
        author: "James J. Condon & Scott M. Ransom",
        edition: "1st",
        year: 2016,
        subject: "radio astronomy",
        difficulty: "graduate",
        prereqLevel: "University Physics II + Fourier basics",
        url: "https://www.cv.nrao.edu/~sransom/web/xxx.html",
        license: "Free to read (authorized); print edition Princeton UP",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["1. Fundamentals", "2. Antennas", "3. Radiometers", "6. Pulsars (time-domain methods)"],
        rationale: "The NRAO course text, legally free online — the single best bridge from undergraduate physics to professional radio astronomy.",
        role: "primary",
      },
    ],
    contradictions: [
      {
        topic: "How wide a drift-rate window should a SETI search cover?",
        description:
          "Classic narrowband searches scanned roughly ±10 Hz/s, sized to Earth-like planetary rotation, while later analyses (e.g. Sheikh et al. 2019) argue physically plausible transmitters — fast rotators, close-in orbits — justify windows up to hundreds of Hz/s at 1.4 GHz.",
        resolution:
          "A modeling disagreement about assumptions, not data: wider windows cost compute and sensitivity but cover more scenarios. Modern pipelines choose per-survey; when reading a search paper, always check its drift window before interpreting 'no detections.'",
        sourceATitle: "Classic narrowband SETI survey conventions",
        sourceBTitle: "Breakthrough Listen drift-rate analyses (arXiv)",
      },
    ],
    lessons: [
      {
        title: "The Fourier transform: from voltages to spectra",
        objectives: ["Explain what an FFT reveals", "Apply Nyquist and resolution rules", "Read waterfall plots"],
        prereqConcepts: ["trigonometry", "complex numbers"],
        conceptSummary:
          "Any signal decomposes into sinusoids; the FFT finds them. Sampling at f_s captures frequencies to f_s/2 (Nyquist); observing for T seconds resolves 1/T Hz. Stack FFTs over time and you get the waterfall plot — SETI's iconic data product, where narrowband signals are lines and drift shows as slope.",
        formalSummary:
          "X(f) = ∫x(t)e^(−2πift)dt; discretely, the FFT computes N bins in O(N log N). Nyquist: f_max = f_s/2; resolution Δf = 1/T. Power spectrum |X(f)|² distributes total variance across frequency (Parseval).",
        commonMistakes: ["Expecting resolution better than 1/T", "Ignoring aliasing above Nyquist", "Confusing bin index with physical frequency"],
        setiApplication:
          "Breakthrough Listen channelizes gigahertz of bandwidth into billions of ~1 Hz channels via cascaded FFTs — turning receiver voltages into the spectra where a technosignature would appear as a single bright bin.",
        masteryCriteria: ["Size an FFT for a target Δf", "Identify aliased components in examples", "Interpret three waterfall morphologies"],
        generatorKeys: ["nyquist-calc", "fft-resolution"],
      },
      {
        title: "SNR, integration, and the drift-rate search",
        objectives: ["Compute and interpret SNR", "Use √t integration gains", "Apply on/off and zero-drift RFI logic"],
        prereqConcepts: ["Fourier analysis", "probability"],
        conceptSummary:
          "Detection is a statistics problem: a real signal must stand above Gaussian receiver noise. Integrating longer buys SNR like √t. Genuine sky signals drift in frequency (Doppler, from Earth's rotation) and appear only when the beam points at them; zero-drift or always-present signals are local interference.",
        formalSummary:
          "SNR = P_signal/σ_noise; for steady signals SNR ∝ √(t·Δf_channel⁻¹)… integrated over matched channels. De-doppler searches shift-and-sum spectra over trial drift rates df/dt, maximizing recovered SNR at the true rate. Thresholds (e.g. SNR > 10) balance sensitivity against the look-elsewhere effect across ~10⁹ channels.",
        commonMistakes: ["Doubling time and expecting doubled SNR (it's √2)", "Treating a 5σ spike among billions of channels as automatically significant", "Skipping re-observation before claiming a candidate"],
        setiApplication:
          "This lesson is the SETI pipeline: turboSETI's algorithm is exactly shift-sum-threshold, followed by on/off cadence filtering — the workflow of your seeded research project.",
        masteryCriteria: ["Compute integration time needed for a target SNR", "Classify candidate signals from cadence descriptions"],
        generatorKeys: ["snr-integrate", "drift-rate"],
      },
    ],
  },
  {
    key: "python-scicomp",
    match: ["cse 110", "python fundamentals", "cse 210", "scientific python", "numpy", "dat 310", "data analysis", "mat 420", "numerical methods", "ast 440", "computational"],
    keywords: ["python", "numpy", "scipy", "programming", "data", "computation"],
    objectives: [
      "Write clean Python: functions, control flow, data structures",
      "Compute with NumPy arrays and vectorization",
      "Load, clean, and plot scientific data",
      "Use SciPy for FFTs, fitting, and statistics",
    ],
    prereqConcepts: ["algebra", "basic logic"],
    sources: [
      src({
        title: "The Python Tutorial (docs.python.org)",
        url: "https://docs.python.org/3/tutorial/",
        type: "documentation",
        subject: "python",
        provider: "python",
        description: "The language's official tutorial — canonical and always current.",
        license: "PSF license (open)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "NumPy user guide",
        url: "https://numpy.org/doc/stable/user/",
        type: "documentation",
        subject: "numpy",
        provider: "numpy",
        description: "Official array-computing guide: broadcasting, indexing, vectorization.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "SciPy user guide",
        url: "https://docs.scipy.org/doc/scipy/tutorial/",
        type: "documentation",
        subject: "scipy",
        provider: "scipy",
        description: "Official tutorials for optimization, FFT, statistics, and signal processing.",
        license: "BSD (open)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Astropy documentation",
        url: "https://docs.astropy.org/en/stable/",
        type: "documentation",
        subject: "astronomy software",
        provider: "astropy",
        description: "The core astronomy Python library: FITS I/O, units, coordinates, time.",
        license: "BSD (open)",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Think Python 2e (Downey)",
        url: "https://greenteapress.com/wp/think-python-2e/",
        type: "textbook",
        subject: "python",
        provider: "greenteapress",
        description: "Complete open programming textbook for beginners.",
        license: "CC BY-NC 3.0",
        accessStatus: "open_full_text",
        year: 2015,
        authors: ["Allen B. Downey"],
      }),
      src({
        title: "scikit-learn user guide",
        url: "https://scikit-learn.org/stable/user_guide.html",
        type: "documentation",
        subject: "machine learning",
        provider: "scikit-learn",
        description: "Official guide to classical machine learning in Python.",
        license: "BSD (open)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Think Python",
        author: "Allen B. Downey",
        edition: "2nd",
        year: 2015,
        subject: "python",
        difficulty: "intro",
        prereqLevel: "none",
        url: "https://greenteapress.com/wp/think-python-2e/",
        license: "CC BY-NC 3.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["1-8. Core language", "10-12. Lists, dicts, tuples", "14. Files"],
        rationale: "Free, complete, and pitched exactly at a first programming course.",
        role: "primary",
      },
      {
        title: "Python Data Science Handbook",
        author: "Jake VanderPlas",
        edition: "2nd",
        year: 2023,
        subject: "scientific python",
        difficulty: "undergraduate",
        prereqLevel: "basic Python",
        url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
        license: "CC BY-NC-ND (text open online)",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["2. NumPy", "3. pandas", "4. Matplotlib", "5. Machine Learning"],
        rationale: "Written by an astronomer; the standard bridge from Python basics to scientific computing, free to read online.",
        role: "primary",
      },
    ],
    contradictions: [],
    lessons: [
      {
        title: "NumPy arrays and vectorized thinking",
        objectives: ["Create and index arrays", "Vectorize computations", "Use boolean masks for data cleaning"],
        prereqConcepts: ["Python basics"],
        conceptSummary:
          "NumPy replaces Python loops with whole-array operations executed in compiled code — 10-100× faster and closer to the math. Indexing, broadcasting, and boolean masking are the three skills; masking alone (keep samples within 5σ) is a working RFI filter.",
        formalSummary:
          "Arrays are homogeneous n-dimensional blocks; operations apply elementwise with broadcasting rules aligning shapes from the right. Reductions (mean, std, max) collapse axes; axis=0 collapses rows. Boolean arrays index by condition: x[np.abs(x) < 5*x.std()].",
        commonMistakes: ["Writing Python loops where one array expression suffices", "Misreading axis semantics", "Comparing floats with == instead of np.isclose"],
        setiApplication:
          "blimpy loads filterbank data straight into NumPy arrays; every stage of a drift search — normalization, shifting, summing, thresholding — is the vectorized operations in this lesson.",
        masteryCriteria: ["Rewrite three loop programs as array expressions", "Build a σ-cut mask on synthetic noisy data"],
        generatorKeys: ["numpy-shape", "snr-integrate"],
      },
    ],
  },
  {
    key: "quantum-computing",
    match: ["qc 301", "qc 310", "qc 410", "qc 420", "quantum computing", "quantum algorithms", "quantum information"],
    keywords: ["qubit", "quantum computing", "gate", "entanglement", "qiskit", "algorithm"],
    objectives: [
      "Represent qubit states and apply gates as unitary matrices",
      "Build and simulate small quantum circuits",
      "Explain superposition, entanglement, and measurement precisely",
      "Describe Grover's and Shor's algorithms at block level",
    ],
    prereqConcepts: ["linear algebra", "complex numbers", "probability"],
    sources: [
      src({
        title: "IBM Quantum / Qiskit documentation & courses",
        url: "https://docs.quantum.ibm.com/",
        type: "documentation",
        subject: "quantum computing",
        provider: "qiskit",
        description: "Official Qiskit docs plus full open courses (Basics of quantum information).",
        license: "Apache 2.0 / open courseware",
        accessStatus: "open_full_text",
      }),
      src({
        title: "Cirq documentation (Google Quantum AI)",
        url: "https://quantumai.google/cirq",
        type: "documentation",
        subject: "quantum computing",
        provider: "cirq",
        description: "Official Cirq framework docs with circuit tutorials.",
        license: "Apache 2.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "PennyLane codebook and documentation",
        url: "https://pennylane.ai/qml/",
        type: "documentation",
        subject: "quantum computing",
        provider: "pennylane",
        description: "Open quantum machine learning tutorials and interactive codebook.",
        license: "Apache 2.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "MIT OCW 8.370/18.435 Quantum Computation",
        url: "https://ocw.mit.edu/courses/18-435j-quantum-computation-fall-2003/",
        type: "course",
        subject: "quantum computing",
        provider: "mit-ocw",
        description: "Full MIT quantum computation course notes and problem sets.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Quantum Computation and Quantum Information",
        author: "Michael A. Nielsen & Isaac L. Chuang",
        edition: "10th Anniversary",
        year: 2010,
        subject: "quantum computing",
        difficulty: "graduate",
        prereqLevel: "linear algebra + quantum mechanics",
        url: "https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/",
        license: "Commercial (all rights reserved)",
        accessStatus: "commercial",
        openFullText: false,
        relevantChapters: ["1-2. Foundations", "4. Circuits", "5-6. Algorithms", "10. Error correction"],
        rationale: "'Mike & Ike' — the field's standard reference. Commercial: metadata + library path; Qiskit's open courses cover the undergraduate slice.",
        role: "supplemental",
      },
    ],
    contradictions: [],
    lessons: [
      {
        title: "Qubits, gates, and your first circuits",
        objectives: ["Write qubit states as vectors", "Apply H, X, Z, CNOT as matrices", "Predict measurement statistics"],
        prereqConcepts: ["linear algebra", "complex numbers"],
        conceptSummary:
          "A qubit is a unit vector in ℂ²; gates are unitary matrices; measurement samples outcomes with probability |amplitude|². Hadamard creates superposition, CNOT creates entanglement, and every quantum algorithm is choreography of these rotations followed by one measurement.",
        formalSummary:
          "|ψ⟩ = α|0⟩ + β|1⟩, |α|²+|β|² = 1. H = (1/√2)[[1,1],[1,−1]]; CNOT flips target iff control is |1⟩. n qubits inhabit ℂ^(2ⁿ); H⊗CNOT on |00⟩ yields the Bell state (|00⟩+|11⟩)/√2.",
        commonMistakes: ["Adding probabilities instead of amplitudes before measurement", "Treating entangled qubits as having individual states", "Forgetting normalization"],
        setiApplication:
          "Quantum-limited amplifiers — engineered with the same formalism — already set the noise floor of radio astronomy receivers; understanding computation's physical limits also sharpens hypotheses about detectable alien technology.",
        masteryCriteria: ["Hand-simulate 2-qubit circuits", "Compute outcome probabilities for 5 prepared states"],
        generatorKeys: ["qubit-prob", "matrix-det"],
      },
    ],
  },
  {
    key: "prob-stats",
    match: ["stp 420", "probability", "statistics", "mat 243", "discrete"],
    keywords: ["probability", "statistics", "distribution", "hypothesis", "inference"],
    objectives: [
      "Compute probabilities with counting, independence, and conditioning",
      "Work with common distributions (binomial, normal, Poisson)",
      "Estimate parameters and quantify uncertainty",
      "Run and interpret hypothesis tests",
    ],
    prereqConcepts: ["algebra", "summation notation"],
    sources: [
      src({
        title: "OpenStax Introductory Statistics 2e",
        url: "https://openstax.org/details/books/introductory-statistics-2e",
        type: "textbook",
        subject: "statistics",
        provider: "openstax",
        description: "Open statistics text with datasets and technology guides.",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        year: 2023,
      }),
      src({
        title: "MIT OCW 18.05 Introduction to Probability and Statistics",
        url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/",
        type: "course",
        subject: "probability",
        provider: "mit-ocw",
        description: "Complete course with class slides, problem sets, and exams.",
        license: "CC BY-NC-SA 4.0",
        accessStatus: "open_full_text",
      }),
      src({
        title: "SciPy stats documentation",
        url: "https://docs.scipy.org/doc/scipy/reference/stats.html",
        type: "documentation",
        subject: "statistics",
        provider: "scipy",
        description: "Official reference for distributions and statistical tests in Python.",
        license: "BSD (open)",
        accessStatus: "open_full_text",
      }),
    ],
    books: [
      {
        title: "Introductory Statistics 2e",
        author: "OpenStax",
        edition: "2nd",
        year: 2023,
        subject: "statistics",
        difficulty: "intro",
        prereqLevel: "college algebra",
        url: "https://openstax.org/details/books/introductory-statistics-2e",
        license: "CC BY 4.0",
        accessStatus: "open_full_text",
        openFullText: true,
        relevantChapters: ["3-5. Probability and distributions", "8. Confidence intervals", "9-10. Hypothesis testing"],
        rationale: "Open, recent, and aligned with a first statistics course.",
        role: "primary",
      },
    ],
    contradictions: [
      {
        topic: "What does a p-value mean?",
        description:
          "Intro texts sometimes describe p < 0.05 as 'the probability the result is due to chance,' while statistical authorities (e.g. the ASA statement) stress a p-value is P(data at least this extreme | H₀), not the probability H₀ is true.",
        resolution:
          "The precise definition matters: a p-value conditions on the null being true. SETI's 5σ-plus-reobservation culture exists exactly because misread p-values plus billions of trials manufacture false discoveries.",
        sourceATitle: "Informal intro-stats phrasing",
        sourceBTitle: "American Statistical Association p-value statement",
      },
    ],
    lessons: [
      {
        title: "Probability, distributions, and the meaning of σ",
        objectives: ["Compute event probabilities", "Use the normal distribution and z-scores", "Interpret detection thresholds"],
        prereqConcepts: ["algebra"],
        conceptSummary:
          "Probability quantifies uncertainty; distributions describe how outcomes spread. The normal curve rules instrument noise (central limit theorem), so 'how many σ' is science's universal significance currency — and with billions of trials, even 5σ events happen somewhere by chance.",
        formalSummary:
          "For independent A, B: P(A∩B) = P(A)P(B). Normal: ~68/95/99.7% within 1/2/3σ; z = (x−μ)/σ. Binomial(n,p) counts successes; Poisson(λ) models rare-event counts like photon arrivals.",
        commonMistakes: ["Multiplying probabilities of dependent events", "Reading p-values as P(H₀ true)", "Ignoring multiple-trial (look-elsewhere) corrections"],
        setiApplication:
          "A candidate technosignature must clear a high z-threshold and re-observation because a billion-channel search guarantees rare noise spikes — statistics is SETI's first line of defense against false hope.",
        masteryCriteria: ["Compute z-scores and tail probabilities", "Explain the look-elsewhere effect with a worked example"],
        generatorKeys: ["zscore-calc", "prob-independent"],
      },
    ],
  },
];

/** Generic fallback profile when no specific subject matches. */
export const GENERIC_PROFILE: SubjectProfile = {
  key: "generic",
  match: [],
  keywords: ["science", "mathematics", "university"],
  objectives: ["Master the core concepts and vocabulary of the course", "Solve standard problems accurately", "Connect the material to the astrophysics pathway"],
  prereqConcepts: ["algebra", "study skills"],
  sources: [
    src({
      title: "MIT OpenCourseWare course catalog",
      url: "https://ocw.mit.edu/",
      type: "course",
      subject: "general",
      provider: "mit-ocw",
      description: "Search MIT's full open course catalog for this subject.",
      license: "CC BY-NC-SA 4.0",
      accessStatus: "open_full_text",
    }),
    src({
      title: "OpenStax textbook catalog",
      url: "https://openstax.org/subjects",
      type: "textbook",
      subject: "general",
      provider: "openstax",
      description: "Browse peer-reviewed open textbooks by subject.",
      license: "CC BY 4.0",
      accessStatus: "open_full_text",
    }),
    src({
      title: "LibreTexts libraries",
      url: "https://libretexts.org/",
      type: "textbook",
      subject: "general",
      provider: "libretexts",
      description: "Open textbook libraries across the sciences.",
      license: "CC BY-NC-SA 4.0",
      accessStatus: "open_full_text",
    }),
  ],
  books: [],
  contradictions: [],
  lessons: [
    {
      title: "Course orientation and study plan",
      objectives: ["Map the course's main topics", "Identify prerequisite gaps", "Set a weekly study cadence"],
      prereqConcepts: [],
      conceptSummary:
        "Before content, build the map: read the course description, list its units, and mark which prerequisites each unit leans on. Study the gaps first — prerequisite debt, not difficulty, sinks most courses.",
      formalSummary:
        "Backward design: outcomes → assessments → practice → content. Distribute practice across weeks (spacing effect) and self-test rather than reread (testing effect) — the two most replicated results in learning science.",
      commonMistakes: ["Rereading instead of retrieval practice", "Cramming instead of spacing", "Skipping prerequisite review because it 'looks familiar'"],
      setiApplication:
        "Research careers are built on compounding fundamentals: the same spaced, tested mastery that passes this course is what makes a future SETI data analyst reliable under real data.",
      masteryCriteria: ["Produce a one-page topic map", "Schedule the first two study weeks"],
      generatorKeys: ["algebra-linear"],
    },
  ],
};

export function findProfile(courseCode: string, courseTitle: string): SubjectProfile {
  const hay = `${courseCode} ${courseTitle}`.toLowerCase();
  for (const p of SUBJECT_PROFILES) {
    if (p.match.some((m) => hay.includes(m))) return p;
  }
  return GENERIC_PROFILE;
}
