/**
 * CanvasSequence.tsx
 * Ultra-smooth HTML5 Canvas Scrollytelling Component for KAFI Gulberg (300 Frames)
 * 
 * CRITICAL FIXES APPLIED:
 * 1. ZERO BLACK GAPS & ZERO BLACK BARS (FIXED POSITIONING):
 *    - Uses 'fixed inset-0 w-full h-full' instead of sticky. The canvas is pinned to the viewport
 *      at 100vw x 100vh and NEVER scrolls off-screen or reveals black space at the bottom.
 * 2. PERFECT drawCoverImage (OBJECT-FIT COVER):
 *    - Uses Math.max(cWidth / imgWidth, cHeight / imgHeight) so the image dynamically covers 100%
 *      of the screen on all resolutions (ultrawide, desktop, tablet, mobile) with zero black gaps.
 * 3. NO BLACK SCREEN FLASHING:
 *    - Omitted ctx.clearRect() so previous frames are seamlessly overwritten.
 *    - Persistent lastValidImgRef ensures canvas NEVER flashes black if a frame is momentarily loading.
 * 4. BUTTER-SMOOTH LERP + RAF:
 *    - Decoupled scroll listener using window.scrollY + requestAnimationFrame with LERP (0.08)
 *      for liquid Apple-grade momentum scrubbing.
 */

import React, { useRef, useEffect, useCallback } from 'react';
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

  // Scale factor that guarantees 100% coverage of the canvas
  const scale = Math.max(cWidth / imgWidth, cHeight / imgHeight);
  const renderWidth = imgWidth * scale;
  const renderHeight = imgHeight * scale;

  // Center the image (offsets will be <= 0, preventing any black gaps on any side)
  const offsetX = (cWidth - renderWidth) / 2;
  const offsetY = (cHeight - renderHeight) / 2;

  // Overwrite the entire destination rectangle seamlessly
  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
}

export const CanvasSequence: React.FC<CanvasSequenceProps> = ({
  totalFrames = 300,
  lerpFactor = 0.06,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preloader hook with priority queue and nearest-neighbor fallback
  const { isReady, getNearestFrame, requestPriorityFrame } = useImagePreloader({
    totalFrames,
    concurrency: 12,
  });

  // State tracked in mutable refs for garbage-collection-free 60/120/144fps performance
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const lastValidImgRef = useRef<HTMLImageElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  /**
   * High-performance single-pass frame renderer.
   * Eliminates GPU-thrashing dual drawImage alpha blending.
   */
  const renderFrame = useCallback(
    (frameFloat: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const clamped = Math.max(0, Math.min(totalFrames - 1, frameFloat));
      const targetIndex = Math.round(clamped);

      // Only repaint when integer frame actually updates
      if (targetIndex === lastDrawnFrameRef.current && lastValidImgRef.current) return;

      const img = getNearestFrame(targetIndex) || lastValidImgRef.current || getNearestFrame(0);
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

    if (Math.abs(canvas.width - targetWidth) > 4 || Math.abs(canvas.height - targetHeight) > 4) {
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
   * Smooth, throttled scroll handler
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames, requestPriorityFrame]);

  /**
   * Continuous RAF loop with frame-rate independent Delta-Time LERP
   */
  useEffect(() => {
    let isRunning = true;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (!isRunning) return;

      const deltaMs = Math.min(64, Math.max(1, now - lastTime));
      lastTime = now;

      const prev = currentFrameRef.current;
      const target = targetFrameRef.current;

      const effectiveFactor = 1 - Math.pow(1 - lerpFactor, deltaMs / 16.667);
      currentFrameRef.current = prev + (target - prev) * effectiveFactor;

      if (Math.abs(target - currentFrameRef.current) < 0.02) {
        currentFrameRef.current = target;
      }

      renderFrame(currentFrameRef.current);

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isReady, lerpFactor, renderFrame]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600vh] w-full bg-[#1A100B]"
      style={{ overscrollBehaviorY: 'none' }}
    >
      {/* 
        FIXED FULLSCREEN VIEWPORT:
        Fixed inset-0 pins the canvas directly to the screen at all times.
        Guarantees zero black borders, zero gap when starting to scroll.
      */}
      <div className="fixed inset-0 w-full h-full min-h-[100dvh] overflow-hidden pointer-events-none">
        {/* Permanent Fallback: Frame 1 is permanently behind canvas so the screen NEVER flashes black */}
        <img
          src="/frames/ezgif-frame-001.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none -z-10"
        />
        <canvas
          ref={canvasRef}
          className="block h-full w-full object-cover pointer-events-none select-none relative z-0"
        />
      </div>
    </div>
  );
};

export default CanvasSequence;
