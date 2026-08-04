/**
 * Live discovery connectors for open catalog/metadata services. All are
 * optional enhancements over the curated catalog: every function returns []
 * on any failure (offline, rate-limited, AGENTS_OFFLINE=1) so the pipeline
 * never depends on the network. Only metadata is retrieved — never full text —
 * and every result passes through the access policy before storage.
 */

import { isApprovedUrl } from "./access-policy";
import type { SourceCandidate } from "./scoring";

const TIMEOUT_MS = 8000;

async function fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
  if (process.env.AGENTS_OFFLINE === "1") return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SETI-Scholar/1.0 (educational source discovery)", ...headers },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string | null> {
  if (process.env.AGENTS_OFFLINE === "1") return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SETI-Scholar/1.0 (educational source discovery)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Open Library: book metadata search (never full text). */
export async function searchOpenLibrary(query: string, subject: string): Promise<SourceCandidate[]> {
  interface OLDoc {
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    key?: string;
    ebook_access?: string;
  }
  const data = await fetchJson<{ docs?: OLDoc[] }>(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5&fields=title,author_name,first_publish_year,key,ebook_access`,
  );
  if (!data?.docs) return [];
  return data.docs
    .filter((d) => d.title && d.key)
    .map((d) => ({
      title: d.title!,
      url: `https://openlibrary.org${d.key}`,
      provider: "openlibrary",
      type: "textbook",
      subject,
      description: `Book metadata via Open Library${d.ebook_access === "public" ? "; public e-book access" : ""}.`,
      license: d.ebook_access === "public" ? "Public domain" : "unknown",
      accessStatus: d.ebook_access === "public" ? ("open_full_text" as const) : ("metadata_only" as const),
      year: d.first_publish_year ?? null,
      authors: d.author_name?.slice(0, 3) ?? [],
    }));
}

/** Google Books: metadata + authorized preview links only. */
export async function searchGoogleBooks(query: string, subject: string): Promise<SourceCandidate[]> {
  interface GBItem {
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publishedDate?: string;
      canonicalVolumeLink?: string;
      previewLink?: string;
      description?: string;
    };
    accessInfo?: { viewability?: string; publicDomain?: boolean };
  }
  const data = await fetchJson<{ items?: GBItem[] }>(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&printType=books`,
  );
  if (!data?.items) return [];
  return data.items
    .filter((i) => i.volumeInfo?.title)
    .map((i) => {
      const vi = i.volumeInfo!;
      const publicDomain = i.accessInfo?.publicDomain === true;
      const hasPreview = i.accessInfo?.viewability === "PARTIAL";
      return {
        title: vi.title!,
        url: vi.canonicalVolumeLink ?? vi.previewLink ?? "https://books.google.com",
        provider: "google-books",
        type: "textbook" as const,
        subject,
        description: (vi.description ?? "Book metadata via Google Books.").slice(0, 300),
        license: publicDomain ? "Public domain" : "unknown",
        accessStatus: publicDomain
          ? ("open_full_text" as const)
          : hasPreview
            ? ("preview" as const)
            : ("metadata_only" as const),
        year: vi.publishedDate ? parseInt(vi.publishedDate.slice(0, 4), 10) || null : null,
        authors: vi.authors?.slice(0, 3) ?? [],
      };
    });
}

/** Crossref: peer-reviewed work metadata. */
export async function searchCrossref(query: string, subject: string): Promise<SourceCandidate[]> {
  interface CRItem {
    title?: string[];
    URL?: string;
    author?: { family?: string; given?: string }[];
    published?: { "date-parts"?: number[][] };
    "container-title"?: string[];
  }
  const data = await fetchJson<{ message?: { items?: CRItem[] } }>(
    `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&select=title,URL,author,published,container-title`,
  );
  const items = data?.message?.items ?? [];
  return items
    .filter((i) => i.title?.[0] && i.URL)
    .map((i) => ({
      title: i.title![0],
      url: i.URL!,
      provider: "crossref",
      type: "paper" as const,
      subject,
      description: `Peer-reviewed work${i["container-title"]?.[0] ? ` in ${i["container-title"]![0]}` : ""} (metadata via Crossref).`,
      license: "unknown",
      accessStatus: "metadata_only" as const,
      year: i.published?.["date-parts"]?.[0]?.[0] ?? null,
      authors: (i.author ?? []).slice(0, 3).map((a) => `${a.given ?? ""} ${a.family ?? ""}`.trim()),
    }));
}

/** arXiv: open-access preprints (Atom feed, minimal parse). */
export async function searchArxiv(query: string, subject: string): Promise<SourceCandidate[]> {
  const xml = await fetchText(
    `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5&sortBy=relevance`,
  );
  if (!xml) return [];
  const entries = xml.split("<entry>").slice(1);
  return entries
    .map((e) => {
      const title = /<title>([\s\S]*?)<\/title>/.exec(e)?.[1]?.replace(/\s+/g, " ").trim();
      const id = /<id>(.*?)<\/id>/.exec(e)?.[1]?.trim();
      const year = /<published>(\d{4})/.exec(e)?.[1];
      const summary = /<summary>([\s\S]*?)<\/summary>/.exec(e)?.[1]?.replace(/\s+/g, " ").trim();
      if (!title || !id) return null;
      return {
        title,
        url: id,
        provider: "arxiv",
        type: "paper" as const,
        subject,
        description: (summary ?? "arXiv preprint.").slice(0, 300),
        license: "Open access (arXiv)",
        accessStatus: "open_full_text" as const,
        year: year ? parseInt(year, 10) : null,
        authors: [],
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/** Semantic Scholar: paper metadata with open-access flags. */
export async function searchSemanticScholar(query: string, subject: string): Promise<SourceCandidate[]> {
  interface S2Paper {
    title?: string;
    url?: string;
    year?: number;
    abstract?: string;
    isOpenAccess?: boolean;
    openAccessPdf?: { url?: string } | null;
  }
  const data = await fetchJson<{ data?: S2Paper[] }>(
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,url,year,abstract,isOpenAccess,openAccessPdf`,
  );
  if (!data?.data) return [];
  return data.data
    .filter((p) => p.title && p.url)
    .map((p) => ({
      title: p.title!,
      url: p.url!,
      provider: "semantic-scholar",
      type: "paper" as const,
      subject,
      description: (p.abstract ?? "Paper metadata via Semantic Scholar.").slice(0, 300),
      license: p.isOpenAccess ? "Open access" : "unknown",
      accessStatus: p.isOpenAccess ? ("open_full_text" as const) : ("metadata_only" as const),
      year: p.year ?? null,
      authors: [],
    }));
}

/**
 * Run all connectors for a query. Policy filter applied here as defense in
 * depth: anything from an unapproved domain is dropped before it ever
 * reaches scoring or storage.
 */
export async function discoverFromNetwork(
  query: string,
  subject: string,
): Promise<SourceCandidate[]> {
  const results = await Promise.all([
    searchOpenLibrary(query, subject),
    searchGoogleBooks(query, subject),
    searchCrossref(query, subject),
    searchArxiv(query, subject),
    searchSemanticScholar(query, subject),
  ]);
  return results.flat().filter((c) => isApprovedUrl(c.url));
}
