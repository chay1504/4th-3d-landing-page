/**
 * NOCTIS Preloader
 * - Displays brand mark + centered expanding xenon bar with 000-100 mono counter.
 * - Prioritizes loading initial hero frames (1-40) before dismissing.
 * - Flashes on completion and smoothly fades out.
 */

export class Preloader {
  constructor(onReady) {
    this.container = document.getElementById('preloader');
    this.bar = this.container ? this.container.querySelector('.preloader-bar') : null;
    this.counter = this.container ? this.container.querySelector('.preloader-count') : null;
    this.flash = this.container ? this.container.querySelector('.preloader-flash') : null;
    this.onReady = onReady;
    this.progress = 0;
    this.targetProgress = 0;
    this.isDismissed = false;

    this.startProgressLoop();
  }

  updateProgress(percent) {
    this.targetProgress = Math.min(100, Math.max(0, percent));
    if (this.targetProgress >= 100 && this.progress >= 98) {
      this.dismiss();
    }
  }

  startProgressLoop() {
    const loop = () => {
      if (this.isDismissed) return;

      // Smooth step towards targetProgress
      this.progress += (this.targetProgress - this.progress) * 0.2;

      // If close enough to target 100, snap to 100
      if (this.targetProgress >= 100 && this.progress >= 98.5) {
        this.progress = 100;
      }

      const displayVal = Math.min(100, Math.round(this.progress));
      if (this.bar) {
        this.bar.style.width = `${displayVal}%`;
      }
      if (this.counter) {
        this.counter.textContent = String(displayVal).padStart(3, '0');
      }

      if (displayVal >= 100 && !this.isDismissed) {
        this.dismiss();
        return;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    // Failsafe: never block user for more than 3 seconds
    setTimeout(() => {
      if (!this.isDismissed) {
        this.dismiss();
      }
    }, 3000);
  }

  dismiss() {
    this.isDismissed = true;
    if (this.counter) this.counter.textContent = '100';
    if (this.bar) this.bar.style.width = '100%';

    // Brief flash (120ms) then fade to hero
    if (this.flash) {
      this.flash.style.opacity = '1';
      setTimeout(() => {
        if (this.flash) this.flash.style.opacity = '0';
        if (this.container) {
          this.container.classList.add('loaded');
          setTimeout(() => {
            if (this.container) this.container.remove();
          }, 850);
        }
        if (this.onReady) this.onReady();
      }, 120);
    } else {
      if (this.container) this.container.classList.add('loaded');
      if (this.onReady) this.onReady();
    }
  }
}
