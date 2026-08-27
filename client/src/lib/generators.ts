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

const emailThemes = [
  { subject: "the project plan", message: "I’m sharing the latest project plan so we can agree on the next step." },
  { subject: "the meeting schedule", message: "I’m confirming the meeting schedule and the time that works best for everyone." },
  { subject: "the document review", message: "I’m following up on the document review and the points that need your attention." },
  { subject: "the requested information", message: "I’m sending the requested information so you can review the details." },
  { subject: "the next steps", message: "I’m outlining the next steps so we can keep the work moving." },
  { subject: "the project update", message: "I’m sharing a project update with the latest progress and open items." },
  { subject: "the task deadline", message: "I’m checking the task deadline so we can keep the delivery on track." },
  { subject: "the shared file", message: "I’m following up on the shared file and the changes included in it." },
  { subject: "the appointment details", message: "I’m confirming the appointment details and the information needed beforehand." },
  { subject: "the team decision", message: "I’m summarizing the team decision so everyone has the same understanding." },
  { subject: "the budget details", message: "I’m sharing the budget details so we can review the numbers together." },
  { subject: "the delivery status", message: "I’m checking the delivery status and will keep you informed of the progress." },
  { subject: "the event details", message: "I’m sending the event details so the arrangements are clear." },
  { subject: "the feedback request", message: "I’m asking for your feedback so we can improve the next version." },
  { subject: "the account request", message: "I’m following up on the account request and the remaining information." },
  { subject: "the training plan", message: "I’m sharing the training plan so the sessions can be organized smoothly." },
  { subject: "the application status", message: "I’m checking the application status and the next action required." },
  { subject: "the travel arrangements", message: "I’m confirming the travel arrangements and the details for the trip." },
  { subject: "the support request", message: "I’m following up on the support request and the solution being prepared." },
  { subject: "the final confirmation", message: "I’m sending the final confirmation so we can close this item with confidence." },
];
const emailSubjectStyles = ["A quick note about", "A quick update on", "Following up on", "A note about", "Checking in about", "Details for", "Reviewing", "Confirming", "Regarding", "Sharing a note about"];
const emailSubjectQualifiers = ["for review", "for reference", "for approval", "for discussion", "for planning", "for confirmation", "for follow-up", "for your input", "for the record", "for next steps", "for a quick look", "for this project", "for the team", "for today", "for tomorrow", "for the meeting", "for the schedule", "for the update", "for the file", "for your notes"];
const emailSubjectContexts = ["this morning", "this afternoon", "this evening", "this week", "next week", "when convenient", "before the meeting", "after our call", "as discussed", "as planned", "with the next step", "for a quick check", "with your review", "on the record", "in the current project", "with the latest update", "in the shared file", "with the team", "today", "tomorrow"];
const emailGreetings = ["Hi,", "Hello,", "Hope you’re well,", "Good morning,", "Good afternoon,"];
const emailMessageTransitions = ["I hope you’re doing well.", "I wanted to send a quick note.", "Thanks for your time.", "Just a quick update from me.", "I’m getting in touch today.", "I wanted to keep this moving.", "Here’s the information I have.", "I’m sharing a brief note.", "I hope this reaches you well.", "Thanks for taking a moment to read this."];
const emailMessageNotes = ["I hope this helps", "I appreciate your time", "I’ll keep you posted", "I’ll share more soon", "I’m available if needed", "I’ll review this again", "I’ll follow up shortly", "I’ll keep this moving", "I’ll send the next update", "I’m happy to clarify", "I’ll confirm the details", "I’ll stay in touch", "I’ll take care of it", "I’ll check and respond", "I’ll keep the record updated", "I’ll make a note of this", "I’ll coordinate the next step", "I’ll return with an update", "I’ll review the file", "I’ll follow through"];
const emailMessageClosers = ["Let me know what you think.", "Please let me know if you have any questions.", "I’d be happy to clarify anything.", "Let me know if this works for you.", "I look forward to hearing from you.", "Thanks for taking a look.", "I’ll keep you posted.", "Please share any feedback when convenient.", "Let me know if anything needs to change.", "Thanks again for your help.", "I appreciate your time.", "I’ll follow up soon.", "Please let me know what you prefer.", "I’m here if you need anything else.", "Thanks for reviewing this.", "I look forward to your thoughts.", "Let me know how you’d like to proceed.", "I’ll be in touch with the next update.", "Please feel free to ask any questions.", "Thanks again."];

export const generateEmailPairs = (count: number): EmailPair[] => {
  const poolSize = emailThemes.length * emailSubjectStyles.length * emailSubjectQualifiers.length * emailSubjectContexts.length;
  const pool = Array.from({ length: poolSize }, (_, index) => {
    const theme = emailThemes[index % emailThemes.length];
    const subjectBaseIndex = Math.floor(index / emailThemes.length);
    const subjectQualifierIndex = subjectBaseIndex % emailSubjectQualifiers.length;
    const subjectContextIndex = Math.floor(subjectBaseIndex / emailSubjectQualifiers.length) % emailSubjectContexts.length;
    const subjectStyleIndex = Math.floor(subjectBaseIndex / (emailSubjectQualifiers.length * emailSubjectContexts.length)) % emailSubjectStyles.length;
    const subject = `${emailSubjectStyles[subjectStyleIndex]} ${theme.subject} — ${emailSubjectQualifiers[subjectQualifierIndex]}, ${emailSubjectContexts[subjectContextIndex]}`;
    const messageBaseIndex = Math.floor(index / emailThemes.length);
    const greeting = emailGreetings[messageBaseIndex % emailGreetings.length];
    const transition = emailMessageTransitions[Math.floor(messageBaseIndex / emailGreetings.length) % emailMessageTransitions.length];
    const note = emailMessageNotes[Math.floor(messageBaseIndex / (emailGreetings.length * emailMessageTransitions.length)) % emailMessageNotes.length];
    const closer = emailMessageClosers[Math.floor(messageBaseIndex / (emailGreetings.length * emailMessageTransitions.length * emailMessageNotes.length)) % emailMessageClosers.length];
    const message = `${greeting} ${transition} ${theme.message} ${note}. ${closer}`;
    return { id: createId("email", index), subject, message };
  });
  return shuffle(pool).slice(0, count);
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
