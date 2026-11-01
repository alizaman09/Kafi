/**
 * High-Performance Image Sequence Preloader & Memory Cache
 * Optimized for 300 sequential frames with progressive fallback & concurrency limiting
 */

import { TOTAL_FRAMES, getFrameUrl } from './frameConfig';

export class ImageSequenceLoader {
  constructor(options = {}) {
    this.total = options.total || TOTAL_FRAMES;
    this.concurrency = options.concurrency || 8;
    this.onProgress = options.onProgress || (() => {});
    this.onInitialReady = options.onInitialReady || (() => {});
    this.onComplete = options.onComplete || (() => {});

    // Array of HTMLImageElement (or null if not loaded yet)
    this.frames = new Array(this.total).fill(null);
    this.loadedCount = 0;
    this.isCancelled = false;
    this.isInitialReady = false;
  }

  /**
   * Starts preloading frames with priority scheduling
   */
  async start() {
    this.isCancelled = false;
    this.loadedCount = 0;

    // Phase 1: High Priority - Load Frame 1 first for immediate canvas mount
    try {
      await this.loadSingleFrame(1);
      this.isInitialReady = true;
      this.onInitialReady(this.frames[0]);
    } catch (err) {
      console.warn("Failed loading initial frame:", err);
    }

    if (this.isCancelled) return;

    // Phase 2: Keyframe preview stride (loads every 10th frame first for quick scrub preview)
    const keyframes = [];
    for (let i = 10; i <= this.total; i += 10) {
      if (!this.frames[i - 1]) {
        keyframes.push(i);
      }
    }
    await this.loadBatchWithConcurrency(keyframes);

    if (this.isCancelled) return;

    // Phase 3: Fill remaining frames sequentially
    const remaining = [];
    for (let i = 1; i <= this.total; i++) {
      if (!this.frames[i - 1]) {
        remaining.push(i);
      }
    }
    await this.loadBatchWithConcurrency(remaining);

    if (!this.isCancelled) {
      this.onComplete(this.frames);
    }
  }

  /**
   * Load a single frame by 1-indexed number and store in memory
   */
  loadSingleFrame(frameNum) {
    return new Promise((resolve) => {
      if (this.isCancelled) return resolve(null);
      const index = frameNum - 1;

      if (this.frames[index]) {
        return resolve(this.frames[index]);
      }

      const img = new Image();
      img.src = getFrameUrl(frameNum);

      const finish = () => {
        if (!this.frames[index]) {
          this.frames[index] = img;
          this.loadedCount++;
          const progress = Math.round((this.loadedCount / this.total) * 100);
          this.onProgress(this.loadedCount, this.total, progress);
        }
        resolve(img);
      };

      img.onload = () => {
        // Attempt async GPU decode if browser supports it
        if ('decode' in img) {
          img.decode().then(finish).catch(finish);
        } else {
          finish();
        }
      };

      img.onerror = () => {
        console.warn(`[KAFI] Frame ${frameNum} failed to load.`);
        resolve(null);
      };
    });
  }

  /**
   * Worker pool to load frames with concurrency limit
   */
  async loadBatchWithConcurrency(frameNumbers) {
    let cursor = 0;
    const workers = Array(Math.min(this.concurrency, frameNumbers.length))
      .fill(null)
      .map(async () => {
        while (cursor < frameNumbers.length && !this.isCancelled) {
          const frameNum = frameNumbers[cursor++];
          await this.loadSingleFrame(frameNum);
        }
      });

    await Promise.all(workers);
  }

  /**
   * Get frame by 0-indexed number with instant nearest-frame fallback
   * Ensures 0% stuttering even while loading in progress
   * @param {number} targetIndex - 0 to (total - 1)
   * @returns {HTMLImageElement | null}
   */
  getFrame(targetIndex) {
    const idx = Math.max(0, Math.min(this.total - 1, Math.round(targetIndex)));
    
    // Direct hit
    if (this.frames[idx]) {
      return this.frames[idx];
    }

    // Search outwards for nearest loaded frame
    for (let offset = 1; offset < this.total; offset++) {
      if (idx - offset >= 0 && this.frames[idx - offset]) {
        return this.frames[idx - offset];
      }
      if (idx + offset < this.total && this.frames[idx + offset]) {
        return this.frames[idx + offset];
      }
    }

    return this.frames[0] || null;
  }

  cancel() {
    this.isCancelled = true;
  }
}
