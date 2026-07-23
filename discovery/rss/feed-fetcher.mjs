// @ts-check
/**
 * discovery/rss/feed-fetcher.mjs
 * RSS and XML job feed fetcher for public job boards (WeWorkRemotely, RemoteOK, etc.).
 */

const RSS_FEEDS = [
  { name: 'WeWorkRemotely Dev', url: 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss' },
  { name: 'WeWorkRemotely DevOps', url: 'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss' },
  { name: 'RemoteOK', url: 'https://remoteok.com/rss' },
];

/**
 * Fetches and parses RSS job feeds into unified job entries.
 * @param {{ limit?: number, timeoutMs?: number }} [options]
 * @returns {Promise<Array<{ title: string, company: string, url: string, source: string }>>}
 */
export async function fetchRSSJobs(options = {}) {
  const limit = options.limit || 30;
  const jobs = [];

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(options.timeoutMs || 10000),
      });

      if (!res.ok) continue;
      const xml = await res.text();

      // Simple regex extraction for RSS <item> tags
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

      for (const itemXml of itemMatches) {
        const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);

        if (titleMatch && linkMatch) {
          const rawTitle = titleMatch[1].trim();
          const url = linkMatch[1].trim();

          // Split "Company: Title" or "Title at Company"
          let company = feed.name;
          let title = rawTitle;

          if (rawTitle.includes(' is hiring ')) {
            const parts = rawTitle.split(' is hiring ');
            company = parts[0];
            title = parts[1];
          } else if (rawTitle.includes(' at ')) {
            const parts = rawTitle.split(' at ');
            title = parts[0];
            company = parts[1];
          } else if (rawTitle.includes(': ')) {
            const parts = rawTitle.split(': ');
            company = parts[0];
            title = parts[1];
          }

          jobs.push({
            title,
            company,
            url,
            source: feed.name,
          });

          if (jobs.length >= limit) break;
        }
      }
    } catch {
      // Ignore individual feed errors
    }
  }

  return jobs;
}
