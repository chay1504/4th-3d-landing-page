/**
 * NOCTIS Exploded View Scrollytelling Manager
 * - Canvas scrubs 180 dismantle frames (down: disassembles, up: reassembles).
 * - After 70% progress, four callouts fade in with 1px hairlines and xenon dots.
 * - Central config coordinates in CONFIG.explode.callouts.
 */

import { CanvasScrubber } from './canvas-scrub.js';
import { CONFIG } from './config.js';

export class ExplodeView {
  constructor() {
    this.section = document.getElementById('explode-section');
    this.canvas = document.getElementById('explode-canvas');
    this.svgLayer = document.getElementById('explode-svg-layer');
    this.cardsContainer = document.getElementById('explode-cards-container');
    this.progressBar = this.section.querySelector('.pinned-progress-fill');

    this.scrubber = new CanvasScrubber({
      canvas: this.canvas,
      frameCount: CONFIG.explode.frameCount,
      desktopPattern: CONFIG.explode.desktopPath,
      mobilePattern: CONFIG.explode.mobilePath,
      smoothLerp: CONFIG.explode.smoothLerp,
      priorityCount: 20
    });

    this.initCallouts();
    this.initScrollTrigger();

    window.addEventListener('resize', () => {
      this.renderCallouts(this.lastProgress || 0);
    }, { passive: true });
  }

  initCallouts() {
    if (!this.cardsContainer || !this.svgLayer) return;

    this.cardsContainer.innerHTML = '';
    this.svgLayer.innerHTML = '';

    CONFIG.explode.callouts.forEach((callout) => {
      // 1. Create HTML Card
      const card = document.createElement('div');
      card.id = `callout-${callout.id}`;
      card.className = 'callout-card';
      card.style.left = `${callout.card.x}%`;
      card.style.top = `${callout.card.y}%`;
      card.innerHTML = `
        <div class="callout-label">${callout.title}</div>
        <div class="callout-desc">${callout.description}</div>
      `;
      this.cardsContainer.appendChild(card);

      // 2. Create SVG elements: 1px hairline line + 4px solid xenon dot
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.id = `svg-group-${callout.id}`;
      group.style.opacity = '0';
      group.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#CFE3FF');
      line.setAttribute('stroke-width', '1');
      line.id = `svg-line-${callout.id}`;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#CFE3FF');
      circle.id = `svg-dot-${callout.id}`;

      group.appendChild(line);
      group.appendChild(circle);
      this.svgLayer.appendChild(group);
    });

    this.renderCallouts(0);
  }

  initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
      trigger: this.section,
      pin: true,
      pinSpacing: true,
      start: 'top top',
      end: CONFIG.explode.scrollDistance || '+=300%',
      scrub: 0.1,
      anticipatePin: 1,
      onUpdate: (self) => {
        this.update(self.progress);
      }
    });
  }

  update(progress) {
    this.lastProgress = progress;

    // 1. Scrub canvas frames
    this.scrubber.setScrollProgress(progress);

    // 2. Update section progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${progress * 100}%`;
    }

    // 3. Render callout lines and cards
    this.renderCallouts(progress);
  }

  renderCallouts(progress) {
    const w = this.svgLayer.clientWidth || window.innerWidth;
    const h = this.svgLayer.clientHeight || window.innerHeight;

    CONFIG.explode.callouts.forEach((callout) => {
      const card = document.getElementById(`callout-${callout.id}`);
      const group = document.getElementById(`svg-group-${callout.id}`);
      const line = document.getElementById(`svg-line-${callout.id}`);
      const circle = document.getElementById(`svg-dot-${callout.id}`);

      if (!card || !group || !line || !circle) return;

      const dotX = (callout.dot.x / 100) * w;
      const dotY = (callout.dot.y / 100) * h;
      const cardX = (callout.card.x / 100) * w;
      const cardY = (callout.card.y / 100) * h;

      circle.setAttribute('cx', dotX);
      circle.setAttribute('cy', dotY);

      line.setAttribute('x1', dotX);
      line.setAttribute('y1', dotY);
      line.setAttribute('x2', cardX);
      line.setAttribute('y2', cardY);

      // Reveal threshold check
      const isVisible = progress >= callout.revealProgress;
      if (isVisible) {
        card.classList.add('active');
        group.style.opacity = '1';
      } else {
        card.classList.remove('active');
        group.style.opacity = '0';
      }
    });
  }
}
