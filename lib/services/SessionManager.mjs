// @ts-check
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import path from 'path';

/**
 * SessionManager — Manages browser state persistence and step recovery.
 * Saves cookies, storage state, current step, and context metadata.
 * Enables automatic resume after CAPTCHA, OTP, 2FA, or browser crash.
 */
export class SessionManager {
  /**
   * @param {string} [sessionsDir]
   */
  constructor(sessionsDir = 'data/sessions') {
    this.sessionsDir = sessionsDir;
    mkdirSync(this.sessionsDir, { recursive: true });
  }

  /**
   * Generate a session filename.
   * @param {string} sessionId
   */
  _getSessionPath(sessionId) {
    return path.join(this.sessionsDir, `${sessionId}.json`);
  }

  /**
   * Save active browser session state and checkpoint data.
   * @param {string} sessionId - Unique identifier (e.g., job report number or UUID)
   * @param {import('playwright').BrowserContext} context - Playwright browser context
   * @param {object} stepData - Current execution step, URL, company, role, metadata
   * @param {import('playwright').Page} [page] - Active Playwright page instance
   * @returns {Promise<string>} Session file path
   */
  async saveSession(sessionId, context, stepData = {}, page = null) {
    let storageState = null;
    let localStorageData = {};
    let sessionStorageData = {};
    let currentFormValues = {};

    if (context && typeof context.storageState === 'function') {
      try {
        storageState = await context.storageState();
      } catch (err) {
        console.warn(`⚠️ SessionManager: unable to capture storageState — ${err.message}`);
      }
    }

    if (page && typeof page.evaluate === 'function') {
      try {
        localStorageData = await page.evaluate(() => ({ ...window.localStorage })).catch(() => ({}));
        sessionStorageData = await page.evaluate(() => ({ ...window.sessionStorage })).catch(() => ({}));
        currentFormValues = await page.evaluate(() => {
          const values = {};
          const inputs = document.querySelectorAll('input, select, textarea');
          inputs.forEach((el) => {
            const name = el.getAttribute('name') || el.getAttribute('id');
            if (name && el instanceof HTMLInputElement) {
              values[name] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
            }
          });
          return values;
        }).catch(() => ({}));
      } catch {}
    }

    const payload = {
      sessionId,
      timestamp: new Date().toISOString(),
      step: stepData.step || 'UNKNOWN',
      url: stepData.url || (page ? page.url() : ''),
      company: stepData.company || '',
      role: stepData.role || '',
      reportNo: stepData.reportNo || null,
      reason: stepData.reason || 'MANUAL_INTERVENTION_REQUIRED',
      storageState,
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      currentFormValues: stepData.currentFormValues || currentFormValues,
      uploadedFiles: stepData.uploadedFiles || [],
      providerState: stepData.providerState || {},
      metadata: stepData.metadata || {},
    };

    const filePath = this._getSessionPath(sessionId);
    writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`💾 Session saved: ${filePath} (Step: ${payload.step})`);
    return filePath;
  }

  /**
   * Load saved session payload.
   * @param {string} sessionId
   * @returns {object|null}
   */
  loadSession(sessionId) {
    const filePath = this._getSessionPath(sessionId);
    if (!existsSync(filePath)) return null;
    try {
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`❌ SessionManager: failed to load session ${sessionId} — ${err.message}`);
      return null;
    }
  }

  /**
   * Restore Playwright browser context from saved session.
   * @param {object} playwrightBrowser - Playwright Browser instance
   * @param {string} sessionId
   * @returns {Promise<{ context: import('playwright').BrowserContext, sessionData: object }|null>}
   */
  async restoreContext(playwrightBrowser, sessionId) {
    const sessionData = this.loadSession(sessionId);
    if (!sessionData) return null;

    const options = {};
    if (sessionData.storageState) {
      options.storageState = sessionData.storageState;
    }

    const context = await playwrightBrowser.newContext(options);
    return { context, sessionData };
  }

  /**
   * Clear session after successful completion.
   * @param {string} sessionId
   */
  clearSession(sessionId) {
    const filePath = this._getSessionPath(sessionId);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {}
    }
  }

  /**
   * List all pending paused sessions requiring user intervention.
   * @returns {object[]}
   */
  listPendingSessions() {
    if (!existsSync(this.sessionsDir)) return [];
    const files = readdirSync(this.sessionsDir).filter(f => f.endsWith('.json'));
    const sessions = [];

    for (const f of files) {
      try {
        const content = JSON.parse(readFileSync(path.join(this.sessionsDir, f), 'utf-8'));
        sessions.push(content);
      } catch {}
    }
    return sessions;
  }
}
