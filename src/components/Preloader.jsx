/**
 * Preloader Component
 * Boutique Minimalist Loading Screen with Monospace Percentage Counter & Smooth Shimmer Bar
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, ArrowRight } from 'lucide-react';

export default function Preloader({ progress, loadedCount, totalFrames, isInitialReady, onEnterNow }) {
  // Can enter early once initial critical frames are loaded (e.g. 25% or initial frame ready)
  const canSkip = isInitialReady && progress >= 20;

  return (
    <AnimatePresence>
      <motion.div
        key="preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 md:p-14 bg-[#0A0A0A] text-cream-100 select-none overflow-hidden"
      >
        {/* Subtle espresso radial backdrop glow */}
        <div className="absolute inset-0 pointer-events-none bg-espresso-radial opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

        {/* Top Header */}
        <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-xs tracking-superwide uppercase text-cream-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500" />
            <span>KAFI Gulberg / Lahore</span>
          </div>
          <div>EST. 2024</div>
        </div>

        {/* Center Stage: Coffee Emblem & Monospace Counter */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-16 h-16 rounded-full border border-gold-500/30 bg-espresso-900/60 backdrop-blur-md flex items-center justify-center mb-8 shadow-luxury-glow"
          >
            <Coffee className="w-8 h-8 text-gold-400 animate-pulse" />
          </motion.div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-luxury text-cream-100 mb-3">
            KAFI GULBERG
          </h1>
          <p className="text-xs md:text-sm font-sans tracking-widest text-cream-300 uppercase mb-8">
            Specialty Coffee & Architectural Ambiance
          </p>

          {/* Monospace 3-Digit Counter */}
          <div className="font-mono text-5xl md:text-7xl font-light tracking-tighter text-gold-400 mb-4 tabular-nums">
            {String(progress).padStart(3, '0')}<span className="text-2xl md:text-3xl text-cream-400 font-sans font-extralight ml-1">%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-64 md:w-80 h-1 bg-white/10 rounded-full overflow-hidden p-0.5 relative mb-4">
            <motion.div
              className="h-full bg-gold-gradient rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>

          {/* Frame count readout */}
          <div className="font-mono text-[11px] text-cream-400 tracking-wider">
            CACHING SEQUENTIAL FRAMES: <span className="text-gold-400">{loadedCount}</span> / {totalFrames}
          </div>

          {/* Early Enter Button if user wants instant interaction */}
          {canSkip && progress < 100 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onEnterNow}
              className="mt-8 px-5 py-2.5 rounded-full glass-panel border border-gold-500/40 text-xs font-mono tracking-wider text-cream-100 hover:text-gold-400 hover:border-gold-400 flex items-center gap-2 transition-all duration-300 group"
            >
              <span>ENTER EXPERIENCE NOW</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}

        </div>

        {/* Bottom Note */}
        <div className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] tracking-wider text-cream-400/80 font-mono gap-2">
          <span>HIGH-PRECISION RETINA CANVAS RENDERING</span>
          <span className="text-gold-400/80">SCROLL DOWN TO REVEAL STORY</span>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
