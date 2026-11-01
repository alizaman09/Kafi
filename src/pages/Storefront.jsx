import React, { useState } from 'react';
import CanvasSequence from '../components/CanvasSequence';
import HeroInspiration from '../components/HeroInspiration';
import InteriorMenuOverlay from '../components/InteriorMenuOverlay';
import MenuModal from '../components/MenuModal';
import CartModal from '../components/CartModal';
import FooterSection from '../components/FooterSection';

export default function Storefront() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState({});

  const handleScrollToMenu = () => {
    const menuEl = document.getElementById('menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsMenuOpen(true);
    }
  };

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: {
            ...existing,
            quantity: (existing.quantity || 1) + 1,
          },
        };
      }
      return {
        ...prev,
        [item.id]: {
          ...item,
          quantity: 1,
        },
      };
    });
  };

  const handleUpdateQuantity = (id, newQty) => {
    setCart((prev) => {
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: {
          ...prev[id],
          quantity: newQty,
        },
      };
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const totalCartCount = Object.values(cart).reduce(
    (sum, it) => sum + (it.quantity || 1),
    0
  );

  return (
    <main
      className="relative w-full min-h-[100dvh] overflow-x-hidden"
      style={{
        backgroundColor: 'var(--theme-bg-color, #1A100B)',
      }}
    >
      {/* Underlying 300-Frame Scrollytelling Animation (Pinned Fullscreen Canvas) */}
      <CanvasSequence totalFrames={300} lerpFactor={0.08} />

      {/* 1. Hero Section: Clean, compact 1-screen viewport design */}
      <HeroInspiration
        onOpenMenu={handleScrollToMenu}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        onAddToCart={handleAddToCart}
        cart={cart}
      />

      {/* 2. Menu Section: Standard static HTML block with native browser scrolling */}
      <InteriorMenuOverlay
        cart={cart}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 3. Section 3: Modern, Responsive, Elegant Footer */}
      <FooterSection
        onOpenMenu={handleScrollToMenu}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 4. Full Artisan Coffee Menu Modal */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* 5. Full Cart & WhatsApp Order Placement Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </main>
  );
}

