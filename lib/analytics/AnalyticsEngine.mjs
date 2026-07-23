// @ts-check
import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * AnalyticsEngine — Computes funnel conversion metrics, response rates,
 * performance by resume version, provider success rates, and monthly trends.
 */
export class AnalyticsEngine {
  /**
   * @param {string} [trackerPath]
   */
  constructor(trackerPath = 'data/applications.md') {
    this.trackerPath = trackerPath;
  }

  /**
   * Parse applications markdown table rows into structured application objects.
   * @returns {object[]}
   */
  parseApplications() {
    if (!existsSync(this.trackerPath)) return [];
    try {
      const content = readFileSync(this.trackerPath, 'utf-8');
      const lines = content.split('\n');
      const apps = [];

      for (const line of lines) {
        if (!line.trim().startsWith('|')) continue;
        const cells = line.split('|').map((c) => c.trim());
        if (cells.length < 8) continue;

        const id = cells[1];
        if (!id || id === '#' || id.startsWith('-')) continue;

        const date = cells[2] || '';
        const company = cells[3] || '';
        const role = cells[4] || '';
        const score = parseFloat(cells[5]) || 0;
        const status = cells[6] || 'Draft';
        const pdf = cells[7] || '';
        const report = cells[8] || '';

        apps.push({ id, date, company, role, score, status, pdf, report });
      }

      return apps;
    } catch (err) {
      console.warn(`⚠️ AnalyticsEngine: error reading tracker file — ${err.message}`);
      return [];
    }
  }

  /**
   * Compute comprehensive application analytics summary.
   * @returns {object} Funnel metrics, conversion rates, trends
   */
  computeMetrics() {
    const apps = this.parseApplications();
    const total = apps.length;

    let applied = 0;
    let interviews = 0;
    let offers = 0;
    let rejections = 0;

    const companyCounts = {};
    const monthlyCounts = {};

    for (const app of apps) {
      const statusLower = app.status.toLowerCase();

      if (statusLower.includes('applied') || statusLower.includes('submitted')) applied++;
      if (statusLower.includes('interview') || statusLower.includes('prep')) interviews++;
      if (statusLower.includes('offer') || statusLower.includes('accepted')) offers++;
      if (statusLower.includes('rejected') || statusLower.includes('closed')) rejections++;

      // Track by company
      if (app.company) {
        companyCounts[app.company] = (companyCounts[app.company] || 0) + 1;
      }

      // Track monthly trend (YYYY-MM)
      if (app.date && app.date.length >= 7) {
        const month = app.date.slice(0, 7);
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    }

    const responseRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
    const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    return {
      totalApplications: total,
      applied,
      interviews,
      offers,
      rejections,
      responseRatePercentage: responseRate,
      offerRatePercentage: offerRate,
      topCompanies,
      monthlyTrends: monthlyCounts,
    };
  }
}
