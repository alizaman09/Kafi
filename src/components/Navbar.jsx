/**
 * Navbar Component
 * Minimalist luxury boutique header with glassmorphism, live status, sound toggle & menu trigger
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Volume2, VolumeX, Sparkles, MapPin } from 'lucide-react';

export default function Navbar({ onOpenMenu, isSoundActive, onToggleSound, onNavigateSection }) {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Identity */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => onNavigateSection(0)}
            className="group text-left flex items-center gap-3 focus:outline-none"
            aria-label="KAFI Gulberg Home"
          >
            <div className="w-10 h-10 rounded-full border border-gold-500/30 bg-espresso-900/80 flex items-center justify-center text-gold-400 group-hover:border-gold-500 group-hover:shadow-luxury-glow transition-all duration-300">
              <Coffee className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-lg md:text-xl font-bold text-cream-100 group-hover:text-gold-400 transition-colors">
                  KAFI
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500" />
                <span className="text-[10px] tracking-superwide uppercase text-cream-300 font-mono">
                  Gulberg
                </span>
              </div>
              <p className="text-[10px] text-cream-400 font-sans tracking-wider hidden sm:block">
                Specialty Roastery & Cafe
              </p>
            </div>
          </button>
        </div>

        {/* Center Live Indicator (Desktop) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel border border-white/10 text-xs text-cream-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-matcha-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-matcha-500"></span>
          </span>
          <span className="font-mono text-[11px] tracking-wider text-cream-100">BREWING NOW</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1 text-[11px] text-cream-300">
            <MapPin className="w-3 h-3 text-gold-400" /> Gulberg III, Lahore
          </span>
        </div>

        {/* Right Controls: Ambient Audio + Menu + Order CTA */}
        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundActive ? "Mute Ambient Sound" : "Play Ambient Cafe Sound"}
            className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-cream-300 hover:text-gold-400 transition-colors"
          >
            {isSoundActive ? (
              <Volume2 className="w-4 h-4 text-gold-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-cream-400" />
            )}
          </button>

          {/* Quick Nav: Roastery */}
          <button
            onClick={() => onNavigateSection(0.4)}
            className="hidden lg:inline-flex px-4 py-2 rounded-full glass-button text-xs font-medium tracking-wider text-cream-200 hover:text-cream-50 uppercase"
          >
            Vibes & Roast
          </button>

          {/* Menu Modal Trigger */}
          <button
            onClick={onOpenMenu}
            className="px-4 py-2 rounded-full glass-button text-xs font-medium tracking-wider text-cream-100 hover:text-gold-400 uppercase flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Menu</span>
          </button>

          {/* Direct Order Button */}
          <button
            onClick={() => onNavigateSection(0.85)}
            className="px-4 md:px-5 py-2 rounded-full bg-gold-gradient text-matte-950 font-semibold text-xs tracking-wider uppercase hover:shadow-luxury-glow hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center gap-1.5"
          >
            <span>Order Direct</span>
            <span className="hidden sm:inline text-[10px] bg-matte-950/20 px-1.5 py-0.5 rounded text-matte-950 font-bold">0%</span>
          </button>

        </div>
      </div>
    </motion.header>
  );
}
