// @ts-check
/**
 * discovery/ats/detector.mjs
 * ATS detection engine connecting discovery URLs to Career-Ops provider plugins or generic Playwright driver.
 */

import { loadProviders, resolveProvider } from '../../providers/_registry.mjs';
import path from 'path';

let cachedProviders = null;

async function getProviders() {
  if (!cachedProviders) {
    const providersDir = path.resolve('providers');
    cachedProviders = await loadProviders(providersDir);
  }
  return cachedProviders;
}

/**
 * Detects ATS type for a given application or portal URL.
 * @param {string} url - Target job page URL
 * @returns {Promise<{ type: string, provider: object | null, isKnown: boolean }>}
 */
export async function detectATS(url) {
  if (!url || typeof url !== 'string') {
    return { type: 'unknown', provider: null, isKnown: false };
  }

  const urlLower = url.toLowerCase();

  // Pattern checks for known ATS domains
  if (urlLower.includes('greenhouse.io')) {
    return { type: 'greenhouse', provider: null, isKnown: true };
  }
  if (urlLower.includes('lever.co')) {
    return { type: 'lever', provider: null, isKnown: true };
  }
  if (urlLower.includes('ashbyhq.com')) {
    return { type: 'ashby', provider: null, isKnown: true };
  }
  if (urlLower.includes('workday.com') || urlLower.includes('myworkdayjobs.com')) {
    return { type: 'workday', provider: null, isKnown: true };
  }
  if (urlLower.includes('smartrecruiters.com')) {
    return { type: 'smartrecruiters', provider: null, isKnown: true };
  }
  if (urlLower.includes('workable.com')) {
    return { type: 'workable', provider: null, isKnown: true };
  }
  if (urlLower.includes('bamboohr.com')) {
    return { type: 'bamboohr', provider: null, isKnown: true };
  }

  const providers = await getProviders();
  const entry = { url, name: 'Target Portal', careers_url: url };

  const resolved = resolveProvider(entry, providers);
  if (resolved && resolved.provider) {
    return {
      type: resolved.provider.id,
      provider: resolved.provider,
      isKnown: true,
    };
  }

  // Fallback to generic Playwright driver for unknown portals
  return { type: 'generic', provider: null, isKnown: false };
}
