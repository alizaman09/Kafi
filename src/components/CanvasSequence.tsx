/**
 * CanvasSequence.tsx
 * Ultra-smooth HTML5 Canvas Scrollytelling Component for KAFI Gulberg (300 Frames)
 * 
 * Performance & Stability Guarantees:
 * 1. Zero continuous idle loops: RAF runs ONLY while momentum scrubbing, then completely sleeps.
 * 2. Zero thread locking: Frame requests are throttled and lightweight.
 * 3. Fixed fullscreen viewport: 100% viewport coverage with zero black bars or jumping.
 * 4. Memoized to avoid unnecessary React re-renders when outer scroll progress updates.
 */

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useImagePreloader } from '../hooks/useImagePreloader';

interface CanvasSequenceProps {
  totalFrames?: number;
  lerpFactor?: number;
}

/**
 * Calculates exact cover scaling and centers the image on the canvas.
 * Guarantees zero black borders, zero letterboxes, and zero pillarboxes.
 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  if (!img) return;

  const cWidth = canvas.width;
  const cHeight = canvas.height;
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;

  if (!imgWidth || !imgHeight || !cWidth || !cHeight) return;

  const scale = Math.max(cWidth / imgWidth, cHeight / imgHeight);
  const renderWidth = imgWidth * scale;
  const renderHeight = imgHeight * scale;

  const offsetX = (cWidth - renderWidth) / 2;
  const offsetY = (cHeight - renderHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
}

export const CanvasSequence: React.FC<CanvasSequenceProps> = memo(({
  totalFrames = 300,
  lerpFactor = 0.08,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isReady, getNearestFrame, requestPriorityFrame } = useImagePreloader({
    totalFrames,
  });

  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const lastValidImgRef = useRef<HTMLImageElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  /**
   * High-performance single-pass frame renderer
   */
  const renderFrame = useCallback(
    (frameFloat: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const clamped = Math.max(0, Math.min(totalFrames - 1, frameFloat));
      const targetIndex = Math.round(clamped);

      // Avoid redundant redraw of the exact same frame
      if (targetIndex === lastDrawnFrameRef.current && lastValidImgRef.current) return;

      const img = getNearestFrame(targetIndex) || lastValidImgRef.current;
      if (!img || !img.complete || img.naturalWidth === 0) return;

      lastValidImgRef.current = img;
      lastDrawnFrameRef.current = targetIndex;

      drawCoverImage(ctx, img, canvas);
    },
    [getNearestFrame, totalFrames]
  );

  /**
   * Retina DPR calibration & dynamic resize
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const targetWidth = Math.floor(displayWidth * dpr);
    const targetHeight = Math.floor(displayHeight * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      if (lastValidImgRef.current) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) drawCoverImage(ctx, lastValidImgRef.current, canvas);
      } else {
        renderFrame(currentFrameRef.current);
      }
    }
  }, [renderFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  /**
   * Demand-driven RAF loop: Runs ONLY while scrubbing, completely pauses when settled
   */
  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaMs = Math.min(64, Math.max(1, now - lastTime));
      lastTime = now;

      const prev = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - prev;

      // When settled within a tiny fraction of a frame, draw target and sleep
      if (Math.abs(diff) < 0.04) {
        currentFrameRef.current = target;
        renderFrame(target);
        isAnimatingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const effectiveFactor = 1 - Math.pow(1 - lerpFactor, deltaMs / 16.667);
      currentFrameRef.current = prev + diff * effectiveFactor;
      renderFrame(currentFrameRef.current);

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [lerpFactor, renderFrame]);

  /**
   * Scroll listener: updates target frame and wakes up RAF loop
   */
  useEffect(() => {
    let lastProgress = -1;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      if (Math.abs(progress - lastProgress) < 0.0005) return;
      lastProgress = progress;

      const newTarget = progress * (totalFrames - 1);
      targetFrameRef.current = newTarget;

      requestPriorityFrame(newTarget);
      startAnimation();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [totalFrames, requestPriorityFrame, startAnimation]);

  // Initial paint as soon as frame 1 or canvas is ready
  useEffect(() => {
    renderFrame(0);
  }, [isReady, renderFrame]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600vh] w-full"
      style={{ backgroundColor: '#1A100B', overscrollBehaviorY: 'none' }}
    >
      {/* Fixed fullscreen viewport: covers 100% of screen, zero black gaps */}
      <div
        className="pointer-events-none overflow-hidden"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      >
        {/* Permanent Fallback: Frame 1 behind canvas so screen never flashes black */}
        <img
          src="/frames/ezgif-frame-001.png"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          className="select-none pointer-events-none -z-10"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none select-none"
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 0 }}
        />
      </div>
    </div>
  );
});

CanvasSequence.displayName = 'CanvasSequence';

export default CanvasSequence;
