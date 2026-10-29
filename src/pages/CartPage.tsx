import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, Clock, ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

interface CartPageProps {
  onNavigate: (tab: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, estimatedPrepTime } = useCart();
  const { items: liveMenuItems } = useMenu();

  // Availability validation
  const unavailableItemsInCart = cart.filter((ci) => {
    const live = liveMenuItems.find((m) => m.id === ci.menuItem.id);
    return live && !live.available;
  });

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Your tray is empty</h2>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            Explore today's canteen specials, hot samosas, grilled sandwiches, and drinks.
          </p>
        </div>
        <button
          onClick={() => onNavigate('menu')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl transition-all"
        >
          <span>Browse Canteen Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Ordering</span>
          </button>
          <h1 className="text-2xl font-extrabold text-stone-900">Order Tray</h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Unavailable items alert banner */}
      {unavailableItemsInCart.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <span className="font-bold">Item Availability Alert: </span>
            {unavailableItemsInCart.map((it) => it.menuItem.name).join(', ')} just got sold out in the canteen. Please remove them to proceed.
          </div>
        </div>
      )}

      {/* Grid: Cart Items (left) + Summary (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map(({ menuItem, quantity }) => {
            const isUnavailable = unavailableItemsInCart.some((u) => u.menuItem.id === menuItem.id);
            return (
              <div
                key={menuItem.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex items-center gap-4 ${
                  isUnavailable ? 'border-rose-300 bg-rose-50/30' : 'border-stone-200 shadow-xs'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                  <img
                    src={menuItem.image_url}
                    alt={menuItem.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-0.5">
                    <span>{menuItem.category}</span>
                    <span>·</span>
                    <span>{menuItem.preparation_time}m prep</span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 truncate">
                    {menuItem.name}
                  </h3>
                  <p className="text-xs font-semibold text-stone-800 mt-1 tabular-nums">
                    ₹{menuItem.price} <span className="text-stone-400 font-normal">each</span>
                  </p>

                  {isUnavailable && (
                    <span className="text-[10px] text-rose-600 font-bold mt-1 inline-block">
                      Sold out in kitchen
                    </span>
                  )}
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1 border border-stone-200">
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      className="w-6 h-6 rounded bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 font-bold"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-stone-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                      className="w-6 h-6 rounded bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 font-bold"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                      ₹{menuItem.price * quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(menuItem.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Bill Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs sticky top-24">
          <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Payment Summary
          </h2>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-stone-900 tabular-nums">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Campus Canteen Convenience Fee:</span>
              <span className="font-semibold text-emerald-700">₹0 (Free)</span>
            </div>

            <div className="flex justify-between">
              <span>Taxes & GST:</span>
              <span className="font-semibold text-emerald-700">Included in prices</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-stone-900">Total Payable:</span>
              <span className="text-2xl font-black text-stone-900 tabular-nums">₹{subtotal}</span>
            </div>
          </div>

          {/* Prep time preview */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-950">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Estimated preparation time: <strong className="font-bold">~{estimatedPrepTime} minutes</strong> once payment is verified.
            </span>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            disabled={unavailableItemsInCart.length > 0}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
              unavailableItemsInCart.length > 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-stone-400">
            Secure payment verification via Razorpay (UPI, GPay, Cards, NetBanking).
          </p>
        </div>
      </div>
    </div>
  );
};
