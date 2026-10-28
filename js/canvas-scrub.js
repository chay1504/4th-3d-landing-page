/**
 * NOCTIS Canvas Scrub Engine
 * High-performance frame sequence scrubbing on <canvas>
 * - DevicePixelRatio capped at 2
 * - Redraws strictly when frame index changes, inside requestAnimationFrame
 * - Smooth index lerp: current += (target - current) * 0.15
 * - Landscape: cover-fit; Portrait: contain-fit vertically centered on #07080A
 * - Nearest-loaded-frame fallback if scrolled past loaded buffer
 * - Responsive desktop vs mobile frame source switching (< 768px)
 */

export class CanvasScrubber {
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.frameCount = options.frameCount;
    this.desktopPattern = options.desktopPattern;
    this.mobilePattern = options.mobilePattern;
    this.smoothLerp = options.smoothLerp || 0.15;
    this.onPriorityLoaded = options.onPriorityLoaded || null;
    this.onProgress = options.onProgress || null;
    this.priorityCount = options.priorityCount || 40;

    this.isMobile = window.innerWidth < 768;
    this.images = new Array(this.frameCount);
    this.loadedSet = new Set();
    this.targetIndex = 0;
    this.currentIndex = 0;
    this.renderedIndex = -1;
    this.rafId = null;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;

    this.initCanvasSize();
    this.loadFrames();
    this.startRenderLoop();

    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.renderedIndex = -1; // force redraw on resize
    }, { passive: true });
  }

  initCanvasSize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
  }

  formatPath(index) {
    const padded = String(index + 1).padStart(4, '0');
    const pattern = this.isMobile ? this.mobilePattern : this.desktopPattern;
    return pattern.replace('{index}', padded);
  }

  loadFrames() {
    let priorityLoadedCount = 0;
    let totalLoadedCount = 0;

    // Load first priority frames
    const loadNextBatch = (startIndex, endIndex, onComplete) => {
      let batchLoaded = 0;
      const count = endIndex - startIndex;
      if (count <= 0) {
        if (onComplete) onComplete();
        return;
      }

      for (let i = startIndex; i < endIndex; i++) {
        const img = new Image();
        img.src = this.formatPath(i);
        img.onload = () => {
          this.images[i] = img;
          this.loadedSet.add(i);
          batchLoaded++;
          totalLoadedCount++;

          if (i === 0 && this.renderedIndex === -1) {
            this.drawFrame(img);
            this.renderedIndex = 0;
          }

          if (i < this.priorityCount) {
            priorityLoadedCount++;
            if (this.onProgress) {
              this.onProgress(priorityLoadedCount / this.priorityCount, i);
            }
            if (priorityLoadedCount >= Math.min(this.priorityCount, this.frameCount)) {
              if (this.onPriorityLoaded) {
                this.onPriorityLoaded();
                this.onPriorityLoaded = null; // trigger only once
              }
            }
          }

          if (batchLoaded === count && onComplete) {
            onComplete();
          }
        };
        img.onerror = () => {
          batchLoaded++;
          totalLoadedCount++;
          if (batchLoaded === count && onComplete) {
            onComplete();
          }
        };
      }
    };

    // Stage 1: Load priority frames (1..40)
    loadNextBatch(0, Math.min(this.priorityCount, this.frameCount), () => {
      // Stage 2: Background stream remaining frames in order
      loadNextBatch(this.priorityCount, this.frameCount, null);
    });
  }

  setScrollProgress(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    this.targetIndex = clamped * (this.frameCount - 1);
  }

  getNearestLoadedFrame(targetIdx) {
    if (this.loadedSet.has(targetIdx)) {
      return this.images[targetIdx];
    }
    // Search backward first, then forward for nearest loaded frame
    let closestDist = Infinity;
    let closestIdx = -1;

    for (const loadedIdx of this.loadedSet) {
      const dist = Math.abs(loadedIdx - targetIdx);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = loadedIdx;
        if (dist === 1) break;
      }
    }

    return closestIdx !== -1 ? this.images[closestIdx] : null;
  }

  startRenderLoop() {
    const render = () => {
      // Smooth the index: current += (target - current) * 0.15
      this.currentIndex += (this.targetIndex - this.currentIndex) * this.smoothLerp;

      const frameToDraw = Math.round(this.currentIndex);

      if (frameToDraw !== this.renderedIndex) {
        const img = this.getNearestLoadedFrame(frameToDraw);
        if (img && img.naturalWidth > 0) {
          this.drawFrame(img);
          this.renderedIndex = frameToDraw;
        }
      }

      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  drawFrame(img) {
    const cw = this.width;
    const ch = this.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Fill flat solid asphalt background (#07080A)
    this.ctx.fillStyle = '#07080A';
    this.ctx.fillRect(0, 0, cw, ch);

    const isLandscape = cw >= ch;
    let scale;
    let rw, rh, ox, oy;

    if (isLandscape) {
      // Cover-fit on landscape screens
      scale = Math.max(cw / iw, ch / ih);
    } else {
      // Contain-fit on portrait screens, vertically centered so car is never cropped
      scale = Math.min(cw / iw, ch / ih);
    }

    rw = iw * scale;
    rh = ih * scale;
    ox = (cw - rw) / 2;
    oy = (ch - rh) / 2;

    this.ctx.drawImage(img, ox, oy, rw, rh);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
