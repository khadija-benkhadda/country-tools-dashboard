// Civic Index design note: imported data remains local, inspectable, and reversible; exports preserve columns whenever the browser format allows it.
import * as XLSX from "xlsx";

export type ResultValue = string | number | boolean | null | undefined;
export type ResultRow = Record<string, ResultValue>;
export type ImportFormat = "csv" | "json" | "xlsx";
export type ExportFormat = "csv" | "json" | "xlsx";

export type ImportedDataset = {
  rows: ResultRow[];
  columns: string[];
  filename: string;
  format: ImportFormat;
};

const parseScalar = (value: string): ResultValue => {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
};

const parseCsv = (source: string): ResultRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (character === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map((header, index) => header.trim() || `Column ${index + 1}`);
  return rows.slice(1).map((values) => headers.reduce<ResultRow>((result, header, index) => {
    result[header] = parseScalar(values[index] ?? "");
    return result;
  }, {}));
};

const normalizeRows = (input: unknown): ResultRow[] => {
  const candidate = Array.isArray(input)
    ? input
    : input && typeof input === "object"
      ? ((input as { results?: unknown; data?: unknown }).results ?? (input as { data?: unknown }).data ?? [input])
      : [input];
  if (!Array.isArray(candidate)) return [];
  return candidate.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) return item as ResultRow;
    return { value: item as ResultValue };
  });
};

const collectColumns = (rows: ResultRow[]) => Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

export const parseUploadedFile = async (file: File): Promise<ImportedDataset> => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    const source = await file.text();
    const rows = parseCsv(source);
    return { rows, columns: collectColumns(rows), filename: file.name, format: "csv" };
  }
  if (extension === "json") {
    const parsed = JSON.parse(await file.text()) as unknown;
    const rows = normalizeRows(parsed);
    return { rows, columns: collectColumns(rows), filename: file.name, format: "json" };
  }
  if (extension === "xlsx" || extension === "xls") {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = normalizeRows(XLSX.utils.sheet_to_json(firstSheet, { defval: "" }));
    return { rows, columns: collectColumns(rows), filename: file.name, format: "xlsx" };
  }
  throw new Error("Unsupported format. Please upload a .csv, .json, or .xlsx file.");
};

export const filterRows = (rows: ResultRow[], query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) => Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(normalized)));
};

export const randomizeRows = (rows: ResultRow[]) => {
  const copy = [...rows];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

const csvEscape = (value: ResultValue) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const rowsToCsv = (rows: ResultRow[], columns = collectColumns(rows)) => {
  const header = columns.map(csvEscape).join(",");
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","));
  return [header, ...body].join("\n");
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportRows = (rows: ResultRow[], format: ExportFormat, filename = "country-tools-results") => {
  const safeBase = filename.replace(/\.[^/.]+$/, "");
  if (format === "json") {
    downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }), `${safeBase}.json`);
    return;
  }
  if (format === "xlsx") {
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Results");
    XLSX.writeFile(workbook, `${safeBase}.xlsx`);
    return;
  }
  downloadBlob(new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" }), `${safeBase}.csv`);
};

export const formatRowsForExport = (rows: ResultRow[], columns: string[]) => rows.map((row) => columns.reduce<ResultRow>((result, column) => {
  result[column] = row[column] ?? "";
  return result;
}, {}));
