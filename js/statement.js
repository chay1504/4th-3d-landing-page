/**
 * NOCTIS Statement Section
 * Word-by-word scroll reveal from 15% to 100% opacity.
 */

import { CONFIG } from './config.js';

export class StatementView {
  constructor() {
    this.section = document.getElementById('statement-section');
    this.phraseEl = document.getElementById('statement-phrase');
    if (!this.phraseEl) return;

    this.initWords();
    this.initScrollTrigger();
  }

  initWords() {
    const text = CONFIG.statement.text;
    const words = text.split(' ');
    this.phraseEl.innerHTML = words
      .map(w => `<span class="statement-word">${w}</span>`)
      .join(' ');
    this.wordEls = Array.from(this.phraseEl.querySelectorAll('.statement-word'));
  }

  initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
      trigger: this.section,
      start: 'top 80%',
      end: 'bottom 40%',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const total = this.wordEls.length;
        this.wordEls.forEach((el, i) => {
          // Word reveals progressively based on fraction of total
          const wordThreshold = i / total;
          if (p >= wordThreshold) {
            el.style.opacity = '1';
            el.style.color = 'var(--bone)';
          } else {
            el.style.opacity = '0.15';
            el.style.color = 'var(--bone)';
          }
        });
      }
    });
  }
}
