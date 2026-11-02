/**
 * HeaderNavbar.jsx
 * Persistent Sticky Header & Navigation for KAFI Gulberg (Desktop & Mobile)
 *
 * Guarantees:
 * 1. Remains fixed at the top across all sections during the entire page scroll.
 * 2. Solid/frosted dark espresso background (#1A100B) prevents content or hero images from showing behind the logo.
 * 3. 3-line Hamburger Menu placed immediately to the LEFT of the Cart button on both desktop and mobile.
 * 4. Exactly 3 clean navigation actions:
 *    - Home Page -> Smoothly scrolls to top (hero section).
 *    - Menu -> Smoothly scrolls to the Interior Menu section.
 *    - Details -> Smoothly scrolls to the Footer / Details section.
 * 5. Cart button with live item counter badge.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Coffee, ShoppingCart, Menu, X, Home, Info } from 'lucide-react';

export default function HeaderNavbar({
  cartCount = 0,
  onOpenCart,
  onScrollToHome,
  onScrollToMenu,
  onScrollToDetails,
  scrollProgress = 0,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full py-2.5 sm:py-3 pointer-events-none select-none transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
        {/* =========================================================================
            1. BRAND: KAFI GULBERG LOGO (Clean dark backing, zero image clutter)
            ========================================================================= */}
        <div
          onClick={onScrollToHome}
          className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto cursor-pointer group"
          title="KAFI Gulberg — Go to Home"
        >
          {/* Coffee Emblem Badge */}
          <div className="w-8 h-8 xs:w-8.5 xs:h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#1C0F08] border border-white/30 flex items-center justify-center text-[#F5EFEB] shadow-md shrink-0 group-hover:border-[#EAD18D] transition-colors">
            <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EAD18D]" />
          </div>

          {/* Typography */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif text-base xs:text-lg sm:text-xl md:text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                KAFI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAD18D]" />
              <span className="text-[9.5px] xs:text-[11px] sm:text-xs md:text-sm font-mono tracking-widest text-[#EAD18D] font-black uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Gulberg
              </span>
            </div>
            <p className="text-[8px] xs:text-[9.5px] sm:text-xs text-[#F5EFEB]/90 font-sans font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Specialty Coffee & Roastery
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. RIGHT ACTIONS:
               - Mobile: Cart (left) + Hamburger (right) [unchanged original layout]
               - Laptop: Hamburger (left) + Cart (right) [swapped to opposite side]
            ========================================================================= */}
        <div ref={menuRef} className="relative flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
          {/* Cart Button: order-1 on mobile, md:order-2 on laptop */}
          <button
            onClick={onOpenCart}
            style={{ touchAction: 'pan-y' }}
            className="order-1 md:order-2 relative px-3 sm:px-4 py-1.5 min-h-[32px] sm:min-h-[36px] rounded-full bg-white hover:bg-[#FAF6F0] text-[#3D2214] text-[11px] sm:text-xs font-black tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5 shrink-0"
            title="Open Cart & Checkout"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#3D2214]" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#3D2214] text-[#EAD18D] text-[9px] sm:text-[10px] font-mono font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* 3-line Hamburger Menu Button: order-2 on mobile (right of Cart), md:order-1 on laptop (left of Cart) */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            style={{ touchAction: 'pan-y' }}
            className={`order-2 md:order-1 w-8 h-8 xs:w-9 xs:h-9 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 border ${
              isMenuOpen
                ? 'bg-[#EAD18D] text-[#1A100B] border-[#EAD18D]'
                : 'bg-[#6E4E37]/85 hover:bg-[#6E4E37] text-white border-white/25 active:scale-95'
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            title="Navigation Menu"
          >
            {isMenuOpen ? (
              <X className="w-4 h-4 xs:w-4.5 xs:h-4.5 stroke-[2.5]" />
            ) : (
              <Menu className="w-4 h-4 xs:w-4.5 xs:h-4.5 stroke-[2.5]" />
            )}
          </button>

          {/* =====================================================================
              3. NAVIGATION DROPDOWN MENU (Exactly 3 Options: Home Page, Menu, Details)
              ===================================================================== */}
          {isMenuOpen && (
            <div
              className="absolute top-full right-0 mt-2.5 w-52 sm:w-56 rounded-2xl bg-[#1C0F08]/95 backdrop-blur-xl border border-white/20 shadow-2xl p-2 z-50 flex flex-col gap-1 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Option 1: Home Page */}
              <button
                onClick={() => {
                  if (onScrollToHome) onScrollToHome();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-[13px] font-bold text-white hover:bg-[#6E4E37]/70 active:bg-[#6E4E37] transition-all group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#6E4E37]/50 border border-white/10 flex items-center justify-center text-[#EAD18D] group-hover:scale-105 transition-transform">
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span>Home Page</span>
              </button>

              {/* Option 2: Menu */}
              <button
                onClick={() => {
                  if (onScrollToMenu) onScrollToMenu();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-[13px] font-bold text-white hover:bg-[#6E4E37]/70 active:bg-[#6E4E37] transition-all group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#6E4E37]/50 border border-white/10 flex items-center justify-center text-[#EAD18D] group-hover:scale-105 transition-transform">
                  <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span>Menu</span>
              </button>

              {/* Option 3: Details */}
              <button
                onClick={() => {
                  if (onScrollToDetails) onScrollToDetails();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-[13px] font-bold text-white hover:bg-[#6E4E37]/70 active:bg-[#6E4E37] transition-all group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#6E4E37]/50 border border-white/10 flex items-center justify-center text-[#EAD18D] group-hover:scale-105 transition-transform">
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span>Details</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
