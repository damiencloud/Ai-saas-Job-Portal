// @ts-check
/**
 * discovery/deduplicator/simhash-dedup.mjs
 * Deduplicates job listings using SimHash text fingerprinting (reusing fingerprint-core.mjs).
 */

import { fingerprintText, similarity } from '../../fingerprint-core.mjs';

export class SimHashDeduplicator {
  /**
   * @param {{ threshold?: number }} [options]
   */
  constructor(options = {}) {
    this.threshold = options.threshold || 0.90;
    /** @type {Map<string, string>} */
    this.seenFingerprints = new Map();
  }

  /**
   * Checks if a job listing is a duplicate of a previously seen listing.
   * @param {string} text - Job title + description text
   * @returns {boolean} True if duplicate, false if unique
   */
  isDuplicate(text) {
    if (!text) return false;
    const fp = fingerprintText(text);

    if (!fp) return false; // Unfingerprintable short text

    for (const existingFp of this.seenFingerprints.values()) {
      if (similarity(fp, existingFp) >= this.threshold) {
        return true;
      }
    }

    this.seenFingerprints.set(text.slice(0, 100), fp);
    return false;
  }
}
