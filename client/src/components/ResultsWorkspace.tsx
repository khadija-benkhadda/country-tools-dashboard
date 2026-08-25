// Civic Index design note: imported results are treated as a local evidence table — preserve structure, surface scale, and keep every mutation reversible.
import { useMemo, useRef, useState } from "react";
import { Check, Clipboard, Download, FileSpreadsheet, Search, Shuffle, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { exportRows, filterRows, formatRowsForExport, parseUploadedFile, randomizeRows, type ExportFormat, type ImportedDataset, type ResultRow } from "@/lib/resultIO";

type ResultsWorkspaceProps = {
  dataset: ImportedDataset | null;
  onDatasetChange: (dataset: ImportedDataset | null) => void;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const copyText = async (value: string, label = "Result copied") => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(label);
  } catch {
    toast.error("Copy failed — select the text manually.");
  }
};

function RowCopyButton({ row }: { row: ResultRow }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyText(JSON.stringify(row, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return <button className="inline-action inline-action--compact" type="button" onClick={handleCopy}>{copied ? <Check size={14} /> : <Clipboard size={14} />}<span>{copied ? "Copied" : "Copy"}</span></button>;
}

export default function ResultsWorkspace({ dataset, onDatasetChange }: ResultsWorkspaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");

  const filteredRows = useMemo(() => dataset ? filterRows(dataset.rows, query) : [], [dataset, query]);
  const previewRows = filteredRows.slice(0, 80);
  const hasMore = filteredRows.length > previewRows.length;

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      onDatasetChange(parsed);
      setQuery("");
      toast.success(`${parsed.rows.length.toLocaleString()} rows loaded from ${parsed.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read this file.");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearResults = () => {
    onDatasetChange(null);
    setQuery("");
    toast.success("Uploaded results cleared");
  };

  const shuffleResults = () => {
    if (!dataset) return;
    onDatasetChange({ ...dataset, rows: randomizeRows(dataset.rows) });
    toast.success("Uploaded results randomized");
  };

  const copyAllResults = () => {
    if (!dataset) return;
    const tsv = [dataset.columns.join("\t"), ...dataset.rows.map((row) => dataset.columns.map((column) => formatValue(row[column]).replaceAll("\t", " ").replaceAll("\n", " ")).join("\t"))].join("\n");
    copyText(tsv, `${dataset.rows.length.toLocaleString()} results copied`);
  };

  const downloadResults = () => {
    if (!dataset) return;
    const exportData = formatRowsForExport(filteredRows, dataset.columns);
    exportRows(exportData, exportFormat, `${dataset.filename.replace(/\.[^/.]+$/, "")}-filtered`);
    toast.success(`${filteredRows.length.toLocaleString()} rows exported as ${exportFormat.toUpperCase()}`);
  };

  return (
    <section className={cx("import-workspace", !dataset && "import-workspace--empty")}>
      <div className="import-workspace__header">
        <div className="import-workspace__title"><span className="import-icon"><FileSpreadsheet size={17} /></span><div><div className="eyebrow-line"><span className="orange-line" /> Local results desk</div><h2>Upload Results</h2><p>Open a previous CSV, JSON, or Excel export directly in this browser.</p></div></div>
        <div className="import-workspace__badge">FRONTEND ONLY<br /><strong>NO BACKEND</strong></div>
      </div>
      <div className="import-workspace__controls">
        <input ref={inputRef} className="visually-hidden-input" type="file" accept=".csv,.json,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => handleFile(event.target.files?.[0])} />
        <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}><Upload size={15} /> Upload Results</button>
        <button className="secondary-button" type="button" onClick={copyAllResults} disabled={!dataset}><Clipboard size={15} /> Copy all results</button>
        <button className="secondary-button" type="button" onClick={clearResults} disabled={!dataset}><Trash2 size={15} /> Clear Results</button>
        <button className="secondary-button" type="button" onClick={shuffleResults} disabled={!dataset}><Shuffle size={15} /> Randomize Results</button>
        <span className="export-control"><label htmlFor="export-format">Export as</label><select id="export-format" value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)} disabled={!dataset}><option value="csv">CSV</option><option value="xlsx">Excel</option><option value="json">JSON</option></select><button className="secondary-button" type="button" onClick={downloadResults} disabled={!dataset}><Download size={15} /> Export Results</button></span>
      </div>
      {dataset ? <>
        <div className="import-workspace__meta"><div><span className="status-dot" /> <strong>{dataset.filename}</strong><span className="format-tag">{dataset.format.toUpperCase()}</span></div><span>{dataset.rows.length.toLocaleString()} total rows · {dataset.columns.length} columns</span></div>
        <div className="import-workspace__search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search across all uploaded columns" /><span>{filteredRows.length.toLocaleString()} matching</span>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={14} /></button>}</div>
        <div className="import-table-wrap"><table className="import-table"><thead><tr><th className="import-row-number">#</th>{dataset.columns.map((column) => <th key={column}>{column}</th>)}<th>Action</th></tr></thead><tbody>{previewRows.map((row, index) => <tr key={`${dataset.filename}-${index}`}><td className="import-row-number">{String(index + 1).padStart(2, "0")}</td>{dataset.columns.map((column) => <td key={column} title={formatValue(row[column])}>{formatValue(row[column])}</td>)}<td><RowCopyButton row={row} /></td></tr>)}</tbody></table>{previewRows.length === 0 && <div className="import-empty"><Search size={18} /><span>No uploaded rows match this search.</span></div>}</div>
        {hasMore && <div className="import-workspace__footer">Showing the first 80 matching rows for a responsive preview. Export Results includes all {filteredRows.length.toLocaleString()} matching rows.<span>LOCAL PREVIEW / FULL DATA RETAINED</span></div>}
      </> : <div className="import-empty import-empty--large"><Upload size={22} /><div><strong>Drop in a previous result set.</strong><p>Your file stays in this browser. We preserve the original column names and values where possible.</p></div></div>}
    </section>
  );
}
