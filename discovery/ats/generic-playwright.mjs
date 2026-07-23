// @ts-check
/**
 * discovery/ats/generic-playwright.mjs
 * Fallback automation driver for pre-filling unknown or custom ATS application forms using Playwright.
 */

import { BaseProvider } from '../../providers/_base.mjs';

export class GenericPlaywrightProvider extends BaseProvider {
  constructor() {
    super('generic', 'Generic Playwright ATS Fallback');
  }

  /**
   * Prefills standard form input selectors on unknown application pages.
   * @param {import('playwright').Page} page
   * @param {object} profile
   * @param {object} [answers]
   */
  async prefillForm(page, profile, answers = {}) {
    const filledFields = [];

    // Helper for safe input filling
    const tryFill = async (selectors, value) => {
      if (!value) return false;
      for (const selector of selectors) {
        try {
          const input = page.locator(selector).first();
          if (await input.isVisible({ timeout: 1000 })) {
            await input.fill(value);
            return true;
          }
        } catch {
          // Try next selector
        }
      }
      return false;
    };

    // First Name
    if (await tryFill(['input[name*="first" i]', 'input[id*="first" i]', 'input[aria-label*="first name" i]'], profile.first_name)) {
      filledFields.push('first_name');
    }

    // Last Name
    if (await tryFill(['input[name*="last" i]', 'input[id*="last" i]', 'input[aria-label*="last name" i]'], profile.last_name)) {
      filledFields.push('last_name');
    }

    // Full Name (if first/last weren't separate)
    if (!filledFields.includes('first_name')) {
      if (await tryFill(['input[name*="name" i]', 'input[id*="name" i]', 'input[aria-label*="full name" i]'], profile.full_name || `${profile.first_name} ${profile.last_name}`)) {
        filledFields.push('full_name');
      }
    }

    // Email
    if (await tryFill(['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'], profile.email)) {
      filledFields.push('email');
    }

    // Phone
    if (await tryFill(['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'], profile.phone)) {
      filledFields.push('phone');
    }

    // Resume Upload
    if (profile.pdfPath) {
      try {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible({ timeout: 1000 })) {
          await fileInput.setInputFiles(profile.pdfPath);
          filledFields.push('resume');
        }
      } catch {
        // Resume upload optional
      }
    }

    return {
      success: filledFields.length > 0,
      filledFields,
      unfilledRequired: [],
    };
  }

  /**
   * Submits the generic application form.
   * @param {import('playwright').Page} page
   */
  async submitForm(page) {
    try {
      const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Apply")').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        return { success: true, message: 'Submitted via Generic Playwright Driver' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Submit button not found' };
  }
}
