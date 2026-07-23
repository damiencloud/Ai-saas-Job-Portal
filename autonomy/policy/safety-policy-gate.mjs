// @ts-check
/**
 * autonomy/policy/safety-policy-gate.mjs
 * Policy safety gate wrapping ApplicationModeConfig 9-point checklist.
 */

import { ApplicationModeConfig } from '../../lib/domain/ApplicationMode.mjs';

export class SafetyPolicyGate {
  /**
   * @param {object} [config]
   */
  constructor(config = {}) {
    this.modeConfig = new ApplicationModeConfig(config);
  }

  /**
   * Evaluates auto-submission safety policy.
   * @param {object} params
   */
  evaluate(params) {
    return this.modeConfig.verifyAutoSubmissionPolicy(params);
  }
}
