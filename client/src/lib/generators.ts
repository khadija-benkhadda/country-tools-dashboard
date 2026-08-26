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
const placeTypes = ["Restaurant", "Coffee Shop", "Bookstore", "Library", "Museum", "Park", "Shopping Center", "Hotel", "Gym", "Cinema", "Tourist Attraction", "University", "Local Market"];
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
export const openGoogleTrends = (query: string) => `https://trends.google.com/trends/explore?q=${encode(query)}`;

const createId = (prefix: string, index: number) => `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;

export const generateTrendIdeas = (country: CountryProfile, category: string, count: number): TrendIdea[] => {
  const available = country.trendIdeas[category] ?? country.trendIdeas.All;
  const randomizedIdeas = shuffle(available);
  return Array.from({ length: count }, (_, index) => {
    const keyword = randomizedIdeas[index % randomizedIdeas.length];
    const city = country.cities[index % country.cities.length];
    return {
      id: createId("trend", index),
      keyword,
      category,
      trendType: pick(trendTypes),
      searchQuery: `${keyword} ${city}, ${country.name}`,
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

export const generateAddresses = (country: CountryProfile, count: number) => Array.from({ length: count }, (_, index) => generateRandomAddress(country, index));

export const generateMapQueries = (country: CountryProfile, placeType: string, count: number): PlaceQuery[] => {
  const types = placeType === "Random" ? Array.from({ length: count }, (_, index) => placeTypes[index % placeTypes.length]) : Array.from({ length: count }, () => placeType);
  const randomizedTypes = shuffle(types);
  return randomizedTypes.map((type, index) => {
    const cityIndex = randomInt(0, country.cities.length - 1);
    const city = country.cities[cityIndex];
    const region = country.regions[cityIndex] ?? country.regions[0];
    return {
      id: createId("place", index),
      placeType: type,
      city,
      region,
      country: country.name,
      query: `${type}s in ${city}, ${country.name}`,
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

const emailSubjectParts = {
  openers: ["Quick follow-up", "A small update", "Checking in", "One thing to share", "A note for you", "Next steps", "Friendly reminder", "Thank you", "Your request", "A helpful update"],
  topics: ["on your request", "about the details", "for this week", "on the next step", "about our conversation", "for your review", "on the plan", "about the schedule", "for your reference", "before we continue"],
};

const emailMessageParts = {
  greetings: ["Hi,", "Hello,", "Hope you’re well,", "Good morning,", "Good afternoon,"],
  bodies: ["Thanks for your message. I wanted to share a quick update.", "I’m following up with the information we discussed.", "Thank you for your time. Here is the next step.", "I appreciate your help and wanted to keep you informed.", "Just sharing a brief note so we can stay aligned.", "Thanks for checking in. I’ll keep this moving.", "I’ve reviewed the details and wanted to update you.", "Here is a short update for your reference."],
  closers: ["Please let me know what you think.", "I’ll follow up soon.", "Thanks again.", "Let me know if you need anything else.", "Looking forward to your reply.", "Have a great day."],
};

export const generateEmailPairs = (count: number): EmailPair[] => {
  const pool = Array.from({ length: emailSubjectParts.openers.length * emailSubjectParts.topics.length * emailMessageParts.greetings.length * emailMessageParts.bodies.length * emailMessageParts.closers.length }, (_, index) => {
    const subject = `${emailSubjectParts.openers[Math.floor(index / emailSubjectParts.topics.length) % emailSubjectParts.openers.length]} ${emailSubjectParts.topics[index % emailSubjectParts.topics.length]}`;
    const greeting = emailMessageParts.greetings[Math.floor(index / emailMessageParts.bodies.length) % emailMessageParts.greetings.length];
    const body = emailMessageParts.bodies[Math.floor(index / (emailMessageParts.greetings.length * emailMessageParts.closers.length)) % emailMessageParts.bodies.length];
    const closer = emailMessageParts.closers[index % emailMessageParts.closers.length];
    return { subject, message: `${greeting} ${body} ${closer}` };
  });
  const shuffled = shuffle(pool);
  return Array.from({ length: count }, (_, index) => {
    const pair = shuffled[index % shuffled.length];
    return { id: createId("email", index), subject: pair.subject + (index >= shuffled.length ? ` — ${index + 1}` : ""), message: pair.message + (index >= shuffled.length ? ` Ref: ${index + 1}.` : "") };
  });
};

export const generatePdfQueries = (topic: string, country: CountryProfile, contentType: string, language: string, count: number): DocumentQuery[] => {
  const safeTopic = cleanTopic(topic);
  const titles = shuffle([...publicBookTitles]);
  return Array.from({ length: count }, (_, index) => {
    const title = titles[index % titles.length];
    const query = `${title} pdf`;
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
