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

  // Natural scroll translation: 6 items fit initially. As user scrolls down past 0.36, Row 3 smoothly scrolls up
  const extraRows = Math.ceil(Math.max(0, menuItems.length - 6) / 3);
  const approxRowHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 190 : 255;
  const maxShift = extraRows * approxRowHeight;

  let menuTranslateY = 0;
  if (scrollProgress > 0.36 && maxShift > 0) {
    const t = Math.max(0, Math.min(1, (scrollProgress - 0.36) / (0.58 - 0.36)));
    menuTranslateY = t * maxShift;
  }

  return (
    <div
      id="menu-section"
      style={{
        opacity,
        willChange: 'opacity',
      }}
      className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-start overflow-hidden p-2 sm:p-4 pt-14 xs:pt-16 sm:pt-16 pb-12 sm:pb-20 select-none"
    >
      {/* Parent section holding the menu cards is transparent so background animation is fully visible */}
      <div
        style={{
          transform: `translate3d(0, -${menuTranslateY}px, 0)`,
          willChange: 'transform',
          transition: 'transform 0.08s ease-out',
        }}
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center bg-transparent pointer-events-none"
      >
        {/* Sleek Compact Header with Ample Top Spacing */}
        <div className="text-center mb-2.5 xs:mb-3 sm:mb-4 shrink-0 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#2A1810]/85 border border-[#EAD18D]/50 text-[#EAD18D] text-[9px] xs:text-[10px] sm:text-xs font-mono tracking-widest uppercase font-black shadow-md backdrop-blur-sm pointer-events-none">
            ★ KAFI GULBERG • SPECIALTY COFFEE MENU ★
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-white mt-1.5 sm:mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] pointer-events-none">
            Artisanal Espresso & Handcrafted Brews
          </h2>
        </div>

        {/* 3-Column Grid: Exactly 2 rows (6 larger boxes) fit initially, 7th box onwards sits below the fold */}
        <div className="w-full grid grid-cols-3 gap-2 xs:gap-2.5 sm:gap-3.5 md:gap-4 px-1 pointer-events-auto">
          {menuItems.map((item) => {
            const isAdded = !!cart[item.id];
            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item)}
                style={{ touchAction: 'pan-y' }}
                className="group relative bg-[#341F14]/90 hover:bg-[#4A2E20]/95 md:backdrop-blur-md border border-[#EAD18D]/30 hover:border-[#EAD18D]/70 rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3 md:p-3.5 flex flex-col items-center justify-between text-center shadow-[0_6px_18px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_24px_rgba(234,209,141,0.25)] transition-all duration-200 pointer-events-auto cursor-pointer"
              >
                {/* Centered Product Image Container - Larger & Perfectly Visible */}
                <div className="w-[44px] h-[44px] xs:w-[50px] xs:h-[50px] sm:w-[62px] sm:h-[62px] md:w-[72px] md:h-[72px] flex items-center justify-center mx-auto mb-1 sm:mb-1.5 shrink-0 overflow-visible pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] pointer-events-none">
                    {item.cupImg && !brokenImages[item.id] ? (
                      <img
                        src={item.cupImg}
                        alt={item.name}
                        onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-contain select-none pointer-events-none"
                      />
                    ) : brokenImages[item.id] ? (
                      <div className="px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/30 text-[7px] xs:text-[8px] sm:text-[9px] text-red-200 flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                        <span>Image error</span>
                      </div>
                    ) : (
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#3D2214] border border-white/20 flex items-center justify-center text-[#EAD18D]">
                        <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Price in Crisp Warm Caramel Gold */}
                <div className="font-mono font-extrabold text-[10.5px] xs:text-[11.5px] sm:text-xs md:text-sm text-[#F3D68E] tracking-wider mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none">
                  {item.price}
                </div>

                {/* Title in Crisp Pure White Modern Sans */}
                <h3 className="font-sans font-black text-[9.5px] xs:text-[10.5px] sm:text-xs md:text-[13px] text-white tracking-wide uppercase leading-tight mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] line-clamp-1 pointer-events-none">
                  {item.name}
                </h3>

                {/* Subtitle / Description */}
                <p className="font-sans text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[9.5px] text-[#D8CFBF] leading-tight line-clamp-1 sm:line-clamp-2 max-w-[170px] mb-1 sm:mb-1.5 font-medium pointer-events-none">
                  {item.desc}
                </p>

                {/* Pill "+ Add to cart" Button */}
                <button
                  onClick={() => handleToggle(item)}
                  style={{ touchAction: 'pan-y' }}
                  className={`pointer-events-auto w-full max-w-[80px] xs:max-w-[90px] sm:max-w-[105px] min-h-[24px] xs:min-h-[26px] sm:min-h-[30px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-sans font-extrabold text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] tracking-wide shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#FDFBF7] hover:bg-white text-[#24150E] hover:scale-105'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      <span className="truncate">Added ({cart[item.id]?.quantity || 1})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] sm:text-xs font-black">+</span>
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
            className="sticky bottom-4 mt-4 px-4 py-1.5 rounded-full bg-[#2A1810]/95 border border-[#EAD18D]/50 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-white shrink-0 transition-all duration-300 z-20"
          >
            <div className="flex items-center gap-1 sm:gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-[#EAD18D]" />
              <span>
                {totalCount} item{totalCount > 1 ? 's' : ''} • <span className="text-[#EAD18D]">₱ {totalPrice}</span>
              </span>
            </div>
            <button
              onClick={onOpenCart}
              className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] sm:text-[11px] flex items-center gap-1 shadow transition-transform hover:scale-105 active:scale-95"
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
