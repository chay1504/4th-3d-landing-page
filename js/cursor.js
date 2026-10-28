/**
 * NOCTIS Custom Cursor ("The Headlight")
 * Desktop only (pointer: fine).
 * - 6px solid xenon dot inside 28px ring with 1px stroke (no blur, no glow).
 * - Lerp 0.18 follower.
 * - Morphs into 44x2px light bar over interactive elements with mono label.
 * - Flashes brighter for 120ms on mousedown.
 */

export class CustomCursor {
  constructor() {
    this.hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.hasFinePointer || this.prefersReducedMotion) {
      return;
    }

    this.cursorEl = document.getElementById('custom-cursor');
    this.labelEl = this.cursorEl ? this.cursorEl.querySelector('.cursor-label') : null;

    if (!this.cursorEl) return;

    document.body.classList.add('custom-cursor-active');

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.pos = { x: this.mouse.x, y: this.mouse.y };
    this.lerp = 0.18;
    this.isHovering = false;
    this.currentLabel = '';
    this.rafId = null;

    this.initEvents();
    this.render();
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      if (!this.cursorEl) return;
      this.cursorEl.classList.add('is-active');
      setTimeout(() => {
        if (this.cursorEl) this.cursorEl.classList.remove('is-active');
      }, 120);
    });

    // Delegate hover detection for links, buttons, and custom data-cursor elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      if (target) {
        this.cursorEl.classList.add('is-hovering');
        let label = target.getAttribute('data-cursor');

        if (!label) {
          if (target.classList.contains('reserve-btn') || target.closest('#reserve-section')) {
            label = 'RESERVE';
          } else if (target.classList.contains('nav-link')) {
            label = 'MENU';
          } else {
            label = 'VIEW';
          }
        }

        if (this.labelEl) {
          this.labelEl.textContent = label;
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      if (target) {
        this.cursorEl.classList.remove('is-hovering');
        if (this.labelEl) {
          this.labelEl.textContent = '';
        }
      }
    });
  }

  render() {
    this.pos.x += (this.mouse.x - this.pos.x) * this.lerp;
    this.pos.y += (this.mouse.y - this.pos.y) * this.lerp;

    if (this.cursorEl) {
      this.cursorEl.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    }

    this.rafId = requestAnimationFrame(() => this.render());
  }
}
