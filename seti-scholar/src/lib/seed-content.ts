import { MODULES_1 } from "./seed-content-1";
import { MODULES_2 } from "./seed-content-2";
import type { SeedCard, SeedChallenge, SeedModule } from "./seed-content-types";

export const ALL_MODULES: SeedModule[] = [...MODULES_1, ...MODULES_2];

export const CODING_CHALLENGES: SeedChallenge[] = [
  {
    key: "py-snr",
    title: "Signal-to-Noise Ratio",
    track: "python",
    sortOrder: 1,
    prompt:
      "Write a function snr(signal_power, noise_std) that returns the signal-to-noise ratio. Then compute the SNR of a 42.0 units signal in noise with standard deviation 3.5, and decide if it clears a detection threshold of 10.",
    starterCode: `def snr(signal_power, noise_std):
    # your code here
    pass

value = snr(42.0, 3.5)
print(value)
print("DETECTION" if value > 10 else "below threshold")
`,
    solution: `def snr(signal_power, noise_std):
    return signal_power / noise_std

value = snr(42.0, 3.5)
print(value)                      # 12.0
print("DETECTION" if value > 10 else "below threshold")  # DETECTION
`,
    hints: [
      "SNR is simply the ratio of signal power to noise standard deviation.",
      "12.0 > 10, so this one clears the threshold.",
    ],
  },
  {
    key: "py-star-catalog",
    title: "Filtering a Star Catalog",
    track: "python",
    sortOrder: 2,
    prompt:
      "Given a list of (name, distance_ly) tuples, write nearby(stars, max_ly) returning the names of stars within max_ly light-years, sorted by distance. Test with Proxima (4.24), Tau Ceti (11.9), Barnard's Star (5.96), TRAPPIST-1 (40.7) and max_ly = 12.",
    starterCode: `stars = [("Proxima Centauri", 4.24), ("Tau Ceti", 11.9),
         ("Barnard's Star", 5.96), ("TRAPPIST-1", 40.7)]

def nearby(stars, max_ly):
    # your code here
    pass

print(nearby(stars, 12))
`,
    solution: `stars = [("Proxima Centauri", 4.24), ("Tau Ceti", 11.9),
         ("Barnard's Star", 5.96), ("TRAPPIST-1", 40.7)]

def nearby(stars, max_ly):
    close = [s for s in stars if s[1] <= max_ly]
    close.sort(key=lambda s: s[1])
    return [name for name, _ in close]

print(nearby(stars, 12))
# ['Proxima Centauri', "Barnard's Star", 'Tau Ceti']
`,
    hints: [
      "A list comprehension with a condition filters the list.",
      "sort(key=lambda s: s[1]) sorts tuples by their second element.",
    ],
  },
  {
    key: "np-waterfall",
    title: "Build a Waterfall Plot Array",
    track: "numpy",
    sortOrder: 3,
    prompt:
      "Using NumPy, create a 64×256 array of Gaussian noise (mean 0, std 1) and inject a narrowband 'signal' by adding 8.0 to column 100 in every row. Report the z-score of the mean power in column 100 versus the mean and std of column means.",
    starterCode: `import numpy as np
rng = np.random.default_rng(42)

# 1) noise: shape (64, 256)
# 2) inject: add 8.0 to column 100
# 3) col_means = mean over time (axis=0)
# 4) z = (col_means[100] - col_means.mean()) / col_means.std()
`,
    solution: `import numpy as np
rng = np.random.default_rng(42)

wf = rng.normal(0, 1, (64, 256))
wf[:, 100] += 8.0

col_means = wf.mean(axis=0)
z = (col_means[100] - col_means.mean()) / col_means.std()
print(round(float(z), 1))   # a very large z — an obvious detection
`,
    hints: [
      "wf[:, 100] selects every row of column 100.",
      "axis=0 averages down the time axis, leaving one value per frequency channel.",
    ],
  },
  {
    key: "np-doppler-drift",
    title: "Doppler Drift Correction",
    track: "signal",
    sortOrder: 4,
    prompt:
      "A narrowband signal drifts at 2 channels per time step. Given a 32×128 waterfall where the signal sits at channel (20 + 2*t) in row t, write code that shifts each row left by 2*t (np.roll) so the signal aligns vertically, then sums over time to recover it.",
    starterCode: `import numpy as np
rng = np.random.default_rng(7)

wf = rng.normal(0, 1, (32, 128))
for t in range(32):
    wf[t, 20 + 2 * t] += 4.0     # drifting signal

# de-drift: roll each row so the signal lines up, then sum over time
`,
    solution: `import numpy as np
rng = np.random.default_rng(7)

wf = rng.normal(0, 1, (32, 128))
for t in range(32):
    wf[t, 20 + 2 * t] += 4.0

dedrifted = np.stack([np.roll(wf[t], -2 * t) for t in range(32)])
profile = dedrifted.sum(axis=0)
print(int(profile.argmax()))   # 20 — the signal, recovered

# This is the core of a de-doppler search: try many drift rates,
# keep the one that maximizes the integrated SNR.
`,
    hints: [
      "np.roll(row, -shift) moves elements left by `shift`.",
      "After alignment, summing over time makes the signal add coherently while noise averages out.",
    ],
  },
  {
    key: "scipy-fft-tone",
    title: "Find a Hidden Tone with the FFT",
    track: "signal",
    sortOrder: 5,
    prompt:
      "A 440 Hz tone with amplitude 0.2 is buried in noise with std 1.0 (1 second at 8000 Hz sampling). Use an FFT to find the tone's frequency. It is invisible in the time series — but unmistakable in the spectrum.",
    starterCode: `import numpy as np
rng = np.random.default_rng(1)

fs = 8000
t = np.arange(fs) / fs
x = 0.2 * np.sin(2 * np.pi * 440 * t) + rng.normal(0, 1, fs)

# FFT, take magnitude of the positive-frequency half,
# find the peak's frequency using np.fft.rfftfreq
`,
    solution: `import numpy as np
rng = np.random.default_rng(1)

fs = 8000
t = np.arange(fs) / fs
x = 0.2 * np.sin(2 * np.pi * 440 * t) + rng.normal(0, 1, fs)

spectrum = np.abs(np.fft.rfft(x))
freqs = np.fft.rfftfreq(len(x), 1 / fs)
peak = freqs[spectrum[1:].argmax() + 1]   # skip the DC bin
print(peak)   # 440.0
`,
    hints: [
      "np.fft.rfft gives the positive-frequency half of the spectrum for real input.",
      "np.fft.rfftfreq maps FFT bins to frequencies in Hz.",
      "Skip bin 0 (the DC/mean component) when looking for the peak.",
    ],
  },
  {
    key: "ml-rfi-features",
    title: "Classify RFI with Simple Features",
    track: "ml",
    sortOrder: 6,
    prompt:
      "Given candidate signals as (drift_rate_hz_s, appears_in_off_pointing) pairs, write classify(candidates) that labels each 'RFI' if drift is exactly 0 or it appears in the off pointing, else 'candidate'. Count how many survive from a small test set.",
    starterCode: `cands = [
    {"id": 1, "drift": 0.0,  "in_off": False},
    {"id": 2, "drift": -0.31, "in_off": False},
    {"id": 3, "drift": 0.12, "in_off": True},
    {"id": 4, "drift": 0.27, "in_off": False},
]

def classify(candidates):
    # return dict id -> "RFI" or "candidate"
    pass
`,
    solution: `cands = [
    {"id": 1, "drift": 0.0,  "in_off": False},
    {"id": 2, "drift": -0.31, "in_off": False},
    {"id": 3, "drift": 0.12, "in_off": True},
    {"id": 4, "drift": 0.27, "in_off": False},
]

def classify(candidates):
    out = {}
    for c in candidates:
        if c["drift"] == 0.0 or c["in_off"]:
            out[c["id"]] = "RFI"
        else:
            out[c["id"]] = "candidate"
    return out

labels = classify(cands)
print(labels)
print(sum(1 for v in labels.values() if v == "candidate"), "survive")  # 2 survive
`,
    hints: [
      "Zero drift → co-moving with the telescope → local interference.",
      "Appearing when pointed away from the source also means local.",
    ],
  },
  {
    key: "qc-born-rule",
    title: "Simulate a Qubit Measurement",
    track: "quantum",
    sortOrder: 7,
    prompt:
      "Represent a qubit state as a 2-element complex vector. Write measure_probabilities(state) returning (P0, P1) via the Born rule, and apply a Hadamard gate (as a 2×2 matrix) to |0⟩ to verify it gives (0.5, 0.5).",
    starterCode: `import numpy as np

ket0 = np.array([1, 0], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)

def measure_probabilities(state):
    # Born rule: P(i) = |amplitude_i|^2
    pass
`,
    solution: `import numpy as np

ket0 = np.array([1, 0], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)

def measure_probabilities(state):
    probs = np.abs(state) ** 2
    return float(probs[0]), float(probs[1])

superposed = H @ ket0
print(measure_probabilities(superposed))   # (0.5, 0.5)
`,
    hints: [
      "np.abs of a complex array gives moduli; square them for probabilities.",
      "Matrix–vector product in NumPy is the @ operator.",
    ],
  },
];

/** Starter flashcards provisioned for every new user. */
export const STARTER_CARDS: SeedCard[] = [
  { front: "180° in radians?", back: "π radians", topic: "trigonometry" },
  { front: "Definition of the derivative", back: "f'(x) = lim (h→0) [f(x+h) − f(x)] / h — the limiting slope of secant lines.", topic: "calculus" },
  { front: "Newton's second law", back: "F = ma (net force = mass × acceleration, applied per axis as vectors)", topic: "mechanics" },
  { front: "Kepler's third law (Sun, years & AU)", back: "T² = a³", topic: "orbital mechanics" },
  { front: "Inverse-square law for flux", back: "Flux ∝ 1/d² — double the distance, quarter the brightness.", topic: "astronomy" },
  { front: "Frequency of the hydrogen line", back: "1420.4 MHz (λ = 21 cm) — a natural 'magic frequency' for SETI searches.", topic: "radio astronomy" },
  { front: "Nyquist frequency", back: "Half the sampling rate — the highest frequency faithfully captured.", topic: "signal processing" },
  { front: "FFT frequency resolution for observation length T", back: "Δf = 1/T", topic: "signal processing" },
  { front: "Why does a real SETI signal drift in frequency?", back: "Earth's rotation/orbit (and the transmitter's motion) produce a changing Doppler shift — df/dt ≠ 0. Zero drift suggests local RFI.", topic: "SETI methods" },
  { front: "Born rule", back: "P(outcome) = |amplitude|² — probabilities are squared moduli of complex amplitudes.", topic: "quantum mechanics" },
  { front: "Euler's formula", back: "e^{iθ} = cos θ + i sin θ", topic: "complex numbers" },
  { front: "SNR growth with integration time", back: "SNR ∝ √t for a steady signal — patience buys sensitivity.", topic: "radio astronomy" },
];
