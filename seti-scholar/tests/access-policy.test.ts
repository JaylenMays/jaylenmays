import { describe, expect, it } from "vitest";
import {
  assertApprovedUrl,
  canIngestFullText,
  domainTier,
  isApprovedUrl,
  normalizeAccessStatus,
  purchaseLookupUrl,
  PolicyViolationError,
} from "@/lib/agents/access-policy";

describe("approved-domain policy", () => {
  it("approves official scientific organizations at tier 1", () => {
    expect(domainTier("https://science.nasa.gov/universe/")).toBe(1);
    expect(domainTier("https://public.nrao.edu/radio-astronomy/")).toBe(1);
    expect(domainTier("https://www.seti.org/our-work")).toBe(1);
  });

  it("approves open textbooks, universities, and software docs at tier 2", () => {
    expect(domainTier("https://openstax.org/details/books/astronomy-2e")).toBe(2);
    expect(domainTier("https://ocw.mit.edu/courses/18-06/")).toBe(2);
    expect(domainTier("https://numpy.org/doc/stable/")).toBe(2);
    expect(domainTier("https://math.libretexts.org/Bookshelves/Calculus")).toBe(2); // subdomain
  });

  it("rejects unknown and unapproved domains", () => {
    expect(isApprovedUrl("https://random-blog.example.com/calculus")).toBe(false);
    expect(isApprovedUrl("https://some-shadow-library.example/book.pdf")).toBe(false);
    expect(isApprovedUrl("not a url")).toBe(false);
  });

  it("does not approve lookalike domains by substring", () => {
    expect(isApprovedUrl("https://fakeopenstax.org.evil.com/book")).toBe(false);
    expect(isApprovedUrl("https://notnasa.gov.attacker.io/")).toBe(false);
  });

  it("assertApprovedUrl throws PolicyViolationError for bad domains", () => {
    expect(() => assertApprovedUrl("https://piratebooks.example/x")).toThrow(PolicyViolationError);
    expect(() => assertApprovedUrl("https://openstax.org/x")).not.toThrow();
  });
});

describe("full-text ingestion gate", () => {
  it("allows full text only with an approved domain AND an open license", () => {
    expect(canIngestFullText({ url: "https://openstax.org/x", license: "CC BY 4.0" })).toBe(true);
    expect(canIngestFullText({ url: "https://www.gutenberg.org/ebooks/33283", license: "Public domain" })).toBe(true);
    // Approved domain but commercial license → never ingestable.
    expect(canIngestFullText({ url: "https://www.cambridge.org/book", license: "Commercial (all rights reserved)" })).toBe(false);
    // Open license claim on unapproved domain → never ingestable.
    expect(canIngestFullText({ url: "https://sketchy.example/book", license: "CC BY 4.0" })).toBe(false);
  });

  it("never lets a non-open source claim open access", () => {
    expect(
      normalizeAccessStatus({
        url: "https://www.cengage.com/c/stewart",
        license: "Commercial (all rights reserved)",
        claimed: "open_full_text",
      }),
    ).toBe("metadata_only");
  });

  it("downgrades everything on unapproved domains to metadata_only", () => {
    expect(
      normalizeAccessStatus({ url: "https://evil.example/x", license: "CC BY 4.0", claimed: "open_full_text" }),
    ).toBe("metadata_only");
  });

  it("preserves honest statuses", () => {
    expect(
      normalizeAccessStatus({ url: "https://openstax.org/x", license: "CC BY 4.0", claimed: "open_full_text" }),
    ).toBe("open_full_text");
    expect(
      normalizeAccessStatus({ url: "https://books.google.com/x", license: "unknown", claimed: "preview" }),
    ).toBe("preview");
  });
});

describe("purchase path", () => {
  it("routes commercial books to a legitimate library/purchase lookup", () => {
    const url = purchaseLookupUrl("Introduction to Electrodynamics", "Griffiths");
    expect(url).toContain("openlibrary.org/search");
    expect(url).toContain("Electrodynamics");
  });
});
