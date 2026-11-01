import React from 'react';
import { Coffee, MapPin, Phone, Clock, Globe, ArrowUp } from 'lucide-react';

export default function FooterSection({
  scrollProgress = 0,
  onOpenMenu,
  onOpenCart,
}) {
  let opacity = 0;

  if (scrollProgress >= 0.72) {
    const t = Math.min(1, (scrollProgress - 0.72) / 0.12);
    opacity = t * t * (3 - 2 * t);
  }

  const isVisible = opacity > 0.02;
  const isInteractive = opacity > 0.4;

  if (!isVisible) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection2 = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      window.scrollTo({ top: maxScroll * 0.38, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        opacity,
        willChange: 'opacity',
      }}
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between pt-3 sm:pt-6 md:pt-8 h-[100dvh] max-h-[100dvh] overflow-hidden transition-opacity duration-200 no-scrollbar select-none"
    >
      {/* 1. Grand Atmospheric "KAFI" Showcase Title in Upper Screen Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-auto text-center flex flex-col items-center justify-center py-6 sm:py-10">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#1A120B]/85 border border-[#EAD18D]/40 text-[#EAD18D] text-[9px] xs:text-[10px] sm:text-xs font-mono font-black tracking-widest uppercase backdrop-blur-md mb-2 sm:mb-3 shadow-lg">
          <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#EAD18D]" />
          <span>Specialty Roastery & Coffee Lab</span>
        </div>

        <h1 className="font-display font-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] tracking-[0.10em] sm:tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF9] via-[#F4E9DC] to-[#D4AF37] uppercase drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)] leading-none break-words">
          KAFI
        </h1>

        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-3">
          <span className="h-[1px] w-6 sm:w-16 bg-gradient-to-r from-transparent to-[#EAD18D]" />
          <p className="font-sans font-extrabold text-[9.5px] xs:text-[11px] sm:text-xs md:text-[13px] tracking-[0.25em] xs:tracking-[0.35em] sm:tracking-[0.45em] text-[#EAD18D] uppercase drop-shadow-md">
            Gulberg • Lahore
          </p>
          <span className="h-[1px] w-6 sm:w-16 bg-gradient-to-l from-transparent to-[#EAD18D]" />
        </div>
      </div>

      {/* 2. Footer Container — Dark Theme: Deep Espresso Brown #1A120B with Warm Beige/Gold Accents */}
      <div
        style={{ touchAction: 'pan-y' }}
        className="w-full bg-[#1A120B]/95 sm:bg-[#1A120B]/92 border-t border-[#EAD18D]/25 shadow-[0_-15px_45px_rgba(0,0,0,0.85)] text-[#F5F2EB] pointer-events-auto"
      >

        {/* Subtle Ambient Gold Gradient Line on top */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#EAD18D]/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-7 sm:py-9 lg:py-10">

          {/* 4-Column Grid Layout on Desktop, Stacking to 1 Column on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 sm:gap-8 lg:gap-10">

            {/* =========================================================
                COLUMN 1: BRAND
                ========================================================= */}
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2A1810] border border-[#EAD18D]/40 flex items-center justify-center text-[#EAD18D] shadow-md">
                  <Coffee className="w-4 h-4 text-[#EAD18D]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-lg font-black tracking-wider text-white">
                      KAFI
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAD18D]" />
                    <span className="text-[10px] font-mono tracking-widest text-[#EAD18D] font-black uppercase">
                      Gulberg
                    </span>
                  </div>
                  <p className="text-[9px] text-[#C6BBA3] font-sans font-medium tracking-wide">
                    Artisanal Roastery & Cafe
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-[#DCD3C0] leading-relaxed font-sans font-normal max-w-sm">
                Serving premium specialty coffee, signature seasonal lattes, and freshly baked patisserie in a cozy environment.
              </p>

              <div className="pt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2A1810] border border-[#EAD18D]/30 text-[#EAD18D] text-[10px] font-mono font-bold">
                  ★ Lahore Specialty Coffee
                </span>
              </div>
            </div>

            {/* =========================================================
                COLUMN 2: QUICK LINKS
                ========================================================= */}
            <div className="flex flex-col items-start space-y-3">
              <h3 className="font-serif text-sm font-bold tracking-wider text-[#EAD18D] uppercase flex items-center gap-2">
                <span>Quick Links</span>
                <span className="w-5 h-[1px] bg-[#EAD18D]/40" />
              </h3>

              <ul className="space-y-2 text-xs sm:text-[13px] font-sans font-medium">
                <li>
                  <button
                    onClick={scrollToTop}
                    className="text-[#DCD3C0] hover:text-[#EAD18D] hover:translate-x-1 transition-all duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="text-[#EAD18D]/50 group-hover:text-[#EAD18D]">›</span>
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={scrollToSection2}
                    className="text-[#DCD3C0] hover:text-[#EAD18D] hover:translate-x-1 transition-all duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="text-[#EAD18D]/50 group-hover:text-[#EAD18D]">›</span>
                    <span>Menu</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={scrollToTop}
                    className="text-[#DCD3C0] hover:text-[#EAD18D] hover:translate-x-1 transition-all duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="text-[#EAD18D]/50 group-hover:text-[#EAD18D]">›</span>
                    <span>Our Story</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={scrollToSection2}
                    className="text-[#DCD3C0] hover:text-[#EAD18D] hover:translate-x-1 transition-all duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="text-[#EAD18D]/50 group-hover:text-[#EAD18D]">›</span>
                    <span>Gallery</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* =========================================================
                COLUMN 3: CONTACT & HOURS
                ========================================================= */}
            <div className="flex flex-col items-start space-y-3">
              <h3 className="font-serif text-sm font-bold tracking-wider text-[#EAD18D] uppercase flex items-center gap-2">
                <span>Contact & Hours</span>
                <span className="w-5 h-[1px] bg-[#EAD18D]/40" />
              </h3>

              <div className="space-y-2.5 text-xs text-[#DCD3C0] font-sans">
                {/* Address */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#EAD18D] shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    63-A, Block E 1, Gulberg III, Lahore, 54000
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#EAD18D] shrink-0" />
                  <a
                    href="tel:03228441768"
                    className="hover:text-[#EAD18D] transition-colors font-mono font-bold tracking-wide"
                  >
                    0322 8441768
                  </a>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#EAD18D] shrink-0 mt-0.5" />
                  <div className="leading-tight space-y-0.5 text-[11.5px]">
                    <p>
                      <strong className="text-white">Mon–Thu & Sun:</strong> 6:30 AM – 2:00 AM
                    </p>
                    <p>
                      <strong className="text-white">Fri–Sat:</strong> 6:00 AM – 2:00 AM
                    </p>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Globe className="w-3.5 h-3.5 text-[#EAD18D] shrink-0" />
                  <a
                    href="https://www.kafi.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#EAD18D] transition-colors underline underline-offset-2 font-mono text-[11.5px]"
                  >
                    www.kafi.pk
                  </a>
                </div>
              </div>
            </div>

            {/* =========================================================
                COLUMN 4: SOCIALS
                ========================================================= */}
            <div className="flex flex-col items-start space-y-3">
              <h3 className="font-serif text-sm font-bold tracking-wider text-[#EAD18D] uppercase flex items-center gap-2">
                <span>Follow Us</span>
                <span className="w-5 h-[1px] bg-[#EAD18D]/40" />
              </h3>

              <p className="text-xs text-[#C6BBA3] leading-relaxed font-sans">
                Stay updated with our seasonal brews, latte art sessions, and roastery moments.
              </p>

              {/* Minimalist SVG Social Icons */}
              <div className="flex items-center gap-3 pt-1">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="w-9 h-9 rounded-full bg-[#2A1810] border border-white/15 hover:border-[#EAD18D] text-[#DCD3C0] hover:text-[#EAD18D] flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md group"
                >
                  <svg
                    className="w-4 h-4 fill-current transition-colors"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  className="w-9 h-9 rounded-full bg-[#2A1810] border border-white/15 hover:border-[#EAD18D] text-[#DCD3C0] hover:text-[#EAD18D] flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md group"
                >
                  <svg
                    className="w-4 h-4 fill-current transition-colors"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TikTok"
                  className="w-9 h-9 rounded-full bg-[#2A1810] border border-white/15 hover:border-[#EAD18D] text-[#DCD3C0] hover:text-[#EAD18D] flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md group"
                >
                  <svg
                    className="w-4 h-4 fill-current transition-colors"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.96-4.49V8.65a8.28 8.28 0 0 0 4.81 1.54V6.73a4.77 4.77 0 0 1-1-.04z" />
                  </svg>
                </a>
              </div>

              {/* Back to top shortcut */}
              <div className="pt-2">
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#C6BBA3] hover:text-[#EAD18D] text-[10px] font-mono tracking-wider transition-colors border border-white/10"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Back to top</span>
                </button>
              </div>
            </div>

          </div>

          {/* =========================================================
              BOTTOM BAR: Full-width subtle top border with centered copyright
              ========================================================= */}
          <div className="mt-7 sm:mt-9 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs text-[#C6BBA3]/80 font-sans">
            <p className="w-full text-center tracking-wide">
              © 2026 KAFI Gulberg. All Rights Reserved.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

