/**
 * InteriorMenuOverlay.jsx
 * Perfectly fitted on 1 single screen without scrolling:
 * - Clean transparent glasses/cups (Zero background box, 100% uncropped)
 * - Proportional compact cards that fit completely within the viewport
 * - Exactly matches the user reference image (3x3 grid, exact text & colors)
 */
import React, { useState, useEffect } from 'react';
import { Check, ShoppingCart, MessageSquare, Sparkles, Coffee, AlertCircle } from 'lucide-react';

const COFFEE_MENU_ITEMS = [
  {
    id: 1,
    name: 'Caramel Macchiato',
    price: '₱ 150',
    numericPrice: 150,
    desc: 'A caramel macchiato is a layered espresso drink with steamed milk and caramel drizzle.',
    cupImg: '/assets/cups/cup_clean_1.png',
  },
  {
    id: 2,
    name: 'Americano',
    price: '₱ 130',
    numericPrice: 130,
    desc: 'Single coffee drink made by diluting espresso with hot water, giving it a smooth, bold flavor.',
    cupImg: '/assets/cups/cup_clean_2.png',
  },
  {
    id: 3,
    name: 'Cappuccino',
    price: '₱ 200',
    numericPrice: 200,
    desc: 'A cappuccino is an espresso-based drink with equal parts espresso, steamed milk, and milk foam.',
    cupImg: '/assets/cups/cup_clean_3.png',
  },
  {
    id: 4,
    name: 'Flat White',
    price: '₱ 125',
    numericPrice: 125,
    desc: 'Creamy espresso with microfoam.',
    cupImg: '/assets/cups/cup_clean_4.png',
  },
  {
    id: 5,
    name: 'Espresso',
    price: '₱ 160',
    numericPrice: 160,
    desc: 'Espresso "stained" with a small amount of milk.',
    cupImg: '/assets/cups/cup_clean_5.png',
  },
  {
    id: 6,
    name: 'Café Mocha',
    price: '₱ 140',
    numericPrice: 140,
    desc: 'Coffee with chocolate and milk.',
    cupImg: '/assets/cups/cup_clean_6.png',
  },
  {
    id: 7,
    name: 'Cold Brew',
    price: '₱ 145',
    numericPrice: 145,
    desc: 'Slowly steeped coffee served chilled.',
    cupImg: '/assets/cups/cup_clean_7.png',
  },
  {
    id: 8,
    name: 'Ristretto',
    price: '₱ 150',
    numericPrice: 150,
    desc: 'A shorter, more concentrated espresso.',
    cupImg: '/assets/cups/cup_clean_8.png',
  },
  {
    id: 9,
    name: 'Café au Lait',
    price: '₱ 130',
    numericPrice: 130,
    desc: 'Brewed coffee with steamed milk.',
    cupImg: '/assets/cups/cup_clean_9.png',
  },
];

export default function InteriorMenuOverlay({
  scrollProgress = 0,
  cart = {},
  onAddToCart,
  onOpenCart,
}) {
  const [menuItems, setMenuItems] = useState(COFFEE_MENU_ITEMS);
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => {
            const exactImg = (p.images && Array.isArray(p.images) && p.images.length > 0 && p.images[0])
              ? p.images[0]
              : null;
            return {
              id: p.id,
              name: p.name,
              price: `PKR ${p.sale_price || p.regular_price}`,
              numericPrice: Number(p.sale_price || p.regular_price),
              desc: p.description || 'Artisanal single origin selection.',
              cupImg: exactImg,
            };
          });
          setMenuItems(mapped);
        }
      })
      .catch(() => { });
  }, []);

  // Entrance & Exit curves with smooth cubic Hermite easing (zero jerky jumps)
  let opacity = 0;

  if (scrollProgress >= 0.20 && scrollProgress <= 0.78) {
    if (scrollProgress < 0.32) {
      const t = Math.max(0, Math.min(1, (scrollProgress - 0.20) / (0.32 - 0.20)));
      opacity = t * t * (3 - 2 * t);
    } else if (scrollProgress > 0.66) {
      const t = Math.max(0, Math.min(1, (scrollProgress - 0.66) / (0.78 - 0.66)));
      opacity = 1 - t * t * (3 - 2 * t);
    } else {
      opacity = 1;
    }
  }

  const isVisible = opacity > 0.01;
  const isInteractive = opacity > 0.35;

  if (!isVisible) return null;

  const handleToggle = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  const cartItems = Object.values(cart);
  const totalCount = cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const totalPrice = cartItems.reduce((sum, it) => sum + (it.numericPrice || 150) * (it.quantity || 1), 0);

  return (
    <div
      style={{
        opacity,
        willChange: 'opacity',
      }}
      className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-center p-2 sm:p-4 pt-14 xs:pt-16 sm:pt-20 pb-2 sm:pb-4 h-[100dvh] max-h-[100dvh] transition-opacity duration-200 overflow-hidden select-none"
    >
      {/* Parent section holding the menu cards is transparent so background animation is fully visible */}
      <div
        style={{ touchAction: 'pan-y' }}
        className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center bg-transparent p-1.5 xs:p-2 sm:p-3 md:p-4 pointer-events-auto"
      >
        {/* Sleek Compact Header with Ample Top Spacing */}
        <div className="text-center mb-2 xs:mb-2.5 sm:mb-3.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#2A1810]/85 border border-[#EAD18D]/50 text-[#EAD18D] text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-mono tracking-widest uppercase font-black shadow-md backdrop-blur-sm">
            ★ KAFI GULBERG • SPECIALTY COFFEE MENU ★
          </span>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-serif font-black text-white mt-1 sm:mt-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Artisanal Espresso & Handcrafted Brews
          </h2>
        </div>

        {/* 3-Column Grid of Lighter, Compact Product Cards */}
        <div className="w-full grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 px-0.5 sm:px-1 mt-1 sm:mt-1.5">
          {menuItems.map((item) => {
            const isAdded = !!cart[item.id];
            return (
              <div
                key={item.id}
                className="group relative bg-[#3D251A]/85 hover:bg-[#4A2E20]/90 backdrop-blur-md border border-[#EAD18D]/30 hover:border-[#EAD18D]/70 rounded-lg sm:rounded-xl p-1 xs:p-1.5 sm:p-2 md:p-2.5 flex flex-col items-center justify-between text-center shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_20px_rgba(234,209,141,0.25)] transition-all duration-200"
              >
                {/* Centered Product Image Container - Scaled Down for Perfect Fit */}
                <div className="w-[34px] h-[34px] xs:w-[40px] xs:h-[40px] sm:w-[50px] sm:h-[50px] md:w-[56px] md:h-[56px] flex items-center justify-center mx-auto mb-0.5 sm:mb-1 shrink-0 overflow-visible">
                  <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    {item.cupImg && !brokenImages[item.id] ? (
                      <img
                        src={item.cupImg}
                        alt={item.name}
                        onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-contain select-none"
                      />
                    ) : brokenImages[item.id] ? (
                      <div className="px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/30 text-[7px] xs:text-[8px] sm:text-[9px] text-red-200 flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-2 h-2 text-red-400 shrink-0" />
                        <span>Image error</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3D2214] border border-white/20 flex items-center justify-center text-[#EAD18D]">
                        <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Price in Crisp Warm Caramel Gold */}
                <div className="font-mono font-extrabold text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs text-[#F3D68E] tracking-wider mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {item.price}
                </div>

                {/* Title in Crisp Pure White Modern Sans */}
                <h3 className="font-sans font-black text-[8px] xs:text-[9px] sm:text-[10.5px] md:text-xs text-white tracking-wide uppercase leading-tight mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] line-clamp-1">
                  {item.name}
                </h3>

                {/* Subtitle / Description */}
                <p className="font-sans text-[6.5px] xs:text-[7px] sm:text-[8px] md:text-[8.5px] text-[#D8CFBF] leading-tight line-clamp-1 sm:line-clamp-2 max-w-[150px] mb-1 font-medium">
                  {item.desc}
                </p>

                {/* Pill "+ Add to cart" Button */}
                <button
                  onClick={() => handleToggle(item)}
                  className={`w-full max-w-[70px] xs:max-w-[80px] sm:max-w-[95px] min-h-[20px] xs:min-h-[22px] sm:min-h-[26px] px-1 sm:px-2 py-0.5 rounded-full font-sans font-extrabold text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] tracking-wide shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#FDFBF7] hover:bg-white text-[#24150E] hover:scale-105'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />
                      <span className="truncate">Added ({cart[item.id]?.quantity || 1})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] sm:text-[11px] font-black">+</span>
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Cart Bar inside Panel when items are selected */}
        {totalCount > 0 && (
          <div
            className="mt-3.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#2A1810] border border-[#EAD18D]/50 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-white shrink-0 transition-all duration-300"
          >
            <div className="flex items-center gap-1 sm:gap-1.5">
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#EAD18D]" />
              <span>
                {totalCount} item{totalCount > 1 ? 's' : ''} • <span className="text-[#EAD18D]">₱ {totalPrice}</span>
              </span>
            </div>
            <button
              onClick={onOpenCart}
              className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9.5px] sm:text-[11px] flex items-center gap-1 shadow transition-transform hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>Checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
