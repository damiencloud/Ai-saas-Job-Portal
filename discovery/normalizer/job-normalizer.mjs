// @ts-check
/**
 * discovery/normalizer/job-normalizer.mjs
 * Normalizes raw job discovery entries into clean, unified Job objects.
 */

/**
 * @typedef {Object} NormalizedJob
 * @property {string} id - Unique hash identifier
 * @property {string} title - Clean job title
 * @property {string} company - Clean company name
 * @property {string} applyUrl - Absolute application URL
 * @property {string} location - Normalized location
 * @property {string} source - Origin source (e.g., 'DuckDuckGo', 'WeWorkRemotely', 'Greenhouse')
 * @property {string} discoveredAt - ISO timestamp
 */

/**
 * Normalizes a raw job discovery object.
 * @param {object} raw
 * @returns {NormalizedJob | null}
 */
export function normalizeJob(raw) {
  if (!raw || !raw.url || !raw.title) return null;

  const cleanUrl = String(raw.url).trim().replace(/#.*/, '');
  const cleanTitle = String(raw.title).replace(/\s+/g, ' ').trim();
  let cleanCompany = String(raw.company || 'Unknown').replace(/\s+/g, ' ').trim();

  // Strip trailing company suffixes (Inc, LLC, Ltd, Pvt Ltd) and punctuation
  cleanCompany = cleanCompany
    .replace(/,?\s*(Inc\.?|LLC\.?|Ltd\.?|Pvt\.?\s*Ltd\.?)$/i, '')
    .replace(/[,.-]+$/, '')
    .trim();

  const id = `job_${Buffer.from(cleanUrl).toString('hex').slice(0, 16)}`;

  return {
    id,
    title: cleanTitle,
    company: cleanCompany,
    applyUrl: cleanUrl,
    location: raw.location || 'Remote / Unspecified',
    source: raw.source || 'Discovery Engine',
    discoveredAt: new Date().toISOString(),
  };
}
