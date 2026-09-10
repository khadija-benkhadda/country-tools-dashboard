import { afterEach, describe, expect, it, vi } from "vitest";
import { assertProviderStatus, fetchAddresses, fetchDocuments, fetchPlaces, fetchTrends, generatedTextSource } from "./liveData";
import { makeRequest } from "./_core/map";

vi.mock("./_core/map", () => ({ makeRequest: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(makeRequest).mockReset();
});

describe("live data provenance", () => {
  it("returns Open Library records with live source metadata", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [{ key: "/works/OL1W", title: "Real Book", author_name: ["Author"], first_publish_year: 2020 }] }),
    }));
    const batch = await fetchDocuments("climate", 150, "Book");
    expect(batch.rows).toHaveLength(1);
    expect(String((fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0])).toContain("limit=100");
    expect(batch.rows[0]).toMatchObject({ title: "Real Book", source: "Open Library Search API", contentType: "Book", topic: "climate" });
    expect(batch.rows[0]?.sourceMeta.mode).toBe("live");
    expect(batch.rows[0]?.sourceMeta.endpoint).toContain("openlibrary.org/search.json");
    expect(batch.rows[0]?.sourceMeta.endpoint).toContain("limit=100");
    expect(batch.quality).toMatchObject({ requested: 150, retrieved: 2, unique: 1, displayed: 1, status: "partial" });
  });

  it("deduplicates duplicate Open Library works and keeps the API cap", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [{ key: "/works/OL1W", title: "Same Book" }, { key: "/works/OL1W", title: "Same Book" }, { key: "/works/OL2W", title: "Other Book" }] }),
    }));
    const batch = await fetchDocuments("books", 150, "Book");
    expect(batch.rows).toHaveLength(2);
    expect(new Set(batch.rows.map((row) => row.id)).size).toBe(2);
    expect(batch.quality.unique).toBe(2);
  });

  it("deduplicates repeated live trend items and keeps the requested limit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "<item><title>alpha</title></item><item><title>alpha</title></item><item><title>beta</title></item>",
    }));
    const batch = await fetchTrends("US", 2, "All");
    expect(batch.rows.map((row) => row.keyword)).toEqual(["alpha", "beta"]);
    expect(batch.rows).toHaveLength(2);
    expect(batch.quality).toMatchObject({ requested: 2, retrieved: 3, unique: 2, displayed: 2, status: "complete" });
  });

  it("surfaces provider quota responses as a distinct error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "OVER_QUERY_LIMIT", results: [] }) }));
    await expect(fetchDocuments("books", 10, "Book")).rejects.toThrow("LIVE_QUOTA_EXCEEDED");
  });

  it("distinguishes Google Maps quota and provider errors from valid responses", () => {
    expect(() => assertProviderStatus({ status: "OVER_QUERY_LIMIT", results: [] })).toThrow("LIVE_QUOTA_EXCEEDED");
    expect(() => assertProviderStatus({ status: "REQUEST_DENIED", results: [] })).toThrow("LIVE_PROVIDER_ERROR:REQUEST_DENIED");
    expect(() => assertProviderStatus({ status: "OK", results: [] })).not.toThrow();
  });

  it("rejects quota and provider errors on the actual Maps adapters", async () => {
    vi.mocked(makeRequest).mockResolvedValueOnce({ status: "OVER_QUERY_LIMIT", results: [] } as never);
    await expect(fetchAddresses("United States", 10)).rejects.toThrow("LIVE_QUOTA_EXCEEDED");
    vi.mocked(makeRequest).mockResolvedValueOnce({ status: "REQUEST_DENIED", results: [] } as never);
    await expect(fetchPlaces("United States", "Cafe", 10)).rejects.toThrow("LIVE_PROVIDER_ERROR:REQUEST_DENIED");
  });

  it("marks reply and email templates as generated", () => {
    const source = generatedTextSource("reply and email");
    expect(source.mode).toBe("generated");
    expect(source.endpoint).toBe("client/src/lib/generators.ts");
  });
});
