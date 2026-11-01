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

  const handleToggle = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  const cartItems = Object.values(cart);
  const totalCount = cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const totalPrice = cartItems.reduce((sum, it) => sum + (it.numericPrice || 150) * (it.quantity || 1), 0);

  return (
    <section
      id="menu-section"
      className="relative z-10 w-full min-h-screen py-12 sm:py-16 md:py-24 px-2 sm:px-4 md:px-6 bg-[#160E0A] flex flex-col items-center justify-center text-[#EDE4D8] select-none"
    >
      {/* Deep Espresso Subtle Ambient Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#1A100B] via-[#160E0A] to-[#140C08]" />

      {/* Solid Dark Background Panel specifically behind the menu grid for 100% crystal-clear readability */}
      <div
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center bg-[#140C08]/95 sm:bg-[#180E09]/95 border border-[#EAD18D]/35 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      >
        {/* Sleek Compact Header */}
        <div className="text-center mb-3 sm:mb-5 shrink-0">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#2A1810] border border-[#EAD18D]/50 text-[#EAD18D] text-[9px] xs:text-[10px] sm:text-xs font-mono tracking-widest uppercase font-black shadow-md">
            ★ KAFI GULBERG • SPECIALTY COFFEE MENU ★
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-white mt-2 drop-shadow-md">
            Artisanal Espresso & Handcrafted Brews
          </h2>
        </div>

        {/* 3-Column Grid of Solid, High-Contrast Product Cards */}
        <div className="w-full grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 px-0.5 sm:px-1">
          {menuItems.map((item) => {
            const isAdded = !!cart[item.id];
            return (
              <div
                key={item.id}
                className="group relative bg-[#24150E] hover:bg-[#2C1B12] border border-[#EAD18D]/20 hover:border-[#EAD18D]/70 rounded-xl sm:rounded-2xl p-1.5 xs:p-2 sm:p-2.5 md:p-3.5 flex flex-col items-center justify-between text-center shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_28px_rgba(234,209,141,0.2)] transition-all duration-200"
              >
                {/* Centered Product Image Container */}
                <div className="w-[46px] h-[46px] xs:w-[54px] xs:h-[54px] sm:w-[68px] sm:h-[68px] md:w-[76px] md:h-[76px] flex items-center justify-center mx-auto mb-1 sm:mb-1.5 shrink-0 overflow-visible">
                  <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
                    {item.cupImg && !brokenImages[item.id] ? (
                      <img
                        src={item.cupImg}
                        alt={item.name}
                        onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-contain select-none"
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
                <div className="font-mono font-extrabold text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-[#F3D68E] tracking-wider mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {item.price}
                </div>

                {/* Title in Crisp Pure White Modern Sans */}
                <h3 className="font-sans font-black text-[9px] xs:text-[10px] sm:text-xs md:text-[13px] text-white tracking-wide uppercase leading-tight mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] line-clamp-1">
                  {item.name}
                </h3>

                {/* Subtitle / Description */}
                <p className="font-sans text-[7px] xs:text-[8px] sm:text-[9px] text-[#D8CFBF] leading-tight line-clamp-1 sm:line-clamp-2 max-w-[180px] mb-1 sm:mb-1.5 font-medium">
                  {item.desc}
                </p>

                {/* Pill "+ Add to cart" Button */}
                <button
                  onClick={() => handleToggle(item)}
                  className={`w-full max-w-[85px] xs:max-w-[95px] sm:max-w-[110px] min-h-[25px] xs:min-h-[27px] sm:min-h-[32px] px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-sans font-extrabold text-[8px] xs:text-[9.5px] sm:text-[10.5px] tracking-wide shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
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
    </section>
  );
}
