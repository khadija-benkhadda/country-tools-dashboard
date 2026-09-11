import { makeRequest } from "./_core/map";
import { makeDataQuality, normalizeForDeduplication, uniqueBy, type QualityBatch } from "@shared/types";

export type SourceMeta = { source: string; endpoint: string; fetchedAt: string; mode: "live" | "generated" };
export type LiveTrend = { id: string; keyword: string; category: string; trendType: string; score?: number; searchQuery: string; source: SourceMeta };
export type LiveAddress = { id: string; formatted: string; houseNumber?: number; street: string; city: string; region: string; postalCode: string; country: string; source: SourceMeta };
export type LivePlace = { id: string; query: string; placeType: string; city: string; region: string; country: string; mapsUrl: string; source: SourceMeta };
export type LiveDocument = { id: string; query: string; title: string; author: string; year: string; key: string; contentType: string; topic: string; source: string; resourceUrl: string; sourceMeta: SourceMeta };
export type QualityResult<T> = QualityBatch<T> & { source?: SourceMeta; sourceErrors?: string[] };

const now = () => new Date().toISOString();
const requestedCount = (count: number) => Math.max(1, Math.min(Math.trunc(count), 1000));

function finish<T>(requested: number, retrieved: number, rows: T[], key: (row: T) => string): QualityBatch<T> {
  const valid = rows.filter((row) => Boolean(key(row).trim()));
  const unique = uniqueBy(valid, key);
  return { rows: unique.slice(0, requested), quality: makeDataQuality(requested, retrieved, unique.length) };
}

export function assertProviderStatus(value: unknown): void {
  if (!value || typeof value !== "object" || !("status" in value)) return;
  const status = String((value as { status?: unknown }).status ?? "").toUpperCase();
  if (["OVER_QUERY_LIMIT", "RESOURCE_EXHAUSTED", "RATE_LIMITED"].includes(status)) throw new Error("LIVE_QUOTA_EXCEEDED");
  if (status && !["OK", "ZERO_RESULTS"].includes(status)) throw new Error(`LIVE_PROVIDER_ERROR:${status}`);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "CountryTools/1.0" } });
  if (!response.ok) throw new Error(response.status === 429 ? "LIVE_QUOTA_EXCEEDED" : `Live source failed: ${response.status}`);
  const payload = (await response.json()) as T;
  assertProviderStatus(payload);
  return payload;
}

export async function fetchTrends(countryCode: string, count: number, category: string): Promise<QualityResult<LiveTrend>> {
  const requested = requestedCount(count); const codes = countryCode.split(",").map((code) => code.trim().toUpperCase()).filter(Boolean); const all: LiveTrend[] = []; const sourceErrors: string[] = [];
  for (const code of codes) {
    try {
      const endpoint = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(code)}`; const response = await fetch(endpoint, { headers: { Accept: "application/rss+xml, application/xml", "User-Agent": "CountryTools/1.0" } });
      if (!response.ok) throw new Error(response.status === 429 ? "LIVE_QUOTA_EXCEEDED" : `HTTP ${response.status}`);
      const xml = await response.text(); if (/OVER_QUERY_LIMIT|RESOURCE_EXHAUSTED/i.test(xml)) throw new Error("LIVE_QUOTA_EXCEEDED");
      const source: SourceMeta = { source: "Google Trends Trending RSS", endpoint, fetchedAt: now(), mode: "live" }; const keywords = Array.from(xml.matchAll(/<item>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<\/item>/g)).map((match) => match[1]?.trim() ?? "").filter(Boolean);
      all.push(...keywords.map((keyword, index) => ({ id: `trend-${code}-${index}`, keyword, category, trendType: "Live trending search", searchQuery: keyword, source })));
    } catch (error) {
      sourceErrors.push(`${code}: ${error instanceof Error ? error.message : "source error"}`);
    }
  }
  const result = finish(requested, all.length, all, (row) => normalizeForDeduplication(row.keyword)); return { ...result, source: all[0]?.source, sourceErrors };
}

type MapsPlaceRow = { place_id?: string; name?: string; formatted_address?: string; types?: string[] }; type MapsPlacesResponse = { results?: MapsPlaceRow[]; status?: string; next_page_token?: string };

export async function fetchAddresses(countryName: string, count: number): Promise<QualityResult<LiveAddress>> {
  const requested = requestedCount(count); const endpoint = "/maps/api/place/textsearch/json"; const response = await makeRequest<MapsPlacesResponse>(endpoint, { query: `addresses and landmarks in ${countryName}`, language: "en" }); assertProviderStatus(response);
  const source: SourceMeta = { source: "Google Maps Places Text Search API via Manus proxy", endpoint, fetchedAt: now(), mode: "live" };
  const rows = (response.results ?? []).filter((row) => Boolean(row.formatted_address?.trim())).map((row, index) => { const formatted = row.formatted_address!.trim(); const pieces = formatted.split(",").map((item) => item.trim()); const numberMatch = formatted.match(/^([0-9]+)/); return { id: row.place_id ?? `address-${index}`, formatted, houseNumber: numberMatch ? Number.parseInt(numberMatch[1], 10) : undefined, street: pieces[0] ?? row.name ?? "", city: pieces.length > 1 ? pieces[pieces.length - 2] : "", region: "", postalCode: "", country: countryName, source }; });
  return { ...finish(requested, (response.results ?? []).length, rows, (row) => row.formatted), source };
}

export async function fetchPlaces(countryName: string, placeType: string, count: number): Promise<QualityResult<LivePlace>> {
  const requested = requestedCount(count); const query = `${placeType === "Random" ? "popular places" : placeType} in ${countryName}`; const endpoint = "/maps/api/place/textsearch/json"; const response = await makeRequest<MapsPlacesResponse>(endpoint, { query, language: "en" }); assertProviderStatus(response); const source: SourceMeta = { source: "Google Maps Places Text Search API via Manus proxy", endpoint, fetchedAt: now(), mode: "live" };
  const rows = (response.results ?? []).filter((row) => Boolean(row.place_id && row.name && row.formatted_address)).map((row) => { const address = row.formatted_address!.trim(); const pieces = address.split(",").map((item) => item.trim()); return { id: row.place_id!, query: `${row.name!.trim()} — ${address}`, placeType: row.types?.[0] ?? placeType, city: pieces.length > 1 ? pieces[pieces.length - 2] : "", region: "", country: countryName, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${row.name} ${address}`)}`, source }; });
  return { ...finish(requested, (response.results ?? []).length, rows, (row) => row.id || row.query), source };
}

type OpenLibraryDoc = { key?: string; title?: string; author_name?: string[]; first_publish_year?: number; isbn?: string[] }; type OpenLibraryResponse = { docs?: OpenLibraryDoc[]; numFound?: number };

export async function fetchDocuments(topic: string, count: number, contentType: string): Promise<QualityResult<LiveDocument>> {
  const requested = requestedCount(count); const all: OpenLibraryDoc[] = []; const pages = Math.min(10, Math.ceil(requested / 100));
  for (let page = 1; page <= pages; page += 1) { const endpoint = `https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&page=${page}&limit=100&fields=key,title,author_name,first_publish_year,isbn`; const response = await fetchJson<OpenLibraryResponse>(endpoint); all.push(...(response.docs ?? [])); if (!response.docs?.length || all.length >= requested) break; }
  const source: SourceMeta = { source: "Open Library Search API", endpoint: `https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&limit=100`, fetchedAt: now(), mode: "live" };
  const rows = all.filter((row) => Boolean(row.key && row.title?.trim())).map((row, index) => { const title = row.title!.trim(); const author = row.author_name?.[0]?.trim() ?? ""; const key = row.key!.trim(); return { id: key || `book-${index}`, key, title, author, year: row.first_publish_year ? String(row.first_publish_year) : "", query: title, contentType, topic, source: source.source, resourceUrl: `https://openlibrary.org${key}`, sourceMeta: source }; });
  return { ...finish(requested, all.length, rows, (row) => row.key || `${row.title}|${row.author}|${row.year}`), source };
}

export function generatedTextSource(kind: string): SourceMeta { return { source: `Local ${kind} template generator`, endpoint: "client/src/lib/generators.ts", fetchedAt: now(), mode: "generated" }; }
export function qualityForGenerated<T>(requested: number, retrieved: number, rows: T[], key: (row: T) => string): QualityBatch<T> { return finish(requestedCount(requested), retrieved, rows, key); }
