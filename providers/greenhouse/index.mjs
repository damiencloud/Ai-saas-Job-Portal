// @ts-check
import { BaseProvider } from '../_base.mjs';

/**
 * Greenhouse ATS Provider Plugin — implements full lifecycle (discover, schema, prefill, submit).
 */
const ALLOWED_GREENHOUSE_HOSTS = new Set([
  'boards-api.greenhouse.io',
  'boards.greenhouse.io',
  'job-boards.greenhouse.io',
  'job-boards.eu.greenhouse.io',
]);

function assertGreenhouseUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`greenhouse: invalid URL: ${url}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`greenhouse: URL must use HTTPS: ${url}`);
  if (!ALLOWED_GREENHOUSE_HOSTS.has(parsed.hostname))
    throw new Error(`greenhouse: untrusted hostname "${parsed.hostname}" — must be one of: ${[...ALLOWED_GREENHOUSE_HOSTS].join(', ')}`);
  return url;
}

function resolveApiUrl(entry) {
  if (entry.api) {
    assertGreenhouseUrl(entry.api);
    return entry.api;
  }
  const url = entry.careers_url || '';
  const match = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (match) return `https://boards-api.greenhouse.io/v1/boards/${match[1]}/jobs`;
  return null;
}

function toEpochMs(value) {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export class GreenhouseProvider extends BaseProvider {
  constructor() {
    super('greenhouse', 'Greenhouse ATS');
  }

  detect(entry) {
    try {
      const apiUrl = resolveApiUrl(entry);
      return apiUrl ? { url: apiUrl } : null;
    } catch {
      return null;
    }
  }

  async fetch(entry, ctx) {
    const apiUrl = resolveApiUrl(entry);
    if (!apiUrl) throw new Error(`greenhouse: cannot derive API URL for ${entry.name}`);
    assertGreenhouseUrl(apiUrl);
    const json = /** @type {any} */ (await ctx.fetchJson(apiUrl, { redirect: 'error' }));
    const jobs = Array.isArray(json?.jobs) ? json.jobs : [];
    return jobs.filter(j => j.absolute_url).map(j => ({
      title: j.title || '',
      url: j.absolute_url,
      company: entry.name,
      location: j.location?.name || '',
      postedAt: toEpochMs(j.first_published),
    }));
  }

  async extractFormSchema(pageUrl, options = {}) {
    return {
      providerId: this.id,
      url: pageUrl,
      supported: true,
      fields: [
        { name: 'first_name', selector: '#first_name', type: 'text', required: true },
        { name: 'last_name', selector: '#last_name', type: 'text', required: true },
        { name: 'email', selector: '#email', type: 'email', required: true },
        { name: 'phone', selector: '#phone', type: 'tel', required: false },
        { name: 'resume', selector: 'input[type="file"][name="resume"]', type: 'file', required: true },
      ],
    };
  }

  async prefillForm(page, profile, answers = {}, options = {}) {
    const filled = [];
    const errors = [];

    try {
      if (profile.first_name) {
        await page.fill('#first_name, input[name*="first_name"]', profile.first_name);
        filled.push('first_name');
      }
      if (profile.last_name) {
        await page.fill('#last_name, input[name*="last_name"]', profile.last_name);
        filled.push('last_name');
      }
      if (profile.email) {
        await page.fill('#email, input[name*="email"]', profile.email);
        filled.push('email');
      }
      if (profile.phone) {
        await page.fill('#phone, input[name*="phone"]', profile.phone);
        filled.push('phone');
      }
      if (options.pdfPath) {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.setInputFiles(options.pdfPath);
          filled.push('resume');
        }
      }
      return { success: true, filledFields: filled, missingFields: [], errors };
    } catch (err) {
      errors.push(err.message);
      return { success: false, filledFields: filled, missingFields: [], errors };
    }
  }

  async submitForm(page, options = {}) {
    try {
      const submitBtn = await page.$('#submit_app, button[type="submit"], input[type="submit"]');
      if (!submitBtn) throw new Error('Greenhouse submit button not found');
      await submitBtn.click();
      await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
      return { success: true, confirmationUrl: page.url() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

const instance = new GreenhouseProvider();
export default instance;
