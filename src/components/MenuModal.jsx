/**
 * MenuModal Component
 * Interactive luxury drawer for KAFI Gulberg's artisanal specialty coffee & bakery menu
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Coffee, Flame, Check, MessageSquare } from 'lucide-react';

const MENU_CATEGORIES = [
  {
    id: 'espresso',
    name: 'Espresso Bar',
    items: [
      {
        name: 'Artisan Flat White',
        price: 'PKR 850',
        desc: 'Double shot of house blend with silky microfoam and dark cacao notes.',
        tag: 'Popular',
      },
      {
        name: 'Spanish Cortado',
        price: 'PKR 890',
        desc: 'Equal parts extracted espresso and warm condensed milk with cinnamon dust.',
        tag: 'Signature',
      },
      {
        name: 'Double Ristretto',
        price: 'PKR 650',
        desc: 'Short, dense extraction boasting vibrant fruit acidity and velvety crema.',
      },
      {
        name: 'Salted Caramel Latte',
        price: 'PKR 980',
        desc: 'Himalayan pink salt, artisanal burnt caramel, whole organic milk.',
      },
    ],
  },
  {
    id: 'pourover',
    name: 'Manual Brews',
    items: [
      {
        name: 'Ethiopia Yirgacheffe V60',
        price: 'PKR 1,150',
        desc: 'Washed process, notes of jasmine, bergamot, lemon zest, and clean peach.',
        tag: 'Single Origin',
      },
      {
        name: 'Colombia Pink Bourbon',
        price: 'PKR 1,350',
        desc: 'Anaerobic natural fermentation, juicy wild berries, papaya, and honey.',
        tag: 'Reserve',
      },
      {
        name: 'Cold Drip Reserve (18 Hr)',
        price: 'PKR 1,050',
        desc: 'Slow Dutch-drip tower extraction served over hand-carved crystal ice ball.',
        tag: 'Limited',
      },
    ],
  },
  {
    id: 'coldbar',
    name: 'Matcha & Specials',
    items: [
      {
        name: 'Ceremonial Iced Matcha',
        price: 'PKR 1,100',
        desc: 'First-harvest Uji matcha whisked with oat milk and Madagascar vanilla.',
        tag: 'Kyoto Import',
      },
      {
        name: 'Espresso Tonic Spritz',
        price: 'PKR 950',
        desc: 'Citrus tonic water, fresh rosemary sprig, double espresso float.',
      },
      {
        name: 'Cascara Sparkling Fizz',
        price: 'PKR 880',
        desc: 'Sun-dried coffee cherry tea brewed with fresh lime and sparkling water.',
      },
    ],
  },
  {
    id: 'bakery',
    name: 'Artisan Bakes',
    items: [
      {
        name: 'Twice-Baked Almond Croissant',
        price: 'PKR 850',
        desc: 'French butter lamination, frangipane cream, toasted flaked almonds.',
      },
      {
        name: 'Pistachio Cardamom Babka',
        price: 'PKR 920',
        desc: 'Braided brioche, Bronte pistachio paste, floral cardamom syrup.',
        tag: 'Fresh Daily',
      },
      {
        name: 'Truffle Mushroom Sourdough',
        price: 'PKR 1,250',
        desc: 'House-fermented sourdough, sautéed wild mushrooms, aged parmesan.',
      },
    ],
  },
];

export default function MenuModal({ isOpen, onClose }) {
  const [categories, setCategories] = useState(MENU_CATEGORIES);
  const [activeTab, setActiveTab] = useState(MENU_CATEGORIES[0]?.id || 'espresso');
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch live products & categories from admin database
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()).catch(() => []),
      fetch('/api/products').then((r) => r.json()).catch(() => []),
    ]).then(([cats, prods]) => {
      if (Array.isArray(prods) && prods.length > 0) {
        const catMap = {};
        if (Array.isArray(cats)) {
          cats.forEach((c) => {
            catMap[c.id] = { id: c.slug || String(c.id), name: c.name, items: [] };
          });
        }
        // Group products
        prods.forEach((p) => {
          const cId = p.category_id && catMap[p.category_id] ? p.category_id : 'all';
          if (!catMap[cId]) {
            catMap[cId] = { id: 'specialty', name: 'Specialty Menu', items: [] };
          }
          catMap[cId].items.push({
            name: p.name,
            price: `PKR ${p.sale_price || p.regular_price}`,
            desc: p.description || 'Artisanal roastery selection.',
            tag: p.is_featured ? 'Featured' : (p.sale_price ? 'Special Offer' : undefined),
          });
        });
        const activeCategories = Object.values(catMap).filter((c) => c.items.length > 0);
        if (activeCategories.length > 0) {
          setCategories(activeCategories);
          setActiveTab(activeCategories[0].id);
        }
      }
    });
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleItem = (item) => {
    if (selectedItems.find((i) => i.name === item.name)) {
      setSelectedItems(selectedItems.filter((i) => i.name !== item.name));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const getWhatsAppLink = () => {
    let text = "Hi KAFI Gulberg! I would like to order directly (0% commission):\n\n";
    if (selectedItems.length > 0) {
      selectedItems.forEach((i) => {
        text += `• ${i.name} (${i.price})\n`;
      });
      text += "\nPlease confirm availability and preparation time.";
    } else {
      text += "I'd like to check today's artisan roast availability.";
    }
    return `https://wa.me/923000000000?text=${encodeURIComponent(text)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] glass-panel-espresso rounded-3xl border border-gold-500/30 flex flex-col shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-gold-400 text-[10px] sm:text-xs font-mono tracking-widest uppercase mb-1">
                <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>ARTISANAL ROASTERY SELECTION</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-cream-100">
                KAFI Gulberg Menu
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass-button flex items-center justify-center text-cream-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                  activeTab === cat.id
                    ? 'bg-gold-gradient text-matte-950 font-bold shadow-luxury-glow'
                    : 'text-cream-300 hover:text-cream-100 bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[50vh] space-y-3 sm:space-y-4">
            {categories.find((c) => c.id === activeTab)?.items.map((item) => {
              const isSelected = selectedItems.some((i) => i.name === item.name);
              return (
                <div
                  key={item.name}
                  onClick={() => toggleItem(item)}
                  className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-gold-500/10 border-gold-500/50 shadow-luxury-glow'
                      : 'bg-matte-950/40 border-white/5 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-base md:text-lg text-cream-100 font-semibold">
                        {item.name}
                      </span>
                      {item.tag && (
                        <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cream-300/80 font-sans leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="font-mono text-sm md:text-base font-semibold text-gold-400">
                      {item.price}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-gold-500 border-gold-500 text-matte-950'
                          : 'border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer with WhatsApp Direct Order */}
          <div className="p-6 md:p-8 border-t border-white/10 bg-matte-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-cream-300 font-mono">
              {selectedItems.length > 0 ? (
                <span>
                  <strong className="text-gold-400">{selectedItems.length} items</strong> selected
                  for 0% commission direct order
                </span>
              ) : (
                <span>Select items to order directly with zero platform fee</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-gold-gradient text-matte-950 font-bold text-xs tracking-wider uppercase hover:shadow-luxury-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {selectedItems.length > 0 ? 'Send Order to Kitchen' : 'Order via WhatsApp'}
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
