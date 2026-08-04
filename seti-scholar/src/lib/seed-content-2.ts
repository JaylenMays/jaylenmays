import type { SeedModule } from "./seed-content-types";

/** Modern physics, astronomy, programming, research and quantum modules. */
export const MODULES_2: SeedModule[] = [
  {
    key: "modern-physics-prep",
    title: "Modern Physics Preparation",
    description: "Special relativity and the quantum revolution — the conceptual leap beyond Newton.",
    category: "PHYSICS",
    sortOrder: 11,
    lessons: [
      {
        slug: "relativity-quanta",
        title: "Relativity & the Quantum Idea",
        minutes: 30,
        objectives: [
          "State the postulates of special relativity",
          "Compute photon energy with E = hf",
          "Explain why light is both wave and particle",
        ],
        content: `# Relativity & the Quantum Idea

## Special relativity in two postulates
1. Physics looks the same in every inertial (non-accelerating) frame.
2. Light travels at c ≈ 3×10⁸ m/s for *every* observer.

Consequences: moving clocks tick slower (time dilation, γ = 1/sqrt(1 - v²/c²)), moving rulers shorten, and no signal outruns light. This is why interstellar communication is slow by construction — a reply from a star 100 light-years away takes at least 200 years. SETI is a patience game written into spacetime itself.

Also: E = mc² — mass is a form of energy. Stars shine by converting ~0.7% of hydrogen's mass to light in fusion.

## The quantum idea
Light arrives in packets — **photons** — each carrying energy \`E = hf\` (h = 6.626×10⁻³⁴ J·s). Blue photons are more energetic than red; radio photons are billions of times less energetic than optical ones, which is why radio telescopes must be so large and sensitive.

The photoelectric effect (Einstein, Nobel Prize): light below a threshold *frequency* ejects no electrons no matter how bright — intensity is many photons, but each photon must individually pay the exit fee.

## Wave–particle duality
Electrons diffract like waves (wavelength λ = h/p, de Broglie), photons hit like particles. Neither picture alone is right; quantum mechanics (next module) is the framework that holds both.

## Atomic spectra: fingerprints in light
Electrons in atoms occupy discrete energy levels; jumps emit or absorb photons at exact frequencies. That's why each element has a spectral fingerprint — the tool that lets astronomers read the composition of a star they will never touch, and the physics behind the 21 cm hydrogen line central to radio astronomy.`,
      },
    ],
    questions: [
      {
        prompt: "A photon's energy is given by:",
        choices: ["E = hf", "E = mc", "E = ½mv²", "E = qV"],
        correctIndex: 0,
        explanation: "Planck–Einstein relation: energy equals Planck's constant times frequency.",
        difficulty: 1,
        topic: "quantum basics",
      },
      {
        prompt: "Compared with an optical photon (~5×10¹⁴ Hz), a 1420 MHz radio photon carries:",
        choices: ["Far less energy (about a million times less)", "Far more energy", "The same energy", "No energy"],
        correctIndex: 0,
        explanation: "E = hf and the radio frequency is ~3.5×10⁵ times lower — radio photons are extremely low-energy.",
        difficulty: 2,
        topic: "photons",
      },
      {
        prompt: "One postulate of special relativity is that:",
        choices: [
          "The speed of light is the same for all inertial observers",
          "Time is absolute for all observers",
          "Mass never changes form",
          "Light needs a medium to travel",
        ],
        correctIndex: 0,
        explanation: "The invariance of c for all inertial observers is Einstein's second postulate.",
        difficulty: 1,
        topic: "relativity",
      },
      {
        prompt: "Why does each chemical element produce a unique spectral-line pattern?",
        choices: [
          "Its electrons occupy discrete energy levels, so photon jumps have exact energies",
          "Its nucleus vibrates randomly",
          "Atoms reflect light of one color only",
          "Temperature fixes the line positions",
        ],
        correctIndex: 0,
        explanation: "Quantized energy levels make transitions element-specific — spectroscopy's foundation.",
        difficulty: 2,
        topic: "spectra",
      },
    ],
  },
  {
    key: "quantum-prep",
    title: "Quantum Mechanics Preparation",
    description: "Complex numbers, bra-ket notation, operators, and probability — the mathematical toolkit QM assumes.",
    category: "PHYSICS",
    sortOrder: 12,
    lessons: [
      {
        slug: "complex-numbers-qm",
        title: "Complex Numbers for Quantum Mechanics",
        minutes: 30,
        objectives: [
          "Compute with complex numbers in rectangular and polar form",
          "Use Euler's formula",
          "Explain why QM needs complex amplitudes",
        ],
        content: `# Complex Numbers for Quantum Mechanics

## The basics
i² = -1. A complex number z = a + bi has real part a, imaginary part b, modulus |z| = sqrt(a² + b²), and complex conjugate z* = a - bi. Handy identity: **z·z\\* = |z|²** — always real, never negative.

## Euler's formula (the most useful equation you'll ever meet)
\`e^{iθ} = cos θ + i sin θ\`

A complex number is a little arrow in the plane: |z| is its length, θ its angle. Multiplying complex numbers multiplies lengths and *adds angles* — rotation becomes multiplication. This is why complex exponentials describe anything that oscillates: a wave is just \`A e^{i(kx - ωt)}\`.

Signal processing runs on this too: the Fourier transform decomposes a radio time series into complex exponentials. The FFT of telescope data — the first step of every SETI pipeline — is complex arithmetic at billions of samples per second.

## Why QM is complex-valued
A quantum state assigns each outcome a complex **amplitude** ψ. Probabilities come from the Born rule: \`P = |ψ|²\`. Amplitudes (unlike probabilities) can *cancel* — interference — because complex numbers have direction. The double-slit pattern is amplitudes adding with different phases.

## Bra-ket notation preview
Dirac notation writes states as kets |ψ⟩ (column vectors) and their conjugates as bras ⟨ψ| (row vectors). The inner product ⟨φ|ψ⟩ is a complex number measuring overlap; ⟨ψ|ψ⟩ = 1 says probabilities sum to one. If you know linear algebra's dot product, you already know 80% of this notation.`,
      },
      {
        slug: "operators-measurement",
        title: "States, Operators & Measurement",
        minutes: 30,
        objectives: [
          "Represent quantum states as vectors",
          "Understand operators and eigenvalues as observables",
          "Apply the Born rule to superpositions",
        ],
        content: `# States, Operators & Measurement

## States are vectors
A qubit's general state: \`|ψ⟩ = α|0⟩ + β|1⟩\` with |α|² + |β|² = 1. The state is a *superposition* — not "secretly 0 or 1," but a genuinely new kind of thing that yields 0 with probability |α|² and 1 with probability |β|² upon measurement.

## Observables are operators
Every measurable quantity (energy, momentum, spin) corresponds to a Hermitian operator — a matrix acting on state vectors. The possible measurement outcomes are the operator's **eigenvalues**; after measuring, the state collapses to the matching **eigenvector**. Linear algebra isn't a tool for QM; it *is* QM.

The Schrödinger equation \`H|ψ⟩ = E|ψ⟩\` (time-independent form) is an eigenvalue problem: the Hamiltonian H (energy operator) has eigenvalues E — the allowed energy levels producing atomic spectra.

## Expectation values
Repeat an experiment many times; the average outcome is \`⟨A⟩ = ⟨ψ|A|ψ⟩\`. Individual results are random; the statistics are exactly predicted. Quantum mechanics is the most precisely tested theory in science *because of* this statistical structure, not despite it.

## Uncertainty
Position and momentum operators don't commute: xp ≠ px. Consequence: Δx·Δp ≥ ℏ/2 — no state has both sharply defined. This isn't measurement clumsiness; it's the geometry of the state space.

## Looking ahead
These same structures — state vectors, unitary evolution, measurement collapse — are the substrate of quantum computing in your secondary track. A quantum algorithm is choreography of rotations in a 2ⁿ-dimensional complex vector space.`,
      },
    ],
    questions: [
      {
        prompt: "For z = 3 + 4i, |z|² equals:",
        choices: ["25", "5", "7", "12"],
        correctIndex: 0,
        explanation: "z·z* = 9 + 16 = 25 (modulus 5, squared).",
        difficulty: 1,
        topic: "complex numbers",
      },
      {
        prompt: "Euler's formula states e^{iθ} =",
        choices: ["cos θ + i sin θ", "sin θ + i cos θ", "cos θ - sin θ", "i(cos θ + sin θ)"],
        correctIndex: 0,
        explanation: "e^{iθ} = cos θ + i sin θ — the bridge between exponentials and oscillation.",
        difficulty: 1,
        topic: "Euler's formula",
      },
      {
        prompt: "A qubit in state |ψ⟩ = (0.6)|0⟩ + (0.8)|1⟩ is measured. P(1) is:",
        choices: ["0.64", "0.8", "0.36", "0.5"],
        correctIndex: 0,
        explanation: "Born rule: P = |amplitude|² = 0.8² = 0.64.",
        difficulty: 2,
        topic: "Born rule",
      },
      {
        prompt: "In quantum mechanics, the possible outcomes of measuring an observable are the operator's:",
        choices: ["Eigenvalues", "Determinants", "Traces", "Row sums"],
        correctIndex: 0,
        explanation: "Measurement outcomes are eigenvalues; the state collapses onto the corresponding eigenvector.",
        difficulty: 2,
        topic: "operators",
      },
      {
        prompt: "⟨ψ|ψ⟩ = 1 expresses:",
        choices: ["Normalization — total probability is 1", "Energy conservation", "The uncertainty principle", "Wave-particle duality"],
        correctIndex: 0,
        explanation: "The inner product of a state with itself is total probability, which must equal 1.",
        difficulty: 1,
        topic: "bra-ket notation",
      },
    ],
  },
  {
    key: "astronomy-prep",
    title: "Astronomy Foundations",
    description: "Scientific notation, light and spectra, gravity and orbits, and how telescopes actually work.",
    category: "ASTRONOMY",
    sortOrder: 13,
    lessons: [
      {
        slug: "scales-light-spectra",
        title: "Cosmic Scales, Light & Spectra",
        minutes: 30,
        objectives: [
          "Handle scientific notation and astronomical units fluently",
          "Relate wavelength, frequency and photon energy",
          "Read the three spectrum types and Doppler shifts",
        ],
        content: `# Cosmic Scales, Light & Spectra

## Scientific notation is survival gear
Distances: Earth–Sun = 1 AU ≈ 1.5×10¹¹ m. Light-year ≈ 9.46×10¹⁵ m. Parsec ≈ 3.26 ly. The nearest star system is ~4×10¹⁶ m away — write that without exponents and you'll never do astronomy again.

Multiply → add exponents: (2×10⁵)(3×10⁸) = 6×10¹³.

## Light: the only messenger (mostly)
Nearly everything we know about the universe arrives as electromagnetic radiation. c = fλ links wavelength and frequency; E = hf gives photon energy. The atmosphere is transparent in two main "windows": visible light and radio — which is why radio astronomy can run day and night from the ground, and why SETI's workhorse instruments are radio dishes.

## Three spectrum types (Kirchhoff's laws)
1. **Continuous** — hot dense object (star interior): rainbow with no gaps.
2. **Emission lines** — thin hot gas: bright lines at element-specific frequencies.
3. **Absorption lines** — continuous source seen through cooler gas: dark lines. Stellar spectra are this type; the lines reveal composition, temperature, and motion.

## The Doppler effect: velocity written in light
Motion along the line of sight shifts spectral lines: receding → redshift, approaching → blueshift. \`Δλ/λ ≈ v/c\` for v << c.

Doppler shifts discovered most known exoplanets (stellar wobble), measure the universe's expansion, and matter enormously for SETI: a transmitter on a rotating, orbiting planet drifts in frequency at a predictable rate (~Hz/s scale). A signal with *zero* drift is suspicious — it's probably local interference sitting still relative to your telescope.`,
      },
      {
        slug: "gravity-orbits-telescopes",
        title: "Gravity, Orbits & Telescopes",
        minutes: 30,
        objectives: [
          "Apply Newtonian gravity and orbital reasoning",
          "Use Kepler's laws qualitatively and quantitatively",
          "Compare telescope types and explain resolution and light-gathering",
        ],
        content: `# Gravity, Orbits & Telescopes

## Universal gravitation
\`F = G m₁m₂ / r²\` (G = 6.674×10⁻¹¹ N·m²/kg²). The same law drops apples and holds galaxies together.

An orbit is perpetual falling: the Moon accelerates toward Earth continuously but moves sideways fast enough to keep missing. Circular orbital speed: \`v = sqrt(GM/r)\`.

## Kepler's laws
1. Orbits are ellipses with the central body at one focus.
2. Equal areas in equal times (angular momentum conservation — bodies move fastest at closest approach).
3. \`T² ∝ a³\` — period squared scales with semi-major axis cubed. Around the Sun with T in years and a in AU: T² = a³ exactly.

Kepler's third law is how we weigh everything: stars from their planets, galaxies from their rotation, the Milky Way's central black hole from stellar orbits.

## Telescopes: buckets for photons
Two jobs:
- **Light gathering** ∝ collecting area ∝ D². A 10 m dish collects 25× more than a 2 m dish.
- **Resolution**: smallest resolvable angle θ ≈ 1.22 λ/D. Longer wavelength → worse resolution → radio telescopes must be *huge* or work together as interferometers (linked dishes acting as one giant aperture — the technique behind the Very Large Array and the Event Horizon Telescope's black-hole image).

Refractors (lenses) vs. reflectors (mirrors): all large modern telescopes are reflectors — mirrors can be supported from behind and don't absorb light in glass. Radio dishes are reflectors too, just for 21 cm waves instead of 500 nm ones. The Allen Telescope Array — built specifically for SETI — is 42 small dishes doing exactly this.`,
      },
    ],
    questions: [
      {
        prompt: "(2×10⁵) × (3×10⁸) =",
        choices: ["6×10¹³", "6×10⁴⁰", "5×10¹³", "6×10³"],
        correctIndex: 0,
        explanation: "Multiply coefficients (6), add exponents (13).",
        difficulty: 1,
        topic: "scientific notation",
      },
      {
        prompt: "A spectral line normally at 500.0 nm appears at 500.5 nm. The source is:",
        choices: ["Receding at ~300 km/s", "Approaching at ~300 km/s", "At rest", "Receding at ~3 km/s"],
        correctIndex: 0,
        explanation: "Δλ/λ = 0.5/500 = 0.001 = v/c → v ≈ 300 km/s away (redshift).",
        difficulty: 2,
        topic: "Doppler effect",
      },
      {
        prompt: "By Kepler's third law, an asteroid at a = 4 AU orbits the Sun with period:",
        choices: ["8 years", "4 years", "16 years", "64 years"],
        correctIndex: 0,
        explanation: "T² = a³ = 64 → T = 8 years.",
        difficulty: 2,
        topic: "Kepler's laws",
      },
      {
        prompt: "Doubling a telescope's diameter multiplies its light-gathering power by:",
        choices: ["4", "2", "8", "16"],
        correctIndex: 0,
        explanation: "Area ∝ D², so 2× diameter → 4× area.",
        difficulty: 1,
        topic: "telescopes",
      },
      {
        prompt: "An absorption-line spectrum is produced when:",
        choices: [
          "Light from a hot continuous source passes through cooler gas",
          "A thin hot gas glows on its own",
          "A solid object melts",
          "A telescope mirror reflects sunlight",
        ],
        correctIndex: 0,
        explanation: "Cool gas absorbs element-specific frequencies from the continuum — the pattern seen in stellar spectra.",
        difficulty: 1,
        topic: "spectra",
      },
    ],
  },
  {
    key: "stellar-prep",
    title: "Stellar & Galactic Astrophysics Preparation",
    description: "How stars work, live and die, and the structure of galaxies — context for every advanced astro course.",
    category: "ASTRONOMY",
    sortOrder: 14,
    lessons: [
      {
        slug: "stars-hr-diagram",
        title: "Stellar Physics & the H-R Diagram",
        minutes: 30,
        objectives: [
          "Explain hydrostatic equilibrium and fusion",
          "Read the Hertzsprung-Russell diagram",
          "Trace stellar life cycles by mass",
        ],
        content: `# Stellar Physics & the H-R Diagram

## What a star is
A star is a battle: gravity pulls inward, pressure from fusion-heated gas pushes outward. **Hydrostatic equilibrium** is the truce, maintained for millions to trillions of years. Core fusion (4 H → He, releasing E = Δm·c²) supplies the pressure.

## The H-R diagram: astronomy's periodic table
Plot luminosity vs. surface temperature (hot on the *left*, by convention):
- **Main sequence** — the diagonal band where stars spend ~90% of life fusing hydrogen. Position set almost entirely by mass: massive = hot, luminous, short-lived.
- **Giants/supergiants** — upper right: evolved stars, swollen and cool but enormous.
- **White dwarfs** — lower left: hot, tiny stellar corpses.

## Mass decides everything
- ~0.1 M☉ red dwarfs: sip fuel for *trillions* of years — the most common stars and prime long-lived SETI targets.
- ~1 M☉ (Sun): ~10 billion years, then red giant → white dwarf.
- >8 M☉: millions of years, then supernova → neutron star or black hole; the explosion forges and scatters heavy elements. Your body and your radio telescope are recycled supernova debris.

## Why SETI cares about stellar physics
Habitable-zone location depends on stellar luminosity; planet-hosting statistics depend on stellar type; a civilization's maximum age is bounded by its star's stable lifetime. Target lists (like those for Breakthrough Listen) are built from exactly these considerations — stellar astrophysics is SETI's targeting computer.`,
      },
    ],
    questions: [
      {
        prompt: "A star remains stable for billions of years because:",
        choices: [
          "Inward gravity balances outward pressure from fusion heating",
          "It has no gravity",
          "Magnetic fields hold it rigid",
          "It constantly gains mass",
        ],
        correctIndex: 0,
        explanation: "Hydrostatic equilibrium: gravity vs. pressure, maintained by core fusion.",
        difficulty: 1,
        topic: "stellar structure",
      },
      {
        prompt: "On the main sequence, a more massive star is:",
        choices: ["More luminous and shorter-lived", "Dimmer and longer-lived", "Cooler and larger", "Identical to the Sun"],
        correctIndex: 0,
        explanation: "Mass sets luminosity steeply (L ~ M³·⁵), so massive stars burn bright and die fast.",
        difficulty: 1,
        topic: "H-R diagram",
      },
      {
        prompt: "Red dwarfs interest SETI target selection because they:",
        choices: [
          "Remain stable for trillions of years, allowing civilizations enormous time to arise",
          "Are the hottest stars",
          "Always host exactly one planet",
          "Emit mostly radio waves",
        ],
        correctIndex: 0,
        explanation: "Their extreme longevity (and abundance) makes them statistically attractive search targets.",
        difficulty: 2,
        topic: "SETI target selection",
      },
      {
        prompt: "Elements heavier than iron in your body were primarily forged in:",
        choices: ["Supernova explosions and neutron-star mergers", "Earth's core", "The Sun today", "The Big Bang directly"],
        correctIndex: 0,
        explanation: "Explosive nucleosynthesis creates and disperses heavy elements into later generations of stars and planets.",
        difficulty: 2,
        topic: "nucleosynthesis",
      },
    ],
  },
  {
    key: "python-prep",
    title: "Python Fundamentals",
    description: "Core Python for scientists: variables, control flow, functions, and data structures.",
    category: "PROGRAMMING",
    sortOrder: 15,
    lessons: [
      {
        slug: "python-basics",
        title: "Python Essentials for Scientists",
        minutes: 35,
        objectives: [
          "Use variables, types, lists and dicts",
          "Write loops, conditionals and functions",
          "Read tracebacks without panic",
        ],
        content: `# Python Essentials for Scientists

Python is the working language of modern astronomy — from telescope control to the Breakthrough Listen analysis stack.

## Variables & types
\`\`\`python
n_channels = 1_048_576        # int
freq_mhz   = 1420.405751      # float
target     = "Proxima Centauri"  # str
detected   = False            # bool
\`\`\`

## Collections
\`\`\`python
freqs = [1420.1, 1420.2, 1420.3]      # list: ordered, mutable
star  = {"name": "Proxima", "dist_ly": 4.24}  # dict: key → value
freqs[0]        # 1420.1  (indexing starts at 0)
freqs[-1]       # last element
star["name"]    # "Proxima"
\`\`\`

## Control flow
\`\`\`python
for f in freqs:
    if f > 1420.15:
        print(f, "above the line")
\`\`\`
Indentation is syntax — consistent 4 spaces.

## Functions
\`\`\`python
def snr(signal, noise):
    """Signal-to-noise ratio."""
    return signal / noise

print(snr(50.0, 2.5))   # 20.0
\`\`\`
Write small functions with docstrings; future-you is your most important collaborator.

## Reading errors
A traceback reads bottom-up: the last line names the error (\`ZeroDivisionError\`, \`IndexError\`, \`TypeError\`), lines above show where. Errors are information, not judgment.

## Practice habits
Use the Coding Lab challenges in this app — typing code yourself is the only way this sticks.`,
      },
    ],
    questions: [
      {
        prompt: "What does freqs[-1] return for freqs = [1420.1, 1420.2, 1420.3]?",
        choices: ["1420.3", "1420.1", "An IndexError", "-1420.1"],
        correctIndex: 0,
        explanation: "Negative indices count from the end; -1 is the last element.",
        difficulty: 1,
        topic: "python lists",
      },
      {
        prompt: "Which is valid Python for defining a function?",
        choices: ["def snr(s, n): return s / n", "function snr(s, n) { return s/n }", "snr := (s, n) -> s/n", "define snr(s, n) = s/n"],
        correctIndex: 0,
        explanation: "Python uses def, a colon, and indentation (or a same-line body).",
        difficulty: 1,
        topic: "python functions",
      },
      {
        prompt: "star = {\"name\": \"Proxima\", \"dist_ly\": 4.24}. How do you get the distance?",
        choices: ["star[\"dist_ly\"]", "star.dist_ly", "star(1)", "star[1]"],
        correctIndex: 0,
        explanation: "Dictionaries are accessed by key with square brackets.",
        difficulty: 1,
        topic: "python dicts",
      },
      {
        prompt: "What does this print?  \nfor i in range(3): print(i)",
        choices: ["0 1 2", "1 2 3", "0 1 2 3", "3"],
        correctIndex: 0,
        explanation: "range(3) yields 0, 1, 2 — the stop value is excluded.",
        difficulty: 1,
        topic: "python loops",
      },
    ],
  },
  {
    key: "scientific-python-prep",
    title: "Scientific Python: NumPy & SciPy",
    description: "Array computing, vectorization, and the scientific stack used in real astronomy pipelines.",
    category: "PROGRAMMING",
    sortOrder: 16,
    lessons: [
      {
        slug: "numpy-arrays",
        title: "NumPy Arrays & Vectorization",
        minutes: 35,
        objectives: [
          "Create and manipulate NumPy arrays",
          "Vectorize computations instead of looping",
          "Use boolean masks for data filtering",
        ],
        content: `# NumPy Arrays & Vectorization

NumPy is the foundation of scientific Python: fast N-dimensional arrays with math applied elementwise in compiled code.

## Creating arrays
\`\`\`python
import numpy as np
t = np.linspace(0, 1, 1000)         # 1000 evenly spaced samples
noise = np.random.normal(0, 1, 1000)  # Gaussian noise
spectrum = np.zeros((16, 1024))     # 2D: 16 time steps × 1024 channels
\`\`\`

## Vectorization: the core idea
\`\`\`python
signal = np.sin(2 * np.pi * 50 * t)   # whole waveform, no loop
power  = signal**2                     # elementwise square
\`\`\`
One line replaces a for-loop and runs ~100× faster. Real pipelines process billions of samples; vectorization is the difference between minutes and days.

## Reductions & statistics
\`\`\`python
power.mean(), power.std(), power.max()
spectrum.mean(axis=0)   # average over time → 1024-channel mean spectrum
\`\`\`
The axis argument says *which dimension to collapse* — axis=0 collapses rows (time), axis=1 collapses columns (channels). Master this and 2D data holds no fear.

## Boolean masking: RFI excision in one line
\`\`\`python
clean = data[np.abs(data - data.mean()) < 5 * data.std()]
\`\`\`
That's a genuine radio-frequency-interference filter: keep only samples within 5σ. Masking is how astronomers cut cosmic rays, dropouts, and satellite interference from data.

## SciPy in one paragraph
SciPy builds on NumPy: \`scipy.fft\` (Fourier transforms), \`scipy.signal\` (filtering, spectrograms), \`scipy.optimize\` (curve fitting), \`scipy.stats\` (distributions, tests). When you fit an exoplanet transit or build a spectrogram, it's SciPy underneath.`,
      },
    ],
    questions: [
      {
        prompt: "np.linspace(0, 1, 5) produces:",
        choices: ["[0, 0.25, 0.5, 0.75, 1.0]", "[0, 1, 2, 3, 4]", "[0.2, 0.4, 0.6, 0.8, 1.0]", "[0, 0.5, 1]"],
        correctIndex: 0,
        explanation: "5 evenly spaced points including both endpoints.",
        difficulty: 1,
        topic: "numpy",
      },
      {
        prompt: "For a (16, 1024) array `spec`, spec.mean(axis=0) returns:",
        choices: ["A length-1024 array (average over time)", "A length-16 array", "A single number", "A (16, 1024) array"],
        correctIndex: 0,
        explanation: "axis=0 collapses the first dimension (16 time steps), leaving 1024 channels.",
        difficulty: 2,
        topic: "numpy axes",
      },
      {
        prompt: "data[np.abs(data) < 3*data.std()] is best described as:",
        choices: ["Boolean masking to keep samples within 3σ", "Sorting the array", "A syntax error", "Matrix multiplication"],
        correctIndex: 0,
        explanation: "The comparison builds a boolean mask; indexing selects only where it's True — a standard outlier/RFI cut.",
        difficulty: 2,
        topic: "masking",
      },
      {
        prompt: "The main performance benefit of vectorization is:",
        choices: [
          "Elementwise operations run in fast compiled code instead of Python loops",
          "It uses less disk space",
          "It automatically parallelizes across machines",
          "It reduces code correctness",
        ],
        correctIndex: 0,
        explanation: "NumPy pushes the loop into C, typically 10–100× faster than pure-Python iteration.",
        difficulty: 1,
        topic: "vectorization",
      },
    ],
  },
  {
    key: "signal-processing-prep",
    title: "Fourier Analysis & Signal Processing",
    description: "The Fourier transform, spectrograms, SNR, and filtering — the mathematical heart of radio SETI.",
    category: "RESEARCH",
    sortOrder: 17,
    lessons: [
      {
        slug: "fourier-transform",
        title: "The Fourier Transform & Spectrograms",
        minutes: 35,
        objectives: [
          "Explain what a Fourier transform reveals",
          "Relate sample rate, Nyquist frequency and resolution",
          "Read waterfall plots (spectrograms)",
        ],
        content: `# The Fourier Transform & Spectrograms

## The idea
Any signal is a sum of sinusoids. The Fourier transform converts a time series x(t) into a spectrum X(f): *which frequencies are present, and how strongly*. The FFT algorithm computes this for n samples in ~n·log(n) operations — the single most important algorithm in radio astronomy.

A pure 50 Hz tone buried in noise is invisible in the time series but stands up as a sharp spike at 50 Hz in the spectrum. Narrowband concentration is exactly why SETI looks for narrowband signals: nature makes broadband noise; oscillators make spikes.

## Sampling rules
- Sampling at rate f_s captures frequencies only up to the **Nyquist frequency** f_s/2. Higher frequencies *alias* — masquerade as lower ones.
- Frequency resolution: Δf = 1/T where T is the observation length. Observe for 1000 s → resolve 1 mHz structure. Fine SETI channels (~1 Hz) come from seconds-long FFTs of voltage data.

## Spectrograms / waterfall plots
Chop the time series into segments, FFT each, stack the spectra as rows: a 2D image of power vs. frequency vs. time. Radio astronomers call these **waterfall plots** — the iconic SETI data product.

- Vertical line: steady narrowband tone.
- Sloped line: frequency drifting in time — Doppler drift from a rotating/orbiting transmitter. A genuinely extraterrestrial signal *should* drift; zero-drift usually means local interference.
- Broadband horizontal stripes: impulsive interference (or, if dispersed, a fast radio burst).

## Signal-to-noise ratio
SNR = signal power / noise standard deviation in the measurement. It grows with sqrt(observation time) for steady signals — patience literally buys sensitivity. Detection thresholds (say SNR > 10) plus drift-rate searches plus re-observation are the SETI pipeline in a sentence.`,
      },
    ],
    questions: [
      {
        prompt: "Sampling a signal at 8000 Hz lets you faithfully capture frequencies up to:",
        choices: ["4000 Hz", "8000 Hz", "16000 Hz", "2000 Hz"],
        correctIndex: 0,
        explanation: "Nyquist: maximum representable frequency is half the sample rate.",
        difficulty: 1,
        topic: "sampling",
      },
      {
        prompt: "An FFT of a 1000-second observation gives frequency resolution of about:",
        choices: ["1 mHz", "1 Hz", "1000 Hz", "1 kHz"],
        correctIndex: 0,
        explanation: "Δf = 1/T = 1/1000 s = 0.001 Hz.",
        difficulty: 2,
        topic: "Fourier analysis",
      },
      {
        prompt: "In a waterfall plot, a narrow line that slopes steadily in frequency over time most likely indicates:",
        choices: [
          "A Doppler-drifting narrowband signal (transmitter in relative motion)",
          "Broadband thermal noise",
          "A dead receiver channel",
          "A software crash",
        ],
        correctIndex: 0,
        explanation: "Relative acceleration between transmitter and receiver produces a drifting tone — the classic technosignature morphology.",
        difficulty: 2,
        topic: "waterfall plots",
      },
      {
        prompt: "Why is a zero-drift narrowband signal in a SETI search usually treated as interference?",
        choices: [
          "A transmitter fixed relative to the telescope (local RFI) shows no Doppler drift, while sky sources should drift",
          "Extraterrestrial signals cannot be narrowband",
          "Zero drift violates the Nyquist theorem",
          "Drift is required for amplification",
        ],
        correctIndex: 0,
        explanation: "Earth's rotation imposes drift on genuine sky signals; something not drifting is co-moving with the observatory — i.e., local.",
        difficulty: 3,
        topic: "RFI rejection",
      },
      {
        prompt: "For a steady signal, integrating 4× longer improves SNR by a factor of:",
        choices: ["2", "4", "16", "It doesn't change"],
        correctIndex: 0,
        explanation: "SNR grows as sqrt(t): sqrt(4) = 2.",
        difficulty: 2,
        topic: "SNR",
      },
    ],
  },
  {
    key: "radio-seti-prep",
    title: "Radio Astronomy & SETI Methods",
    description: "Radio telescopes, technosignatures, RFI rejection, data formats, and how real SETI searches are run.",
    category: "RESEARCH",
    sortOrder: 18,
    lessons: [
      {
        slug: "radio-telescopes-technosignatures",
        title: "Radio Telescopes & Technosignatures",
        minutes: 35,
        objectives: [
          "Describe how a radio telescope system works end to end",
          "Define technosignatures and the main search strategies",
          "Explain RFI rejection and validation practices",
        ],
        content: `# Radio Telescopes & Technosignatures

## The signal chain
Dish → feed antenna → low-noise amplifier (cryogenically cooled — the sky signals are ~10⁻²⁰ W) → mixer (shifts sky frequency down; heterodyning) → digitizer → FFT into millions–billions of narrow channels → search software. Every stage exists to preserve a whisper against the receiver's own thermal hiss (the "system temperature").

## Technosignatures
Any observable evidence of technology: narrowband radio carriers (the classic), pulsed broadband beacons, laser pulses (optical SETI), megastructure infrared excess, atmospheric industrial chemistry. Narrowband radio remains the flagship because physics favors it — a 1 Hz-wide carrier concentrates energy detectable across hundreds of light-years with our own technology, and no known natural process makes Hz-wide lines.

## Search strategies
- **Targeted:** stare at nearby stars/exoplanets (deep but few).
- **Surveys:** scan large sky areas (shallow but many).
- Landmark efforts: Project Ozma (1960, Frank Drake, the first), the Wow! signal (1977, never repeated), Breakthrough Listen (2015–, publicly archived petabytes — data *you* can analyze today).

## The RFI battle
Humanity is loud: satellites, radar, Wi-Fi, microwave ovens (a famous Parkes "signal," the *peryton*, was the staff kitchen). Rejection tactics:
1. **Drift:** genuine sky signals drift in frequency from Earth's rotation; zero-drift → local.
2. **On/off pointing (nodding):** a real source appears only when the beam is on it; RFI appears everywhere.
3. **Multi-site coincidence:** a sky signal shifts predictably between distant telescopes; local RFI can't.
4. **Persistence & re-observation:** the ironclad rule — no single-epoch detection is a discovery.

## Data formats you'll meet
Filterbank (.fil) and HDF5 — channelized power vs. time; SIGPROC and blimpy (Python) read them. FITS for images/tables (astropy.io.fits). Raw voltage ("baseband") for re-channelization. The Breakthrough Listen open archive serves all three — a realistic first research project is pulling one cadence and running a drift search with open-source tools like turboSETI.

## The Drake equation (framing, not formula)
N = R* · fp · ne · fl · fi · fc · L estimates communicating civilizations. Its factors span astrophysics (measured well now!) to sociology (unknown). Its real value: it organizes *what we must learn* — and its last factor, civilization lifetime L, may matter most.`,
      },
    ],
    questions: [
      {
        prompt: "Why are narrowband (~1 Hz) radio signals the classic SETI target?",
        choices: [
          "No known natural source produces Hz-wide lines, and narrow bandwidth concentrates transmitter power",
          "They are the only signals radio telescopes can record",
          "Natural pulsars emit them constantly",
          "They travel faster than broadband signals",
        ],
        correctIndex: 0,
        explanation: "Natural emission is broadband; an artificial oscillator concentrates energy in a spike detectable at interstellar range.",
        difficulty: 2,
        topic: "technosignatures",
      },
      {
        prompt: "During on/off nodding observations, a candidate appears in BOTH on-source and off-source pointings. Conclusion:",
        choices: [
          "It is almost certainly local interference",
          "It is confirmed extraterrestrial",
          "The telescope is broken",
          "It must be re-observed immediately as a detection",
        ],
        correctIndex: 0,
        explanation: "A true sky source is only in the beam when pointed at it; presence everywhere means the signal enters locally.",
        difficulty: 2,
        topic: "RFI rejection",
      },
      {
        prompt: "The receiver electronics of radio telescopes are cryogenically cooled to:",
        choices: [
          "Reduce thermal noise so faint sky signals aren't swamped",
          "Prevent the dish from melting",
          "Increase the speed of light in the cables",
          "Make the FFT run faster",
        ],
        correctIndex: 0,
        explanation: "Amplifier thermal noise sets the system temperature; cooling it is the cheapest sensitivity gain available.",
        difficulty: 2,
        topic: "radio instrumentation",
      },
      {
        prompt: "The 1977 Wow! signal is not considered a confirmed detection because:",
        choices: [
          "It was never observed again despite many follow-ups",
          "It was too weak to record",
          "It was proven to be a satellite",
          "Its frequency was impossible",
        ],
        correctIndex: 0,
        explanation: "Reproducibility is the ironclad rule; a one-off event, however striking, cannot be validated.",
        difficulty: 1,
        topic: "SETI history",
      },
      {
        prompt: "Which file formats commonly hold channelized radio SETI data?",
        choices: ["Filterbank (.fil) and HDF5", "JPEG and PNG", "CSV only", "MP3 and WAV"],
        correctIndex: 0,
        explanation: "Filterbank and HDF5 store power vs. frequency vs. time; blimpy/SIGPROC read them.",
        difficulty: 1,
        topic: "data formats",
      },
    ],
  },
  {
    key: "ml-prep",
    title: "Machine Learning for SETI",
    description: "Core ML concepts and how they're applied to anomaly detection in radio astronomy data.",
    category: "PROGRAMMING",
    sortOrder: 19,
    lessons: [
      {
        slug: "ml-fundamentals-seti",
        title: "ML Fundamentals & Anomaly Detection",
        minutes: 35,
        objectives: [
          "Distinguish supervised, unsupervised and anomaly-detection setups",
          "Explain train/validation/test splits and overfitting",
          "Describe how CNNs classify waterfall plots",
        ],
        content: `# Machine Learning for SETI

## The three setups
- **Supervised:** learn from labeled examples (these waterfalls are RFI, these are simulated technosignatures) → classifier.
- **Unsupervised:** find structure without labels (cluster signal morphologies).
- **Anomaly detection:** model "normal" data, flag what doesn't fit — arguably the most honest framing for SETI, since we don't know what an alien signal looks like. We're searching for the *weird*.

## The workflow that keeps you honest
Split data into train / validation / test. Fit on train, tune on validation, report on test **once**. A model that memorizes training data but fails on new data is **overfitting** — the cardinal sin. Regularization, more data, and simpler models fight it.

Metrics beyond accuracy: with 1 real signal per billion windows, a model saying "always noise" is 99.9999999% accurate and 100% useless. Use precision (how many flagged are real?) and recall (how many real ones did we catch?). SETI pipelines tune for high recall, then let humans and re-observation handle precision.

## CNNs on waterfall plots
A waterfall plot is an image; convolutional neural networks excel at images. Convolution layers slide small filters across frequency-time space, learning edge/slope/texture detectors — exactly the drifting-line morphology of candidate signals. Breakthrough Listen has published CNN searches over millions of cadence snippets, surfacing candidates human-designed pipelines missed.

## Feature thinking (works even without deep nets)
Classic pipeline features: drift rate, bandwidth, SNR, on/off cadence behavior, kurtosis of the power distribution. A random forest over good features often rivals a deep net and is far more interpretable — important when a "detection" claim must survive review.

## Tools
scikit-learn (classic ML), PyTorch/TensorFlow (deep learning), and honest evaluation habits — which you now have.`,
      },
    ],
    questions: [
      {
        prompt: "Why is anomaly detection a natural framing for SETI machine learning?",
        choices: [
          "We can model normal data well but don't know what an alien signal looks like",
          "Anomaly detectors run faster than all other models",
          "Labeled alien signals are plentiful",
          "It avoids needing any training data",
        ],
        correctIndex: 0,
        explanation: "With no confirmed positive examples, modeling 'normal' and flagging outliers avoids assuming the signal's form.",
        difficulty: 2,
        topic: "anomaly detection",
      },
      {
        prompt: "A model scores 99% on training data but 60% on held-out data. This is:",
        choices: ["Overfitting", "Underfitting", "Perfect generalization", "Data leakage in the test set"],
        correctIndex: 0,
        explanation: "Large train/test gap means the model memorized rather than generalized.",
        difficulty: 1,
        topic: "overfitting",
      },
      {
        prompt: "In a search where real signals are ~1 in a billion windows, accuracy is a poor metric because:",
        choices: [
          "Predicting 'noise' always gives near-perfect accuracy while finding nothing",
          "Accuracy cannot be computed on images",
          "Accuracy requires balanced classes by definition",
          "GPUs cannot compute it",
        ],
        correctIndex: 0,
        explanation: "Extreme class imbalance makes accuracy meaningless; precision/recall describe what matters.",
        difficulty: 2,
        topic: "evaluation metrics",
      },
      {
        prompt: "Convolutional neural networks suit waterfall-plot classification because:",
        choices: [
          "Waterfalls are images, and convolutions learn local frequency-time patterns like drifting lines",
          "They require no training data",
          "They only work on audio",
          "They guarantee zero false positives",
        ],
        correctIndex: 0,
        explanation: "Convolution filters detect local morphology — edges and slopes — which is precisely candidate-signal structure.",
        difficulty: 2,
        topic: "CNNs",
      },
    ],
  },
  {
    key: "quantum-computing-prep",
    title: "Quantum Computing Preparation",
    description: "Qubits, gates, entanglement, and key algorithms — the secondary specialization track.",
    category: "QUANTUM",
    sortOrder: 20,
    lessons: [
      {
        slug: "qubits-gates",
        title: "Qubits, Gates & Circuits",
        minutes: 35,
        objectives: [
          "Represent qubit states and apply single-qubit gates",
          "Explain superposition and entanglement precisely",
          "Trace simple quantum circuits",
        ],
        content: `# Qubits, Gates & Circuits

*Prerequisite: the Quantum Mechanics Preparation module — states, amplitudes, Born rule.*

## The qubit
\`|ψ⟩ = α|0⟩ + β|1⟩\`, complex α, β with |α|² + |β|² = 1. Measurement yields 0 or 1 with those probabilities and destroys the superposition. n qubits live in a 2ⁿ-dimensional space — 300 qubits describe more amplitudes than there are atoms in the observable universe. That exponential space is the resource quantum algorithms exploit.

## Gates are unitary matrices
- **X** (NOT): |0⟩ ↔ |1⟩. Matrix [[0,1],[1,0]].
- **H** (Hadamard): |0⟩ → (|0⟩ + |1⟩)/√2 — the superposition-maker.
- **Z**: flips the phase of |1⟩. Invisible to immediate measurement, crucial for interference.
- **CNOT** (2-qubit): flips the target iff the control is |1⟩ — the entangler.

All gates are reversible (unitary); circuits are read left to right.

## Entanglement
H on qubit 1, then CNOT: \`(|00⟩ + |11⟩)/√2\` — a Bell state. Neither qubit has its own state; only correlations exist. Measure one, and the other's outcome is fixed, regardless of separation — but no usable information travels faster than light (relativity survives).

## Algorithms worth knowing by name
- **Deutsch–Jozsa:** first proof quantum beats classical (toy problem, real lesson: interference computes).
- **Grover:** unstructured search in √N steps instead of N.
- **Shor:** factors integers exponentially faster — the reason post-quantum cryptography exists.
- **Quantum simulation:** the killer app — simulating quantum systems (molecules, materials) that choke classical computers.

## Honest connection to your SETI path
Quantum computing is a *secondary* specialization: near-term devices won't run SETI pipelines. The overlap is deeper: shared linear algebra, signal/noise thinking, and a possible future in quantum-enhanced receivers and sensing. And understanding computation's physical limits sharpens how you reason about what *any* technological civilization could build — which is, after all, your field's central question.`,
      },
    ],
    questions: [
      {
        prompt: "Applying H to |0⟩ then measuring gives:",
        choices: ["0 or 1, each with probability 1/2", "Always 0", "Always 1", "0 with probability 1/4"],
        correctIndex: 0,
        explanation: "H|0⟩ = (|0⟩+|1⟩)/√2; Born rule gives |1/√2|² = 1/2 for each outcome.",
        difficulty: 1,
        topic: "quantum gates",
      },
      {
        prompt: "The state (|00⟩ + |11⟩)/√2 is special because:",
        choices: [
          "It is entangled — neither qubit has an independent state",
          "It always measures 01",
          "It violates normalization",
          "It cannot be created by any circuit",
        ],
        correctIndex: 0,
        explanation: "It's a Bell state: only joint correlations exist. H + CNOT creates it.",
        difficulty: 2,
        topic: "entanglement",
      },
      {
        prompt: "Grover's algorithm searches N unsorted items in roughly:",
        choices: ["√N steps", "log N steps", "N steps", "1 step"],
        correctIndex: 0,
        explanation: "Grover gives a quadratic speedup: O(√N) oracle queries.",
        difficulty: 2,
        topic: "quantum algorithms",
      },
      {
        prompt: "Why can't entanglement transmit messages faster than light?",
        choices: [
          "Each side's outcomes are locally random; correlations only appear when results are compared classically",
          "Entanglement decays instantly over distance",
          "Measurement is impossible on entangled qubits",
          "It can — relativity forbids nothing",
        ],
        correctIndex: 0,
        explanation: "No local operation on one qubit changes the other side's statistics; comparing results requires a classical (light-limited) channel.",
        difficulty: 3,
        topic: "entanglement",
      },
      {
        prompt: "300 ideal qubits are notable because their state space:",
        choices: [
          "Has 2³⁰⁰ amplitudes — more than atoms in the observable universe",
          "Is exactly 300-dimensional",
          "Contains 300² classical bits",
          "Cannot be described mathematically",
        ],
        correctIndex: 0,
        explanation: "State space doubles per qubit: 2ⁿ complex amplitudes — the exponential resource behind quantum computing.",
        difficulty: 1,
        topic: "qubits",
      },
    ],
  },
];
