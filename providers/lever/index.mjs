// @ts-check
import { BaseProvider } from '../_base.mjs';

/**
 * Lever ATS Provider Plugin — implements full lifecycle (discover, schema, prefill, submit).
 */
const ALLOWED_LEVER_HOSTS = new Set(['api.lever.co', 'api.eu.lever.co']);

function assertLeverUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`lever: invalid URL: ${url}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`lever: URL must use HTTPS: ${url}`);
  if (!ALLOWED_LEVER_HOSTS.has(parsed.hostname))
    throw new Error(`lever: untrusted hostname "${parsed.hostname}" — must be one of: ${[...ALLOWED_LEVER_HOSTS].join(', ')}`);
  return url;
}

function resolveApiUrl(entry) {
  if (entry.api) {
    assertLeverUrl(entry.api);
    return entry.api;
  }
  let url;
  try {
    url = new URL(entry.careers_url || '');
  } catch {
    return null;
  }
  const host = url.hostname.match(/^jobs\.((?:eu\.)?lever\.co)$/);
  if (!host) return null;
  const slug = url.pathname.split('/').filter(Boolean)[0];
  if (!slug) return null;
  return `https://api.${host[1]}/v0/postings/${slug}`;
}

export class LeverProvider extends BaseProvider {
  constructor() {
    super('lever', 'Lever ATS');
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
    if (!apiUrl) throw new Error(`lever: cannot derive API URL for ${entry.name}`);
    assertLeverUrl(apiUrl);
    const json = await ctx.fetchJson(apiUrl, { redirect: 'error' });
    if (!Array.isArray(json)) return [];
    return json.map(j => ({
      title: j.text || '',
      url: j.hostedUrl || '',
      company: entry.name,
      location: j.categories?.location || '',
      description: typeof j.descriptionPlain === 'string' ? j.descriptionPlain : '',
      postedAt: typeof j.createdAt === 'number' ? j.createdAt : undefined,
    }));
  }

  async extractFormSchema(pageUrl, options = {}) {
    return {
      providerId: this.id,
      url: pageUrl,
      supported: true,
      fields: [
        { name: 'name', selector: 'input[name="name"]', type: 'text', required: true },
        { name: 'email', selector: 'input[name="email"]', type: 'email', required: true },
        { name: 'phone', selector: 'input[name="phone"]', type: 'tel', required: false },
        { name: 'org', selector: 'input[name="org"]', type: 'text', required: false },
        { name: 'resume', selector: 'input[type="file"][name="resume"]', type: 'file', required: true },
      ],
    };
  }

  async prefillForm(page, profile, answers = {}, options = {}) {
    const filled = [];
    const errors = [];

    try {
      const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      if (fullName) {
        await page.fill('input[name="name"]', fullName);
        filled.push('name');
      }
      if (profile.email) {
        await page.fill('input[name="email"]', profile.email);
        filled.push('email');
      }
      if (profile.phone) {
        await page.fill('input[name="phone"]', profile.phone);
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
      const submitBtn = await page.$('#btn-submit, button[type="submit"]');
      if (!submitBtn) throw new Error('Lever submit button not found');
      await submitBtn.click();
      await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
      return { success: true, confirmationUrl: page.url() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

const instance = new LeverProvider();
export default instance;
