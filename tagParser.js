'use strict';

/**
 * @typedef {Object} TagResult
 * @property {string} tag       Нормализованный тег (без '#')
 * @property {string} original  Тег как в исходном тексте
 * @property {number} position  Индекс первого символа тега (после '#')
 */
const TAG_RE = /(?<![\p{L}\p{N}_])#([\p{L}\p{N}_]+)/gu;
const DIGITS_ONLY_RE = /^\p{Nd}+$/u;

class TagParser {
  constructor({ minLength = 1, maxLength = 50, lowerCase = true } = {}) {
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.lowerCase = lowerCase;
  }

  /**
   * @param {string} text
   * @param {boolean} [unique=false]
   * @returns {TagResult[]}
   */
  parse(text, unique = false) {
    const results = [];
    const seen = new Set();

    for (const match of text.matchAll(TAG_RE)) {
      const raw = match[1];

      const len = [...raw].length;
      if (len < this.minLength || len > this.maxLength) continue;
      if (DIGITS_ONLY_RE.test(raw)) continue;

      const norm = this.lowerCase ? raw.toLowerCase() : raw;
      if (unique) {
        if (seen.has(norm)) continue;
        seen.add(norm);
      }

      results.push({
        tag: norm,
        original: raw,
        position: match.index + 1,
      });
    }
    return results;
  }
}

module.exports = { TagParser };
