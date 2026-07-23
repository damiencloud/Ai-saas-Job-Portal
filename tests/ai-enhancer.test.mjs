// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AiEnhancer } from '../lib/ai/AiEnhancer.mjs';

test('AiEnhancer evaluateMatch computes score and missing terms', () => {
  const enhancer = new AiEnhancer();
  const resume = 'Experienced Software Engineer skilled in Node.js, TypeScript, Docker, and AWS.';
  const jd = 'Looking for a Senior Software Engineer with Node.js, Kubernetes, Docker, and Python skills.';

  const result = enhancer.evaluateMatch(resume, jd);
  assert.ok(result.score >= 1.0 && result.score <= 5.0);
  assert.ok(Array.isArray(result.missingSkills));
  assert.ok(result.missingSkills.includes('kubernetes') || result.missingSkills.includes('python'));
});

test('AiEnhancer answerQuestion generates concise response', () => {
  const enhancer = new AiEnhancer();
  const profile = { name: 'Damien' };
  const answer = enhancer.answerQuestion('Why are you interested in this role?', profile, 'Stripe');

  assert.ok(answer.includes('Stripe'));
  assert.ok(answer.length > 20);
});

test('AiEnhancer analyzeSkillGap categorizes readiness level', () => {
  const enhancer = new AiEnhancer();
  const resume = 'Node.js React TypeScript Docker PostgreSQL';
  const jd = 'Node.js React TypeScript Docker PostgreSQL AWS Kubernetes';

  const gap = enhancer.analyzeSkillGap(resume, jd);
  assert.ok(gap.readinessLevel);
  assert.ok(Array.isArray(gap.recommendedUpskills));
});
