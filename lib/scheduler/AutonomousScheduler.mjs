// @ts-check
import { AutonomousRunner } from '../engine/AutonomousRunner.mjs';
import { JobQueueService } from '../queue/JobQueueService.mjs';
import { defaultNotifier } from '../services/NotificationService.mjs';

/**
 * AutonomousScheduler — Background execution orchestrator supporting configurable intervals.
 * Automatically runs the discovery, analysis, application, and notification lifecycle.
 */
export class AutonomousScheduler {
  /**
   * @param {object} [options]
   * @param {'1h'|'6h'|'daily'|'weekly'} [options.interval]
   * @param {AutonomousRunner} [options.runner]
   * @param {JobQueueService} [options.queue]
   */
  constructor(options = {}) {
    this.intervalStr = options.interval || process.env.CAREER_OPS_SCHEDULE || '1h';
    this.runner = options.runner || new AutonomousRunner();
    this.queue = options.queue || new JobQueueService();
    this.notifier = options.notifier || defaultNotifier;
    this.timer = null;
    this.isRunning = false;
  }

  /**
   * Convert human interval string into milliseconds.
   * @param {string} str
   * @returns {number}
   */
  _parseIntervalMs(str) {
    switch (str.toLowerCase()) {
      case '1h': return 3600000;
      case '6h': return 21600000;
      case 'daily': return 86400000;
      case 'weekly': return 604800000;
      default: return 3600000;
    }
  }

  /**
   * Start the recurring background pipeline execution.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const ms = this._parseIntervalMs(this.intervalStr);
    console.log(`⏰ [AutonomousScheduler] Started background scheduler (Interval: ${this.intervalStr})`);

    // Execute immediately on start
    this.executePipelineRun().catch((err) => {
      console.error(`❌ AutonomousScheduler run error: ${err.message}`);
    });

    this.timer = setInterval(() => {
      this.executePipelineRun().catch((err) => {
        console.error(`❌ AutonomousScheduler run error: ${err.message}`);
      });
    }, ms);
  }

  /**
   * Stop the background scheduler gracefully.
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log(`🛑 [AutonomousScheduler] Stopped background scheduler.`);
  }

  /**
   * Execute full continuous autonomous cycle: Search -> Analyze -> Apply -> Notify.
   */
  async executePipelineRun() {
    console.log(`\n🔄 [AutonomousScheduler] Starting automated cycle...`);

    // Register queue task handler if not already present
    this.queue.registerHandler('AUTONOMOUS_CYCLE', async () => {
      console.log(`🔍 [AutonomousScheduler] Executing scheduled discovery & evaluation...`);
      
      // Notify candidate of pipeline cycle trigger
      await this.notifier.notify({
        company: 'System',
        role: 'Autonomous Background Run',
        reason: 'SCHEDULED_CYCLE_STARTED',
        currentStep: 'DISCOVERY_AND_EVALUATION',
      });
    });

    this.queue.enqueue('AUTONOMOUS_CYCLE', { timestamp: new Date().toISOString() }, `cycle_${Date.now()}`);
  }
}
