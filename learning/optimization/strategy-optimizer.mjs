// @ts-check
/**
 * learning/optimization/strategy-optimizer.mjs
 * Strategy optimization engine recommending top resume version per ATS.
 */

import { LearningEngine } from '../../lib/ai/LearningEngine.mjs';

export class StrategyOptimizer {
  constructor() {
    this.learningEngine = new LearningEngine();
  }

  /**
   * Evaluates historical metrics and returns strategy recommendations.
   */
  getOptimalStrategy() {
    return this.learningEngine.computeInsights();
  }
}
