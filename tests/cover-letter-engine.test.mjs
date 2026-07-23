// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CoverLetterEngine } from '../lib/ai/CoverLetterEngine.mjs';

test('CoverLetterEngine generates short and long cover letters', () => {
  const engine = new CoverLetterEngine();
  const short = engine.generateShortCoverLetter({ company: 'Google', role: 'Staff Engineer' });
  const long = engine.generateLongCoverLetter({ company: 'Google', role: 'Staff Engineer' });

  assert.ok(short.includes('Google'));
  assert.ok(short.includes('Staff Engineer'));
  assert.ok(long.length > short.length);
});

test('CoverLetterEngine generates recruiter email, LinkedIn, and referral messages', () => {
  const engine = new CoverLetterEngine();
  const email = engine.generateRecruiterEmail({ company: 'Stripe', role: 'Architect' });
  const linkedin = engine.generateLinkedInMessage({ company: 'Stripe', role: 'Architect' });
  const referral = engine.generateReferralRequest({ company: 'Stripe', role: 'Architect' });

  assert.ok(email.includes('Subject: Architect'));
  assert.ok(linkedin.includes('Stripe'));
  assert.ok(referral.includes('referral'));
});
