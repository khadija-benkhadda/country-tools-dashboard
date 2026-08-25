// Civic Index design note: this page is the research desk — orient first, reveal useful synthetic outputs, and keep external actions explicit.
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Check,
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
import {
  defaultToolCounts,
  documentTypeOptions,
  generateAddresses,
  generateMapQueries,
  generatePdfQueries,
  generateTrendIdeas,
  languageOptions,
  openGoogleMaps,
  openGoogleSearch,
  openGoogleTrends,
  placeTypeOptions,
  trendCategoryOptions,
  type DocumentQuery,
  type PlaceQuery,
  type SyntheticAddress,
  type TrendIdea,
} from "@/lib/generators";

const navItems = [
  { id: "overview", label: "Dashboard", icon: Compass },
  { id: "trends", label: "Trends Explorer", icon: Flame },
  { id: "addresses", label: "Address Generator", icon: MapPin },
  { id: "places", label: "Places Explorer", icon: Map },
  { id: "documents", label: "PDF & Book Finder", icon: BookOpen },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function copyToClipboard(text: string, label = "Copied to clipboard") {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast.success(label)).catch(() => toast.error("Copy failed — select the text manually."));
  } else {
    toast.error("Clipboard access is unavailable in this browser.");
  }
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
  const [activeTool, setActiveTool] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastAction, setLastAction] = useState("Ready for a new set");

  const [trendCategory, setTrendCategory] = useState("All");
  const [trendCount, setTrendCount] = useState("5");
  const [trendFilter, setTrendFilter] = useState("");
  const [trends, setTrends] = useState<TrendIdea[]>(() => generateTrendIdeas(defaultCountry, "All", defaultToolCounts.trends));

  const [addressCount, setAddressCount] = useState("3");
  const [addresses, setAddresses] = useState<SyntheticAddress[]>(() => generateAddresses(defaultCountry, defaultToolCounts.addresses));

  const [placeType, setPlaceType] = useState("Random");
  const [placeCount, setPlaceCount] = useState("4");
  const [places, setPlaces] = useState<PlaceQuery[]>(() => generateMapQueries(defaultCountry, "Random", defaultToolCounts.places));

  const [documentType, setDocumentType] = useState("Guide");
  const [documentLanguage, setDocumentLanguage] = useState("Any");
  const [documentCount, setDocumentCount] = useState("5");
  const [topic, setTopic] = useState("marketing");
  const [documents, setDocuments] = useState<DocumentQuery[]>(() => generatePdfQueries("marketing", defaultCountry, "Guide", "Any", defaultToolCounts.documents));

  useEffect(() => {
    localStorage.setItem("country-tools-country", country.code);
    setTrends(generateTrendIdeas(country, trendCategory, Number(trendCount)));
    setAddresses(generateAddresses(country, Number(addressCount)));
    setPlaces(generateMapQueries(country, placeType, Number(placeCount)));
    setDocuments(generatePdfQueries(topic, country, documentType, documentLanguage, Number(documentCount)));
    setLastAction(`${country.name} context loaded`);
  }, [country]);

  const filteredTrends = useMemo(() => trends.filter((trend) => trend.keyword.toLowerCase().includes(trendFilter.toLowerCase()) || trend.category.toLowerCase().includes(trendFilter.toLowerCase())), [trends, trendFilter]);

  const navigateTo = (id: string) => {
    setActiveTool(id);
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generateTrendsNow = () => {
    setTrends(generateTrendIdeas(country, trendCategory, Number(trendCount)));
    setLastAction(`New ${trendCategory.toLowerCase()} pulse generated`);
    toast.success("Trend ideas refreshed");
  };

  const generateAddressesNow = () => {
    setAddresses(generateAddresses(country, Number(addressCount)));
    setLastAction("Synthetic addresses randomized");
    toast.success("Address set refreshed");
  };

  const generatePlacesNow = () => {
    setPlaces(generateMapQueries(country, placeType, Number(placeCount)));
    setLastAction("Map queries randomized");
    toast.success("Places set refreshed");
  };

  const generateDocumentsNow = () => {
    setDocuments(generatePdfQueries(topic, country, documentType, documentLanguage, Number(documentCount)));
    setLastAction("Open-access search queries generated");
    toast.success("Search ideas refreshed");
  };

  const randomizeEverything = () => {
    const otherCountries = countryProfiles.filter((profile) => profile.code !== country.code);
    const nextCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
    setCountry(nextCountry);
    const nextTrends = generateTrendIdeas(nextCountry, trendCategory, Number(trendCount));
    const nextAddresses = generateAddresses(nextCountry, Number(addressCount));
    const nextPlaces = generateMapQueries(nextCountry, placeType, Number(placeCount));
    const nextDocuments = generatePdfQueries(topic, nextCountry, documentType, documentLanguage, Number(documentCount));
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
          {navItems.map(({ id, label, icon: Icon }) => (
            <button className={cx("nav-item", activeTool === id && "nav-item--active")} key={id} onClick={() => navigateTo(id)} type="button">
              <Icon size={17} />
              <span>{label}</span>
              {activeTool === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-country-card">
          <div className="sidebar-country-card__label"><span className="orange-line" /> Current context</div>
          <div className="sidebar-country-card__main"><span className="sidebar-country-code">{country.code}</span><div><strong>{country.name}</strong><small>{country.region}</small></div></div>
          <div className="sidebar-country-card__route"><span /><span /><span /></div>
          <p>All instruments follow this country. Change it once, keep the route consistent.</p>
        </div>
        <div className="sidebar-bottom">
          <div className="rail-card">
            <div className="rail-card__top"><span className="status-dot" /> Frontend mode</div>
            <p>Demo data stays transparent. External search opens in a new tab.</p>
          </div>
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
          <section className="hero-panel" id="overview">
            <div className="hero-panel__texture" />
            <div className="hero-panel__content">
              <div className="hero-kicker"><span className="orange-line" /> Country-aware search utilities</div>
              <h1>Sharper starting points<br /><em>for every country.</em></h1>
              <p>Generate research prompts, synthetic location context, and legal discovery queries — then take the useful parts straight to Google.</p>
              <div className="hero-meta"><span className="hero-meta__code">{country.code}</span><span>{country.name}</span><span className="meta-divider" /><span>{country.region}</span></div>
            </div>
            <div className="hero-panel__control"><CountrySelect country={country} onChange={setCountry} /></div>
            <div className="hero-coordinates">{country.code} · {country.region.toUpperCase()}<br />45° 12′ N / 06° 08′ E</div>
          </section>

          <section className="pulse-strip" aria-label="Workspace summary">
            <div className="pulse-strip__lead"><span className="pulse-mark"><TrendingUp size={15} /></span><div><span className="eyebrow">Selected country</span><strong>{country.name}</strong></div></div>
            <div className="pulse-stat"><span className="eyebrow">Trend ideas</span><strong>{trends.length.toString().padStart(2, "0")}</strong></div>
            <div className="pulse-stat"><span className="eyebrow">Addresses</span><strong>{addresses.length.toString().padStart(2, "0")}</strong></div>
            <div className="pulse-stat"><span className="eyebrow">Maps searches</span><strong>{places.length.toString().padStart(2, "0")}</strong></div>
            <div className="pulse-stat"><span className="eyebrow">Document queries</span><strong>{documents.length.toString().padStart(2, "0")}</strong></div>
            <div className="pulse-strip__stamp">UPDATED<br /><b>JUST NOW</b></div>
          </section>

          <div className="workspace-intro"><div><span className="eyebrow">01 / TOOLKIT</span><h2>Pick a signal. Build a route.</h2></div><p>All generators use <strong>{country.name}</strong> as their shared context. Synthetic outputs are clearly marked; Google destinations are only a click away.</p></div>

          <div className="tool-grid">
            <ToolCard id="trends" className="tool-card--wide">
              <SectionIntro index="01" eyebrow="Trend signal" title="Google Trends Explorer" description="Create country-aware keyword angles to validate in Google Trends." icon={Flame} note="DEMO DATA / NO LIVE API" />
              <div className="tool-controls"><SelectControl label="Category" value={trendCategory} onChange={setTrendCategory} options={trendCategoryOptions} /><SelectControl label="Results" value={trendCount} onChange={setTrendCount} options={["3", "5", "8", "10"]} /><label className="field-control search-control"><span>Filter results</span><span className="input-wrap"><Search size={15} /><input value={trendFilter} onChange={(event) => setTrendFilter(event.target.value)} placeholder="Search this set" /></span></label><button className="primary-button" onClick={generateTrendsNow} type="button"><RefreshCw size={15} /> Build trend set</button></div>
              <div className="notice-banner"><Lightbulb size={16} /><span><strong>Generated trend ideas</strong> — randomized country examples, not real-time Google Trends data. Use the links below to validate live interest.</span></div>
              {filteredTrends.length ? <div className="result-table result-table--trends"><div className="table-head"><span>#</span><span>Keyword / topic</span><span>Category</span><span>Signal</span><span>Actions</span></div>{filteredTrends.map((trend, index) => <div className="table-row" key={trend.id}><span className="row-number">{String(index + 1).padStart(2, "0")}</span><div className="result-main"><strong>{trend.keyword}</strong><small>{trend.searchQuery}</small></div><Badge variant="outline" className="soft-badge">{trend.category}</Badge><div className="signal-score"><span className="score-bar"><i style={{ width: `${trend.score}%` }} /></span><small>{trend.trendType}</small></div><div className="row-actions"><CopyButton text={trend.searchQuery} compact /><ExternalButton label="Google search" url={openGoogleSearch(trend.searchQuery)} /><ExternalButton label="Validate trends" url={openGoogleTrends(trend.keyword)} tone="accent" /></div></div>)}</div> : <EmptyState text="No trend ideas match this filter. Try a broader phrase or generate a new set." />}
            </ToolCard>

            <ToolCard id="addresses" className="tool-card--address">
              <SectionIntro index="02" eyebrow="Location seed" title="Random Address Generator" description="Create plausible address-shaped context for demos and search exploration." icon={MapPin} note="SYNTHETIC ONLY" />
              <div className="tool-controls tool-controls--two"><SelectControl label="Addresses" value={addressCount} onChange={setAddressCount} options={["1", "3", "5"]} /><button className="primary-button" onClick={generateAddressesNow} type="button"><RefreshCw size={15} /> Make synthetic addresses</button></div>
              <div className="notice-banner notice-banner--warm"><MapPin size={16} /><span><strong>Synthetic / Random Address</strong> — not guaranteed to be a real location. Verify before using.</span></div>
              <div className="address-list">{addresses.map((address) => <article className="address-row" key={address.id}><div className="address-pin"><MapPin size={15} /></div><div className="address-copy"><strong>{address.houseNumber} {address.street} Street</strong><span>{address.city}, {address.region} {address.postalCode}</span><small>{address.country}</small></div><div className="row-actions"><CopyButton text={address.formatted} compact /><ExternalButton label="Google Maps" url={openGoogleMaps(address.formatted)} icon={<Map size={14} />} tone="accent" /></div></article>)}</div>
            </ToolCard>

            <ToolCard id="places" className="tool-card--places">
              <div className="places-visual"><div className="places-visual__overlay" /><div className="places-visual__label"><span className="eyebrow">03 / MAP INDEX</span><strong>Find a place<br />to begin.</strong></div><div className="map-crosshair"><span /><span /></div></div>
              <div className="tool-card__body"><SectionIntro index="03" eyebrow="Place query" title="Random Places Explorer" description="Turn a country and a place type into ready-to-search Google Maps prompts." icon={Map} note="SEARCH IDEAS" /><div className="tool-controls tool-controls--three"><SelectControl label="Place type" value={placeType} onChange={setPlaceType} options={placeTypeOptions} /><SelectControl label="Queries" value={placeCount} onChange={setPlaceCount} options={["3", "4", "6", "8"]} /><button className="primary-button" onClick={generatePlacesNow} type="button"><RefreshCw size={15} /> Build map queries</button></div><div className="notice-banner notice-banner--teal"><Target size={16} /><span>Search query generated by the tool. Verify the location on Google Maps.</span></div><div className="place-list">{places.map((place) => <article className="place-row" key={place.id}><div className="place-icon"><Map size={16} /></div><div className="place-copy"><div><Badge variant="outline" className="soft-badge soft-badge--teal">{place.placeType}</Badge><span className="place-region">{place.region}</span></div><strong>{place.query}</strong><small>{place.city}, {place.country}</small></div><div className="row-actions"><CopyButton text={place.query} compact /><ExternalButton label="Google Maps" url={openGoogleMaps(place.query)} icon={<ExternalLink size={14} />} tone="accent" /></div></article>)}</div></div>
            </ToolCard>

            <ToolCard id="documents" className="tool-card--documents">
              <SectionIntro index="04" eyebrow="Open access route" title="PDF & Book Finder" description="Build legal Google search queries for public, open-access, and educational material." icon={BookOpen} note="LEGAL DISCOVERY" />
              <div className="tool-controls tool-controls--document"><SelectControl label="Content type" value={documentType} onChange={setDocumentType} options={documentTypeOptions} /><label className="field-control topic-control"><span>Topic</span><span className="input-wrap"><Search size={15} /><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. javascript" /></span></label><SelectControl label="Language" value={documentLanguage} onChange={setDocumentLanguage} options={languageOptions} /><SelectControl label="Queries" value={documentCount} onChange={setDocumentCount} options={["5", "10", "20"]} /><button className="primary-button" onClick={generateDocumentsNow} type="button"><RefreshCw size={15} /> Build public queries</button></div>
              <div className="notice-banner notice-banner--safe"><BookOpen size={16} /><span><strong>Publicly available material only.</strong> These queries do not bypass paywalls, DRM, copyright restrictions, or access controls.</span></div>
              <div className="document-list">{documents.map((document) => <article className="document-row" key={document.id}><div className="document-index">PDF</div><div className="document-copy"><strong>{document.query}</strong><div><Badge variant="outline" className="soft-badge">{document.contentType}</Badge><span>Suggested source: {document.source}</span></div></div><div className="row-actions"><CopyButton text={document.query} compact /><ExternalButton label="Google search" url={openGoogleSearch(document.query)} icon={<Search size={14} />} tone="accent" /></div></article>)}</div>
            </ToolCard>
          </div>

          <footer className="workspace-footer"><div><div className="footer-mark"><span className="orange-line" /> CT / COUNTRY TOOLS</div><p>A transparent frontend workspace for location-aware research prompts.</p></div><div className="footer-links"><span>NO API KEY</span><span>LOCAL STORAGE</span><span>DEMO DATA LABELLED</span></div></footer>
        </div>
      </main>
    </div>
  );
}
