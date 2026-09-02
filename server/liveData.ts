import { makeRequest } from "./_core/map";

export type SourceMeta = {
  source: string;
  endpoint: string;
  fetchedAt: string;
  mode: "live" | "generated";
};

export type LiveTrend = {
  id: string;
  keyword: string;
  category: string;
  trendType: string;
  score: number;
  searchQuery: string;
  source: SourceMeta;
};

export type LiveAddress = {
  id: string;
  formatted: string;
  houseNumber: number;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  source: SourceMeta;
};

export type LivePlace = {
  id: string;
  query: string;
  placeType: string;
  city: string;
  region: string;
  country: string;
  mapsUrl: string;
  source: SourceMeta;
};

export type LiveDocument = {
  id: string;
  query: string;
  title: string;
  author: string;
  year: string;
  key: string;
  contentType: string;
  topic: string;
  source: string;
  sourceMeta: SourceMeta;
};

const now = () => new Date().toISOString();

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

export async function fetchTrends(countryCode: string, count: number, category: string): Promise<LiveTrend[]> {
  const codes = countryCode.split(",").map((code) => code.trim()).filter(Boolean);
  const perCountry = Math.max(1, Math.ceil(count / Math.max(codes.length, 1)));
  const all: LiveTrend[] = [];
  for (const code of codes) {
    const endpoint = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(code)}`;
    const response = await fetch(endpoint, { headers: { Accept: "application/rss+xml, application/xml", "User-Agent": "CountryTools/1.0" } });
    if (!response.ok) throw new Error(response.status === 429 ? "LIVE_QUOTA_EXCEEDED" : `Google Trends RSS failed: ${response.status}`);
    const xml = await response.text();
    if (xml.includes("OVER_QUERY_LIMIT") || xml.includes("RESOURCE_EXHAUSTED")) throw new Error("LIVE_QUOTA_EXCEEDED");
    const keywords = Array.from(xml.matchAll(/<item>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<\/item>/g)).map((match) => match[1]?.trim() ?? "").filter(Boolean);
    const source: SourceMeta = { source: "Google Trends Trending RSS", endpoint, fetchedAt: now(), mode: "live" };
    all.push(...Array.from(new Set(keywords)).slice(0, perCountry).map((keyword, index) => ({ id: `trend-${code}-${index}-${Date.now()}`, keyword, category, trendType: "Live trending search", score: 100 - index, searchQuery: keyword, source })));
  }
  return all.slice(0, count);
}

type MapsGeocodeResponse = { results?: Array<{ place_id?: string; formatted_address?: string; address_components?: Array<{ long_name: string; types: string[] }> }>; status?: string };
type MapsPlaceRow = { place_id?: string; name?: string; formatted_address?: string; types?: string[] };
type MapsPlacesResponse = { results?: MapsPlaceRow[]; status?: string; next_page_token?: string };

type AddressComponent = { long_name: string; types: string[] };
const component = (components: AddressComponent[] | undefined, types: string[]) => components?.find((item: AddressComponent) => types.some((type) => item.types.includes(type)))?.long_name ?? "";

export async function fetchAddresses(countryName: string, count: number): Promise<LiveAddress[]> {
  const endpoint = "/maps/api/place/textsearch/json";
  const response = await makeRequest<MapsPlacesResponse>(endpoint, { query: `addresses and landmarks in ${countryName}`, language: "en" });
  assertProviderStatus(response);
  const source: SourceMeta = { source: "Google Maps Places Text Search API via Manus proxy", endpoint, fetchedAt: now(), mode: "live" };
  return (response.results ?? []).slice(0, count).map((row, index) => {
    const formatted = row.formatted_address ?? countryName;
    const numberMatch = formatted.match(/^([0-9]+)/);
    const pieces = formatted.split(",").map((item) => item.trim());
    const street = pieces[0] ?? row.name ?? "";
    const city = pieces.length > 1 ? pieces[pieces.length - 2] : countryName;
    return { id: row.place_id ?? `address-${index}`, formatted, houseNumber: Number.parseInt(numberMatch?.[1] ?? "0", 10), street, city, region: "", postalCode: "", country: countryName, source };
  });
}

export async function fetchPlaces(countryName: string, placeType: string, count: number): Promise<LivePlace[]> {
  const query = `${placeType === "Random" ? "popular places" : placeType} in ${countryName}`;
  const endpoint = "/maps/api/place/textsearch/json";
  const response = await makeRequest<MapsPlacesResponse>(endpoint, { query, language: "en" });
  assertProviderStatus(response);
  const source: SourceMeta = { source: "Google Maps Places Text Search API via Manus proxy", endpoint, fetchedAt: now(), mode: "live" };
  const unique = new Map<string, MapsPlaceRow>();
  for (const row of response.results ?? []) {
    const key = row.place_id ?? `${row.name ?? ""}|${row.formatted_address ?? ""}`;
    if (!unique.has(key)) unique.set(key, row);
  }
  return Array.from(unique.values()).slice(0, Math.min(count, 100)).map((row, index) => {
    const address = row.formatted_address ?? countryName;
    const pieces = address.split(",").map((item: string) => item.trim());
    const city = pieces.length > 1 ? pieces[pieces.length - 2] : countryName;
    return { id: row.place_id ?? `place-${index}`, query: `${row.name ?? placeType} — ${address}`, placeType: row.types?.[0] ?? placeType, city, region: "", country: countryName, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.name ?? query)}`, source };
  });
}

type OpenLibraryDoc = { key?: string; title?: string; author_name?: string[]; first_publish_year?: number };
type OpenLibraryResponse = { docs?: OpenLibraryDoc[]; numFound?: number };

export async function fetchDocuments(topic: string, count: number, contentType: string): Promise<LiveDocument[]> {
  const endpoint = `https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&limit=${Math.min(count, 100)}&fields=key,title,author_name,first_publish_year`;
  const response = await fetchJson<OpenLibraryResponse>(endpoint);
  const source: SourceMeta = { source: "Open Library Search API", endpoint, fetchedAt: now(), mode: "live" };
  const unique = new Map<string, OpenLibraryDoc>();
  for (const row of response.docs ?? []) {
    const key = row.key ?? row.title ?? "Untitled";
    if (!unique.has(key)) unique.set(key, row);
  }
  return Array.from(unique.values()).slice(0, Math.min(count, 100)).map((row, index) => ({ id: row.key ?? `book-${index}`, key: row.key ?? "", title: row.title ?? "Untitled", author: row.author_name?.[0] ?? "Unknown author", year: row.first_publish_year ? String(row.first_publish_year) : "", query: `${row.title ?? "Untitled"} pdf`, contentType, topic, source: source.source, sourceMeta: source }));
}

export function generatedTextSource(kind: string): SourceMeta {
  return { source: `Local ${kind} template generator`, endpoint: "client/src/lib/generators.ts", fetchedAt: now(), mode: "generated" };
}
