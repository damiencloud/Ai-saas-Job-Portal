// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JobQueueService } from '../lib/queue/JobQueueService.mjs';

test('JobQueueService enqueues tasks and processes them with handlers', async () => {
  const queue = new JobQueueService({ concurrency: 2, queueFilePath: 'data/test-queue.json' });
  let processed = false;

  queue.registerHandler('TEST_JOB', async (payload) => {
    assert.equal(payload.foo, 'bar');
    processed = true;
  });

  const taskId = queue.enqueue('TEST_JOB', { foo: 'bar' });
  assert.ok(taskId);

  // Wait briefly for async loop
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(processed, true);
});

test('JobQueueService deduplicates tasks with dedupKey', () => {
  const queue = new JobQueueService({ queueFilePath: 'data/test-queue-dedup.json' });
  queue.registerHandler('DEDUP_JOB', async () => {});

  const id1 = queue.enqueue('DEDUP_JOB', { item: 1 }, 'key_123');
  const id2 = queue.enqueue('DEDUP_JOB', { item: 1 }, 'key_123');

  assert.ok(id1);
  assert.equal(id2, null);
});
