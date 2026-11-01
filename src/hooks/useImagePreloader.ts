/**
 * useImagePreloader.ts
 * Multi-tier high-performance image preloader for 300 sequential frames.
 *
 * Key Optimizations:
 * 1. Instant Initial Paint: Frame 1 is prioritized and decoded first.
 * 2. Dynamic Priority Queue: Frames in the active scroll viewport are loaded on-demand.
 * 3. Nearest-Neighbor Fallback: If a frame is still streaming, instantly renders the closest loaded neighbor.
 * 4. Zero Memory Leaks: Cached HTMLImageElements are preserved in memory without garbage-collection thrashing.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseImagePreloaderOptions {
  totalFrames?: number;
  concurrency?: number;
  frameUrlPattern?: (index: number) => string;
}

export interface UseImagePreloaderReturn {
  isReady: boolean;
  progress: number;
  loadedCount: number;
  totalFrames: number;
  getNearestFrame: (targetIndex: number) => HTMLImageElement | null;
  requestPriorityFrame: (targetIndex: number) => void;
}

export function useImagePreloader({
  totalFrames = 300,
  concurrency = 12,
  frameUrlPattern = (i) => `/frames/ezgif-frame-${String(i).padStart(3, '0')}.png`,
}: UseImagePreloaderOptions = {}): UseImagePreloaderReturn {
  const [progress, setProgress] = useState<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  // In-memory cache for all 300 HTMLImageElements
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadingPromisesRef = useRef<Map<number, Promise<HTMLImageElement | null>>>(new Map());
  const isCancelledRef = useRef<boolean>(false);

  if (framesRef.current.length !== totalFrames) {
    framesRef.current = new Array(totalFrames).fill(null);
  }

  /**
   * Loads a single image frame safely with async decoding
   */
  const loadSingleFrame = useCallback(
    (frameNum: number): Promise<HTMLImageElement | null> => {
      const index = frameNum - 1;

      // Already loaded
      if (framesRef.current[index]?.complete && framesRef.current[index]?.naturalWidth) {
        return Promise.resolve(framesRef.current[index]);
      }

      // Already loading in flight
      if (loadingPromisesRef.current.has(frameNum)) {
        return loadingPromisesRef.current.get(frameNum)!;
      }

      const promise = new Promise<HTMLImageElement | null>((resolve) => {
        if (isCancelledRef.current) return resolve(null);

        const img = new Image();
        img.decoding = 'async';

        img.onload = () => {
          framesRef.current[index] = img;
          setLoadedCount((prev) => {
            const updated = prev + 1;
            setProgress(Math.round((updated / totalFrames) * 100));
            return updated;
          });
          resolve(img);
        };

        img.onerror = () => {
          console.warn(`[CanvasSequence] Frame ${frameNum} failed to load.`);
          resolve(null);
        };

        img.src = frameUrlPattern(frameNum);
      }).finally(() => {
        loadingPromisesRef.current.delete(frameNum);
      });

      loadingPromisesRef.current.set(frameNum, promise);
      return promise;
    },
    [frameUrlPattern, totalFrames]
  );

  /**
   * Proactively request priority streaming for frames around current scrub target
   */
  const requestPriorityFrame = useCallback(
    (targetIndex: number) => {
      const center = Math.max(1, Math.min(totalFrames, Math.round(targetIndex) + 1));
      const range = 10; // Load 10 frames ahead and behind for instant scrubbing
      for (let offset = 0; offset <= range; offset++) {
        const ahead = center + offset;
        const behind = center - offset;
        if (ahead <= totalFrames && !framesRef.current[ahead - 1]) {
          loadSingleFrame(ahead);
        }
        if (behind >= 1 && !framesRef.current[behind - 1]) {
          loadSingleFrame(behind);
        }
      }
    },
    [loadSingleFrame, totalFrames]
  );

  useEffect(() => {
    isCancelledRef.current = false;
    let active = true;

    async function preloadAll() {
      // Step 1: High Priority - Load Frame 1 immediately
      await loadSingleFrame(1);
      if (!active) return;
      setIsReady(true);

      // Step 2: Stride loading (every 8th frame) to provide quick scrub coverage
      const strideFrames: number[] = [];
      for (let i = 8; i <= totalFrames; i += 8) {
        if (!framesRef.current[i - 1]) strideFrames.push(i);
      }
      await runBatch(strideFrames, concurrency);

      // Step 3: Complete all remaining frames sequentially
      const remaining: number[] = [];
      for (let i = 1; i <= totalFrames; i++) {
        if (!framesRef.current[i - 1]) remaining.push(i);
      }
      await runBatch(remaining, concurrency);
    }

    async function runBatch(items: number[], limit: number) {
      let cursor = 0;
      const workers = Array(Math.min(limit, items.length))
        .fill(null)
        .map(async () => {
          while (cursor < items.length && !isCancelledRef.current) {
            const frameNum = items[cursor++];
            await loadSingleFrame(frameNum);
          }
        });
      await Promise.all(workers);
    }

    preloadAll();

    return () => {
      active = false;
      isCancelledRef.current = true;
    };
  }, [loadSingleFrame, totalFrames, concurrency]);

  /**
   * Returns exact frame or closest loaded neighbor.
   * Guarantees zero black frames or flickering during scroll.
   */
  const getNearestFrame = useCallback(
    (targetIndex: number): HTMLImageElement | null => {
      const frames = framesRef.current;
      const idx = Math.max(0, Math.min(totalFrames - 1, Math.round(targetIndex)));

      // Exact match
      if (frames[idx]?.complete && frames[idx]?.naturalWidth) {
        return frames[idx];
      }

      // Search outward for closest loaded neighbor
      for (let offset = 1; offset < totalFrames; offset++) {
        const left = idx - offset;
        if (left >= 0 && frames[left]?.complete && frames[left]?.naturalWidth) {
          return frames[left];
        }
        const right = idx + offset;
        if (right < totalFrames && frames[right]?.complete && frames[right]?.naturalWidth) {
          return frames[right];
        }
      }

      // Fallback to first loaded frame in array
      for (let i = 0; i < totalFrames; i++) {
        if (frames[i]?.complete && frames[i]?.naturalWidth) {
          return frames[i];
        }
      }

      return null;
    },
    [totalFrames]
  );

  return {
    isReady,
    progress,
    loadedCount,
    totalFrames,
    getNearestFrame,
    requestPriorityFrame,
  };
}
