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
  const loadedCountRef = useRef<number>(0);
  const lastRequestedRef = useRef<number>(-1);

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
          loadedCountRef.current += 1;
          if (loadedCountRef.current % 15 === 0 || loadedCountRef.current === totalFrames) {
            setLoadedCount(loadedCountRef.current);
            setProgress(Math.round((loadedCountRef.current / totalFrames) * 100));
          }
          resolve(img);
        };

        img.onerror = () => {
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
   * Proactively request priority streaming for frames around current scrub target (throttled)
   */
  const requestPriorityFrame = useCallback(
    (targetIndex: number) => {
      // Throttle: only trigger if target moves by at least 1 full frame
      if (Math.abs(targetIndex - lastRequestedRef.current) < 1) return;
      lastRequestedRef.current = targetIndex;

      const center = Math.max(1, Math.min(totalFrames, Math.round(targetIndex) + 1));
      const range = 4; // Tight range to prevent memory and network saturation
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
      // Step 1: Initial priority paint - load starting 5 frames immediately
      const initialBatch: number[] = [];
      for (let i = 1; i <= Math.min(5, totalFrames); i++) {
        initialBatch.push(i);
      }
      await runBatch(initialBatch, 3);
      if (!active) return;
      setIsReady(true);

      // Step 2: Keyframe stride (every 4th frame) for instant smooth scrubbing coverage
      const strideFrames: number[] = [];
      for (let i = 6; i <= totalFrames; i += 4) {
        if (!framesRef.current[i - 1]) strideFrames.push(i);
      }
      await runBatch(strideFrames, 4);
      if (!active) return;

      // Step 3: Progressive idle loading for intermediate frames
      const remaining: number[] = [];
      for (let i = 1; i <= totalFrames; i++) {
        if (!framesRef.current[i - 1]) remaining.push(i);
      }
      await runBatch(remaining, 2);
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
  }, [loadSingleFrame, totalFrames]);

  /**
   * Fast Nearest-neighbor lookup with zero GC thrashing
   */
  const getNearestFrame = useCallback(
    (targetIndex: number): HTMLImageElement | null => {
      const frames = framesRef.current;
      const idx = Math.max(0, Math.min(totalFrames - 1, Math.round(targetIndex)));

      // 1. Exact match
      if (frames[idx]?.complete && frames[idx]?.naturalWidth) {
        return frames[idx];
      }

      // 2. Search outward up to 8 frames
      for (let offset = 1; offset <= 8; offset++) {
        const left = idx - offset;
        if (left >= 0 && frames[left]?.complete && frames[left]?.naturalWidth) {
          return frames[left];
        }
        const right = idx + offset;
        if (right < totalFrames && frames[right]?.complete && frames[right]?.naturalWidth) {
          return frames[right];
        }
      }

      // 3. Fallback to stride keyframe
      const strideIdx = Math.round(idx / 4) * 4;
      if (strideIdx >= 0 && strideIdx < totalFrames && frames[strideIdx]?.complete && frames[strideIdx]?.naturalWidth) {
        return frames[strideIdx];
      }

      // 4. Fallback to first loaded frame
      return frames[0] || null;
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
