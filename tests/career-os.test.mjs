// @ts-check
import test from 'node:test';
import assert from 'node:assert/strict';

import { expandQuery } from '../discovery/search/query-expander.mjs';
import { detectATS } from '../discovery/ats/detector.mjs';
import { normalizeJob } from '../discovery/normalizer/job-normalizer.mjs';
import { SimHashDeduplicator } from '../discovery/deduplicator/simhash-dedup.mjs';
import { MultiMetricRanker } from '../intelligence/ranking/multi-metric-ranker.mjs';
import { SafetyPolicyGate } from '../autonomy/policy/safety-policy-gate.mjs';
import { StrategyOptimizer } from '../learning/optimization/strategy-optimizer.mjs';

test('Discovery Engine - Query Expansion', () => {
  const expanded = expandQuery('DevOps Bangalore');
  assert.equal(expanded.primary, 'DevOps Bangalore');
  assert.ok(expanded.titles.includes('DevOps Engineer'));
  assert.ok(expanded.locations.includes('Bangalore'));
});

test('Discovery Engine - ATS Detector', async () => {
  const ghResult = await detectATS('https://job-boards.greenhouse.io/vercel/jobs/6122437004');
  assert.equal(ghResult.type, 'greenhouse');
  assert.equal(ghResult.isKnown, true);

  const unknownResult = await detectATS('https://custom-careers-page.com/apply');
  assert.equal(unknownResult.type, 'generic');
  assert.equal(unknownResult.isKnown, false);
});

test('Discovery Engine - Job Normalizer', () => {
  const normalized = normalizeJob({
    title: '  Senior DevOps Engineer  ',
    company: 'Stripe, Inc.',
    url: 'https://jobs.lever.co/stripe/12345#apply',
  });
  assert.equal(normalized.title, 'Senior DevOps Engineer');
  assert.equal(normalized.company, 'Stripe');
  assert.equal(normalized.applyUrl, 'https://jobs.lever.co/stripe/12345');
});

test('Discovery Engine - SimHash Deduplicator', () => {
  const dedup = new SimHashDeduplicator();
  const text1 = 'Senior DevOps Engineer at Stripe focusing on Kubernetes, Terraform, Docker, AWS infrastructure, CI/CD pipeline automation, monitoring, incident response, Linux systems administration, and high availability service architecture for scalable fintech platforms.';
  const text2 = 'Senior DevOps Engineer at Stripe focusing on Kubernetes, Terraform, Docker, AWS infrastructure, CI/CD pipeline automation, monitoring, incident response, Linux systems administration, and high availability service architecture for scalable fintech platforms.';

  assert.equal(dedup.isDuplicate(text1), false);
  assert.equal(dedup.isDuplicate(text2), true);
});

test('Intelligence Engine - Multi-Metric Ranker', () => {
  const ranker = new MultiMetricRanker();
  const resume = 'Experienced Full Stack Developer with Python, React, Next.js, and AWS.';
  const jd = 'Looking for Full Stack Developer with Python, React, Next.js, Docker, and AWS.';

  const rank = ranker.rankJob(resume, jd, { location: 'Remote' });
  assert.ok(rank.matchScore > 0);
  assert.equal(rank.remoteScore, 5.0);
  assert.ok(rank.priorityScore > 0);
});

test('Autonomy Engine - Safety Policy Gate', () => {
  const gate = new SafetyPolicyGate({ mode: 'autonomous', minScoreThreshold: 4.5 });
  const check = gate.evaluate({
    score: 4.8,
    resumeGenerated: true,
    coverLetterGenerated: true,
    questionsAnswered: true,
    noUnansweredRequiredFields: true,
    resumeUploaded: true,
    noValidationErrors: true,
    filtersMatched: true,
    providerSupported: true,
  });
  assert.equal(check.allowed, true);
  assert.equal(check.failedConditions.length, 0);
});

test('Learning Engine - Strategy Optimizer', () => {
  const optimizer = new StrategyOptimizer();
  const insights = optimizer.getOptimalStrategy();
  assert.ok(insights.recommendedResumeVersion !== undefined);
});
