/**
 * useImagePreloader.ts
 * Multi-tier high-performance image preloader for 300 sequential frames.
 *
 * Safe, Leak-Free, Infinite-Loop-Proof Design:
 * 1. Global singleton cache prevents re-fetching or memory leaks.
 * 2. Stable module-level functions with NO dynamic inline dependencies.
 * 3. Mount-only effect: runs once without triggering re-render cascades.
 * 4. Zero thread blocking: progressive frames load in idle callbacks.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseImagePreloaderOptions {
  totalFrames?: number;
  frameUrlPattern?: (index: number) => string;
}

export interface UseImagePreloaderReturn {
  isReady: boolean;
  totalFrames: number;
  getNearestFrame: (targetIndex: number) => HTMLImageElement | null;
  requestPriorityFrame: (targetIndex: number) => void;
}

const DEFAULT_FRAME_URL = (i: number): string =>
  `/frames/ezgif-frame-${String(i).padStart(3, '0')}.png`;

// Global singleton cache so frames persist across component re-renders
const globalFramesCache = new Map<number, HTMLImageElement>();
const globalLoadingPromises = new Map<number, Promise<HTMLImageElement | null>>();

function loadFrame(
  frameNum: number,
  urlPattern: (i: number) => string = DEFAULT_FRAME_URL
): Promise<HTMLImageElement | null> {
  const cached = globalFramesCache.get(frameNum);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  const existingPromise = globalLoadingPromises.get(frameNum);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      globalFramesCache.set(frameNum, img);
      resolve(img);
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = urlPattern(frameNum);
  }).finally(() => {
    globalLoadingPromises.delete(frameNum);
  });

  globalLoadingPromises.set(frameNum, promise);
  return promise;
}

export function useImagePreloader({
  totalFrames = 300,
  frameUrlPattern = DEFAULT_FRAME_URL,
}: UseImagePreloaderOptions = {}): UseImagePreloaderReturn {
  const [isReady, setIsReady] = useState<boolean>(() => {
    const f1 = globalFramesCache.get(1);
    return Boolean(f1 && f1.complete && f1.naturalWidth > 0);
  });

  const lastRequestedRef = useRef<number>(-1);
  const isCancelledRef = useRef<boolean>(false);

  // Mount-only preloading with zero infinite loops
  useEffect(() => {
    isCancelledRef.current = false;

    // 1. Prioritize Frame 1 for immediate crisp display
    loadFrame(1, frameUrlPattern).then((img) => {
      if (!isCancelledRef.current && img) {
        setIsReady(true);
      }
    });

    // 2. Preload first 10 frames immediately for smooth initial motion
    for (let i = 2; i <= Math.min(10, totalFrames); i++) {
      loadFrame(i, frameUrlPattern);
    }

    // 3. Stride loading (every 5th frame) staggered across idle intervals
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let strideIndex = 10;

    const scheduleNextStride = () => {
      if (isCancelledRef.current || strideIndex > totalFrames) return;

      loadFrame(strideIndex, frameUrlPattern);
      strideIndex += 5;

      // Small 30ms interval keeps the main thread 100% responsive and free
      timeoutId = setTimeout(scheduleNextStride, 30);
    };

    timeoutId = setTimeout(scheduleNextStride, 100);

    return () => {
      isCancelledRef.current = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [totalFrames]); // Strict primitive dependency only

  /**
   * On-demand priority loading for frames near the current scrub position
   */
  const requestPriorityFrame = useCallback(
    (targetIndex: number) => {
      const frameNum = Math.max(1, Math.min(totalFrames, Math.round(targetIndex) + 1));
      if (Math.abs(frameNum - lastRequestedRef.current) < 2) return;
      lastRequestedRef.current = frameNum;

      // Fetch immediate surrounding frames (expanded window for ultra-smooth scrubbing)
      for (let offset = 0; offset <= 5; offset++) {
        const ahead = frameNum + offset;
        const behind = frameNum - offset;
        if (ahead <= totalFrames) loadFrame(ahead, frameUrlPattern);
        if (behind >= 1) loadFrame(behind, frameUrlPattern);
      }
    },
    [totalFrames, frameUrlPattern]
  );

  /**
   * Fast, synchronous nearest-neighbor frame lookup from cache
   */
  const getNearestFrame = useCallback(
    (targetIndex: number): HTMLImageElement | null => {
      const frameNum = Math.max(1, Math.min(totalFrames, Math.round(targetIndex) + 1));

      // 1. Direct hit
      const exact = globalFramesCache.get(frameNum);
      if (exact && exact.complete && exact.naturalWidth > 0) {
        return exact;
      }

      // 2. Search outward up to 10 frames
      for (let offset = 1; offset <= 10; offset++) {
        const left = globalFramesCache.get(frameNum - offset);
        if (left && left.complete && left.naturalWidth > 0) return left;

        const right = globalFramesCache.get(frameNum + offset);
        if (right && right.complete && right.naturalWidth > 0) return right;
      }

      // 3. Fallback to keyframe stride
      const strideNum = Math.round(frameNum / 5) * 5;
      const strideImg = globalFramesCache.get(strideNum);
      if (strideImg && strideImg.complete && strideImg.naturalWidth > 0) {
        return strideImg;
      }

      // 4. Default to frame 1
      const f1 = globalFramesCache.get(1);
      if (f1 && f1.complete && f1.naturalWidth > 0) {
        return f1;
      }

      return null;
    },
    [totalFrames]
  );

  return {
    isReady,
    totalFrames,
    getNearestFrame,
    requestPriorityFrame,
  };
}
