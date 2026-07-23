// @ts-check
/**
 * discovery/search/query-expander.mjs
 * Expands search queries (e.g. "DevOps Bangalore") into title variations,
 * location filters, and ATS search query strings.
 */

/**
 * Standard role title mappings.
 */
const TITLE_SYNONYMS = {
  devops: ['DevOps Engineer', 'Infrastructure Engineer', 'Site Reliability Engineer', 'SRE', 'Cloud Infrastructure Engineer'],
  cloud: ['Cloud Engineer', 'Cloud Architect', 'AWS Engineer', 'Cloud Infrastructure Engineer'],
  backend: ['Backend Engineer', 'Backend Developer', 'Software Engineer - Backend', 'Node.js Engineer', 'Python Backend Engineer'],
  frontend: ['Frontend Engineer', 'React Engineer', 'Next.js Developer', 'Full Stack Developer'],
  fullstack: ['Full Stack Developer', 'Full Stack Engineer', 'Software Engineer - Full Stack', 'AI Full Stack Developer'],
  python: ['Python Developer', 'Python Engineer', 'Backend Developer (Python)', 'FastAPI Developer'],
  ai: ['AI Engineer', 'Applied AI Engineer', 'AI Software Engineer', 'Machine Learning Engineer'],
};

/**
 * Expands a raw query string into structured search terms and target titles.
 * @param {string} rawQuery - E.g. "DevOps Bangalore", "Cloud Engineer India", "Python Backend Europe"
 * @returns {{ primary: string, titles: string[], locations: string[], searchTerms: string[] }}
 */
export function expandQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { primary: '', titles: [], locations: [], searchTerms: [] };
  }

  const queryLower = rawQuery.toLowerCase().trim();
  const tokens = queryLower.split(/\s+/);

  const matchedTitles = new Set();
  const matchedLocations = new Set();

  for (const token of tokens) {
    if (TITLE_SYNONYMS[token]) {
      TITLE_SYNONYMS[token].forEach((t) => matchedTitles.add(t));
    }
    if (['bangalore', 'bengaluru', 'kochi', 'kerala', 'india', 'remote', 'europe', 'us', 'usa'].includes(token)) {
      matchedLocations.add(token.charAt(0).toUpperCase() + token.slice(1));
    }
  }

  // Fallback to original raw string if no synonyms matched
  if (matchedTitles.size === 0) {
    matchedTitles.add(rawQuery);
  }

  const titlesArray = Array.from(matchedTitles);
  const locationsArray = Array.from(matchedLocations);

  const searchTerms = [];
  for (const title of titlesArray) {
    if (locationsArray.length > 0) {
      for (const loc of locationsArray) {
        searchTerms.push(`${title} ${loc}`);
      }
    } else {
      searchTerms.push(title);
    }
  }

  return {
    primary: rawQuery,
    titles: titlesArray,
    locations: locationsArray,
    searchTerms,
  };
}
