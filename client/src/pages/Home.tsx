// Civic Index design note: this page is the research desk — orient first, reveal useful synthetic outputs, and keep external actions explicit.
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Clipboard,
  Flame,
  Globe2,
  Lightbulb,
  Map,
  MapPin,
  Mail,
  Menu,
  MessageCircle,
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
  openGoogleTrends,
  languageOptions,
  placeTypeOptions,
  trendCategoryOptions,
  type DocumentQuery,
  type EmailPair,
  generateEmailPairs,
  type PlaceQuery,
  type SyntheticAddress,
  type TrendIdea,
} from "@/lib/generators";

const navItems = [
  { id: "trends", href: "/trends", label: "Trends Explorer", icon: Flame },
  { id: "addresses", href: "/addresses", label: "Address Generator", icon: MapPin },
  { id: "places", href: "/places", label: "Places Explorer", icon: Map },
  { id: "documents", href: "/documents", label: "PDF & Book Finder", icon: BookOpen },
  { id: "replies", href: "/replies", label: "Short Reply Generator", icon: MessageCircle },
  { id: "emails", href: "/emails", label: "Gmail Subject + Message", icon: Mail },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const resultCountOptions = ["1,000", "2,000", "5,000", "10,000"];
const parseResultCount = (value: string) => Number(value.replaceAll(",", ""));
const trendDistinctifiers = ["ideas", "guide", "tips", "planning", "updates", "options", "resources", "prices", "benefits", "comparison", "basics", "checklist", "examples", "services", "schedule", "information", "support", "online", "local", "today", "new", "best", "simple", "public", "free", "advanced", "nearby", "learning", "community", "seasonal", "practical", "official", "quick", "smart", "daily", "weekly", "popular", "current", "trusted", "useful", "beginner", "professional", "home", "work", "family", "student", "business", "travel", "health", "digital", "modern"];
const replyDistinctifiers = ["when convenient", "for your records", "as discussed", "with thanks", "for the next step", "at your convenience", "for a quick review", "as a small update", "for today", "for this week", "with appreciation", "for your reference", "before we continue", "when you have time", "for the follow-up", "as planned", "with a clear note", "for the record", "in the meantime", "for the next update"];
const normalizeResult = (value: string) => value.trim().toLocaleLowerCase();
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

function stripDocumentSequence(value: string) {
  return value.replace(/\s+\d+\s*$/, "").trim();
}

function cleanAddressResult(address: SyntheticAddress, countryName: string) {
  const withoutUnit = address.formatted.replace(/\s*·\s*Unit\s+\d+\s*$/i, "").trim();
  return stripCountrySuffix(withoutUnit, countryName);
}

function cleanPlaceResult(place: PlaceQuery, _countryName: string) {
  const withoutZone = place.query.replace(/\s*·\s*zone\s+\d+\s*$/i, "").trim();
  return withoutZone.split(" — ")[0].trim();
}

function cleanReplyResult(value: string) {
  return value.replace(/\s+—\s+\d+\s*$/, "").trim();
}

function cleanEmailSubject(value: string) {
  return value.replace(/\s+—\s+\d+\s*$/, "").trim();
}

function cleanEmailMessage(value: string) {
  return value.replace(/\s+Ref:\s+\d+\.\s*$/, "").trim();
}

function copyAllResults<T>(rows: T[], formatter: (row: T) => string, countryName: string, removeCountry = true) {
  const values = rows.map(formatter);
  copyToClipboard((removeCountry ? values.map((value) => stripCountrySuffix(value, countryName)) : values).join("\n"), "Copied");
}

function downloadResults(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success("Download started");
}

function CopyButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return <button className={cx("inline-action", compact && "inline-action--compact")} onClick={handleCopy} type="button" aria-label="Copy reply">{copied ? <Check size={14} /> : <Clipboard size={14} />}<span>{copied ? "Copied" : "Copy"}</span></button>;
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

function MultiCountrySelect({ selectedCountries, onChange }: { selectedCountries: CountryProfile[]; onChange: (countries: CountryProfile[]) => void }) {
  const selectedCodes = new Set(selectedCountries.map((profile) => profile.code));
  const toggleCountry = (profile: CountryProfile) => {
    if (selectedCodes.has(profile.code)) {
      if (selectedCountries.length === 1) return;
      onChange(selectedCountries.filter((item) => item.code !== profile.code));
      return;
    }
    onChange([...selectedCountries, profile]);
  };

  return (
    <details className="country-multi-select">
      <summary><span className="country-select__eyebrow"><Globe2 size={13} /> Research countries</span><strong>{selectedCountries.length} selected</strong><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="country-multi-select__menu">
        {countryProfiles.map((profile) => <label className="country-multi-select__option" key={profile.code}><input type="checkbox" checked={selectedCodes.has(profile.code)} onChange={() => toggleCountry(profile)} /><span className="country-code">{profile.code}</span><span>{profile.name}</span></label>)}
      </div>
    </details>
  );
}

function MultiLanguageSelect({ selectedLanguages, onChange }: { selectedLanguages: string[]; onChange: (languages: string[]) => void }) {
  const toggleLanguage = (language: string) => {
    if (language === "Any") {
      onChange(["Any"]);
      return;
    }
    const next = selectedLanguages.includes(language) ? selectedLanguages.filter((item) => item !== language && item !== "Any") : [...selectedLanguages.filter((item) => item !== "Any"), language];
    onChange(next.length ? next : ["Any"]);
  };

  return (
    <details className="country-multi-select language-multi-select">
      <summary><span className="country-select__eyebrow"><BookOpen size={13} /> Languages</span><strong>{selectedLanguages.includes("Any") ? "Any" : `${selectedLanguages.length} selected`}</strong><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="country-multi-select__menu">
        {languageOptions.map((language) => <label className="country-multi-select__option" key={language}><input type="checkbox" checked={selectedLanguages.includes(language)} onChange={() => toggleLanguage(language)} /><span className="tone-dot" /> <span>{language}</span></label>)}
      </div>
    </details>
  );
}

function MultiDocumentTypeSelect({ selectedTypes, onChange }: { selectedTypes: string[]; onChange: (types: string[]) => void }) {
  const toggleType = (contentType: string) => {
    if (selectedTypes.includes(contentType)) {
      if (selectedTypes.length === 1) return;
      onChange(selectedTypes.filter((item) => item !== contentType));
      return;
    }
    onChange([...selectedTypes, contentType]);
  };

  const summary = selectedTypes.length === 1 ? selectedTypes[0] : `${selectedTypes.length} selected`;

  return (
    <details className="country-multi-select document-type-multi-select">
      <summary><span className="country-select__eyebrow"><BookOpen size={13} /> Content type</span><strong>{summary}</strong><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="country-multi-select__menu">
        {documentTypeOptions.map((contentType) => <label className="country-multi-select__option" key={contentType}><input type="checkbox" checked={selectedTypes.includes(contentType)} onChange={() => toggleType(contentType)} /><span className="tone-dot" /> <span>{contentType}</span></label>)}
      </div>
    </details>
  );
}

function MultiToneSelect({ selectedTones, onChange }: { selectedTones: string[]; onChange: (tones: string[]) => void }) {
  const toggleTone = (tone: string) => {
    if (selectedTones.includes(tone)) {
      if (selectedTones.length === 1) return;
      onChange(selectedTones.filter((item) => item !== tone));
      return;
    }
    onChange([...selectedTones, tone]);
  };

  return (
    <details className="country-multi-select tone-multi-select">
      <summary><span className="country-select__eyebrow"><MessageCircle size={13} /> Reply tones</span><strong>{selectedTones.length} selected</strong><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="country-multi-select__menu">
        {["Simple", "Polite", "Casual"].map((tone) => <label className="country-multi-select__option" key={tone}><input type="checkbox" checked={selectedTones.includes(tone)} onChange={() => toggleTone(tone)} /><span className="tone-dot" /> <span>{tone}</span></label>)}
      </div>
    </details>
  );
}

function SectionIntro({ title }: { title: string; index?: string; eyebrow?: string; description?: string; icon?: typeof Flame; note?: string }) {
  return <div className="section-intro section-intro--minimal"><h2>{title}</h2></div>;
}

function ToolCard({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cx("tool-card", className)}>{children}</section>;
}


export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCountries, setSelectedCountries] = useState<CountryProfile[]>(() => {
    const stored = localStorage.getItem("country-tools-countries");
    if (stored) {
      try {
        const profiles = JSON.parse(stored).map((code: string) => findCountry(code));
        if (profiles.length) return profiles;
      } catch {
        // Fall back to the default country when saved selection is invalid.
      }
    }
    return [findCountry(localStorage.getItem("country-tools-country") ?? defaultCountry.code)];
  });
  const country = selectedCountries[0] ?? defaultCountry;
  const [location] = useLocation();
  const activeNavItem = navItems.find((item) => item.href === location) ?? navItems[0];
  const activeTool = activeNavItem.id;
  const isOverview = activeTool === "overview";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [, setLastAction] = useState("Country context loaded");

  const [trendCategory, setTrendCategory] = useState("All");
  const [trendCount, setTrendCount] = useState("1,000");
  const [trends, setTrends] = useState<TrendIdea[]>(() => generateTrendIdeas(defaultCountry, "All", defaultToolCounts.trends));

  const [addressCount, setAddressCount] = useState("1,000");
  const [addresses, setAddresses] = useState<SyntheticAddress[]>(() => generateAddresses(defaultCountry, defaultToolCounts.addresses));

  const [placeType, setPlaceType] = useState("Random");
  const [placeCount, setPlaceCount] = useState("1,000");
  const [places, setPlaces] = useState<PlaceQuery[]>(() => generateMapQueries(defaultCountry, "Random", defaultToolCounts.places));

  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>(() => {
    const stored = localStorage.getItem("country-tools-document-types");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length && parsed.every((item) => documentTypeOptions.includes(item))) return parsed;
      } catch {
        // Use Guide when the saved content type selection is invalid.
      }
    }
    return ["Guide"];
  });
  const [selectedDocumentLanguages, setSelectedDocumentLanguages] = useState<string[]>(() => {
    const stored = localStorage.getItem("country-tools-document-languages");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        // Use Any when the saved language selection is invalid.
      }
    }
    return ["Any"];
  });
  const [documentCount, setDocumentCount] = useState("1,000");
  const [topic, setTopic] = useState("marketing");
  const [documents, setDocuments] = useState<DocumentQuery[]>(() => generatePdfQueries("marketing", defaultCountry, "Guide", "Any", defaultToolCounts.documents));
  const [emailCount, setEmailCount] = useState("1,000");
  const [emailPairs, setEmailPairs] = useState<EmailPair[]>(() => generateEmailPairs(defaultToolCounts.documents));
  const [selectedReplyTones, setSelectedReplyTones] = useState<string[]>(() => {
    const stored = localStorage.getItem("country-tools-reply-tones");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        // Use Simple when the saved tone selection is invalid.
      }
    }
    return ["Simple"];
  });
  const [replyCount, setReplyCount] = useState("1,000");
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([]);

  const generateAcrossCountries = <T,>(total: number, generator: (profile: CountryProfile, count: number) => T[], profiles = selectedCountries) => {
    const base = Math.floor(total / profiles.length);
    const remainder = total % profiles.length;
    return profiles.flatMap((profile, index) => generator(profile, base + (index < remainder ? 1 : 0))).slice(0, total);
  };

  const generateUniqueAcrossCountries = <T,>(total: number, generator: (profile: CountryProfile, count: number) => T[], key: (row: T) => string, profiles = selectedCountries) => {
    const unique: T[] = [];
    const seen = new Set<string>();
    let attempt = 0;
    while (unique.length < total && attempt < 10) {
      const batch = generateAcrossCountries(total, generator, profiles);
      batch.forEach((row) => {
        const normalized = normalizeResult(key(row));
        if (!seen.has(normalized) && unique.length < total) {
          seen.add(normalized);
          unique.push(row);
        }
      });
      attempt += 1;
    }
    return unique.slice(0, total);
  };

  const generateTrendsAcrossSelections = (total: number) => {
    const generated = generateAcrossCountries(total, (profile, count) => generateTrendIdeas(profile, trendCategory, count));
    const seen = new Set<string>();
    return generated.map((trend, index) => {
      const baseKeyword = trend.keyword.trim();
      let keyword = baseKeyword;
      let variantIndex = 0;
      while (seen.has(normalizeResult(keyword))) {
        const first = trendDistinctifiers[variantIndex % trendDistinctifiers.length];
        const second = trendDistinctifiers[Math.floor(variantIndex / trendDistinctifiers.length) % trendDistinctifiers.length];
        const third = trendDistinctifiers[Math.floor(variantIndex / (trendDistinctifiers.length * trendDistinctifiers.length)) % trendDistinctifiers.length];
        keyword = `${baseKeyword} ${first} ${second} ${third}`;
        variantIndex += 1;
      }
      seen.add(normalizeResult(keyword));
      return keyword === trend.keyword ? trend : { ...trend, keyword, searchQuery: keyword, id: `${trend.id}-${index}` };
    }).slice(0, total);
  };

  const generateDocumentsAcrossSelections = (total: number, profiles = selectedCountries) => {
    const languages = selectedDocumentLanguages.includes("Any") || !selectedDocumentLanguages.length ? ["Any"] : selectedDocumentLanguages;
    const contentTypes = selectedDocumentTypes.length ? selectedDocumentTypes : ["Guide"];
    const perCountry = Math.floor(total / profiles.length);
    const countryRemainder = total % profiles.length;
    return profiles.flatMap((profile, countryIndex) => {
      const countryTotal = perCountry + (countryIndex < countryRemainder ? 1 : 0);
      const perType = Math.floor(countryTotal / contentTypes.length);
      const typeRemainder = countryTotal % contentTypes.length;
      return contentTypes.flatMap((contentType, typeIndex) => {
        const typeTotal = perType + (typeIndex < typeRemainder ? 1 : 0);
        const perLanguage = Math.floor(typeTotal / languages.length);
        const languageRemainder = typeTotal % languages.length;
        return languages.flatMap((language, languageIndex) => generatePdfQueries(topic, profile, contentType, language, perLanguage + (languageIndex < languageRemainder ? 1 : 0), (countryIndex * contentTypes.length * languages.length + typeIndex * languages.length + languageIndex) * 100));
      });
    }).slice(0, total);
  };

  const generateUniqueDocuments = (total: number, profiles = selectedCountries) => {
    const unique: DocumentQuery[] = [];
    const seen = new Set<string>();
    let attempt = 0;
    while (unique.length < total && attempt < 10) {
      const batch = generateDocumentsAcrossSelections(total, profiles);
      batch.forEach((document) => {
        const cleanQuery = stripDocumentSequence(document.query);
        const normalized = normalizeResult(cleanQuery);
        if (!seen.has(normalized) && unique.length < total) {
          seen.add(normalized);
          unique.push(document);
        }
      });
      attempt += 1;
    }
    return unique.slice(0, total);
  };

  useEffect(() => {
    localStorage.setItem("country-tools-reply-tones", JSON.stringify(selectedReplyTones));
  }, [selectedReplyTones]);

  useEffect(() => {
    localStorage.setItem("country-tools-country", country.code);
    localStorage.setItem("country-tools-countries", JSON.stringify(selectedCountries.map((profile) => profile.code)));
    setTrends(generateTrendsAcrossSelections(parseResultCount(trendCount)));
    setAddresses(generateUniqueAcrossCountries(parseResultCount(addressCount), (profile, count) => generateAddresses(profile, count), (address) => cleanAddressResult(address, address.country)));
    setPlaces(generateUniqueAcrossCountries(parseResultCount(placeCount), (profile, count) => generateMapQueries(profile, placeType, count), (place) => place.query));
    setDocuments(generateUniqueDocuments(parseResultCount(documentCount)));
    setLastAction(`${selectedCountries.length} countr${selectedCountries.length === 1 ? "y" : "ies"} context loaded`);
  }, [selectedCountries, selectedDocumentTypes, selectedDocumentLanguages]);

  useEffect(() => {
    localStorage.setItem("country-tools-document-types", JSON.stringify(selectedDocumentTypes));
  }, [selectedDocumentTypes]);

  useEffect(() => {
    localStorage.setItem("country-tools-document-languages", JSON.stringify(selectedDocumentLanguages));
  }, [selectedDocumentLanguages]);

  const trendPreview = trends.slice(0, 24);
  const addressPreview = addresses.slice(0, 24);
  const placePreview = places.slice(0, 24);
  const documentPreview = documents.slice(0, 24);

  const closeMobileNav = () => setMobileNavOpen(false);

  const generateTrendsNow = () => {
    setTrends(generateTrendsAcrossSelections(parseResultCount(trendCount)));
    setLastAction(`New ${trendCategory.toLowerCase()} pulse generated`);
    toast.success("Trend ideas refreshed");
  };

  const generateAddressesNow = () => {
    setAddresses(generateUniqueAcrossCountries(parseResultCount(addressCount), (profile, count) => generateAddresses(profile, count), (address) => cleanAddressResult(address, address.country)));
    setLastAction("Synthetic addresses randomized");
    toast.success("Address set refreshed");
  };

  const generatePlacesNow = () => {
    setPlaces(generateUniqueAcrossCountries(parseResultCount(placeCount), (profile, count) => generateMapQueries(profile, placeType, count), (place) => place.query));
    setLastAction("Map queries randomized");
    toast.success("Places set refreshed");
  };

  const generateDocumentsNow = () => {
    setDocuments(generateUniqueDocuments(parseResultCount(documentCount)));
    setLastAction("Open-access search queries generated");
    toast.success("Search ideas refreshed");
  };

  const replyParts: Record<string, { openers: string[]; middles: string[]; closers: string[] }> = {
    Simple: {
      openers: ["Thanks for your message", "Thanks for your help", "Thanks for the update", "Thanks for sharing", "I appreciate your message", "I appreciate your help", "Got it", "That sounds good", "Noted with thanks", "I understand"],
      middles: ["I appreciate it", "I’ve noted this", "That helps a lot", "I’ll keep this in mind", "This is helpful", "I understand", "Sounds good to me", "I’ll take care of it", "I’ll review it", "I’m on it"],
      closers: ["Thanks again.", "Got it.", "Much appreciated.", "All noted.", "Talk soon.", "I’ll follow up.", "That works.", "I’ll get back to you.", "Appreciate your help.", "Thank you."],
    },
    Polite: {
      openers: ["Thank you very much", "Thank you for your message", "Many thanks for your help", "I sincerely appreciate your message", "Thank you for the update", "I appreciate your time", "Thank you for sharing this", "Please accept my thanks", "I’m grateful for your help", "Thank you for reaching out"],
      middles: ["I appreciate your support", "I’ll review this carefully", "I’ll keep this in mind", "I’ll look into it", "I’ll follow up shortly", "I’ll take the next steps", "This is very helpful", "I understand your point", "I’m happy to help", "I’ll respond soon"],
      closers: ["Thank you again.", "I appreciate it.", "With thanks.", "Please let me know.", "I’ll be in touch.", "That would be appreciated.", "Many thanks.", "I look forward to it.", "Thank you for your time.", "Kind regards."],
    },
    Casual: {
      openers: ["Thanks a lot", "Thanks for everything", "Really appreciate it", "Got it", "Sounds good", "Thanks for the heads-up", "Awesome, thanks", "That works", "Perfect, thanks", "Appreciate you"],
      middles: ["I’m on it", "I’ll take a look", "I’ve got it", "That helps", "I’ll keep you posted", "I’ll get back to you", "I’m happy to help", "Good to know", "I’ll sort it out", "Let’s do it"],
      closers: ["Thanks!", "Got it!", "Talk soon!", "Appreciate it!", "Sounds good!", "All set!", "Catch you later!", "No problem!", "Thank you!", "Will do!"],
    },
  };

  const generateReplyNow = () => {
    const tones = selectedReplyTones.length ? selectedReplyTones : ["Simple"];
    const pool = tones.flatMap((tone) => {
      const parts = replyParts[tone] ?? replyParts.Simple;
      return Array.from({ length: parts.openers.length * parts.middles.length * parts.closers.length }, (_, index) => {
        const opener = parts.openers[Math.floor(index / (parts.middles.length * parts.closers.length)) % parts.openers.length];
        const middle = parts.middles[Math.floor(index / parts.closers.length) % parts.middles.length];
        const closer = parts.closers[index % parts.closers.length];
        return `${opener}. ${middle}. ${closer}`;
      });
    });
    const uniquePool = Array.from(new Set(pool));
    const count = parseResultCount(replyCount);
    const shuffled = uniquePool.sort(() => Math.random() - 0.5);
    const seen = new Set<string>();
    const nextReplies: string[] = [];
    Array.from({ length: count }, (_, index) => shuffled[index % shuffled.length]).forEach((baseReply, index) => {
      const normalizedBase = normalizeResult(baseReply);
      let reply = baseReply;
      let variantIndex = 0;
      while (seen.has(normalizeResult(reply))) {
        const first = replyDistinctifiers[(index + variantIndex) % replyDistinctifiers.length];
        const second = replyDistinctifiers[Math.floor((index + variantIndex) / replyDistinctifiers.length) % replyDistinctifiers.length];
        const cleanReply = baseReply.replace(/[.!?]+\s*$/, "");
        reply = `${cleanReply}. ${first}, ${second}.`;
        variantIndex += 1;
      }
      if (seen.has(normalizedBase)) reply = `${baseReply.replace(/[.!?]+\s*$/, "")}. ${replyDistinctifiers[index % replyDistinctifiers.length]}.`;
      seen.add(normalizeResult(reply));
      nextReplies.push(reply);
    });
    setGeneratedReplies(nextReplies);
    setLastAction(`${count.toLocaleString()} unique short replies generated`);
    toast.success(`${count.toLocaleString()} unique replies ready`);
  };

  const clearReply = () => {
    setGeneratedReplies([]);
  };

  const generateEmailPairsNow = () => {
    const count = parseResultCount(emailCount);
    setEmailPairs(generateEmailPairs(count));
    setLastAction(`${count.toLocaleString()} Gmail subject/message pairs generated`);
    toast.success(`${count.toLocaleString()} email pairs ready`);
  };

  const randomizeEverything = () => {
    const otherCountries = countryProfiles.filter((profile) => profile.code !== country.code);
    const nextCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
    setSelectedCountries([nextCountry]);
    const nextTrends = generateTrendIdeas(nextCountry, trendCategory, parseResultCount(trendCount));
    const nextAddresses = generateUniqueAcrossCountries(parseResultCount(addressCount), (profile, count) => generateAddresses(profile, count), (address) => cleanAddressResult(address, address.country), [nextCountry]);
    const nextPlaces = generateUniqueAcrossCountries(parseResultCount(placeCount), (profile, count) => generateMapQueries(profile, placeType, count), (place) => place.query, [nextCountry]);
    const nextDocuments = generateUniqueDocuments(parseResultCount(documentCount), [nextCountry]);
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
          <div className="topbar__left"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={19} /></button></div>
          <div className="topbar__right">
            <button className="icon-button" onClick={toggleTheme} type="button" aria-label="Toggle dark mode">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="randomize-button" onClick={randomizeEverything} type="button"><RefreshCw size={15} /> <span>Randomize all</span></button>
          </div>
        </header>

        <div className="workspace">
          {!(["replies", "emails", "documents"] as string[]).includes(activeTool) && <section className="workspace-toolbar" aria-label="Research countries">
            <MultiCountrySelect selectedCountries={selectedCountries} onChange={setSelectedCountries} />
          </section>}

          <div className={cx("tool-grid", !isOverview && "tool-grid--single")}>
            {activeTool === "replies" && <ToolCard id="replies" className="tool-card--replies">
              <SectionIntro index="05" eyebrow="Message utility" title="Short Reply Generator" description="Generate a simple, short response instantly." icon={MessageCircle} note="FRONTEND ONLY" />
              <div className="reply-composer">
                <div className="reply-direct-note"><MessageCircle size={18} /><div><strong>Ready to reply?</strong><p>Choose one or more tones and generate a large set of short messages instantly.</p></div></div>
                <div className="reply-actions"><MultiToneSelect selectedTones={selectedReplyTones} onChange={setSelectedReplyTones} /><SelectControl label="Results" value={replyCount} onChange={setReplyCount} options={resultCountOptions} /><button className="primary-button" onClick={generateReplyNow} type="button"><MessageCircle size={15} /> Generate replies</button><button className="secondary-button" onClick={() => copyToClipboard(generatedReplies.map(cleanReplyResult).join("\n"), "Copied")} disabled={!generatedReplies.length} type="button"><Clipboard size={15} /> Copy all replies</button><button className="secondary-button" onClick={() => downloadResults(generatedReplies.map(cleanReplyResult).join("\n"), "short-replies.txt")} disabled={!generatedReplies.length} type="button"><Download size={15} /> Download results</button><button className="secondary-button" onClick={clearReply} type="button">Clear</button></div>
              </div>
              <div className={cx("reply-output", !generatedReplies.length && "reply-output--empty")}>
                {generatedReplies.length ? <div className="reply-list">{generatedReplies.map((reply, index) => <div className="reply-list__row" key={`${reply}-${index}`}><span>{String(index + 1).padStart(4, "0")}</span><p>{reply}</p></div>)}</div> : <div><span className="eyebrow">Generated replies</span><p>Choose a tone and generate 1,000 short replies.</p></div>}
              </div>
            </ToolCard>}

            {activeTool === "emails" && <ToolCard id="emails" className="tool-card--emails">
              <SectionIntro index="06" eyebrow="Email utility" title="Gmail Subject + Message Generator" description="Generate random email subjects and messages with one-to-one row pairing." icon={Mail} note="FRONTEND ONLY" />
              <div className="reply-composer email-composer"><div className="reply-direct-note"><Mail size={18} /><div><strong>Paired results</strong><p>Subject 1 always matches Message 1, Subject 2 matches Message 2, and so on.</p></div></div><div className="reply-actions"><SelectControl label="Pairs" value={emailCount} onChange={setEmailCount} options={resultCountOptions} /><button className="primary-button" onClick={generateEmailPairsNow} type="button"><Mail size={15} /> Generate pairs</button><div className="email-copy-group"><span>Copy subjects</span><button className="secondary-button" onClick={() => copyToClipboard(emailPairs.map((pair) => cleanEmailSubject(pair.subject)).join("\n"), "Copied")} type="button"><Clipboard size={15} /> Copy all subjects</button></div><div className="email-copy-group"><span>Copy messages</span><button className="secondary-button" onClick={() => copyToClipboard(emailPairs.map((pair) => cleanEmailMessage(pair.message)).join("\n"), "Copied")} type="button"><Clipboard size={15} /> Copy all messages</button></div><button className="secondary-button" onClick={() => downloadResults(emailPairs.map((pair) => `${cleanEmailSubject(pair.subject)}\t${cleanEmailMessage(pair.message)}`).join("\n"), "gmail-subject-message-results.txt")} disabled={!emailPairs.length} type="button"><Download size={15} /> Download results</button></div></div>
              <div className="email-pair-list">{emailPairs.map((pair, index) => <article className="email-pair-row" key={pair.id}><span className="email-pair-row__index">{String(index + 1).padStart(4, "0")}</span><div><strong>Subject: {pair.subject}</strong><p>Message: {pair.message}</p></div></article>)}</div><div className="preview-note">Displaying {emailPairs.length.toLocaleString()} paired results. Each subject and message share the same row.</div>
            </ToolCard>}

            {(isOverview || activeTool === "trends") && <ToolCard id="trends" className="tool-card--wide">
              <SectionIntro index="01" eyebrow="Trend signal" title="Google Trends Explorer" description="Generate keyword ideas and validate them in Google Trends over the last 7 days." icon={Flame} note="DEMO DATA / NO LIVE API" />
              <div className="tool-controls tool-controls--trends"><SelectControl label="Category" value={trendCategory} onChange={setTrendCategory} options={trendCategoryOptions} /><SelectControl label="Results" value={trendCount} onChange={setTrendCount} options={resultCountOptions} /><button className="primary-button" onClick={generateTrendsNow} type="button"><RefreshCw size={15} /> Build trend set</button><button className="secondary-button" onClick={() => copyToClipboard(trends.map((trend) => trend.keyword).join("\n"), "Copied")} disabled={!trends.length} type="button"><Clipboard size={15} /> Copy all results</button><button className="secondary-button" onClick={() => downloadResults(trends.map((trend) => trend.keyword).join("\n"), "trends-results.txt")} disabled={!trends.length} type="button"><Download size={15} /> Download results</button></div>
              <div className="notice-banner"><Lightbulb size={16} /><span><strong>Generated trend ideas</strong> — randomized demo keywords, not live Google Trends data. Open any keyword to validate the last 7 days in Google Trends.</span></div>
              {trendPreview.length > 0 && <div className="result-table result-table--trends"><div className="table-head"><span>#</span><span>Keyword / topic</span><span>Category</span><span>Google Trends</span></div>{trendPreview.map((trend, index) => <div className="table-row" key={trend.id}><span className="row-number">{String(index + 1).padStart(2, "0")}</span><div className="result-main"><a className="trend-keyword-link" href={openGoogleTrends(trend.searchQuery)} target="_blank" rel="noreferrer">{trend.keyword}</a></div><Badge variant="outline" className="soft-badge">{trend.category}</Badge><a className="trend-validate-link" href={openGoogleTrends(trend.searchQuery)} target="_blank" rel="noreferrer">Last 7 days ↗</a></div>)}</div>}
              {trends.length > trendPreview.length && <div className="preview-note">Previewing {trendPreview.length.toLocaleString()} of {trends.length.toLocaleString()} generated ideas. The full collection stays in memory.</div>}
            </ToolCard>}

            {(isOverview || activeTool === "addresses") && <ToolCard id="addresses" className="tool-card--address">
              <SectionIntro index="02" eyebrow="Location seed" title="Random Address Generator" description="Create plausible address-shaped context for demos and search exploration." icon={MapPin} note="SYNTHETIC ONLY" />
              <div className="tool-controls tool-controls--two"><SelectControl label="Addresses" value={addressCount} onChange={setAddressCount} options={resultCountOptions} /><button className="primary-button" onClick={generateAddressesNow} type="button"><RefreshCw size={15} /> Make synthetic addresses</button><button className="secondary-button" onClick={() => copyAllResults(addresses, (address) => cleanAddressResult(address, country.name), country.name)} type="button"><Clipboard size={15} /> Copy all results</button><button className="secondary-button" onClick={() => downloadResults(addresses.map((address) => cleanAddressResult(address, country.name)).join("\n"), "address-results.txt")} disabled={!addresses.length} type="button"><Download size={15} /> Download results</button></div>
              <div className="notice-banner notice-banner--warm"><MapPin size={16} /><span><strong>Synthetic / Random Address</strong> — not guaranteed to be a real location. Verify before using.</span></div>
              <div className="address-list">{addressPreview.map((address) => <article className="address-row" key={address.id}><div className="address-pin"><MapPin size={15} /></div><div className="address-copy"><strong>{address.houseNumber} {address.street} Street</strong><span>{address.city}, {address.region} {address.postalCode}</span><small>{address.country}</small></div></article>)}</div><div className="preview-note">Previewing {addressPreview.length.toLocaleString()} of {addresses.length.toLocaleString()} generated addresses. The full collection stays available for future export workflows.</div>
            </ToolCard>}

            {(isOverview || activeTool === "places") && <ToolCard id="places" className="tool-card--places">
              <div className="places-visual"><div className="places-visual__overlay" /><div className="places-visual__label"><span className="eyebrow">03 / MAP INDEX</span><strong>Find a place<br />to begin.</strong></div><div className="map-crosshair"><span /><span /></div></div>
              <div className="tool-card__body"><SectionIntro index="03" eyebrow="Place query" title="Random Places Explorer" description="Turn a country and a place type into ready-to-search Google Maps prompts." icon={Map} note="SEARCH IDEAS" /><div className="tool-controls tool-controls--three"><SelectControl label="Place type" value={placeType} onChange={setPlaceType} options={placeTypeOptions} /><SelectControl label="Queries" value={placeCount} onChange={setPlaceCount} options={resultCountOptions} /><button className="primary-button" onClick={generatePlacesNow} type="button"><RefreshCw size={15} /> Build map queries</button><button className="secondary-button" onClick={() => copyAllResults(places, (place) => cleanPlaceResult(place, country.name), country.name, false)} type="button"><Clipboard size={15} /> Copy all results</button><button className="secondary-button" onClick={() => downloadResults(places.map((place) => cleanPlaceResult(place, country.name)).join("\n"), "places-results.txt")} disabled={!places.length} type="button"><Download size={15} /> Download results</button></div><div className="notice-banner notice-banner--teal"><Target size={16} /><span>Search query generated by the tool. Verify the location on Google Maps.</span></div><div className="place-list">{placePreview.map((place) => <article className="place-row" key={place.id}><div className="place-icon"><Map size={16} /></div><div className="place-copy"><div><Badge variant="outline" className="soft-badge soft-badge--teal">{place.placeType}</Badge><span className="place-region">{place.region}</span></div><strong>{place.query}</strong><small>{place.city}, {place.country}</small></div></article>)}</div><div className="preview-note">Previewing {placePreview.length.toLocaleString()} of {places.length.toLocaleString()} generated map queries. The full collection stays in memory.</div></div>
            </ToolCard>}

            {(isOverview || activeTool === "documents") && <ToolCard id="documents" className="tool-card--documents">
              <SectionIntro index="04" eyebrow="Open access route" title="PDF & Book Finder" description="Create short public-document queries in the format: book name + pdf." icon={BookOpen} note="LEGAL DISCOVERY" />
              <div className="tool-controls tool-controls--document"><MultiDocumentTypeSelect selectedTypes={selectedDocumentTypes} onChange={setSelectedDocumentTypes} /><label className="field-control topic-control"><span>Topic</span><span className="input-wrap"><Search size={15} /><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. javascript" /></span></label><MultiLanguageSelect selectedLanguages={selectedDocumentLanguages} onChange={setSelectedDocumentLanguages} /><SelectControl label="Queries" value={documentCount} onChange={setDocumentCount} options={resultCountOptions} /><button className="primary-button" onClick={generateDocumentsNow} type="button"><RefreshCw size={15} /> Build public queries</button><button className="secondary-button" onClick={() => copyAllResults(documents, (document) => stripDocumentSequence(document.query), country.name)} type="button"><Clipboard size={15} /> Copy all results</button><button className="secondary-button" onClick={() => downloadResults(documents.map((document) => stripDocumentSequence(document.query)).join("\n"), "pdf-book-results.txt")} disabled={!documents.length} type="button"><Download size={15} /> Download results</button></div>
              <div className="notice-banner notice-banner--safe"><BookOpen size={16} /><span><strong>Publicly available material only.</strong> These queries do not bypass paywalls, DRM, copyright restrictions, or access controls.</span></div>
              <div className="document-list">{documentPreview.map((document) => <article className="document-row" key={document.id}><div className="document-index">PDF</div><div className="document-copy"><strong>{stripDocumentSequence(document.query)}</strong></div></article>)}</div><div className="preview-note">Previewing {documentPreview.length.toLocaleString()} of {documents.length.toLocaleString()} generated document queries. The full collection stays in memory.</div>
            </ToolCard>}
          </div>

          <footer className="workspace-footer"><div><div className="footer-mark"><span className="orange-line" /> CT / COUNTRY TOOLS</div><p>A transparent frontend workspace for location-aware research prompts.</p></div><div className="footer-links"><span>NO API KEY</span><span>LOCAL STORAGE</span><span>DEMO DATA LABELLED</span></div></footer>
        </div>
      </main>
    </div>
  );
}
