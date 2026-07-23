// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LearningEngine } from '../lib/ai/LearningEngine.mjs';

test('LearningEngine computes resume and provider effectiveness insights', () => {
  const engine = new LearningEngine();
  const insights = engine.computeInsights();

  assert.ok(insights.providerEffectiveness);
  assert.ok(insights.resumeEffectiveness);
  assert.ok(typeof insights.recommendedResumeVersion === 'string');
  assert.ok(insights.recommendationSummary.length > 10);
});
