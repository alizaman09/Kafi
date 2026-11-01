import React, { useState, useEffect } from 'react';
import CanvasSequence from '../components/CanvasSequence';
import HeroInspiration from '../components/HeroInspiration';
import InteriorMenuOverlay from '../components/InteriorMenuOverlay';
import MenuModal from '../components/MenuModal';
import CartModal from '../components/CartModal';
import FooterSection from '../components/FooterSection';

export default function Storefront() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState({});

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const rawProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
        setScrollProgress(rawProgress);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToMenu = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      window.scrollTo({
        top: maxScroll * 0.38,
        behavior: 'smooth',
      });
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
    <main className="relative w-full min-h-screen min-h-[100dvh] bg-[#1A100B] overflow-x-hidden" style={{ overscrollBehaviorY: 'none' }}>
      {/* 1. Underlying 300-Frame Scrollytelling Animation (Pinned Fullscreen Canvas) */}
      <CanvasSequence totalFrames={300} lerpFactor={0.06} />

      {/* 2. Hero Section: Clean, compact 1-screen viewport design */}
      <HeroInspiration
        scrollProgress={scrollProgress}
        onOpenMenu={handleScrollToMenu}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        onAddToCart={handleAddToCart}
        cart={cart}
      />

      {/* 3. Second Section: Appears as door opens and enters cafe interior */}
      <InteriorMenuOverlay
        scrollProgress={scrollProgress}
        cart={cart}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 4. Section 3: Modern, Responsive, Elegant Footer */}
      <FooterSection
        scrollProgress={scrollProgress}
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

