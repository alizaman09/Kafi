/**
 * HeroInspiration.tsx
 * Clean, proportionate layout matching inspiration design:
 * - NO blocky white background boxes around text or header
 * - Glass cup inside circle enlarged to fit the circle beautifully
 * - Clear, crisp, high-contrast dark espresso typography without clunky boxes
 * - Compact, elegant bottom cards
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Heart,
  ShoppingCart,
  CupSoda,
  Flame,
  Sparkles,
  ArrowRight,
  Check,
  Menu,
  X,
  Info,
  Home
} from 'lucide-react';

interface HeroInspirationProps {
  onOpenMenu?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  onAddToCart?: (item: any) => void;
  cart?: Record<string | number, any>;
  scrollProgress?: number;
}

export const HeroInspiration: React.FC<HeroInspirationProps> = ({
  onOpenMenu,
  onOpenCart,
  cartCount = 0,
  onAddToCart,
  cart = {},
  scrollProgress = 0,
}) => {
  const [likedCard, setLikedCard] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCardAdd = (id: number) => {
    if (onAddToCart) {
      if (id === 1) {
        onAddToCart({
          id: 'americano-latte',
          name: 'Americano Latte',
          price: '₱ 150',
          numericPrice: 150,
          cupImg: '/assets/glass_latte.png',
        });
      } else {
        onAddToCart({
          id: 'ceremonial-matcha',
          name: 'Ceremonial Matcha',
          price: '₱ 160',
          numericPrice: 160,
          cupImg: '/assets/glass_matcha.png',
        });
      }
    }
  };

  // Completely smooth, fluid easing curve without jerky jumps or elastic bounce
  const progressRatio = Math.max(0, Math.min(1, scrollProgress / 0.22));
  const smoothProgress = progressRatio * progressRatio * (3 - 2 * progressRatio);
  const heroOpacity = Math.max(0, Math.min(1, 1 - smoothProgress));

  if (heroOpacity <= 0.005) return null;

  return (
    <div
      style={{
        opacity: heroOpacity,
        pointerEvents: heroOpacity > 0.3 ? 'auto' : 'none',
        willChange: 'opacity',
      }}
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-2 sm:p-3 md:p-4 pb-2 sm:pb-3 md:pb-4 h-[100dvh] max-h-[100dvh] w-full overflow-hidden no-scrollbar"
    >
      {/* Translucent Warm Coffee Ambient Veil (#6E4E37) — Light so background animation remains visible */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-[#6E4E37]/45 via-[#6E4E37]/30 to-[#6E4E37]/20 backdrop-blur-[2px]" />

      {/* =========================================================================
          1. HEADER / NAVIGATION BAR — Warm Coffee Frosted Capsule & Pure White Text
          ========================================================================= */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-1 sm:py-1.5 pointer-events-auto shrink-0">
        {/* Brand: KAFI GULBERG (High-Contrast, Readable Logo with Clean Shadow) */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-2 xs:px-2.5 py-1 rounded-full bg-[#1C0F08]/60 backdrop-blur-md border border-white/20 shadow-md">
          <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-[#1C0F08] border border-white/35 flex items-center justify-center text-[#F5EFEB] shadow-md shrink-0">
            <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EAD18D]" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif text-base xs:text-lg sm:text-xl md:text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_0_12px_rgba(0,0,0,0.85)]">
                KAFI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAD18D] shadow-[0_0_6px_#EAD18D]" />
              <span className="text-[9.5px] xs:text-[11px] sm:text-xs md:text-sm font-mono tracking-widest text-[#F3D68E] font-black uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                Gulberg
              </span>
            </div>
            <p className="text-[8px] xs:text-[9.5px] sm:text-xs text-[#FFFDF9] font-sans font-bold tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
              Specialty Coffee & Roastery
            </p>
          </div>
        </div>

        {/* Center Nav Links — #6E4E37 Frosted Capsule with Pure White Text (Desktop only) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-1.5 rounded-full bg-[#6E4E37]/65 hover:bg-[#6E4E37]/80 backdrop-blur-md border border-white/25 shadow-[0_6px_25px_rgba(0,0,0,0.25)] transition-all">
          <a
            href="#home"
            className="text-xs lg:text-[13px] font-black tracking-wide text-white relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[2px] after:bg-white hover:scale-105 transition-all drop-shadow-sm"
          >
            Home
          </a>
          <button
            onClick={onOpenMenu}
            className="text-xs lg:text-[13px] font-black tracking-wide text-white/90 hover:text-[#EAD18D] hover:scale-105 active:scale-95 transition-all drop-shadow-sm"
          >
            Coffee Menu
          </button>
          <a
            href="#about"
            className="text-xs lg:text-[13px] font-black tracking-wide text-white/90 hover:text-[#EAD18D] hover:scale-105 active:scale-95 transition-all drop-shadow-sm"
          >
            About Us
          </a>
          <a
            href="#contact"
            className="text-xs lg:text-[13px] font-black tracking-wide text-white/90 hover:text-[#EAD18D] hover:scale-105 active:scale-95 transition-all drop-shadow-sm"
          >
            Contact us
          </a>
        </nav>

        {/* Right Actions: Cart Button first, then Mobile Hamburger Menu on the far right */}
        <div className="relative flex items-center gap-1.5 sm:gap-2">
          {/* Cart Button (Comes first) */}
          <button
            onClick={onOpenCart}
            className="relative px-2.5 sm:px-4 py-1 sm:py-1.5 min-h-[30px] rounded-full bg-white hover:bg-[#FAF6F0] text-[#3D2214] text-[11px] sm:text-xs font-black tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1 sm:gap-1.5 shrink-0"
            title="Open Cart & Checkout"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#3D2214]" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#3D2214] text-[#EAD18D] text-[9px] sm:text-[10px] font-mono font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger Menu Icon Button on Mobile (Far Right) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#6E4E37]/85 hover:bg-[#6E4E37] border border-white/25 text-white flex items-center justify-center active:scale-95 transition-all shadow-md shrink-0"
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-white stroke-[2.5]" />
            ) : (
              <Menu className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-white stroke-[2.5]" />
            )}
          </button>

          {/* Mobile Navigation Dropdown Menu: Home, Menu, Details */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-[#1C0F08]/95 backdrop-blur-xl border border-white/20 shadow-2xl p-2 z-50 flex flex-col gap-1 pointer-events-auto"
              >
                {/* 1. Home */}
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-white hover:bg-[#6E4E37]/60 active:bg-[#6E4E37] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#6E4E37]/50 border border-white/10 flex items-center justify-center text-[#EAD18D]">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <span>Home</span>
                </button>

                {/* 2. Menu */}
                <button
                  onClick={() => {
                    if (onOpenMenu) onOpenMenu();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-white hover:bg-[#6E4E37]/60 active:bg-[#6E4E37] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#6E4E37]/50 border border-white/10 flex items-center justify-center text-[#EAD18D]">
                    <Coffee className="w-3.5 h-3.5" />
                  </div>
                  <span>Menu</span>
                </button>

                {/* 3. Details */}
                <button
                  onClick={() => {
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    window.scrollTo({ top: maxScroll, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-white hover:bg-[#6E4E37]/60 active:bg-[#6E4E37] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#6E4E37]/50 border border-white/10 flex items-center justify-center text-[#EAD18D]">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <span>Details</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN HERO BODY — Compact, Fluid & Responsive for Mobile to Desktop
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-0 sm:my-auto py-0 sm:py-1 grid grid-cols-1 lg:grid-cols-12 gap-1 xs:gap-2 lg:gap-4 items-center pointer-events-auto">

        {/* Left Column: Bold Editorial Typography (Shifted Further Up Closer to Navbar) */}
        <div className="relative lg:col-span-6 flex flex-col items-start text-left p-1 sm:p-2 md:p-3 rounded-2xl -mt-10 xs:-mt-14 sm:-mt-16 lg:-mt-20">

          {/* Soft #6E4E37 ambient glow behind text */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#6E4E37]/50 via-[#6E4E37]/30 to-transparent rounded-2xl backdrop-blur-[2px] pointer-events-none" />

          {/* Large Bold White Heading */}
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-black tracking-tight text-white leading-[0.95] uppercase mb-1.5 sm:mb-2 md:mb-2.5 select-none drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)]">
            COFFEE<br />
            THE BEST FOR<br />
            <span className="text-[#EAD18D]">YOU</span>
          </h1>

          {/* View Menu Button */}
          <button
            onClick={onOpenMenu}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white text-[#4A2F1C] text-[11px] sm:text-xs md:text-[13px] font-black tracking-wider hover:bg-[#FAF6F0] hover:scale-105 active:scale-95 transition-all shadow-lg mb-1.5 sm:mb-2 md:mb-2.5 flex items-center gap-1.5 sm:gap-2"
          >
            <span>View Menu</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4A2F1C]" />
          </button>

          {/* 4 Icon Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { icon: Coffee, label: 'Hot Brew' },
              { icon: CupSoda, label: 'Iced Specials' },
              { icon: Flame, label: 'Roasts' },
              { icon: Sparkles, label: 'Beans' },
            ].map((btn) => (
              <button
                key={btn.label}
                title={btn.label}
                className="w-7 h-7 xs:w-8 xs:h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#6E4E37]/75 hover:bg-[#6E4E37] text-white border border-white/30 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200 backdrop-blur-md"
              >
                <btn.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Maximize Center Cup Image & Outer Circle Ring */}
        <div className="lg:col-span-6 flex items-center justify-center relative my-0.5 xs:my-1 sm:my-0">

          {/* Frosted Translucent #6E4E37 Circular Plate (Maximized Size) */}
          <div className="relative w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[22rem] lg:h-[22rem] rounded-full bg-gradient-to-br from-[#6E4E37]/70 via-[#6E4E37]/50 to-[#6E4E37]/35 shadow-[0_24px_60px_rgba(0,0,0,0.55)] border-[3px] sm:border-[4px] border-white/50 flex items-center justify-center backdrop-blur-md">

            {/* Inner bevel ring */}
            <div className="w-[88%] h-[88%] rounded-full border border-white/35 shadow-inner flex items-center justify-center" />

            {/* Glass Cup scaled prominently */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <img
                src="/assets/glass_latte.png"
                alt="KAFI Artisan Iced Spanish Latte"
                className="w-44 xs:w-52 sm:w-60 md:w-68 lg:w-76 h-auto max-h-[92%] object-contain drop-shadow-[0_20px_32px_rgba(0,0,0,0.65)] select-none"
              />
            </motion.div>

            {/* Badge */}
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#1C0F08]/90 text-[#FFFDF9] text-[8px] sm:text-[9px] font-mono font-black tracking-wider shadow-lg border border-white/20">
              ★ KAFI GULBERG
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          3. BOTTOM SECTION: Side-by-Side on Mobile, Responsive & Lifted
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-0 pb-1 mb-0.5 sm:mb-2 md:mb-3 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-2 sm:gap-3 pointer-events-auto shrink-0">

        {/* Left Side: 2 Compact Cards (Side-by-Side on all screen sizes) */}
        <div className="flex items-end gap-1.5 sm:gap-3 w-full md:w-auto">

          {/* Card 1: Americano Latte — Enlarged Prominent Coffee Cup Image */}
          <div className="flex-1 sm:flex-initial sm:w-[190px] md:w-[205px] bg-[#6E4E37]/85 hover:bg-[#6E4E37]/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-xl border border-white/25 shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-all relative overflow-visible shrink-0 min-w-0">
            <div className="w-full flex items-center justify-center -mt-6 xs:-mt-7 sm:-mt-8 mb-1">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white/30 to-[#6E4E37]/50 p-1 shadow-lg flex items-center justify-center border-2 border-white/50 backdrop-blur-sm">
                <img
                  src="/assets/glass_latte.png"
                  alt="Iced Spanish Latte"
                  className="w-8 xs:w-10 sm:w-12 h-auto max-h-[88%] object-contain drop-shadow-md select-none"
                />
              </div>
            </div>

            <div className="text-left px-0.5">
              <h3 className="font-sans text-[10px] xs:text-[11px] sm:text-xs md:text-[13px] font-extrabold tracking-wide text-white uppercase leading-snug drop-shadow-sm truncate">
                Americano Latte
              </h3>
              <p className="text-[7.5px] xs:text-[8px] sm:text-[9px] text-white/85 font-sans font-medium mb-1 leading-snug truncate">
                100% Arabica, 350 ml
              </p>
            </div>

            <div className="flex items-center justify-between px-0.5 pt-1 border-t border-white/20">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCardAdd(1)}
                  title="Add Americano Latte to Cart"
                  className={`p-1 rounded-full border transition-colors ${cart['americano-latte']
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                >
                  {cart['americano-latte'] ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <ShoppingCart className="w-2.5 h-2.5" />}
                </button>
                <button
                  onClick={() => setLikedCard(likedCard === 1 ? null : 1)}
                  className={`p-1 rounded-full border transition-colors ${likedCard === 1
                    ? 'bg-red-500/80 text-white border-red-400'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                >
                  <Heart className={`w-2.5 h-2.5 ${likedCard === 1 ? 'fill-red-400' : ''}`} />
                </button>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-[#1C0F08] text-white text-[8.5px] sm:text-[9.5px] font-black tracking-wide border border-white/20">
                $2.50
              </span>
            </div>
          </div>

          {/* Card 2: Ceremonial Matcha — Enlarged Prominent Coffee Cup Image */}
          <div className="flex-1 sm:flex-initial sm:w-[190px] md:w-[205px] bg-[#6E4E37]/85 hover:bg-[#6E4E37]/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-xl border border-white/25 shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-all relative overflow-visible shrink-0 min-w-0">
            <div className="w-full flex items-center justify-center -mt-6 xs:-mt-7 sm:-mt-8 mb-1">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white/30 to-[#6E4E37]/50 p-1 shadow-lg flex items-center justify-center border-2 border-white/50 backdrop-blur-sm">
                <img
                  src="/assets/glass_matcha.png"
                  alt="Ceremonial Iced Matcha"
                  className="w-8 xs:w-10 sm:w-12 h-auto max-h-[88%] object-contain drop-shadow-md select-none"
                />
              </div>
            </div>

            <div className="text-left px-0.5">
              <h3 className="font-sans text-[10px] xs:text-[11px] sm:text-xs md:text-[13px] font-extrabold tracking-wide text-white uppercase leading-snug drop-shadow-sm truncate">
                Ceremonial Matcha
              </h3>
              <p className="text-[7.5px] xs:text-[8px] sm:text-[9px] text-white/85 font-sans font-medium mb-1 leading-snug truncate">
                Uji Matcha, oat milk
              </p>
            </div>

            <div className="flex items-center justify-between px-0.5 pt-1 border-t border-white/20">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCardAdd(2)}
                  title="Add Ceremonial Matcha to Cart"
                  className={`p-1 rounded-full border transition-colors ${cart['ceremonial-matcha']
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                >
                  {cart['ceremonial-matcha'] ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <ShoppingCart className="w-2.5 h-2.5" />}
                </button>
                <button
                  onClick={() => setLikedCard(likedCard === 2 ? null : 2)}
                  className={`p-1 rounded-full border transition-colors ${likedCard === 2
                    ? 'bg-red-500/80 text-white border-red-400'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                >
                  <Heart className={`w-2.5 h-2.5 ${likedCard === 2 ? 'fill-red-400' : ''}`} />
                </button>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-[#1C0F08] text-white text-[8.5px] sm:text-[9.5px] font-black tracking-wide border border-white/20">
                $2.50
              </span>
            </div>
          </div>

        </div>

        {/* Right Info: Story & Learn More — Compact Height */}
        <div className="w-full md:max-w-[270px] lg:max-w-[300px] text-left flex flex-col items-start justify-end p-2 sm:p-2.5 rounded-xl bg-[#6E4E37]/65 backdrop-blur-[4px] border border-white/25 shadow-[0_8px_20px_rgba(0,0,0,0.25)] shrink-0">
          <h2 className="font-sans text-[11px] sm:text-xs font-extrabold tracking-wide text-white uppercase leading-snug mb-0.5 sm:mb-1 drop-shadow-sm">
            Artisanal Roastery in Gulberg, Lahore
          </h2>
          <p className="text-[8px] sm:text-[9.5px] text-white/85 leading-tight sm:leading-relaxed mb-1 sm:mb-1.5 font-sans font-medium line-clamp-1 sm:line-clamp-2">
            Where raw architectural serenity meets precision coffee science. Scroll down to take an interactive visual journey.
          </p>
          <button
            onClick={onOpenMenu}
            className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white text-[#4A2F1C] text-[9px] sm:text-[9.5px] font-black tracking-wider hover:bg-[#FAF6F0] hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1 sm:gap-1.5"
          >
            <span>Learn More</span>
            <ArrowRight className="w-2.5 h-2.5 text-[#4A2F1C]" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default HeroInspiration;
