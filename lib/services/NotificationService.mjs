// @ts-check
import { existsSync, readFileSync } from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * NotificationService — Multi-channel event dispatcher.
 * Supports Discord, Telegram, Slack, Email (SMTP webhook/REST), and Desktop.
 */
export class NotificationService {
  /**
   * @param {object} [config]
   */
  constructor(config = {}) {
    this.discordWebhook = config.discordWebhook || process.env.DISCORD_WEBHOOK_URL;
    this.slackWebhook = config.slackWebhook || process.env.SLACK_WEBHOOK_URL;
    this.telegramToken = config.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = config.telegramChatId || process.env.TELEGRAM_CHAT_ID;
    this.emailWebhook = config.emailWebhook || process.env.EMAIL_NOTIFICATION_URL;
  }

  /**
   * Post JSON data to an HTTP/HTTPS endpoint.
   * @param {string} urlStr
   * @param {object} payload
   * @returns {Promise<boolean>}
   */
  async _postJson(urlStr, payload) {
    if (!urlStr) return false;
    try {
      const u = new URL(urlStr);
      const data = JSON.stringify(payload);
      const transport = u.protocol === 'https:' ? https : http;

      return new Promise((resolve) => {
        const req = transport.request(u, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        }, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 300);
        });
        req.on('error', () => resolve(false));
        req.write(data);
        req.end();
      });
    } catch (err) {
      console.warn(`⚠️ NotificationService: failed to post notification — ${err.message}`);
      return false;
    }
  }

  /**
   * Send a rich application lifecycle event notification across all configured channels.
   * @param {object} event
   * @param {string} event.company
   * @param {string} event.role
   * @param {string} event.reason - e.g. "APPLICATION_SUBMITTED", "INTERVENTION_NEEDED", "MATCH_FOUND"
   * @param {string} [event.jobUrl]
   * @param {string} [event.currentStep]
   * @param {string} [event.resumeUsed]
   * @param {string} [event.screenshotPath]
   * @param {number} [event.score]
   */
  async notify(event) {
    const isWarning = event.reason.includes('PAUSE') || event.reason.includes('INTERVENTION') || event.reason.includes('CAPTCHA');
    const headerPrefix = isWarning ? '⚠️ Manual Action Required' : '🤖 Application Update';
    const title = `${headerPrefix} — ${event.company}: ${event.role}`;

    const suggestedActions = event.suggestedActions || [
      'Open Browser',
      'Resume Automation',
      'Skip Job',
      'Cancel Application',
    ];

    const details = [
      `🏢 **Company**: ${event.company}`,
      `💼 **Role**: ${event.role}`,
      `❓ **Reason**: ${event.reason}`,
      `📍 **Current Step**: ${event.currentStep || 'In Progress'}`,
      `📊 **Score**: ${event.score ? `${event.score}/5.0` : 'N/A'}`,
      `📄 **Resume**: ${event.resumeUsed || 'cv.md'}`,
      `🖼️ **Screenshot**: ${event.screenshotPath || 'Saved in session'}`,
      `🔗 **URL**: ${event.jobUrl || 'N/A'}`,
      `⚡ **Suggested Actions**: ${suggestedActions.join(' | ')}`,
    ].join('\n');

    const results = {
      discord: false,
      slack: false,
      telegram: false,
      email: false,
    };

    // 1. Discord Webhook
    if (this.discordWebhook) {
      results.discord = await this._postJson(this.discordWebhook, {
        embeds: [{
          title: title,
          description: details,
          color: event.reason.includes('SUBMITTED') ? 0x2ecc71 : 0xe74c3c,
          timestamp: new Date().toISOString(),
        }],
      });
    }

    // 2. Slack Webhook
    if (this.slackWebhook) {
      results.slack = await this._postJson(this.slackWebhook, {
        text: `*${title}*\n${details}`,
      });
    }

    // 3. Telegram Bot
    if (this.telegramToken && this.telegramChatId) {
      const tgUrl = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;
      results.telegram = await this._postJson(tgUrl, {
        chat_id: this.telegramChatId,
        text: `${title}\n\n${details}`,
        parse_mode: 'Markdown',
      });
    }

    // 4. Email Webhook / Service
    if (this.emailWebhook) {
      results.email = await this._postJson(this.emailWebhook, {
        subject: title,
        text: details,
        event,
      });
    }

    console.log(`🔔 Notification dispatched [Discord: ${results.discord}, Slack: ${results.slack}, Telegram: ${results.telegram}]`);
    return results;
  }
}

export const defaultNotifier = new NotificationService();
