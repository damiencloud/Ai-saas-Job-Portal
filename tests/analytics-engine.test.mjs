// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AnalyticsEngine } from '../lib/analytics/AnalyticsEngine.mjs';

test('AnalyticsEngine parses applications and computes conversion metrics', () => {
  const engine = new AnalyticsEngine('data/applications.md');
  const metrics = engine.computeMetrics();

  assert.ok(typeof metrics.totalApplications === 'number');
  assert.ok(typeof metrics.responseRatePercentage === 'number');
  assert.ok(typeof metrics.offerRatePercentage === 'number');
  assert.ok(Array.isArray(metrics.topCompanies));
  assert.ok(typeof metrics.monthlyTrends === 'object');
});
