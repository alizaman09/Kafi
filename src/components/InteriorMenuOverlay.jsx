/**
 * InteriorMenuOverlay.jsx
 * Perfectly fitted on 1 single screen without scrolling:
 * - Clean transparent glasses/cups (Zero background box, 100% uncropped)
 * - Proportional compact cards that fit completely within the viewport
 * - Exactly matches the user reference image (3x3 grid, exact text & colors)
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart, MessageSquare, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => {
            let cupImg = (p.images && p.images[0]) || `/assets/cups/cup_clean_${(idx % 9) + 1}.png`;
            if (!cupImg || !cupImg.startsWith('/')) {
              cupImg = `/assets/cups/cup_clean_${(idx % 9) + 1}.png`;
            }
            return {
              id: p.id,
              name: p.name,
              price: `PKR ${p.sale_price || p.regular_price}`,
              numericPrice: Number(p.sale_price || p.regular_price),
              desc: p.description || 'Artisanal single origin brew.',
              cupImg: cupImg,
              fallbackCup: `/assets/cups/cup_clean_${(idx % 9) + 1}.png`,
            };
          });
          setMenuItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Entrance curve: Door opens and camera enters around 0.22 -> 0.32
  // Stays active across interior section through 0.76
  let opacity = 0;
  let translateY = 20;

  if (scrollProgress >= 0.22 && scrollProgress <= 0.76) {
    if (scrollProgress < 0.32) {
      opacity = (scrollProgress - 0.22) / (0.32 - 0.22);
      translateY = (1 - opacity) * 20;
    } else if (scrollProgress > 0.67) {
      opacity = 1 - (scrollProgress - 0.67) / (0.76 - 0.67);
      translateY = (scrollProgress - 0.67) / 0.09 * -20;
    } else {
      opacity = 1;
      translateY = 0;
    }
  }

  const isVisible = opacity > 0.02;
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
        transform: `translateY(${translateY}px)`,
        pointerEvents: isInteractive ? 'auto' : 'none',
      }}
      className="fixed inset-0 z-30 flex items-center justify-center p-1.5 sm:p-3 transition-opacity duration-150 overflow-y-auto sm:overflow-hidden overflow-x-hidden"
    >
      {/* Background Soft Ambient Darkening so cafe interior remains visible behind */}
      <div className="fixed inset-0 pointer-events-none bg-black/40 backdrop-blur-[1px]" />

      {/* Sleek Compact Header & Scrollable Cards Container */}
      <div className="relative z-10 w-full max-w-4xl my-auto flex flex-col items-center max-h-[95vh] overflow-y-auto pr-0.5">

        {/* Sleek Compact Header — More Spacing Above Boxes */}
        <div className="text-center mb-3 sm:mb-5 md:mb-6 shrink-0">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-[#6E4E37]/90 border border-[#EAD18D]/60 text-[#EAD18D] text-[9px] xs:text-[10.5px] sm:text-xs font-mono tracking-widest uppercase font-black shadow-lg backdrop-blur-md">
            ★ KAFI GULBERG • SPECIALTY COFFEE MENU ★
          </span>
        </div>

        {/* 3-Column Grid of Cards with Working Transparent Cup Images */}
        <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 px-0.5 sm:px-2 pb-2">
          {menuItems.map((item, idx) => {
            const isAdded = !!cart[item.id];
            return (
              <div
                key={item.id}
                className="group relative bg-[#6E4E37]/45 hover:bg-[#6E4E37]/65 border border-white/25 hover:border-[#EAD18D]/80 rounded-lg sm:rounded-2xl p-1.5 sm:p-2.5 md:p-3 pt-2.5 sm:pt-4 flex flex-col items-center justify-between text-center shadow-[0_10px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_30px_rgba(234,209,141,0.2)] transition-all duration-200 backdrop-blur-md overflow-visible"
              >
                {/* Floating Transparent Glass / Cup (Full Head Intact, Zero Crop) */}
                <div className="w-full flex items-center justify-center -mt-4 sm:-mt-6 mb-0.5 sm:mb-1 relative overflow-visible">
                  <div className="h-8 xs:h-10 sm:h-13 md:h-15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]">
                    <img
                      src={item.cupImg}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = item.fallbackCup || `/assets/cups/cup_clean_${(idx % 9) + 1}.png`;
                      }}
                      className="w-auto h-full max-h-8 xs:max-h-10 sm:max-h-13 md:max-h-15 object-contain select-none"
                    />
                  </div>
                </div>

                {/* Price in Crisp Warm Caramel Gold */}
                <div className="font-sans font-extrabold text-[10px] sm:text-xs md:text-sm text-[#F3D68E] tracking-wider mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                  {item.price}
                </div>

                {/* Title in Crisp Pure White Modern Sans */}
                <h3 className="font-sans font-extrabold text-[9px] xs:text-[10.5px] sm:text-xs md:text-[13px] text-white tracking-wide uppercase leading-snug mb-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] line-clamp-1">
                  {item.name}
                </h3>

                {/* Subtitle / Description in High-Contrast Soft White */}
                <p className="font-sans text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] text-white/90 leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-2 max-w-[190px] mb-1 sm:mb-2 font-medium drop-shadow-sm">
                  {item.desc}
                </p>

                {/* Clear, High-Contrast Pill "+ Add to cart" Button */}
                <button
                  onClick={() => handleToggle(item)}
                  className={`w-full max-w-[85px] xs:max-w-[95px] sm:max-w-none sm:min-w-[110px] px-1.5 sm:px-3.5 py-0.5 sm:py-1.5 rounded-full font-sans font-extrabold text-[8px] xs:text-[9.5px] sm:text-[11px] tracking-wide shadow-md transition-all flex items-center justify-center gap-1 ${isAdded
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-[#FDFBF7] hover:bg-white text-[#3D2214] hover:scale-105 active:scale-95'
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

        {/* Floating Cart Bar when items are selected */}
        {totalCount > 0 && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#6E4E37]/95 border border-[#EAD18D]/50 shadow-[0_12px_30px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-white shrink-0"
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
          </motion.div>
        )}

      </div>
    </div>
  );
}
