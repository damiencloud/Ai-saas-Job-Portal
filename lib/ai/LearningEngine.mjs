// @ts-check
import { AnalyticsEngine } from '../analytics/AnalyticsEngine.mjs';

/**
 * LearningEngine — Learns from historic applications to optimize resume selection,
 * provider targeting, and application strategy over time.
 */
export class LearningEngine {
  /**
   * @param {object} [options]
   * @param {AnalyticsEngine} [options.analytics]
   */
  constructor(options = {}) {
    this.analytics = options.analytics || new AnalyticsEngine();
  }

  /**
   * Compute effectiveness insights across resume versions and ATS providers.
   * @returns {object} Insights and recommendations
   */
  computeInsights() {
    const apps = this.analytics.parseApplications();
    const providerStats = {};
    const resumeStats = {};

    for (const app of apps) {
      const provider = app.provider || 'unknown';
      const resume = app.pdf || 'cv.md';
      const isInterview = app.status.toLowerCase().includes('interview');
      const isOffer = app.status.toLowerCase().includes('offer');

      // Provider stats
      if (!providerStats[provider]) providerStats[provider] = { total: 0, interviews: 0, offers: 0 };
      providerStats[provider].total++;
      if (isInterview) providerStats[provider].interviews++;
      if (isOffer) providerStats[provider].offers++;

      // Resume stats
      if (!resumeStats[resume]) resumeStats[resume] = { total: 0, interviews: 0, offers: 0 };
      resumeStats[resume].total++;
      if (isInterview) resumeStats[resume].interviews++;
      if (isOffer) resumeStats[resume].offers++;
    }

    // Identify top-performing resume version
    let bestResume = 'cv.md';
    let maxRatio = -1;

    for (const [resume, stat] of Object.entries(resumeStats)) {
      const ratio = stat.total > 0 ? stat.interviews / stat.total : 0;
      if (ratio > maxRatio) {
        maxRatio = ratio;
        bestResume = resume;
      }
    }

    return {
      providerEffectiveness: providerStats,
      resumeEffectiveness: resumeStats,
      recommendedResumeVersion: bestResume,
      recommendationSummary: `Resume version "${bestResume}" yielded the highest interview conversion rate.`,
    };
  }
}
