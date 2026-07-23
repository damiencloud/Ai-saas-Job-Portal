/**
 * BaseProvider — Abstract Base Class for all career-ops ATS Provider Plugins.
 *
 * Every provider plugin implements or extends this contract.
 * Supports discovery, text/schema extraction, form pre-filling, and autonomous submission.
 */

export class BaseProvider {
  /**
   * @param {string} id - Unique identifier for the provider (e.g., 'greenhouse', 'lever').
   * @param {string} name - Human-readable display name.
   */
  constructor(id, name) {
    if (!id) throw new Error('Provider id must be defined');
    this.id = id;
    this.name = name || id;
  }

  /**
   * Auto-detect if this provider handles a given portal entry.
   * @param {import('./_types.js').PortalEntry} entry
   * @returns {{ url: string } | null}
   */
  detect(entry) {
    return null;
  }

  /**
   * Fetch job listings from a portal entry zero-token style via public HTTP/JSON endpoints.
   * @param {import('./_types.js').PortalEntry} entry
   * @param {import('./_types.js').Context} ctx
   * @returns {Promise<import('./_types.js').Job[]>}
   */
  async fetch(entry, ctx) {
    throw new Error(`Provider ${this.id} does not implement fetch()`);
  }

  /**
   * Extract application form field schema from a job posting URL.
   * @param {string} pageUrl
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async extractFormSchema(pageUrl, options = {}) {
    return {
      fields: [],
      url: pageUrl,
      providerId: this.id,
      supported: false,
    };
  }

  /**
   * Prefill application form using candidate profile and generated answers.
   * @param {import('playwright').Page} page - Active Playwright page object
   * @param {object} profile - Candidate identity profile
   * @param {object} answers - Key-value pair of form responses
   * @param {object} [options] - Additional options (e.g. pdfPath)
   * @returns {Promise<{ success: boolean, filledFields: string[], missingFields: string[], errors: string[] }>}
   */
  async prefillForm(page, profile, answers = {}, options = {}) {
    return {
      success: false,
      filledFields: [],
      missingFields: [],
      errors: [`Provider ${this.id} prefillForm not implemented`],
    };
  }

  /**
   * Submit application autonomously on the page.
   * @param {import('playwright').Page} page - Active Playwright page object
   * @param {object} [options]
   * @returns {Promise<{ success: boolean, confirmationUrl?: string, error?: string }>}
   */
  async submitForm(page, options = {}) {
    return {
      success: false,
      error: `Provider ${this.id} submitForm not implemented`,
    };
  }
}
