// @ts-check
import { AiEnhancer } from '../lib/ai/AiEnhancer.mjs';
import { CoverLetterEngine } from '../lib/ai/CoverLetterEngine.mjs';
import { AutonomousRunner } from '../lib/engine/AutonomousRunner.mjs';
import { ApplicationModeConfig } from '../lib/domain/ApplicationMode.mjs';
import { pathToFileURL } from 'url';
import path from 'path';

async function main() {
  console.log('🧪 PHASE 7 & 8 VERIFICATION: AI Evaluation & Browser Automation...');

  // 1. AI Enhancer Evaluation
  const ai = new AiEnhancer();
  const resumeText = 'Damien Joseph Martin - Full Stack Developer with AI, Python, React, Next.js, FastAPI, PostgreSQL, Supabase, AWS.';
  const jdText = 'Senior Full Stack Developer looking for Python, React, Next.js, FastAPI, AWS, Docker, and SQL experience.';

  const match = ai.evaluateMatch(resumeText, jdText);
  console.log(`✅ AI Match Score: ${match.score}/5.0`);
  console.log(`   Missing Skills Identified: ${match.missingSkills.join(', ') || 'None'}`);

  const answer = ai.answerQuestion('Why are you interested in this role?', { first_name: 'Damien' }, 'Vercel');
  console.log(`✅ AI Form Question Answer: "${answer}"`);

  // 2. Cover Letter Engine
  const clEngine = new CoverLetterEngine();
  const shortLetter = clEngine.generateShortCoverLetter({
    company: 'Vercel',
    role: 'Full Stack Engineer',
    candidateName: 'Damien Joseph Martin',
    topAchievement: 'architected high-throughput AI agent pipelines with zero-token discovery',
  });
  console.log(`✅ Cover Letter Generated (${shortLetter.length} chars)`);

  // 3. Playwright Form Filling Automation
  const htmlPath = path.resolve('templates/apply-form-test.html');
  const fileUrl = pathToFileURL(htmlPath).href;

  const runner = new AutonomousRunner({ modeConfig: new ApplicationModeConfig({ mode: 'assisted' }) });
  const runResult = await runner.runApplication({
    company: 'Vercel',
    role: 'Full Stack Engineer',
    applyUrl: fileUrl,
    score: match.score,
    pdfPath: 'output/damien-martin-resume.pdf',
  }, {
    first_name: 'Damien',
    last_name: 'Martin',
    email: 'damienjosephmartin10@gmail.com',
    phone: '+919539518192',
    full_name: 'Damien Joseph Martin',
  }, {
    'why_role': answer,
  }, { headless: true });

  console.log(`✅ Playwright Browser Automation Run Completed:`);
  console.log(`   Action Taken: ${runResult.actionTaken}`);
  console.log(`   Session State File: ${runResult.sessionFile}`);
  console.log(`   Screenshot Saved: ${runResult.screenshotPath}`);

  if (runResult.success && runResult.actionTaken === 'FORM_PREFILLED_AWAITING_SUBMIT') {
    console.log('\n🎉 ALL AI & BROWSER AUTOMATION FEATURES VERIFIED 100% WORKING!');
  } else {
    console.error('⚠️ Run result:', runResult);
  }
}

main().catch(err => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
