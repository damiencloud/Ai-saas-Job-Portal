// @ts-check
/**
 * discovery/search/engine.mjs
 * Multi-engine search aggregator for public ATS boards and career portals.
 */

import { expandQuery } from './query-expander.mjs';

/**
 * Searches public search APIs / ATS search endpoints for job opportunities.
 * @param {string} query - E.g. "DevOps Bangalore", "Cloud Engineer India"
 * @param {{ limit?: number, timeoutMs?: number }} [options]
 * @returns {Promise<Array<{ title: string, company: string, url: string, source: string, location?: string }>>}
 */
export async function searchJobs(query, options = {}) {
  const expanded = expandQuery(query);
  const limit = options.limit || 20;
  const results = [];
  const seenUrls = new Set();

  // 1. Query DuckDuckGo public HTML search for direct ATS URLs (Greenhouse, Lever, Ashby, Workday)
  for (const term of expanded.searchTerms.slice(0, 3)) {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(term + ' site:greenhouse.io OR site:lever.co OR site:ashbyhq.com')}`;
    try {
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(options.timeoutMs || 10000),
      });

      if (res.ok) {
        const html = await res.text();
        const urlMatches = html.match(/https?:\/\/(?:job-boards\.greenhouse\.io|jobs\.lever\.co|jobs\.ashbyhq\.com)\/[a-zA-Z0-9_.-]+(?:\/jobs\/[a-zA-Z0-9_-]+)?/gi) || [];

        for (const rawUrl of urlMatches) {
          const cleanUrl = rawUrl.replace(/&amp;.*/, '');
          if (!seenUrls.has(cleanUrl)) {
            seenUrls.add(cleanUrl);

            // Extract company name from URL structure
            let company = 'Discovered Company';
            const ghMatch = cleanUrl.match(/greenhouse\.io\/([a-zA-Z0-9_.-]+)/i);
            const leverMatch = cleanUrl.match(/lever\.co\/([a-zA-Z0-9_.-]+)/i);
            const ashbyMatch = cleanUrl.match(/ashbyhq\.com\/([a-zA-Z0-9_.-]+)/i);

            if (ghMatch) company = ghMatch[1];
            else if (leverMatch) company = leverMatch[1];
            else if (ashbyMatch) company = ashbyMatch[1];

            // Capitalize company name
            company = company.charAt(0).toUpperCase() + company.slice(1);

            results.push({
              title: query,
              company,
              url: cleanUrl,
              source: 'DuckDuckGo Public Discovery',
              location: expanded.locations[0] || 'Remote / Unspecified',
            });

            if (results.length >= limit) break;
          }
        }
      }
    } catch {
      // Ignore transient network errors silently
    }
  }

  return results;
}
