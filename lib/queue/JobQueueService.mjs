// @ts-check
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * JobQueueService — Lightweight asynchronous job queue for background tasks.
 * Supports task retries, exponential backoff, concurrency limits, and deduplication keys.
 */
export class JobQueueService {
  /**
   * @param {object} [options]
   * @param {number} [options.concurrency]
   * @param {number} [options.maxRetries]
   * @param {string} [options.queueFilePath]
   */
  constructor(options = {}) {
    this.concurrency = options.concurrency || 3;
    this.maxRetries = options.maxRetries || 3;
    this.queueFilePath = options.queueFilePath || 'data/queue.json';
    this.queue = [];
    this.activeTasks = 0;
    this.handlers = new Map();
    this.dedupKeys = new Set();

    mkdirSync(path.dirname(this.queueFilePath), { recursive: true });
    this.loadQueue();
  }

  /**
   * Register a task processor handler for a specific task type.
   * @param {string} type
   * @param {(task: object) => Promise<any>} handler
   */
  registerHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * Add a task to the queue with optional deduplication key.
   * @param {string} type
   * @param {object} payload
   * @param {string} [dedupKey]
   * @returns {string|null} Task ID or null if duplicate
   */
  enqueue(type, payload = {}, dedupKey = null) {
    if (dedupKey && this.dedupKeys.has(dedupKey)) {
      console.log(`⏩ Task skipped (duplicate dedupKey: ${dedupKey})`);
      return null;
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task = {
      id: taskId,
      type,
      payload,
      dedupKey,
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    };

    if (dedupKey) this.dedupKeys.add(dedupKey);
    this.queue.push(task);
    this.saveQueue();
    this.processNext();
    return taskId;
  }

  /**
   * Process pending tasks respecting concurrency limit.
   */
  async processNext() {
    if (this.activeTasks >= this.concurrency) return;

    const task = this.queue.find((t) => t.status === 'pending');
    if (!task) return;

    const handler = this.handlers.get(task.type);
    if (!handler) {
      console.warn(`⚠️ JobQueueService: no handler registered for task type "${task.type}"`);
      task.status = 'failed';
      task.error = 'Unregistered task handler';
      this.saveQueue();
      return;
    }

    task.status = 'processing';
    this.activeTasks++;
    this.saveQueue();

    try {
      await handler(task.payload);
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      if (task.dedupKey) this.dedupKeys.delete(task.dedupKey);
    } catch (err) {
      task.retries++;
      if (task.retries < this.maxRetries) {
        task.status = 'pending';
        console.warn(`⚠️ Task ${task.id} failed (attempt ${task.retries}/${this.maxRetries}): ${err.message}. Retrying...`);
      } else {
        task.status = 'failed';
        task.error = err.message;
        if (task.dedupKey) this.dedupKeys.delete(task.dedupKey);
      }
    } finally {
      this.activeTasks--;
      this.saveQueue();
      setImmediate(() => this.processNext());
    }
  }

  saveQueue() {
    try {
      writeFileSync(this.queueFilePath, JSON.stringify(this.queue, null, 2), 'utf-8');
    } catch {}
  }

  loadQueue() {
    if (!existsSync(this.queueFilePath)) return;
    try {
      const data = readFileSync(this.queueFilePath, 'utf-8');
      this.queue = JSON.parse(data);
      for (const t of this.queue) {
        if (t.dedupKey && t.status !== 'completed' && t.status !== 'failed') {
          this.dedupKeys.add(t.dedupKey);
        }
      }
    } catch {}
  }
}
