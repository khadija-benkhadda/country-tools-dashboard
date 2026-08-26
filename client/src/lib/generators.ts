// Civic Index design note: pure generators keep synthetic data honest, testable, and ready for a future live-data adapter.
import type { CountryProfile } from "./countryData";

export type TrendIdea = {
  id: string;
  keyword: string;
  category: string;
  trendType: string;
  searchQuery: string;
  score: number;
};

export type SyntheticAddress = {
  id: string;
  houseNumber: number;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  formatted: string;
};

export type PlaceQuery = {
  id: string;
  placeType: string;
  city: string;
  region: string;
  country: string;
  query: string;
};

export type DocumentQuery = {
  id: string;
  query: string;
  contentType: string;
  topic: string;
  source: string;
};

export type EmailPair = {
  id: string;
  subject: string;
  message: string;
};

const trendTypes = ["Rising idea", "Breakout angle", "Seasonal signal", "Local pulse"];
const trendQualifiers = ["ideas", "guide", "tips", "planning", "updates", "options", "resources", "prices", "benefits", "comparison", "basics", "checklist", "examples", "services", "schedule", "information", "support", "online", "local", "today", "new", "best", "simple", "public", "free", "advanced", "nearby", "learning", "community", "seasonal", "practical", "official", "quick", "smart", "daily", "weekly", "popular", "current", "trusted", "useful", "beginner", "professional", "home", "work", "family", "student", "business", "travel", "health", "digital", "modern"];
const placeTypes = ["Restaurant", "Coffee Shop", "Bookstore", "Library", "Museum", "Park", "Shopping Center", "Hotel", "Gym", "Cinema", "Tourist Attraction", "University", "Local Market"];
const placeAreas = ["near the main square", "near the public library", "near the old town", "near the river", "near the university", "near the market", "near the museum", "near the park", "near the waterfront", "near the station", "near the town hall", "near the arts district"];
const placePurposes = ["for a quick visit", "for families", "for remote work", "for a weekend plan", "for local events", "for an evening out", "for a quiet visit", "for students", "for business meetings", "for visitors", "for a group booking", "for a local experience"];
const placeAttributes = ["with parking", "with outdoor seating", "with accessible entry", "with public transport", "with study space", "with local products", "with guided visits", "open late", "with a quiet room", "with family facilities", "with takeaway options", "with visitor information"];
const contentSources: Record<string, string> = {
  "Public Domain Book": "archive.org / Project Gutenberg",
  "Government Document": "official government portal",
  "Research Paper": "DOAJ / institutional repository",
  "Academic Article": "Google Scholar / university repository",
  Manual: "official documentation site",
  Report: "government or NGO publication library",
  Guide: "public library or open knowledge repository",
  "Course Material": "open educational resource repository",
  Ebook: "OpenStax / Internet Archive",
  Book: "public library catalogue",
  "Technical Documentation": "official documentation site",
};

const sourcePatterns: Record<string, string[]> = {
  "Public Domain Book": ["site:archive.org", "site:gutenberg.org", "site:openlibrary.org"],
  "Government Document": ["site:gov", "site:gov.uk", "site:gouv.fr", "site:who.int"],
  "Research Paper": ["site:doaj.org", "site:arxiv.org", "site:repository"],
  "Academic Article": ["site:edu", "site:ac.uk", "site:sciencedirect.com"],
  Manual: ["site:docs", "site:manualslib.com", "site:developer.mozilla.org"],
  Report: ["site:gov", "site:un.org", "site:oecd.org"],
  Guide: ["site:edu", "site:org", "site:openstax.org"],
  "Course Material": ["site:openstax.org", "site:ocw.mit.edu", "site:edu"],
  Ebook: ["site:openstax.org", "site:archive.org", "site:openlibrary.org"],
  Book: ["site:openlibrary.org", "site:archive.org", "site:worldcat.org"],
  "Technical Documentation": ["site:developer.mozilla.org", "site:docs", "site:w3.org"],
};

const languageTerms: Record<string, string> = {
  English: "English",
  French: "français",
  Spanish: "español",
  German: "Deutsch",
  Arabic: "العربية",
  Portuguese: "português",
  Italian: "italiano",
  Any: "",
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

const encode = (value: string) => encodeURIComponent(value);

export const openGoogleSearch = (query: string) => `https://www.google.com/search?q=${encode(query)}`;
export const openGoogleMaps = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encode(query)}`;
export const openGoogleTrends = (query: string) => `https://trends.google.com/trends/explore?q=${encode(query)}&date=now%207-d`;

const createId = (prefix: string, index: number) => `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;

export const generateTrendIdeas = (country: CountryProfile, category: string, count: number, startIndex = 0): TrendIdea[] => {
  const available = country.trendIdeas[category] ?? country.trendIdeas.All;
  const randomizedIdeas = shuffle(available);
  return Array.from({ length: count }, (_, index) => {
    const sequenceIndex = index + startIndex;
    const baseKeyword = randomizedIdeas[sequenceIndex % randomizedIdeas.length];
    const qualifierIndex = Math.floor(sequenceIndex / randomizedIdeas.length);
    const firstQualifier = trendQualifiers[qualifierIndex % trendQualifiers.length];
    const secondQualifier = trendQualifiers[Math.floor(qualifierIndex / trendQualifiers.length) % trendQualifiers.length];
    const thirdQualifier = trendQualifiers[Math.floor(qualifierIndex / (trendQualifiers.length * trendQualifiers.length)) % trendQualifiers.length];
    const keyword = sequenceIndex < randomizedIdeas.length ? baseKeyword : `${baseKeyword} ${firstQualifier} ${secondQualifier} ${thirdQualifier}`;
    return {
      id: createId("trend", index),
      keyword,
      category,
      trendType: pick(trendTypes),
      searchQuery: keyword,
      score: randomInt(64, 98),
    };
  });
};

const fillPostalPattern = (pattern: string) =>
  pattern
    .split("")
    .map((character) => {
      if (character === "#") return String(randomInt(0, 9));
      if (character === "A") return String.fromCharCode(65 + randomInt(0, 25));
      return character;
    })
    .join("");

export const generateRandomAddress = (country: CountryProfile, index = 0): SyntheticAddress => {
  const cityIndex = randomInt(0, country.cities.length - 1);
  const city = country.cities[cityIndex];
  const region = country.regions[cityIndex] ?? country.regions[0];
  const street = pick(country.streets);
  const houseNumber = randomInt(8, 987);
  const postalCode = fillPostalPattern(country.postalPattern);
  return {
    id: createId("address", index),
    houseNumber,
    street,
    city,
    region,
    postalCode,
    country: country.name,
    formatted: `${houseNumber} ${street} Street, ${city}, ${region} ${postalCode}, ${country.name}`,
  };
};

export const generateAddresses = (country: CountryProfile, count: number) => {
  const seen = new Set<string>();
  return Array.from({ length: count }, (_, index) => {
    let address = generateRandomAddress(country, index);
    let key = `${address.houseNumber}|${address.street}|${address.city}|${address.region}|${address.postalCode}`;
    let attempts = 0;
    while (seen.has(key) && attempts < 80) {
      address = generateRandomAddress(country, index + attempts + 1);
      key = `${address.houseNumber}|${address.street}|${address.city}|${address.region}|${address.postalCode}`;
      attempts += 1;
    }
    seen.add(key);
    return { ...address, formatted: `${address.formatted} · Unit ${String(index + 1).padStart(4, "0")}` };
  });
};

export const generateMapQueries = (country: CountryProfile, placeType: string, count: number): PlaceQuery[] => {
  const types = placeType === "Random" ? placeTypes : [placeType];
  const basePairs = shuffle(types.flatMap((type) => country.cities.map((city, cityIndex) => ({ type, city, region: country.regions[cityIndex] ?? country.regions[0] }))));
  const areas = shuffle(placeAreas);
  const purposes = shuffle(placePurposes);
  const attributes = shuffle(placeAttributes);
  const variantCount = areas.length * purposes.length * attributes.length;
  return Array.from({ length: count }, (_, index) => {
    const base = basePairs[index % basePairs.length];
    const variantIndex = Math.floor(index / basePairs.length) % variantCount;
    const area = areas[variantIndex % areas.length];
    const purpose = purposes[Math.floor(variantIndex / areas.length) % purposes.length];
    const attribute = attributes[Math.floor(variantIndex / (areas.length * purposes.length)) % attributes.length];
    return {
      id: createId("place", index),
      placeType: base.type,
      city: base.city,
      region: base.region,
      country: country.name,
      query: `${base.type}s in ${base.city}, ${country.name} — ${area}, ${purpose}, ${attribute}`,
    };
  });
};

const cleanTopic = (topic: string) => topic.trim().replace(/["“”]/g, "") || "open learning";

const publicBookTitles = [
  "Logafjöll",
  "The Little Prince",
  "The Odyssey",
  "Pride and Prejudice",
  "Jane Eyre",
  "Wuthering Heights",
  "Frankenstein",
  "Dracula",
  "The Time Machine",
  "The War of the Worlds",
  "The Secret Garden",
  "The Wonderful Wizard of Oz",
  "The Call of the Wild",
  "The Adventures of Sherlock Holmes",
  "Alice's Adventures in Wonderland",
  "Through the Looking-Glass",
  "Treasure Island",
  "The Count of Monte Cristo",
  "The Three Musketeers",
  "A Tale of Two Cities",
  "Great Expectations",
  "Oliver Twist",
  "The Picture of Dorian Gray",
  "The Importance of Being Earnest",
  "The Wind in the Willows",
  "The Jungle Book",
  "The Prophet",
  "The Republic",
  "Meditations",
  "The Art of War",
  "Walden",
  "The Prince",
  "Candide",
  "The Metamorphosis",
  "The Trial",
  "The Stranger",
  "Les Misérables",
  "The Red and the Black",
  "Don Quixote",
  "The Divine Comedy",
  "The Canterbury Tales",
  "The Adventures of Tom Sawyer",
  "The Adventures of Huckleberry Finn",
  "The Scarlet Letter",
  "Little Women",
  "The Age of Innocence",
  "The Souls of Black Folk",
  "The Autobiography of Benjamin Franklin",
  "Common Sense",
  "The Federalist Papers",
  "On Liberty",
  "The Wealth of Nations",
  "The Origin of Species",
  "The Interpretation of Dreams",
  "The Story of My Life",
  "The Last of the Mohicans",
  "The House of the Seven Gables",
  "The Yellow Wallpaper",
  "The Awakening",
  "The Wonderful Visit",
];

const documentEditionDescriptors = ["Classic", "Open", "Reader", "Study", "Annotated", "Illustrated", "Reference", "Student", "Complete", "Public", "Digital", "Library"];
const documentFormatDescriptors = ["Archive", "Text", "Print", "Ebook", "Guide", "Reader", "Collection", "Chapter", "Catalogue", "Edition", "Copy", "Volume"];
const documentContextDescriptors = ["for study", "for reference", "for readers", "for classrooms", "for research", "for libraries", "for teaching", "for discussion", "for projects", "for beginners", "for practice", "for review"];

const emailSubjectParts = {
  openers: ["Quick follow-up", "A small update", "Checking in", "One thing to share", "A note for you", "Next steps", "Friendly reminder", "Thank you", "Your request", "A helpful update"],
  topics: ["on your request", "about the details", "for this week", "on the next step", "about our conversation", "for your review", "on the plan", "about the schedule", "for your reference", "before we continue"],
};
const emailSubjectQualifiers = ["for review", "for reference", "for approval", "for discussion", "for planning", "for confirmation", "for follow-up", "for your input", "for the record", "for next steps", "for a quick look", "for this project", "for the team", "for today", "for tomorrow", "for the meeting", "for the schedule", "for the update", "for the file", "for your notes"];
const emailSubjectContexts = ["this morning", "this afternoon", "this evening", "this week", "next week", "when convenient", "before the meeting", "after our call", "as discussed", "as planned", "for the next step", "for a quick check", "for your review", "for the record", "for the current project", "for the latest update", "for the shared file", "for the team", "for today", "for tomorrow"];

const emailMessageParts = {
  greetings: ["Hi,", "Hello,", "Hope you’re well,", "Good morning,", "Good afternoon,"],
  bodies: ["Thanks for your message. I wanted to share a quick update.", "I’m following up with the information we discussed.", "Thank you for your time. Here is the next step.", "I appreciate your help and wanted to keep you informed.", "Just sharing a brief note so we can stay aligned.", "Thanks for checking in. I’ll keep this moving.", "I’ve reviewed the details and wanted to update you.", "Here is a short update for your reference."],
  closers: ["Please let me know what you think.", "I’ll follow up soon.", "Thanks again.", "Let me know if you need anything else.", "Looking forward to your reply.", "Have a great day."],
};
const emailMessageQualifiers = ["I hope this helps", "I appreciate your time", "I’ll keep you posted", "I’ll share more soon", "I’m available if needed", "I’ll review this again", "I’ll follow up shortly", "I’ll keep this moving", "I’ll send the next update", "I’m happy to clarify", "I’ll confirm the details", "I’ll stay in touch", "I’ll take care of it", "I’ll check and respond", "I’ll keep the record updated", "I’ll make a note of this", "I’ll coordinate the next step", "I’ll return with an update", "I’ll review the file", "I’ll follow through"];
const emailMessageContexts = ["when convenient", "for your reference", "as discussed", "before we continue", "for the next step", "at your convenience", "for a quick review", "as a small update", "for today", "for this week", "with appreciation", "before the meeting", "after our call", "for the project", "for the team", "for the record", "during the next step", "when you have time", "for follow-up", "as planned"];

const uniqueNaturalVariant = (base: string, phrases: string[], seen: Set<string>) => {
  let candidate = base;
  let variantIndex = 0;
  while (seen.has(candidate)) {
    const indexes = [
      variantIndex % phrases.length,
      Math.floor(variantIndex / phrases.length) % phrases.length,
      Math.floor(variantIndex / (phrases.length * phrases.length)) % phrases.length,
    ];
    const distinctPhrases = indexes.filter((index, position) => indexes.indexOf(index) === position).map((index) => phrases[index]);
    candidate = `${base} — ${distinctPhrases.join(", ")}`;
    variantIndex += 1;
  }
  seen.add(candidate);
  return candidate;
};

export const generateEmailPairs = (count: number): EmailPair[] => {
  const subjectBaseCount = emailSubjectParts.openers.length * emailSubjectParts.topics.length;
  const messageBaseCount = emailMessageParts.greetings.length * emailMessageParts.bodies.length * emailMessageParts.closers.length;
  const subjectVariantCount = subjectBaseCount * emailSubjectQualifiers.length * emailSubjectContexts.length;
  const messageVariantCount = messageBaseCount * emailMessageQualifiers.length * emailMessageContexts.length;
  const poolSize = Math.max(subjectVariantCount, messageVariantCount);
  const seenSubjects = new Set<string>();
  const seenMessages = new Set<string>();
  const subjectPhrases = [...emailSubjectQualifiers, ...emailSubjectContexts];
  const messagePhrases = [...emailMessageQualifiers, ...emailMessageContexts];
  const pool = Array.from({ length: poolSize }, (_, index) => {
    const subjectBaseIndex = index % subjectBaseCount;
    const subjectVariantIndex = Math.floor(index / subjectBaseCount);
    const subjectBase = `${emailSubjectParts.openers[Math.floor(subjectBaseIndex / emailSubjectParts.topics.length) % emailSubjectParts.openers.length]} ${emailSubjectParts.topics[subjectBaseIndex % emailSubjectParts.topics.length]} — ${emailSubjectQualifiers[subjectVariantIndex % emailSubjectQualifiers.length]} ${emailSubjectContexts[Math.floor(subjectVariantIndex / emailSubjectQualifiers.length) % emailSubjectContexts.length]}`;
    const subject = uniqueNaturalVariant(subjectBase, subjectPhrases, seenSubjects);
    const messageBaseIndex = index % messageBaseCount;
    const messageVariantIndex = Math.floor(index / messageBaseCount);
    const greeting = emailMessageParts.greetings[Math.floor(messageBaseIndex / (emailMessageParts.bodies.length * emailMessageParts.closers.length)) % emailMessageParts.greetings.length];
    const body = emailMessageParts.bodies[Math.floor(messageBaseIndex / emailMessageParts.closers.length) % emailMessageParts.bodies.length];
    const closer = emailMessageParts.closers[messageBaseIndex % emailMessageParts.closers.length];
    const qualifier = emailMessageQualifiers[messageVariantIndex % emailMessageQualifiers.length];
    const context = emailMessageContexts[Math.floor(messageVariantIndex / emailMessageQualifiers.length) % emailMessageContexts.length];
    const normalizedBody = `${greeting} ${body} ${closer}`.replace(/\s+/g, " ").trim();
    const message = uniqueNaturalVariant(`${normalizedBody} ${qualifier} ${context}.`, messagePhrases, seenMessages);
    return { id: createId("email", index), subject, message };
  });
  const shuffled = shuffle(pool);
  return Array.from({ length: count }, (_, index) => shuffled[index]);
};

export const generatePdfQueries = (topic: string, country: CountryProfile, contentType: string, language: string, count: number, startIndex = 0): DocumentQuery[] => {
  const safeTopic = cleanTopic(topic);
  const titles = shuffle([...publicBookTitles]);
  const editions = shuffle(documentEditionDescriptors);
  const formats = shuffle(documentFormatDescriptors);
  const contexts = shuffle(documentContextDescriptors);
  const descriptorCount = editions.length * formats.length * contexts.length;
  return Array.from({ length: count }, (_, index) => {
    const sequenceIndex = index + startIndex;
    const title = titles[sequenceIndex % titles.length];
    const descriptorIndex = Math.floor(sequenceIndex / titles.length) % descriptorCount;
    const edition = editions[descriptorIndex % editions.length];
    const format = formats[Math.floor(descriptorIndex / editions.length) % formats.length];
    const context = contexts[Math.floor(descriptorIndex / (editions.length * formats.length)) % contexts.length];
    const descriptor = sequenceIndex < titles.length ? "" : ` ${edition} ${format} ${context}`;
    const query = `${title}${descriptor} pdf`;
    return {
      id: createId("document", index),
      query,
      contentType,
      topic: safeTopic,
      source: contentSources[contentType] ?? "public or open-access repository",
    };
  });
};

export const defaultToolCounts = {
  trends: 1000,
  addresses: 1000,
  places: 1000,
  documents: 1000,
};

export const placeTypeOptions = ["Random", ...placeTypes];
export const documentTypeOptions = ["Book", "Ebook", "Research Paper", "Academic Article", "Manual", "Report", "Guide", "Course Material", "Government Document", "Technical Documentation", "Public Domain Book"];
export const languageOptions = ["English", "French", "Spanish", "German", "Arabic", "Portuguese", "Italian", "Any"];
export const trendCategoryOptions = ["All", "Technology", "Business", "Sports", "Entertainment", "News", "Shopping", "Travel", "Health", "Education"];
