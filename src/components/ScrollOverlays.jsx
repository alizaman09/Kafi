/**
 * ScrollOverlays Component
 * Renders Awwwards-level typography overlays synchronized to scroll progress:
 * - 0% Scroll: Hero Title ("KAFI Gulberg — Specialty Coffee & Ambiance")
 * - 40% Scroll: Mid-scroll Callout ("From Exterior Vibes to Artisan Roasts")
 * - 80% Scroll: Final CTA ("Explore Menu & Order Direct - 0% Commission")
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
  Coffee,
  Flame,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  ExternalLink
} from 'lucide-react';

export default function ScrollOverlays({
  scrollProgress = 0,
  currentFrame = 0,
  onOpenMenu,
  onNavigateSection,
}) {
  // Compute normalized opacity and transform curves for the 3 key milestones
  
  // Hero (0% to 25% scroll)
  const heroOpacity = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.0) / 0.18));
  const heroTranslateY = (scrollProgress / 0.2) * -50;
  const isHeroVisible = heroOpacity > 0.02;

  // Mid-scroll Callout (30% to 65% scroll, peaks at 42%)
  let midOpacity = 0;
  if (scrollProgress >= 0.25 && scrollProgress <= 0.65) {
    if (scrollProgress < 0.42) {
      midOpacity = (scrollProgress - 0.25) / (0.42 - 0.25);
    } else {
      midOpacity = 1 - (scrollProgress - 0.42) / (0.65 - 0.42);
    }
  }
  const midTranslateY = (scrollProgress - 0.42) * -60;
  const isMidVisible = midOpacity > 0.02;

  // Final CTA (70% to 100% scroll, peaks at 85%)
  let ctaOpacity = 0;
  if (scrollProgress >= 0.68) {
    ctaOpacity = Math.min(1, (scrollProgress - 0.68) / 0.15);
  }
  const ctaTranslateY = Math.max(-20, (1 - ctaOpacity) * 40);
  const isCtaVisible = ctaOpacity > 0.02;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 md:p-12 overflow-hidden">
      
      {/* =========================================================================
          SECTION 1: HERO OVERLAY (0% SCROLL)
          ========================================================================= */}
      {isHeroVisible && (
        <div
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroTranslateY}px)`,
            pointerEvents: heroOpacity > 0.4 ? 'auto' : 'none',
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-opacity duration-150"
        >
          {/* Subtle Accent Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-gold-500/20 text-gold-400 text-xs font-mono tracking-widest uppercase mb-6 shadow-luxury-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gulberg III • Lahore's Premier Roastery</span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-cream-100 max-w-5xl leading-[1.05] drop-shadow-2xl">
            KAFI <span className="gold-shimmer italic font-normal">Gulberg</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 md:mt-6 text-base sm:text-xl md:text-2xl font-light text-cream-200 tracking-wide max-w-2xl font-sans drop-shadow">
            Specialty Coffee & Ambiance
          </p>

          <p className="mt-2 text-xs md:text-sm text-cream-400/80 font-mono tracking-widest uppercase max-w-md">
            Architectural Serenity • Artisan Roast Lab • Direct Trade
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigateSection(0.4)}
              className="px-6 py-3 rounded-full bg-gold-gradient text-matte-950 font-semibold text-xs tracking-wider uppercase hover:shadow-luxury-glow hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <span>Explore The Story</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenMenu}
              className="px-6 py-3 rounded-full glass-button text-cream-100 font-medium text-xs tracking-wider uppercase hover:border-gold-400 flex items-center gap-2"
            >
              <span>Browse Menu</span>
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-400 font-mono text-[11px] tracking-widest uppercase pointer-events-none">
            <span>Scroll to Experience</span>
            <div className="w-5 h-8 rounded-full border border-cream-400/40 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-gold-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: MID-SCROLL CALLOUT (40% SCROLL)
          ========================================================================= */}
      {isMidVisible && (
        <div
          style={{
            opacity: midOpacity,
            transform: `translateY(${midTranslateY}px)`,
            pointerEvents: midOpacity > 0.4 ? 'auto' : 'none',
          }}
          className="absolute inset-0 flex items-center justify-center lg:justify-start px-6 md:px-16 lg:px-28"
        >
          <div className="max-w-xl text-left glass-panel-espresso p-8 md:p-12 rounded-3xl border border-gold-500/20 shadow-2xl relative overflow-hidden">
            
            {/* Top gold badge */}
            <div className="flex items-center gap-2 text-gold-400 text-xs font-mono tracking-widest uppercase mb-4">
              <Flame className="w-4 h-4" />
              <span>CRAFTED IN GULBERG</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cream-100 leading-tight mb-4">
              From Exterior Vibes to <span className="text-gold-400 italic">Artisan Roasts</span>
            </h2>

            {/* Description */}
            <p className="text-sm md:text-base text-cream-200 font-light leading-relaxed mb-6 font-sans">
              Step inside a carefully composed architectural space where concrete warmth, lush foliage,
              and specialty roasting merge. Every bean is small-batch profiled to highlight floral acidity,
              velvety body, and deep caramel finishes.
            </p>

            {/* Micro Feature Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs text-cream-300">
              <div className="p-3 rounded-xl bg-matte-950/60 border border-white/5 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Single Origin V60</span>
              </div>
              <div className="p-3 rounded-xl bg-matte-950/60 border border-white/5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-matcha-400 shrink-0" />
                <span>Ceremonial Matcha</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={onOpenMenu}
                className="px-5 py-2.5 rounded-full bg-gold-gradient text-matte-950 font-semibold text-xs tracking-wider uppercase hover:shadow-luxury-glow transition-all"
              >
                View Roastery Menu
              </button>
              <button
                onClick={() => onNavigateSection(0.85)}
                className="text-xs font-mono tracking-wider text-cream-300 hover:text-gold-400 flex items-center gap-1.5 transition-colors"
              >
                <span>Jump to Order</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: FINAL CALL TO ACTION (80% SCROLL)
          ========================================================================= */}
      {isCtaVisible && (
        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaTranslateY}px)`,
            pointerEvents: ctaOpacity > 0.4 ? 'auto' : 'none',
          }}
          className="absolute inset-0 flex items-center justify-center px-4 md:px-8 py-16"
        >
          <div className="w-full max-w-3xl glass-panel p-8 sm:p-12 md:p-14 rounded-3xl border border-gold-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
            
            {/* Background shimmer effect */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Zero Commission Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono tracking-widest uppercase mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Kitchen Order • 0% Commission</span>
            </div>

            {/* Main CTA Heading */}
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-cream-100 mb-4 leading-tight">
              Explore Menu &amp; <span className="gold-shimmer">Order Direct</span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-cream-200 font-light max-w-xl mx-auto mb-8 font-sans">
              Support your local coffee house with zero aggregator markups. Enjoy freshly extracted
              espresso, artisanal flat whites, and oven-fresh pastries delivered direct or ready for pickup.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onOpenMenu}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-gradient text-matte-950 font-bold text-sm tracking-wider uppercase hover:shadow-luxury-glow hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Explore Full Menu</span>
              </button>

              <a
                href="https://wa.me/923000000000?text=Hi%20KAFI%20Gulberg!%20I%20would%20like%20to%20place%20an%20artisan%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel border border-white/20 text-cream-100 font-semibold text-sm tracking-wider uppercase hover:border-gold-400 hover:text-gold-400 flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-gold-400" />
                <span>WhatsApp Order (0% Fee)</span>
              </a>
            </div>

            {/* Location & Info Grid */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-cream-300">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" />
                <span>Open: 09:00 AM – 12:00 AM</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Gulberg III, Lahore</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-matcha-400" />
                <span>Dine-In • Takeaway • Delivery</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
