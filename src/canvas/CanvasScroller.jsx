/**
 * CanvasScroller Component
 * Ultra-smooth HTML5 Canvas Scrollytelling engine with Retina DPR handling,
 * object-cover scaling, requestAnimationFrame loop, and linear interpolation (LERP).
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { useScroll } from 'framer-motion';
import { TOTAL_FRAMES } from '../utils/frameConfig';
import { lerp } from '../utils/math';

export default function CanvasScroller({ getFrame, isInitialReady, onFrameChange }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastDrawnFrameRef = useRef(-1);

  // Framer Motion scroll tracking over the 600vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Listen to scroll progress updates and set target frame
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Map 0.0 -> 1.0 to frame index 0 -> (TOTAL_FRAMES - 1)
      const clamped = Math.max(0, Math.min(1, latest));
      targetFrameRef.current = clamped * (TOTAL_FRAMES - 1);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  /**
   * High performance Canvas drawing with aspect-ratio cover
   */
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const img = getFrame(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Calculate aspect ratio cover
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    // Draw frame
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Subtle boutique cinematic vignette & warm espresso gradient
    const vignette = ctx.createRadialGradient(
      cw / 2, ch / 2, Math.min(cw, ch) * 0.3,
      cw / 2, ch / 2, Math.max(cw, ch) * 0.75
    );
    vignette.addColorStop(0, 'rgba(10, 10, 10, 0)');
    vignette.addColorStop(0.7, 'rgba(10, 10, 10, 0.25)');
    vignette.addColorStop(1, 'rgba(10, 10, 10, 0.75)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, cw, ch);

    lastDrawnFrameRef.current = frameIndex;
    if (onFrameChange) {
      onFrameChange(frameIndex);
    }
  }, [getFrame, onFrameChange]);

  /**
   * Handle dynamic Retina resize & DPR calibration
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for optimal 60fps performance
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Redraw immediately after resize
      renderFrame(Math.round(currentFrameRef.current));
    }
  }, [renderFrame]);

  // Set up resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  /**
   * Continuous RAF loop with LERP interpolation for butter-smooth scrubbing
   */
  useEffect(() => {
    if (!isInitialReady) return;

    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const prev = currentFrameRef.current;
      const target = targetFrameRef.current;

      // LERP smoothing factor (0.12 gives instant yet silky cinematic feel)
      currentFrameRef.current = lerp(prev, target, 0.12);

      const roundedIndex = Math.round(currentFrameRef.current);

      // Only draw if frame index changed or close to rest
      if (roundedIndex !== lastDrawnFrameRef.current || Math.abs(target - prev) > 0.05) {
        renderFrame(roundedIndex);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isInitialReady, renderFrame]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600vh] w-full bg-[#0A0A0A]"
      id="scroll-sequence-container"
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full object-cover pointer-events-none select-none"
        />

        {/* Ambient Dark-Cinema Gradients for Contrast & Readability */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/60" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/40" />
      </div>
    </div>
  );
}
