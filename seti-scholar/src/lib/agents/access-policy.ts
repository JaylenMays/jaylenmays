/**
 * Copyright & access policy for autonomous source discovery.
 *
 * Hard rules enforced here (and honored by every connector and agent):
 *  - Only approved domains are ever searched or stored.
 *  - Full text may be treated as ingestable ONLY when the license is verifiably
 *    open (or public domain). Everything else is metadata/preview only.
 *  - The system never stores copyrighted full text at all — it stores metadata,
 *    links, and its own original teaching material.
 *  - No pirate/shadow-library domains, ever. No paywall or DRM circumvention.
 *  - Commercial books are recommended via metadata + a legitimate purchase or
 *    library lookup path.
 */

export type AccessStatus = "open_full_text" | "preview" | "metadata_only" | "commercial";

/** Authority tiers: higher tier → higher authority score in the rubric. */
export const APPROVED_DOMAINS: Record<string, { tier: 1 | 2 | 3; label: string }> = {
  // Tier 1 — official scientific organizations & standards bodies
  "nasa.gov": { tier: 1, label: "NASA" },
  "science.nasa.gov": { tier: 1, label: "NASA Science" },
  "adsabs.harvard.edu": { tier: 1, label: "NASA ADS" },
  "ui.adsabs.harvard.edu": { tier: 1, label: "NASA ADS" },
  "nsf.gov": { tier: 1, label: "NSF" },
  "nist.gov": { tier: 1, label: "NIST" },
  "esa.int": { tier: 1, label: "ESA" },
  "nrao.edu": { tier: 1, label: "NRAO" },
  "public.nrao.edu": { tier: 1, label: "NRAO Public" },
  "science.nrao.edu": { tier: 1, label: "NRAO Science" },
  "greenbankobservatory.org": { tier: 1, label: "Green Bank Observatory" },
  "seti.org": { tier: 1, label: "SETI Institute" },
  "seti.berkeley.edu": { tier: 1, label: "Berkeley SETI / Breakthrough Listen" },
  "breakthroughinitiatives.org": { tier: 1, label: "Breakthrough Initiatives" },

  // Tier 2 — universities, peer-reviewed indexes, open textbooks
  "openstax.org": { tier: 2, label: "OpenStax" },
  "libretexts.org": { tier: 2, label: "LibreTexts" },
  "math.libretexts.org": { tier: 2, label: "LibreTexts Math" },
  "phys.libretexts.org": { tier: 2, label: "LibreTexts Physics" },
  "ocw.mit.edu": { tier: 2, label: "MIT OpenCourseWare" },
  "open.edu": { tier: 2, label: "OpenLearn" },
  "arxiv.org": { tier: 2, label: "arXiv" },
  "export.arxiv.org": { tier: 2, label: "arXiv API" },
  "crossref.org": { tier: 2, label: "Crossref" },
  "api.crossref.org": { tier: 2, label: "Crossref API" },
  "semanticscholar.org": { tier: 2, label: "Semantic Scholar" },
  "api.semanticscholar.org": { tier: 2, label: "Semantic Scholar API" },
  "core.ac.uk": { tier: 2, label: "CORE" },
  "doaj.org": { tier: 2, label: "DOAJ" },
  "pubmed.ncbi.nlm.nih.gov": { tier: 2, label: "PubMed" },
  "feynmanlectures.caltech.edu": { tier: 2, label: "Feynman Lectures (Caltech)" },
  "gutenberg.org": { tier: 2, label: "Project Gutenberg" },
  "openlibrary.org": { tier: 2, label: "Open Library" },
  "archive.org": { tier: 2, label: "Internet Archive (public-domain/authorized)" },
  "books.google.com": { tier: 2, label: "Google Books (metadata/authorized preview)" },
  "www.googleapis.com": { tier: 2, label: "Google Books API" },
  "worldcat.org": { tier: 2, label: "WorldCat (metadata)" },
  "d2l.ai": { tier: 2, label: "Dive into Deep Learning" },
  "greenteapress.com": { tier: 2, label: "Green Tea Press (open books)" },

  // Tier 2 — official software documentation
  "docs.python.org": { tier: 2, label: "Python docs" },
  "numpy.org": { tier: 2, label: "NumPy docs" },
  "docs.scipy.org": { tier: 2, label: "SciPy docs" },
  "docs.astropy.org": { tier: 2, label: "Astropy docs" },
  "astropy.org": { tier: 2, label: "Astropy" },
  "pandas.pydata.org": { tier: 2, label: "pandas docs" },
  "scikit-learn.org": { tier: 2, label: "scikit-learn docs" },
  "docs.quantum.ibm.com": { tier: 2, label: "IBM Quantum / Qiskit docs" },
  "qiskit.org": { tier: 2, label: "Qiskit" },
  "quantumai.google": { tier: 2, label: "Cirq docs" },
  "pennylane.ai": { tier: 2, label: "PennyLane docs" },
  "matplotlib.org": { tier: 2, label: "Matplotlib docs" },

  // Tier 3 — publisher/press pages (metadata, previews, purchase paths)
  "cambridge.org": { tier: 3, label: "Cambridge University Press" },
  "press.princeton.edu": { tier: 3, label: "Princeton University Press" },
  "wiley.com": { tier: 3, label: "Wiley" },
  "cengage.com": { tier: 3, label: "Cengage" },
  "pearson.com": { tier: 3, label: "Pearson" },
  "springer.com": { tier: 3, label: "Springer" },
  "link.springer.com": { tier: 3, label: "SpringerLink" },
  "uscibooks.com": { tier: 3, label: "University Science Books" },
};

/** Licenses that permit treating full text as openly readable. */
const OPEN_LICENSES = [
  "public domain",
  "cc0",
  "cc by",
  "cc-by",
  "cc by-sa",
  "cc by-nc",
  "cc by-nc-sa",
  "gfdl",
  "mit",
  "bsd",
  "open access",
  "free to read (authorized)",
];

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function domainTier(url: string): 1 | 2 | 3 | null {
  const host = domainOf(url);
  if (!host) return null;
  // Match the host or any approved parent domain (e.g. math.libretexts.org).
  for (const [domain, info] of Object.entries(APPROVED_DOMAINS)) {
    if (host === domain || host.endsWith(`.${domain}`)) return info.tier;
  }
  return null;
}

export function isApprovedUrl(url: string): boolean {
  return domainTier(url) !== null;
}

export function isOpenLicense(license: string): boolean {
  const l = license.toLowerCase().trim();
  return OPEN_LICENSES.some((ol) => l.startsWith(ol) || l.includes(ol));
}

/**
 * The single gate for full-text ingestion. Metadata alone is never sufficient:
 * the URL must be approved AND the license verifiably open.
 */
export function canIngestFullText(opts: { url: string; license: string }): boolean {
  return isApprovedUrl(opts.url) && isOpenLicense(opts.license);
}

/**
 * Normalize a claimed access status against the license evidence, so the
 * system can never claim a source is open access when it is not.
 */
export function normalizeAccessStatus(opts: {
  url: string;
  license: string;
  claimed: AccessStatus;
}): AccessStatus {
  if (!isApprovedUrl(opts.url)) return "metadata_only";
  if (opts.claimed === "open_full_text" && !isOpenLicense(opts.license)) {
    return "metadata_only";
  }
  return opts.claimed;
}

/** Legitimate purchase / library lookup path for a commercial title. */
export function purchaseLookupUrl(title: string, author: string): string {
  const q = encodeURIComponent(`${title} ${author}`);
  return `https://openlibrary.org/search?q=${q}`;
}

export class PolicyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolicyViolationError";
  }
}

export function assertApprovedUrl(url: string): void {
  if (!isApprovedUrl(url)) {
    throw new PolicyViolationError(
      `URL rejected by access policy (domain not on the approved source list): ${url}`,
    );
  }
}
