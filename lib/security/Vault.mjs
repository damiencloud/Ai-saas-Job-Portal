// @ts-check
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { appendFileSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Vault — AES-256-GCM Secret Vault and Audit Logger.
 * Encrypts API keys, candidate credentials, and browser cookies.
 */
export class Vault {
  /**
   * @param {string} [masterKey] - 32-byte master key string or process.env.CAREER_OPS_VAULT_KEY
   */
  constructor(masterKey = process.env.CAREER_OPS_VAULT_KEY || 'default-career-ops-secret-key-32b!') {
    // Ensure key is exactly 32 bytes
    this.key = Buffer.alloc(32);
    Buffer.from(masterKey).copy(this.key);
    this.auditLogPath = 'data/audit-log.tsv';
    mkdirSync(path.dirname(this.auditLogPath), { recursive: true });
  }

  /**
   * Encrypt a plaintext string using AES-256-GCM.
   * @param {string} text
   * @returns {string} iv:authTag:encryptedHex
   */
  encrypt(text) {
    if (!text) return '';
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt an AES-256-GCM encrypted payload string.
   * @param {string} payload - iv:authTag:encryptedHex
   * @returns {string} Plaintext
   */
  decrypt(payload) {
    if (!payload || !payload.includes(':')) return '';
    try {
      const [ivHex, authTagHex, encryptedHex] = payload.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error(`❌ Vault: decryption failed — ${err.message}`);
      return '';
    }
  }

  /**
   * Append an immutable security audit event to data/audit-log.tsv.
   * @param {string} action - e.g. "AUTONOMOUS_SUBMIT", "CREDENTIAL_DECRYPT"
   * @param {string} user - e.g. "system"
   * @param {string} details
   */
  logAudit(action, user = 'system', details = '') {
    const timestamp = new Date().toISOString();
    const row = `${timestamp}\t${user}\t${action}\t${details.replace(/[\r\n\t]/g, ' ')}\n`;
    try {
      appendFileSync(this.auditLogPath, row, 'utf-8');
    } catch {}
  }
}
