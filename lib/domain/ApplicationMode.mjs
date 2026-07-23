/**
 * ApplicationMode — Defines the execution modes for the AI Job Agent.
 *
 * Manual: Evaluation & answers generated; human pre-fills and submits.
 * Assisted: Form pre-filled automatically via Playwright; human reviews before submit.
 * Autonomous: Form pre-filled & submitted automatically if evaluation criteria satisfied.
 */

export const APPLICATION_MODES = Object.freeze({
  MANUAL: 'manual',
  ASSISTED: 'assisted',
  AUTONOMOUS: 'autonomous',
});

export class ApplicationModeConfig {
  /**
   * @param {object} [config]
   */
  constructor(config = {}) {
    /** @type {'manual'|'assisted'|'autonomous'} */
    this.mode = config.mode || process.env.CAREER_OPS_MODE || APPLICATION_MODES.MANUAL;
    
    // Minimum overall evaluation score (1.0 - 5.0) required to auto-submit in Autonomous mode
    this.minScoreThreshold = config.minScoreThreshold ?? (process.env.CAREER_OPS_MIN_SCORE ? parseFloat(process.env.CAREER_OPS_MIN_SCORE) : 4.5);
    
    // Daily submit quota guardrail
    this.maxDailySubmissions = config.maxDailySubmissions ?? (process.env.CAREER_OPS_MAX_DAILY ? parseInt(process.env.CAREER_OPS_MAX_DAILY, 10) : 10);
    
    // Pause automation if unknown required form fields are encountered
    this.pauseOnUnknownFields = config.pauseOnUnknownFields ?? true;

    // Require non-empty PDF before submit
    this.requirePdfAttachment = config.requirePdfAttachment ?? true;
  }

  isAutonomous() {
    return this.mode === APPLICATION_MODES.AUTONOMOUS;
  }

  isAssisted() {
    return this.mode === APPLICATION_MODES.ASSISTED;
  }

  isManual() {
    return this.mode === APPLICATION_MODES.MANUAL;
  }

  /**
   * Check if job evaluation passes auto-submit threshold.
   * @param {number} score
   * @returns {boolean}
   */
  shouldAutoSubmit(score) {
    return this.isAutonomous() && score >= this.minScoreThreshold;
  }

  /**
   * Enforce the strict 9-point Auto Submission Policy.
   * @param {object} params
   * @param {number} params.score - Resume match score (1.0 - 5.0)
   * @param {boolean} params.resumeGenerated - Resume PDF exists
   * @param {boolean} params.coverLetterGenerated - Cover letter exists
   * @param {boolean} params.questionsAnswered - Required questions answered
   * @param {boolean} params.noUnansweredRequiredFields - All required fields filled
   * @param {boolean} params.resumeUploaded - Resume uploaded to form
   * @param {boolean} params.noValidationErrors - Zero form validation errors
   * @param {boolean} params.filtersMatched - Candidate filters (location, salary, experience) match
   * @param {boolean} params.providerSupported - Provider implements submitForm
   * @returns {{ allowed: boolean, failedConditions: string[] }}
   */
  verifyAutoSubmissionPolicy(params) {
    const failed = [];

    if (params.score < this.minScoreThreshold) {
      failed.push(`Score ${params.score} < threshold ${this.minScoreThreshold}`);
    }
    if (!params.resumeGenerated) failed.push('Resume not generated');
    if (!params.coverLetterGenerated) failed.push('Cover letter not generated');
    if (!params.questionsAnswered) failed.push('Required questions not answered');
    if (!params.noUnansweredRequiredFields) failed.push('Unanswered required fields present');
    if (!params.resumeUploaded) failed.push('Resume upload failed or missing');
    if (!params.noValidationErrors) failed.push('Form validation errors detected');
    if (!params.filtersMatched) failed.push('Candidate target filters did not match');
    if (!params.providerSupported) failed.push('Provider does not support automatic submission');

    return {
      allowed: failed.length === 0 && this.isAutonomous(),
      failedConditions: failed,
    };
  }
}
