import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  FileText,
  ArrowRight,
  Coffee,
  Sparkles
} from 'lucide-react';

export default function CartModal({
  isOpen,
  onClose,
  cart = {},
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cartItems = Object.values(cart);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.numericPrice || 150) * (item.quantity || 1),
    0
  );
  const deliveryFee = totalItemsCount > 0 ? 0 : 0; // Free delivery for KAFI Gulberg promo
  const totalAmount = subtotal + deliveryFee;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your phone / WhatsApp number.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter your delivery address in Lahore.');
      return;
    }

    setIsSubmitting(true);

    let assignedOrderNumber = 'KF-ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Save order in backend persistent database
    try {
      const orderPayload = {
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        shipping_address: formData.address.trim(),
        city: 'Lahore',
        payment_method: 'Cash on Delivery',
        notes: formData.notes.trim(),
        items: cartItems.map(item => ({
          product_id: typeof item.id === 'number' ? item.id : null,
          name: item.name,
          price: item.numericPrice || 150,
          quantity: item.quantity || 1,
          variant: item.size || item.variant || 'Standard'
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order?.order_number) {
          assignedOrderNumber = data.order.order_number;
        }
      }
    } catch (err) {
      console.warn('Backend order sync fallback:', err);
    }

    // Build WhatsApp message with real Order ID
    let orderDetails = `*☕ NEW ORDER — #${assignedOrderNumber} — KAFI GULBERG ☕*\n`;
    orderDetails += `━━━━━━━━━━━━━━━━━━━━━\n`;
    orderDetails += `👤 *Customer:* ${formData.name.trim()}\n`;
    orderDetails += `📞 *Phone:* ${formData.phone.trim()}\n`;
    orderDetails += `📍 *Delivery Address:* ${formData.address.trim()}\n`;
    if (formData.notes.trim()) {
      orderDetails += `📝 *Special Notes:* ${formData.notes.trim()}\n`;
    }
    orderDetails += `━━━━━━━━━━━━━━━━━━━━━\n`;
    orderDetails += `🛒 *ORDER ITEMS:*\n`;

    cartItems.forEach((item, index) => {
      const qty = item.quantity || 1;
      const itemTotal = (item.numericPrice || 150) * qty;
      orderDetails += `${index + 1}. *${item.name}* (x${qty}) — PKR ${itemTotal}\n`;
    });

    orderDetails += `━━━━━━━━━━━━━━━━━━━━━\n`;
    orderDetails += `💰 *Subtotal:* PKR ${subtotal}\n`;
    orderDetails += `🚚 *Delivery:* ${deliveryFee === 0 ? 'FREE' : 'PKR ' + deliveryFee}\n`;
    orderDetails += `⭐ *TOTAL PAYABLE:* PKR ${totalAmount}\n`;
    orderDetails += `━━━━━━━━━━━━━━━━━━━━━\n`;
    orderDetails += `Order Ref: #${assignedOrderNumber}\nPlease confirm and dispatch. Thank you!`;

    const waUrl = `https://wa.me/923000000000?text=${encodeURIComponent(orderDetails)}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
    setIsSuccess(true);
    if (onClearCart) onClearCart();
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-5 overflow-hidden">
      {/* Frosted Dark Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
      />

      {/* Cart Modal Container — Warm Coffee Color (#6E4E37 / #4A2F1C) */}
      <div
        className="relative z-10 w-full max-w-xl max-h-[94vh] sm:max-h-[92vh] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#4A2F1C] via-[#331D12] to-[#1C0F08] border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden text-white font-sans"
      >
        {/* Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-4 bg-[#6E4E37]/70 border-b border-white/15 flex items-center justify-between backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1C0F08] border border-white/25 flex items-center justify-center text-[#EAD18D] shadow-md shrink-0">
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EAD18D]" />
            </div>
            <div>
              <h2 className="font-serif font-black text-sm sm:text-base md:text-lg text-white leading-tight tracking-wide flex items-center gap-1.5 sm:gap-2">
                <span>Your Order</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#1C0F08] text-[#EAD18D] border border-white/15">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
              </h2>
              <p className="text-[9px] sm:text-[10px] text-white/75 font-medium">
                KAFI Gulberg Artisanal Roastery
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
          {isSuccess ? (
            /* Order Success View */
            <div
              className="py-8 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-1">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-white">
                Order Placed Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                Your order details have been forwarded to KAFI Gulberg via WhatsApp. Our barista will confirm your order shortly.
              </p>
              <div className="pt-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-[#EAD18D] hover:bg-white text-[#1C0F08] font-bold text-xs tracking-wider transition-all shadow-lg hover:scale-105"
                >
                  Continue Exploring Menu
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/40 mb-1">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Your cart is empty
              </h3>
              <p className="text-xs text-white/70 max-w-xs">
                Choose any of our handcrafted specialty coffees or matcha brews to begin your order.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-5 py-2 rounded-full bg-white text-[#331D12] text-xs font-bold hover:bg-[#FAF6F0] transition-all hover:scale-105 shadow-md"
              >
                Explore Coffee Menu
              </button>
            </div>
          ) : (
            /* Cart Items & Checkout Form */
            <>
              {/* Cart Items List */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#EAD18D] font-bold flex items-center justify-between">
                  <span>Selected Items</span>
                  <button
                    onClick={onClearCart}
                    className="text-[10px] text-white/60 hover:text-red-300 font-sans normal-case underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const qty = item.quantity || 1;
                    const itemPrice = item.numericPrice || 150;
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-[#6E4E37]/45 border border-white/15 flex items-center justify-between gap-3 backdrop-blur-sm"
                      >
                        {/* Cup Image */}
                        <div className="w-10 h-10 rounded-lg bg-black/25 flex items-center justify-center p-0.5 shrink-0 border border-white/10">
                          <img
                            src={item.cupImg || '/assets/glass_latte.png'}
                            alt={item.name}
                            className="w-auto h-full max-h-9 object-contain"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-sans font-extrabold text-xs text-white uppercase truncate">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-[#EAD18D] font-bold">
                            ₱ {itemPrice} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-[#1C0F08]/80 px-2 py-1 rounded-full border border-white/15">
                          <button
                            onClick={() =>
                              onUpdateQuantity && onUpdateQuantity(item.id, qty - 1)
                            }
                            className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-mono text-xs font-bold w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity && onUpdateQuantity(item.id, qty + 1)
                            }
                            className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Total for item & Delete */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-extrabold text-white">
                            ₱ {itemPrice * qty}
                          </div>
                          <button
                            onClick={() => onRemoveItem && onRemoveItem(item.id)}
                            className="text-[10px] text-white/50 hover:text-red-400 transition-colors p-0.5"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3 inline" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary Pill */}
              <div className="p-3 rounded-xl bg-[#1C0F08]/75 border border-white/15 flex items-center justify-between text-xs font-bold">
                <span className="text-white/80">Total Payable:</span>
                <span className="font-mono text-base font-black text-[#EAD18D]">
                  ₱ {totalAmount}
                </span>
              </div>

              {/* Delivery Details Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-2.5 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#EAD18D] font-bold">
                  Delivery & Contact Details
                </div>

                {errorMessage && (
                  <div className="p-2 rounded-lg bg-red-500/25 border border-red-400/50 text-red-200 text-[11px] font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Full Name *"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl bg-black/40 border border-white/20 focus:border-[#EAD18D] focus:outline-none text-white text-sm sm:text-xs placeholder-white/40 transition-all"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="WhatsApp / Phone Number (e.g. 0300-1234567) *"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl bg-black/40 border border-white/20 focus:border-[#EAD18D] focus:outline-none text-white text-sm sm:text-xs placeholder-white/40 transition-all"
                    required
                  />
                </div>

                {/* Address */}
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none text-white/50">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Delivery Address (House #, Street, Block, Gulberg / DHA Lahore) *"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl bg-black/40 border border-white/20 focus:border-[#EAD18D] focus:outline-none text-white text-sm sm:text-xs placeholder-white/40 resize-none transition-all"
                    required
                  />
                </div>

                {/* Special Notes (Optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Special instructions (e.g. less ice, extra hot, no sugar)"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl bg-black/40 border border-white/20 focus:border-[#EAD18D] focus:outline-none text-white text-sm sm:text-xs placeholder-white/40 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 min-h-[44px] py-3 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#EAD18D] to-[#F3D68E] hover:from-white hover:to-[#FAF6F0] text-[#1C0F08] font-sans font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Processing...' : 'Place Order via WhatsApp'}</span>
                  <ArrowRight className="w-4 h-4 text-[#1C0F08]" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

