/**
 * NOCTIS Animated Film-Grain Overlay
 * Fixed noise pattern, 3-4% opacity, pointer-events none, zero vignette.
 * Updates at low FPS (~18fps) to conserve battery and GPU cycles while giving
 * authentic cinematic analog grain.
 */

export class FilmGrain {
  constructor() {
    this.container = document.getElementById('film-grain');
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.size = 256;
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    this.imageData = this.ctx.createImageData(this.size, this.size);
    this.data = this.imageData.data;

    this.lastFrameTime = 0;
    this.frameInterval = 1000 / 18; // ~18 fps for organic grain jitter

    this.generateNoise();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  generateNoise() {
    const d = this.data;
    const len = d.length;
    for (let i = 0; i < len; i += 4) {
      const val = (Math.random() * 255) | 0;
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
      d[i + 3] = (Math.random() * 40) | 0; // subtle alpha
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    this.container.style.backgroundImage = `url(${this.canvas.toDataURL()})`;
  }

  loop(timestamp) {
    if (timestamp - this.lastFrameTime > this.frameInterval) {
      this.generateNoise();
      this.lastFrameTime = timestamp;
    }
    requestAnimationFrame(this.loop);
  }
}
