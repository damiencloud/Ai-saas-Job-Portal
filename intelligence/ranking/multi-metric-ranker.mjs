// @ts-check
/**
 * intelligence/ranking/multi-metric-ranker.mjs
 * 7-Metric AI Job Ranking Engine (Match, Skill Gap, Resume Rec, Salary Est, Remote, Interview Prob, Priority).
 */

import { AiEnhancer } from '../../lib/ai/AiEnhancer.mjs';

export class MultiMetricRanker {
  constructor() {
    this.aiEnhancer = new AiEnhancer();
  }

  /**
   * Scores a discovered job across 7 dimensions.
   * @param {string} resumeText
   * @param {string} jdText
   * @param {object} [metadata]
   * @returns {{
   *   matchScore: number,
   *   skillGap: string[],
   *   resumeRecommendation: string,
   *   salaryEstimate: string,
   *   remoteScore: number,
   *   interviewProbability: number,
   *   priorityScore: number
   * }}
   */
  rankJob(resumeText, jdText, metadata = {}) {
    const evalResult = this.aiEnhancer.evaluateMatch(resumeText, jdText);

    const jdLower = (jdText || '').toLowerCase();
    const isRemote = jdLower.includes('remote') || jdLower.includes('work from home') || (metadata.location || '').toLowerCase().includes('remote');

    const remoteScore = isRemote ? 5.0 : 3.0;

    // Interview probability heuristic based on match score
    const interviewProbability = Math.round(Math.min(95, Math.max(10, evalResult.score * 18)));

    // Combined priority score (weighted 50% match, 30% remote, 20% interview prob)
    const priorityScore = Number(((evalResult.score * 0.5) + (remoteScore * 0.3) + ((interviewProbability / 20) * 0.2)).toFixed(2));

    const resumeRecommendation = evalResult.missingSkills.length > 0
      ? `Highlight skills: ${evalResult.missingSkills.slice(0, 3).join(', ')}`
      : 'Standard Full-Stack / Cloud Resume';

    return {
      matchScore: evalResult.score,
      skillGap: evalResult.missingSkills,
      resumeRecommendation,
      salaryEstimate: '₹8,00,000 - ₹18,00,000 INR (Market Est.)',
      remoteScore,
      interviewProbability,
      priorityScore,
    };
  }
}
