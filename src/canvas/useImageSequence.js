/**
 * Hook to initialize and monitor image sequence preloading
 */
import { useState, useEffect, useRef } from 'react';
import { ImageSequenceLoader } from '../utils/imageLoader';
import { TOTAL_FRAMES } from '../utils/frameConfig';

export function useImageSequence() {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isInitialReady, setIsInitialReady] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    const loader = new ImageSequenceLoader({
      total: TOTAL_FRAMES,
      concurrency: 12,
      onProgress: (count, total, pct) => {
        setLoadedCount(count);
        setProgress(pct);
      },
      onInitialReady: () => {
        setIsInitialReady(true);
      },
      onComplete: () => {
        setIsFullyLoaded(true);
        setProgress(100);
      },
    });

    loaderRef.current = loader;
    loader.start();

    return () => {
      loader.cancel();
    };
  }, []);

  return {
    progress,
    loadedCount,
    totalFrames: TOTAL_FRAMES,
    isInitialReady,
    isFullyLoaded,
    getFrame: (idx) => loaderRef.current?.getFrame(idx) ?? null,
  };
}
