// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BaseProvider } from '../providers/_base.mjs';
import { loadProviders, resolveProvider } from '../providers/_registry.mjs';
import { ApplicationModeConfig, APPLICATION_MODES } from '../lib/domain/ApplicationMode.mjs';
import { SessionManager } from '../lib/services/SessionManager.mjs';
import { AutonomousRunner } from '../lib/engine/AutonomousRunner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROVIDERS_DIR = path.resolve(__dirname, '..', 'providers');

test('ApplicationModeConfig enforces 9-point Auto Submission Policy', () => {
  const config = new ApplicationModeConfig({ mode: 'autonomous', minScoreThreshold: 4.5 });

  const validPolicy = config.verifyAutoSubmissionPolicy({
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

  assert.equal(validPolicy.allowed, true);
  assert.equal(validPolicy.failedConditions.length, 0);

  const invalidPolicy = config.verifyAutoSubmissionPolicy({
    score: 4.0, // below threshold
    resumeGenerated: true,
    coverLetterGenerated: false, // missing cover letter
    questionsAnswered: true,
    noUnansweredRequiredFields: true,
    resumeUploaded: true,
    noValidationErrors: true,
    filtersMatched: true,
    providerSupported: true,
  });

  assert.equal(invalidPolicy.allowed, false);
  assert.ok(invalidPolicy.failedConditions.length >= 2);
});

test('SessionManager dumps full context including localStorage and form values', async () => {
  const sm = new SessionManager('data/test-sessions-full');
  const mockContext = {
    async storageState() {
      return { cookies: [{ name: 'session_id', value: 'xyz' }], origins: [] };
    },
  };

  const mockPage = {
    url() { return 'https://boards.greenhouse.io/acme/jobs/123'; },
    async evaluate(fn) { return { first_name: 'Damien', email: 'damien@example.com' }; },
  };

  const sessionPath = await sm.saveSession('hitl_session_1', mockContext, {
    step: 'PAUSED_HUMAN_INTERVENTION',
    company: 'Acme',
    role: 'Staff Engineer',
    reason: 'CAPTCHA_DETECTED',
  }, mockPage);

  assert.ok(sessionPath.includes('hitl_session_1.json'));

  const loaded = sm.loadSession('hitl_session_1');
  assert.equal(loaded.company, 'Acme');
  assert.equal(loaded.reason, 'CAPTCHA_DETECTED');
  assert.ok(loaded.currentFormValues);

  sm.clearSession('hitl_session_1');
});

test('AutonomousRunner handles manual mode run', async () => {
  const runner = new AutonomousRunner({
    modeConfig: new ApplicationModeConfig({ mode: 'manual' }),
  });

  const res = await runner.runApplication(
    { company: 'Stripe', role: 'Software Architect', applyUrl: 'https://jobs.lever.co/stripe/123', score: 4.8 },
    { first_name: 'Damien', email: 'damien@example.com' }
  );

  assert.equal(res.success, true);
  assert.equal(res.mode, 'manual');
  assert.equal(res.actionTaken, 'PREFILL_SUMMARY_GENERATED');
});
