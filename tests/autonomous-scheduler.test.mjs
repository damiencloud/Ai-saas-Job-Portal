// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AutonomousScheduler } from '../lib/scheduler/AutonomousScheduler.mjs';

test('AutonomousScheduler parses intervals correctly', () => {
  const scheduler = new AutonomousScheduler({ interval: '6h' });
  assert.equal(scheduler._parseIntervalMs('1h'), 3600000);
  assert.equal(scheduler._parseIntervalMs('6h'), 21600000);
  assert.equal(scheduler._parseIntervalMs('daily'), 86400000);
  assert.equal(scheduler._parseIntervalMs('weekly'), 604800000);
});

test('AutonomousScheduler starts and stops cleanly', () => {
  const scheduler = new AutonomousScheduler({ interval: '1h' });
  assert.equal(scheduler.isRunning, false);

  scheduler.start();
  assert.equal(scheduler.isRunning, true);

  scheduler.stop();
  assert.equal(scheduler.isRunning, false);
});
