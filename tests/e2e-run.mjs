// @ts-check
import { AutonomousRunner } from '../lib/engine/AutonomousRunner.mjs';
import { ApplicationModeConfig } from '../lib/domain/ApplicationMode.mjs';
import { pathToFileURL } from 'url';
import path from 'path';

async function main() {
  console.log('🧪 Starting End-to-End Playwright Form Fill Verification...');

  const modeConfig = new ApplicationModeConfig({ mode: 'assisted' });
  const runner = new AutonomousRunner({ modeConfig });

  const htmlPath = path.resolve('templates/apply-form-test.html');
  const fileUrl = pathToFileURL(htmlPath).href;

  const job = {
    company: 'Airbnb',
    role: 'Staff Software Architect',
    applyUrl: fileUrl,
    score: 4.8,
    reportNo: '003',
    pdfPath: 'output/test-resume.pdf',
    coverLetterPath: 'output/stripe-senior-software-architect-cover.pdf',
  };

  const profile = {
    first_name: 'Damien',
    last_name: 'Engineer',
    email: 'damien@example.com',
    phone: '+91-9876543210',
    full_name: 'Damien Engineer',
  };

  const answers = {
    'why_role': 'My architectural background building high-throughput agent systems maps directly to engineering goals.',
  };

  console.log('🤖 Executing Assisted Mode Application Run on Local Form...');
  const res = await runner.runApplication(job, profile, answers, { headless: true });

  console.log('\n📊 End-to-End Form Fill Verification Results:');
  console.log('  Success:', res.success);
  console.log('  Mode:', res.mode);
  console.log('  Action Taken:', res.actionTaken);
  if (res.screenshotPath) console.log('  Screenshot Path:', res.screenshotPath);

  if (res.success && res.actionTaken === 'FORM_PREFILLED_AWAITING_SUBMIT') {
    console.log('\n✅ END-TO-END WORKFLOW & FORM PRE-FILL VERIFIED 100% SUCCESSFULLY!');
  } else {
    console.log('\n⚠️ End-to-End result:', res);
  }
}

main().catch(err => {
  console.error('❌ E2E Error:', err);
  process.exit(1);
});
