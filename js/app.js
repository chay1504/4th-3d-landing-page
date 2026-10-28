/**
 * NOCTIS — Main Application Entry Point
 * Orchestrates Lenis smooth scrolling, GSAP ScrollTrigger synchronization,
 * Preloader, Custom Cursor, Canvas Scrollers, and Section Views.
 */

import { CONFIG } from './config.js';
import { CustomCursor } from './cursor.js';
import { Preloader } from './preloader.js';
import { FilmGrain } from './grain.js';
import { HeroView } from './hero-view.js';
import { StatementView } from './statement.js';
import { ExplodeView } from './explode-view.js';

class NoctisApp {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lenis = null;
    this.cursor = null;
    this.grain = null;
    this.heroView = null;
    this.statementView = null;
    this.explodeView = null;

    this.init();
  }

  init() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Initialize Lenis Smooth Scroll (unless prefers-reduced-motion)
    this.initSmoothScroll();

    // 2. Initialize Custom Cursor & Film Grain
    this.cursor = new CustomCursor();
    this.grain = new FilmGrain();

    // 3. Initialize Preloader
    this.preloader = new Preloader(() => {
      this.onSiteReady();
    });

    // 4. Initialize Hero View (loads first 40 frames to unlock preloader)
    this.heroView = new HeroView({
      onPriorityLoaded: () => {
        this.preloader.updateProgress(100);
      },
      onProgress: (ratio) => {
        // Feed progress into preloader
        this.preloader.updateProgress(ratio * 100);
      }
    });

    // 5. Initialize Nav Hide/Show on scroll
    this.initNav();
  }

  initSmoothScroll() {
    if (this.prefersReducedMotion) {
      console.info('NOCTIS: Reduced motion detected. Smooth scroll and canvas pinning disabled.');
      return;
    }

    if (typeof Lenis !== 'undefined') {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      // Synchronize Lenis with GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        this.lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          this.lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
      }
    }
  }

  onSiteReady() {
    // Initialize downstream sections once preloader has unlocked
    this.statementView = new StatementView();
    this.explodeView = new ExplodeView();
    this.initHeadlineReveals();
    this.initReserveInteractions();

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down: hide nav
          nav.classList.add('nav-hidden');
        } else {
          // Scrolling up: show nav
          nav.classList.remove('nav-hidden');
        }
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  initHeadlineReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Headlines reveal line by line: each line inside an overflow-hidden mask slides up from 100%, 0.9s, 0.08s stagger
    const revealTargets = document.querySelectorAll('.scroll-reveal-text');
    revealTargets.forEach((target) => {
      const lines = target.querySelectorAll('.line-inner');
      if (lines.length > 0) {
        gsap.from(lines, {
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            once: true
          },
          y: '100%',
          duration: 0.9,
          stagger: 0.08,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
        });
      }
    });
  }

  initReserveInteractions() {
    const reserveBtn = document.getElementById('reserve-cta-btn');
    if (!reserveBtn) return;

    reserveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Smooth feedback
      reserveBtn.textContent = 'ALLOCATION CONFIRMED — 2026';
      setTimeout(() => {
        reserveBtn.textContent = CONFIG.reserve.buttonText;
      }, 3000);
    });
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new NoctisApp();
});
