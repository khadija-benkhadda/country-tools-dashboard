/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export type DataQuality = {
  requested: number;
  retrieved: number;
  unique: number;
  displayed: number;
  status: "complete" | "partial" | "empty";
  message: string;
};

export type QualityBatch<T> = {
  rows: T[];
  quality: DataQuality;
};

export const makeDataQuality = (requested: number, retrieved: number, unique: number): DataQuality => {
  const displayed = Math.min(requested, unique);
  const status = displayed === 0 ? "empty" : displayed < requested ? "partial" : "complete";
  return {
    requested,
    retrieved,
    unique,
    displayed,
    status,
    message: status === "complete"
      ? "Requested count reached with validated unique records."
      : status === "partial"
        ? "Not enough validated unique records were available from the configured source."
        : "No validated records were returned by the configured source.",
  };
};

export const normalizeForDeduplication = (value: string) => value
  .normalize("NFKC")
  .trim()
  .toLocaleLowerCase()
  .replace(/\s+/g, " ")
  .replace(/[.,;:!?()[\]{}'"“”‘’`]/g, "")
  .replace(/\bhttps?:\/\//g, "")
  .replace(/\/+$/g, "");

export const uniqueBy = <T,>(rows: T[], key: (row: T) => string) => {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const normalized = normalizeForDeduplication(key(row));
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};
