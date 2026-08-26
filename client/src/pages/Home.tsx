// Civic Index design note: this page is the research desk — orient first, reveal useful synthetic outputs, and keep external actions explicit.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import ResultsWorkspace from "@/components/ResultsWorkspace";
import {
  BookOpen,
  Check,
  FileSpreadsheet,
  ChevronDown,
  Clipboard,
  Compass,
  ExternalLink,
  Flame,
  Globe2,
  Layers3,
  Lightbulb,
  Map,
  MapPin,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Sun,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { countryProfiles, defaultCountry, findCountry, type CountryProfile } from "@/lib/countryData";
import { exportRows, filterRows, formatRowsForExport, parseUploadedFile, randomizeRows, type ExportFormat, type ImportedDataset, type ResultRow } from "@/lib/resultIO";
import {
  defaultToolCounts,
  documentTypeOptions,
  generateAddresses,
  generateMapQueries,
  generatePdfQueries,
  generateTrendIdeas,
  languageOptions,
  openGoogleMaps,
  openGoogleTrends,
  placeTypeOptions,
  trendCategoryOptions,
  type DocumentQuery,
  type PlaceQuery,
  type SyntheticAddress,
  type TrendIdea,
} from "@/lib/generators";

const navItems = [
  { id: "overview", href: "/", label: "Dashboard", icon: Compass },
  { id: "trends", href: "/trends", label: "Trends Explorer", icon: Flame },
  { id: "addresses", href: "/addresses", label: "Address Generator", icon: MapPin },
  { id: "places", href: "/places", label: "Places Explorer", icon: Map },
  { id: "documents", href: "/documents", label: "PDF & Book Finder", icon: BookOpen },
  { id: "results", href: "/results", label: "Upload Results", icon: FileSpreadsheet },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const resultCountOptions = ["1,000", "2,000", "5,000", "10,000"];
const parseResultCount = (value: string) => Number(value.replaceAll(",", ""));
const formatCount = (value: number) => value.toLocaleString("en-US");

function copyToClipboard(text: string, label = "Copied to clipboard") {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast.success(label)).catch(() => toast.error("Copy failed — select the text manually."));
  } else {
    toast.error("Clipboard unavailable in this browser.");
  }
}

function stripCountrySuffix(value: string, countryName: string) {
  const escapedCountry = countryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(new RegExp(`\\s*,?\\s*${escapedCountry}\\s*$`, "i"), "").trim();
}

function copyAllResults<T>(rows: T[], formatter: (row: T) => string, label: string, countryName: string) {
  copyToClipboard(rows.map((row) => stripCountrySuffix(formatter(row), countryName)).join("\n"), `${rows.length.toLocaleString()} ${label} copied`);
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function CopyButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button className={cx("inline-action", compact && "inline-action--compact")} onClick={handleCopy} type="button" aria-label="Copy result">
      {copied ? <Check size={14} /> : <Clipboard size={14} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function ExternalButton({ label, url, icon = <ExternalLink size={14} />, tone = "quiet" }: { label: string; url: string; icon?: React.ReactNode; tone?: "quiet" | "accent" }) {
  return (
    <button className={cx("inline-action", tone === "accent" && "inline-action--accent")} type="button" onClick={() => openExternal(url)}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SelectControl({ label, value, onChange, options, className = "" }: { label: string; value: string; onChange: (value: string) => void; options: string[]; className?: string }) {
  return (
    <label className={cx("field-control", className)}>
      <span>{label}</span>
      <span className="select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </span>
    </label>
  );
}

function CountrySelect({ country, onChange, compact = false }: { country: CountryProfile; onChange: (country: CountryProfile) => void; compact?: boolean }) {
  return (
    <label className={cx("country-select", compact && "country-select--compact")}>
      <span className="country-select__eyebrow"><Globe2 size={13} /> Research country</span>
      <span className="country-select__control">
        <span className="country-code">{country.code}</span>
        <select value={country.code} onChange={(event) => onChange(findCountry(event.target.value))} aria-label="Select country">
          {countryProfiles.map((profile) => <option value={profile.code} key={profile.code}>{profile.name}</option>)}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
}

function SectionIntro({ index, eyebrow, title, description, icon: Icon, note }: { index: string; eyebrow: string; title: string; description: string; icon: typeof Flame; note?: string }) {
  return (
    <div className="section-intro">
      <div className="section-intro__index">{index}</div>
      <div className="section-intro__copy">
        <div className="eyebrow-line"><Icon size={14} /> {eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {note && <div className="section-intro__note">{note}</div>}
    </div>
  );
}

function ToolCard({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cx("tool-card", className)}>{children}</section>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><Layers3 size={22} /><p>{text}</p></div>;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [country, setCountry] = useState<CountryProfile>(() => findCountry(localStorage.getItem("country-tools-country") ?? defaultCountry.code));
  const [location] = useLocation();
  const activeNavItem = navItems.find((item) => item.href === location) ?? navItems[0];
  const activeTool = activeNavItem.id;
  const isOverview = activeTool === "overview";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastAction, setLastAction] = useState("Ready for a new set");

  const [trendCategory, setTrendCategory] = useState("All");
  const [trendCount, setTrendCount] = useState("1,000");
  const [trendFilter, setTrendFilter] = useState("");
  const [trends, setTrends] = useState<TrendIdea[]>(() => generateTrendIdeas(defaultCountry, "All", defaultToolCounts.trends));

  const [addressCount, setAddressCount] = useState("1,000");
  const [addresses, setAddresses] = useState<SyntheticAddress[]>(() => generateAddresses(defaultCountry, defaultToolCounts.addresses));

  const [placeType, setPlaceType] = useState("Random");
  const [placeCount, setPlaceCount] = useState("1,000");
  const [places, setPlaces] = useState<PlaceQuery[]>(() => generateMapQueries(defaultCountry, "Random", defaultToolCounts.places));

  const [documentType, setDocumentType] = useState("Guide");
  const [documentLanguage, setDocumentLanguage] = useState("Any");
  const [documentCount, setDocumentCount] = useState("1,000");
  const [topic, setTopic] = useState("marketing");
  const [documents, setDocuments] = useState<DocumentQuery[]>(() => generatePdfQueries("marketing", defaultCountry, "Guide", "Any", defaultToolCounts.documents));
  const [importedDataset, setImportedDataset] = useState<ImportedDataset | null>(null);

  useEffect(() => {
    localStorage.setItem("country-tools-country", country.code);
    setTrends(generateTrendIdeas(country, trendCategory, parseResultCount(trendCount)));
    setAddresses(generateAddresses(country, parseResultCount(addressCount)));
    setPlaces(generateMapQueries(country, placeType, parseResultCount(placeCount)));
    setDocuments(generatePdfQueries(topic, country, documentType, documentLanguage, parseResultCount(documentCount)));
    setLastAction(`${country.name} context loaded`);
  }, [country]);

  const filteredTrends = useMemo(() => trends.filter((trend) => trend.keyword.toLowerCase().includes(trendFilter.toLowerCase()) || trend.category.toLowerCase().includes(trendFilter.toLowerCase())), [trends, trendFilter]);
  const trendPreview = filteredTrends.slice(0, 24);
  const addressPreview = addresses.slice(0, 24);
  const placePreview = places.slice(0, 24);
  const documentPreview = documents.slice(0, 24);

  const closeMobileNav = () => setMobileNavOpen(false);

  const generateTrendsNow = () => {
    setTrends(generateTrendIdeas(country, trendCategory, parseResultCount(trendCount)));
    setLastAction(`New ${trendCategory.toLowerCase()} pulse generated`);
    toast.success("Trend ideas refreshed");
  };

  const generateAddressesNow = () => {
    setAddresses(generateAddresses(country, parseResultCount(addressCount)));
    setLastAction("Synthetic addresses randomized");
    toast.success("Address set refreshed");
  };

  const generatePlacesNow = () => {
    setPlaces(generateMapQueries(country, placeType, parseResultCount(placeCount)));
    setLastAction("Map queries randomized");
    toast.success("Places set refreshed");
  };

  const generateDocumentsNow = () => {
    setDocuments(generatePdfQueries(topic, country, documentType, documentLanguage, parseResultCount(documentCount)));
    setLastAction("Open-access search queries generated");
    toast.success("Search ideas refreshed");
  };

  const randomizeEverything = () => {
    const otherCountries = countryProfiles.filter((profile) => profile.code !== country.code);
    const nextCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
    setCountry(nextCountry);
    const nextTrends = generateTrendIdeas(nextCountry, trendCategory, parseResultCount(trendCount));
    const nextAddresses = generateAddresses(nextCountry, parseResultCount(addressCount));
    const nextPlaces = generateMapQueries(nextCountry, placeType, parseResultCount(placeCount));
    const nextDocuments = generatePdfQueries(topic, nextCountry, documentType, documentLanguage, parseResultCount(documentCount));
    setTrends(nextTrends);
    setAddresses(nextAddresses);
    setPlaces(nextPlaces);
    setDocuments(nextDocuments);
    setLastAction(`Everything randomized for ${nextCountry.name}`);
    toast.success(`New research set: ${nextCountry.name}`);
  };

  return (
    <div className="app-shell">
      <aside className={cx("sidebar", mobileNavOpen && "sidebar--open")}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /><span /></div>
          <div><div className="brand-wordmark">COUNTRY</div><div className="brand-submark">TOOLS / INDEX</div></div>
          <button className="mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="sidebar-rule" />
        <div className="sidebar-label">Workspace</div>
        <nav className="primary-nav" aria-label="Primary navigation">
          {navItems.map(({ id, href, label, icon: Icon }) => (
            <Link className={cx("nav-item", activeTool === id && "nav-item--active")} key={id} href={href} onClick={closeMobileNav}>
              <Icon size={17} />
              <span>{label}</span>
              {activeTool === id && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-footer"><span>CT / 01</span><span>v1.0.0</span></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar__left"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><span className="topbar-breadcrumb">RESEARCH DESK <span>/</span> COUNTRY TOOLS</span></div>
          <div className="topbar__right">
            <span className="last-action"><span className="status-dot" /> {lastAction}</span>
            <button className="icon-button" onClick={toggleTheme} type="button" aria-label="Toggle dark mode">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="randomize-button" onClick={randomizeEverything} type="button"><RefreshCw size={15} /> <span>Randomize all</span></button>
          </div>
        </header>

        <div className="workspace">
          <section className="workspace-toolbar" aria-label="Current workspace">
            <div className="workspace-toolbar__identity"><span className="eyebrow">Selected country</span><strong>{country.name}</strong><span className="workspace-toolbar__region">{country.code} · {country.region}</span></div>
            <CountrySelect country={country} onChange={setCountry} compact />
          </section>

          <div className="workspace-intro"><div><span className="eyebrow">{isOverview ? "01 / TOOLKIT" : `${String(navItems.findIndex((item) => item.id === activeTool) + 1).padStart(2, "0")} / INTERFACE`}</span><h2>{isOverview ? "Pick a signal. Build a route." : activeNavItem.label}</h2></div><p>{isOverview ? <>All generators use <strong>{country.name}</strong> as their shared context. Synthetic outputs are clearly marked; Google destinations are only a click away.</> : <>Focused interface for <strong>{country.name}</strong>. Change country above, then generate a fresh working set.</>}</p></div>

          {activeTool === "results" && <ResultsWorkspace dataset={importedDataset} onDatasetChange={setImportedDataset} />}

          <div className={cx("tool-grid", !isOverview && "tool-grid--single")}>
            {(isOverview || activeTool === "trends") && <ToolCard id="trends" className="tool-card--wide">
              <SectionIntro index="01" eyebrow="Trend signal" title="Google Trends Explorer" description="Create country-aware keyword angles to validate in Google Trends." icon={Flame} note="DEMO DATA / NO LIVE API" />
              <div className="tool-controls"><SelectControl label="Category" value={trendCategory} onChange={setTrendCategory} options={trendCategoryOptions} /><SelectControl label="Results" value={trendCount} onChange={setTrendCount} options={resultCountOptions} /><label className="field-control search-control"><span>Filter results</span><span className="input-wrap"><Search size={15} /><input value={trendFilter} onChange={(event) => setTrendFilter(event.target.value)} placeholder="Search this set" /></span></label><button className="primary-button" onClick={generateTrendsNow} type="button"><RefreshCw size={15} /> Build trend set</button><button className="secondary-button" onClick={() => copyAllResults(trends, (trend) => trend.searchQuery, "trend results", country.name)} type="button"><Clipboard size={15} /> Copy all results</button></div>
              <div className="notice-banner"><Lightbulb size={16} /><span><strong>Generated trend ideas</strong> — randomized country examples, not real-time Google Trends data. Use the links below to validate live interest.</span></div>
              {filteredTrends.length === 0 && <EmptyState text="No trend ideas match this filter. Try a broader phrase or generate a new set." />}
              {filteredTrends.length > 0 && <div className="result-table result-table--trends"><div className="table-head"><span>#</span><span>Keyword / topic</span><span>Category</span><span>Signal</span><span>Actions</span></div>{trendPreview.map((trend, index) => <div className="table-row" key={trend.id}><span className="row-number">{String(index + 1).padStart(2, "0")}</span><div className="result-main"><strong>{trend.keyword}</strong><small>{trend.searchQuery}</small></div><Badge variant="outline" className="soft-badge">{trend.category}</Badge><div className="signal-score"><span className="score-bar"><i style={{ width: `${trend.score}%` }} /></span><small>{trend.trendType}</small></div><div className="row-actions"><CopyButton text={stripCountrySuffix(trend.searchQuery, country.name)} compact /><ExternalButton label="Validate trends" url={openGoogleTrends(trend.keyword)} tone="accent" /></div></div>)}</div>}
              {filteredTrends.length > trendPreview.length && <div className="preview-note">Previewing {trendPreview.length.toLocaleString()} of {filteredTrends.length.toLocaleString()} generated ideas. The full collection stays in memory for filtering and export.</div>}
            </ToolCard>}

            {(isOverview || activeTool === "addresses") && <ToolCard id="addresses" className="tool-card--address">
              <SectionIntro index="02" eyebrow="Location seed" title="Random Address Generator" description="Create plausible address-shaped context for demos and search exploration." icon={MapPin} note="SYNTHETIC ONLY" />
              <div className="tool-controls tool-controls--two"><SelectControl label="Addresses" value={addressCount} onChange={setAddressCount} options={resultCountOptions} /><button className="primary-button" onClick={generateAddressesNow} type="button"><RefreshCw size={15} /> Make synthetic addresses</button><button className="secondary-button" onClick={() => copyAllResults(addresses, (address) => address.formatted, "address results", country.name)} type="button"><Clipboard size={15} /> Copy all results</button></div>
              <div className="notice-banner notice-banner--warm"><MapPin size={16} /><span><strong>Synthetic / Random Address</strong> — not guaranteed to be a real location. Verify before using.</span></div>
              <div className="address-list">{addressPreview.map((address) => <article className="address-row" key={address.id}><div className="address-pin"><MapPin size={15} /></div><div className="address-copy"><strong>{address.houseNumber} {address.street} Street</strong><span>{address.city}, {address.region} {address.postalCode}</span><small>{address.country}</small></div><div className="row-actions"><CopyButton text={stripCountrySuffix(address.formatted, country.name)} compact /><ExternalButton label="Google Maps" url={openGoogleMaps(address.formatted)} icon={<Map size={14} />} tone="accent" /></div></article>)}</div><div className="preview-note">Previewing {addressPreview.length.toLocaleString()} of {addresses.length.toLocaleString()} generated addresses. The full collection stays available for future export workflows.</div>
            </ToolCard>}

            {(isOverview || activeTool === "places") && <ToolCard id="places" className="tool-card--places">
              <div className="places-visual"><div className="places-visual__overlay" /><div className="places-visual__label"><span className="eyebrow">03 / MAP INDEX</span><strong>Find a place<br />to begin.</strong></div><div className="map-crosshair"><span /><span /></div></div>
              <div className="tool-card__body"><SectionIntro index="03" eyebrow="Place query" title="Random Places Explorer" description="Turn a country and a place type into ready-to-search Google Maps prompts." icon={Map} note="SEARCH IDEAS" /><div className="tool-controls tool-controls--three"><SelectControl label="Place type" value={placeType} onChange={setPlaceType} options={placeTypeOptions} /><SelectControl label="Queries" value={placeCount} onChange={setPlaceCount} options={resultCountOptions} /><button className="primary-button" onClick={generatePlacesNow} type="button"><RefreshCw size={15} /> Build map queries</button><button className="secondary-button" onClick={() => copyAllResults(places, (place) => place.query, "place results", country.name)} type="button"><Clipboard size={15} /> Copy all results</button></div><div className="notice-banner notice-banner--teal"><Target size={16} /><span>Search query generated by the tool. Verify the location on Google Maps.</span></div><div className="place-list">{placePreview.map((place) => <article className="place-row" key={place.id}><div className="place-icon"><Map size={16} /></div><div className="place-copy"><div><Badge variant="outline" className="soft-badge soft-badge--teal">{place.placeType}</Badge><span className="place-region">{place.region}</span></div><strong>{place.query}</strong><small>{place.city}, {place.country}</small></div><div className="row-actions"><CopyButton text={stripCountrySuffix(place.query, country.name)} compact /><ExternalButton label="Google Maps" url={openGoogleMaps(place.query)} icon={<ExternalLink size={14} />} tone="accent" /></div></article>)}</div><div className="preview-note">Previewing {placePreview.length.toLocaleString()} of {places.length.toLocaleString()} generated map queries. The full collection stays in memory.</div></div>
            </ToolCard>}

            {(isOverview || activeTool === "documents") && <ToolCard id="documents" className="tool-card--documents">
              <SectionIntro index="04" eyebrow="Open access route" title="PDF & Book Finder" description="Create short public-document queries in the format: book name + pdf." icon={BookOpen} note="LEGAL DISCOVERY" />
              <div className="tool-controls tool-controls--document"><SelectControl label="Content type" value={documentType} onChange={setDocumentType} options={documentTypeOptions} /><label className="field-control topic-control"><span>Topic</span><span className="input-wrap"><Search size={15} /><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. javascript" /></span></label><SelectControl label="Language" value={documentLanguage} onChange={setDocumentLanguage} options={languageOptions} /><SelectControl label="Queries" value={documentCount} onChange={setDocumentCount} options={resultCountOptions} /><button className="primary-button" onClick={generateDocumentsNow} type="button"><RefreshCw size={15} /> Build public queries</button><button className="secondary-button" onClick={() => copyAllResults(documents, (document) => document.query, "document results", country.name)} type="button"><Clipboard size={15} /> Copy all results</button></div>
              <div className="notice-banner notice-banner--safe"><BookOpen size={16} /><span><strong>Publicly available material only.</strong> These queries do not bypass paywalls, DRM, copyright restrictions, or access controls.</span></div>
              <div className="document-list">{documentPreview.map((document) => <article className="document-row" key={document.id}><div className="document-index">PDF</div><div className="document-copy"><strong>{document.query}</strong></div><div className="row-actions"><CopyButton text={stripCountrySuffix(document.query, country.name)} compact /></div></article>)}</div><div className="preview-note">Previewing {documentPreview.length.toLocaleString()} of {documents.length.toLocaleString()} generated document queries. The full collection stays in memory.</div>
            </ToolCard>}
          </div>

          <footer className="workspace-footer"><div><div className="footer-mark"><span className="orange-line" /> CT / COUNTRY TOOLS</div><p>A transparent frontend workspace for location-aware research prompts.</p></div><div className="footer-links"><span>NO API KEY</span><span>LOCAL STORAGE</span><span>DEMO DATA LABELLED</span></div></footer>
        </div>
      </main>
    </div>
  );
}
