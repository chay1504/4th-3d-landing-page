/**
 * NOCTIS Hero Scrollytelling Manager
 * Synchronizes Hero Canvas scrubbing, left-edge HUD telemetry,
 * chapter line reveals in empty sky, and blackout overlay.
 */

import { CanvasScrubber } from './canvas-scrub.js';
import { CONFIG } from './config.js';

export class HeroView {
  constructor(options) {
    this.section = document.getElementById('hero-section');
    this.canvas = document.getElementById('hero-canvas');
    this.blackout = document.getElementById('hero-blackout');
    this.progressBar = this.section.querySelector('.pinned-progress-fill');
    this.hudChapter = document.getElementById('hud-chapter-val');
    this.hudSpeed = document.getElementById('hud-speed-val');
    this.hudDist = document.getElementById('hud-dist-val');
    this.chapters = Array.from(document.querySelectorAll('.hero-chapter'));
    this.onPriorityLoaded = options.onPriorityLoaded;
    this.onProgress = options.onProgress;

    this.scrubber = new CanvasScrubber({
      canvas: this.canvas,
      frameCount: CONFIG.hero.frameCount,
      desktopPattern: CONFIG.hero.desktopPath,
      mobilePattern: CONFIG.hero.mobilePath,
      smoothLerp: CONFIG.hero.smoothLerp,
      priorityCount: CONFIG.preloader.priorityFrameCount,
      onPriorityLoaded: this.onPriorityLoaded,
      onProgress: this.onProgress
    });

    this.initScrollTrigger();
    this.update(0);
  }

  initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
      trigger: this.section,
      pin: true,
      pinSpacing: true,
      start: 'top top',
      end: CONFIG.hero.scrollDistance || '+=500%',
      scrub: 0.1,
      anticipatePin: 1,
      onUpdate: (self) => {
        this.update(self.progress);
      }
    });
  }

  update(progress) {
    // 1. Scrub canvas frames
    this.scrubber.setScrollProgress(progress);

    // 2. Section bottom 1px xenon progress line
    if (this.progressBar) {
      this.progressBar.style.width = `${progress * 100}%`;
    }

    // 3. Left-edge HUD telemetry (speed 000->118 KM/H, distance 0.0->4.2 KM)
    const currentSpeed = Math.floor(progress * CONFIG.hero.hud.maxSpeed);
    const currentDist = (progress * CONFIG.hero.hud.maxDistance).toFixed(1);

    if (this.hudSpeed) {
      this.hudSpeed.textContent = `${String(currentSpeed).padStart(3, '0')} KM/H`;
    }
    if (this.hudDist) {
      this.hudDist.textContent = `${currentDist} KM`;
    }

    // 4. Chapters visibility and line-reveals
    CONFIG.hero.chapters.forEach((chapterConfig, idx) => {
      const [start, end] = chapterConfig.range;
      const el = this.chapters[idx];
      if (!el) return;

      const isActive = progress >= start && progress <= end;
      if (isActive) {
        if (!el.classList.contains('active')) {
          el.classList.add('active');
          el.classList.add('revealed');
        }
        if (this.hudChapter) {
          this.hudChapter.textContent = chapterConfig.hudTitle;
        }
      } else {
        el.classList.remove('active');
        el.classList.remove('revealed');
      }
    });

    // 5. Fade to pure black over the last 5% of scroll (0.95 -> 1.0)
    if (this.blackout) {
      if (progress >= CONFIG.hero.fadeToBlackStart) {
        const fadeProgress = (progress - CONFIG.hero.fadeToBlackStart) / (1.0 - CONFIG.hero.fadeToBlackStart);
        this.blackout.style.opacity = String(fadeProgress);
      } else {
        this.blackout.style.opacity = '0';
      }
    }
  }
}
