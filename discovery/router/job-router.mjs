// @ts-check
/**
 * discovery/router/job-router.mjs
 * Routes normalized, non-duplicate jobs into data/pipeline.md and JobQueueService.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Appends discovered jobs into canonical data/pipeline.md file.
 * @param {Array<import('../normalizer/job-normalizer.mjs').NormalizedJob>} jobs
 * @param {string} [pipelinePath]
 * @returns {number} Count of newly added jobs
 */
export function routeJobsToPipeline(jobs, pipelinePath = 'data/pipeline.md') {
  if (!jobs || jobs.length === 0) return 0;

  const targetPath = path.resolve(pipelinePath);
  let content = existsSync(targetPath) ? readFileSync(targetPath, 'utf-8') : '# Pipeline — Pending URLs\n\n## Pending\n\n';

  let addedCount = 0;

  for (const job of jobs) {
    if (!content.includes(job.applyUrl)) {
      const dateStr = new Date().toISOString().split('T')[0];
      const line = `- [ ] ${job.applyUrl} | ${job.company} | ${job.title} | ${job.location} | posted: ${dateStr}\n`;
      content += line;
      addedCount++;
    }
  }

  if (addedCount > 0) {
    writeFileSync(targetPath, content, 'utf-8');
  }

  return addedCount;
}
