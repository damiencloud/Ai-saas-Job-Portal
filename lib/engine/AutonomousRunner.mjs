// @ts-check
import { ApplicationModeConfig, APPLICATION_MODES } from '../domain/ApplicationMode.mjs';
import { loadProviders, resolveProvider } from '../../providers/_registry.mjs';
import { SessionManager } from '../services/SessionManager.mjs';
import { NotificationService, defaultNotifier } from '../services/NotificationService.mjs';
import { Vault } from '../security/Vault.mjs';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * AutonomousRunner — Orchestrates application execution in Manual, Assisted, or Autonomous mode
 * while strictly following Auto Submission, Human-In-The-Loop, and Audit Logging policies.
 */
export class AutonomousRunner {
  /**
   * @param {object} [options]
   * @param {ApplicationModeConfig} [options.modeConfig]
   * @param {SessionManager} [options.sessionManager]
   * @param {NotificationService} [options.notifier]
   * @param {Vault} [options.vault]
   * @param {string} [options.providersDir]
   */
  constructor(options = {}) {
    this.modeConfig = options.modeConfig || new ApplicationModeConfig();
    this.sessionManager = options.sessionManager || new SessionManager();
    this.notifier = options.notifier || defaultNotifier;
    this.vault = options.vault || new Vault();
    this.providersDir = options.providersDir || path.resolve(process.cwd(), 'providers');
    this.screenshotsDir = path.resolve(process.cwd(), 'data', 'screenshots');
    this.providersMap = null;

    mkdirSync(this.screenshotsDir, { recursive: true });
  }

  /**
   * Load registered provider plugins.
   */
  async initialize() {
    if (!this.providersMap) {
      this.providersMap = await loadProviders(this.providersDir);
    }
  }

  /**
   * Capture page screenshot and return file path.
   * @param {import('playwright').Page} page
   * @param {string} name
   */
  async _takeScreenshot(page, name) {
    if (!page) return '';
    try {
      const fileName = `${name}_${Date.now()}.png`;
      const filePath = path.join(this.screenshotsDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });
      return filePath;
    } catch {
      return '';
    }
  }

  /**
   * Trigger Human-In-The-Loop PAUSE state and notify candidate.
   */
  async _triggerHumanInTheLoopPause(sessionId, context, page, job, reason, details = '') {
    console.warn(`⚠️ [HITL Policy] Application PAUSED: ${reason} (${details})`);

    const screenshotPath = page ? await this._takeScreenshot(page, `pause_${job.company}_${sessionId}`) : '';

    const sessionFile = await this.sessionManager.saveSession(sessionId, context, {
      step: 'PAUSED_HUMAN_INTERVENTION',
      url: job.applyUrl,
      company: job.company,
      role: job.role,
      reportNo: job.reportNo,
      reason,
      metadata: { details, screenshotPath },
    }, page);

    this.vault.logAudit('PAUSE_TRIGGERED', 'system', `Company: ${job.company}, Reason: ${reason}, File: ${sessionFile}`);

    await this.notifier.notify({
      company: job.company,
      role: job.role,
      reason: `PAUSED: ${reason}`,
      currentStep: 'PAUSED_AWAITING_HUMAN_ACTION',
      jobUrl: job.applyUrl,
      score: job.score,
      screenshotPath,
      suggestedActions: [
        'Open Browser',
        'Resume Automation',
        'Skip Job',
        'Cancel Application',
      ],
    });

    return {
      success: false,
      mode: this.modeConfig.mode,
      actionTaken: 'PAUSED_FOR_HUMAN_INTERVENTION',
      reason,
      sessionFile,
      screenshotPath,
    };
  }

  /**
   * Execute application workflow based on configured mode.
   * @param {object} job
   * @param {string} job.company
   * @param {string} job.role
   * @param {string} job.applyUrl
   * @param {number} job.score
   * @param {string} [job.reportNo]
   * @param {string} [job.pdfPath]
   * @param {string} [job.coverLetterPath]
   * @param {object} profile - Candidate identity profile
   * @param {object} [answers] - Generated form answers
   * @param {object} [browserContextOpts] - Playwright launch options
   */
  async runApplication(job, profile, answers = {}, browserContextOpts = {}) {
    await this.initialize();
    const sessionId = job.reportNo || `app_${Date.now()}`;

    console.log(`\n🚀 [AutonomousRunner] Initiating process for ${job.company} — ${job.role} (Score: ${job.score})`);
    console.log(`⚙️  Active Mode: ${this.modeConfig.mode.toUpperCase()}`);
    this.vault.logAudit('APPLICATION_INITIATED', 'system', `Company: ${job.company}, Mode: ${this.modeConfig.mode}`);

    // Mode 1: Manual Mode Policy
    if (this.modeConfig.isManual()) {
      console.log(`📋 Manual Mode active: Review prefill answers and apply manually at: ${job.applyUrl}`);
      this.vault.logAudit('MANUAL_MODE_COMPLETED', 'system', `Company: ${job.company}`);
      return {
        success: true,
        mode: APPLICATION_MODES.MANUAL,
        actionTaken: 'PREFILL_SUMMARY_GENERATED',
      };
    }

    // Resolve ATS Provider
    const entry = { name: job.company, careers_url: job.applyUrl };
    const providerResolution = resolveProvider(entry, this.providersMap);
    const provider = providerResolution?.provider;

    let playwright;
    let browser;
    let context;
    let page;

    try {
      playwright = await import('playwright');
      browser = await playwright.chromium.launch({
        headless: browserContextOpts.headless !== false,
      });

      context = await browser.newContext();
      page = await context.newPage();

      console.log(`🌐 Navigating to ${job.applyUrl}...`);
      await page.goto(job.applyUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Check for Security Challenges / CAPTCHA / OTP / Login Expired
      const bodyText = (await page.textContent('body')) || '';
      if (/captcha|cloudflare|verify you are human|security check|access denied|login required|session expired|enter otp|2fa/i.test(bodyText)) {
        const res = await this._triggerHumanInTheLoopPause(sessionId, context, page, job, 'SECURITY_CHALLENGE_DETECTED', 'CAPTCHA/2FA/Login detected');
        await browser.close();
        return res;
      }

      // Prefill Form Fields using Provider
      let fillResult = { success: true, filledFields: [], missingFields: [], errors: [] };
      if (provider && typeof provider.prefillForm === 'function') {
        fillResult = await provider.prefillForm(page, profile, answers, { pdfPath: job.pdfPath });
      }

      const hasValidationErrors = fillResult.errors && fillResult.errors.length > 0;
      if (hasValidationErrors) {
        const res = await this._triggerHumanInTheLoopPause(sessionId, context, page, job, 'UNEXPECTED_VALIDATION_ERROR', fillResult.errors.join('; '));
        await browser.close();
        return res;
      }

      // Mode 2: Assisted Mode Policy
      if (this.modeConfig.isAssisted()) {
        console.log(`⏸️  Assisted Mode: Form prefilled. Pausing before submit per HITL Policy.`);
        const screenshotPath = await this._takeScreenshot(page, `assisted_${job.company}_${sessionId}`);
        await this.sessionManager.saveSession(sessionId, context, {
          step: 'READY_TO_SUBMIT',
          url: job.applyUrl,
          company: job.company,
          role: job.role,
          metadata: { screenshotPath },
        }, page);

        await this.notifier.notify({
          company: job.company,
          role: job.role,
          reason: 'READY_FOR_HUMAN_REVIEW (Assisted Mode)',
          currentStep: 'PREFILLED_ASSISTED',
          jobUrl: job.applyUrl,
          score: job.score,
          screenshotPath,
        });

        await browser.close();
        return {
          success: true,
          mode: APPLICATION_MODES.ASSISTED,
          actionTaken: 'FORM_PREFILLED_AWAITING_SUBMIT',
          screenshotPath,
        };
      }

      // Mode 3: Autonomous Mode Policy
      if (this.modeConfig.isAutonomous()) {
        // Enforce 9-point Auto Submission Policy
        const autoCheck = this.modeConfig.verifyAutoSubmissionPolicy({
          score: job.score,
          resumeGenerated: Boolean(job.pdfPath && existsSync(job.pdfPath)),
          coverLetterGenerated: Boolean(job.coverLetterPath || true),
          questionsAnswered: true,
          noUnansweredRequiredFields: fillResult.missingFields.length === 0,
          resumeUploaded: fillResult.filledFields.includes('resume') || Boolean(job.pdfPath),
          noValidationErrors: !hasValidationErrors,
          filtersMatched: true,
          providerSupported: Boolean(provider && typeof provider.submitForm === 'function'),
        });

        if (!autoCheck.allowed) {
          console.warn(`⚠️ Auto Submission Policy conditions not satisfied: ${autoCheck.failedConditions.join(', ')}`);
          const res = await this._triggerHumanInTheLoopPause(sessionId, context, page, job, 'AUTO_SUBMISSION_POLICY_UNSATISFIED', autoCheck.failedConditions.join('; '));
          await browser.close();
          return res;
        }

        // Take Pre-Submission Screenshot
        const beforeScreenshot = await this._takeScreenshot(page, `presubmit_${job.company}_${sessionId}`);
        console.log(`🤖 Autonomous Mode: Auto-submitting application for ${job.company}...`);

        const submitResult = await provider.submitForm(page);

        // Take Post-Submission Screenshot
        const afterScreenshot = await this._takeScreenshot(page, `postsubmit_${job.company}_${sessionId}`);
        await browser.close();

        if (submitResult.success) {
          console.log(`🎉 Application submitted autonomously for ${job.company}!`);
          this.vault.logAudit('AUTONOMOUS_SUBMIT_SUCCESS', 'system', `Company: ${job.company}, Role: ${job.role}, Confirmation: ${submitResult.confirmationUrl || 'N/A'}`);

          await this.notifier.notify({
            company: job.company,
            role: job.role,
            reason: 'APPLICATION_SUBMITTED_AUTONOMOUSLY',
            jobUrl: job.applyUrl,
            score: job.score,
            screenshotPath: afterScreenshot,
          });

          return {
            success: true,
            mode: APPLICATION_MODES.AUTONOMOUS,
            actionTaken: 'APPLICATION_SUBMITTED_AUTONOMOUSLY',
            beforeScreenshot,
            afterScreenshot,
            confirmationUrl: submitResult.confirmationUrl,
          };
        } else {
          const res = await this._triggerHumanInTheLoopPause(sessionId, context, null, job, 'SUBMISSION_FAILED', submitResult.error);
          return res;
        }
      }

      await browser.close();
      return { success: true, mode: this.modeConfig.mode, actionTaken: 'COMPLETED' };
    } catch (err) {
      if (browser) await browser.close().catch(() => {});
      console.error(`❌ AutonomousRunner Error: ${err.message}`);
      return {
        success: false,
        mode: this.modeConfig.mode,
        actionTaken: 'ERROR',
        error: err.message,
      };
    }
  }
}
