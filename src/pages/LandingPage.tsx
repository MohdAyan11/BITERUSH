import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Search,
  Sparkles,
  Check,
  ChevronRight,
  Flame,
  Coffee,
  Utensils,
  MapPin,
  Bell,
  Plus,
  Minus,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { MenuItem } from '../types/canteen';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { items, loading } = useMenu();
  const { addToCart, updateQuantity, cart } = useCart();
  const { activeOrder } = useOrders();
  const [homeSearch, setHomeSearch] = useState('');

  const getCartQty = (id: string) => {
    const item = cart.find((ci) => ci.menuItem.id === id);
    return item ? item.quantity : 0;
  };

  // Dish segments
  const bestSellers = items.filter((i) => i.is_bestseller);
  const popularToday = items.filter((i) => i.available && (i.price <= 60 || i.is_bestseller)).slice(0, 4);
  const breakfastItems = items.filter((i) => i.category === 'Breakfast');
  const lunchItems = items.filter((i) => i.category === 'Main Course');
  const snackItems = items.filter((i) => i.category === 'Snacks');
  const beverageItems = items.filter((i) => i.category === 'Beverages');

  // Search filtered items if user types in the search bar
  const searchMatches = homeSearch.trim()
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(homeSearch.toLowerCase()) ||
          i.category.toLowerCase().includes(homeSearch.toLowerCase()) ||
          i.description.toLowerCase().includes(homeSearch.toLowerCase())
      )
    : [];

  const renderDishCard = (dish: MenuItem) => {
    const qty = getCartQty(dish.id);

    return (
      <div
        key={dish.id}
        className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-xl hover:-translate-y-1 ${
          dish.available
            ? 'border-orange-100/90 hover:border-orange-300'
            : 'border-stone-200 opacity-60 bg-stone-50'
        }`}
      >
        <div>
          {/* Dish Image */}
          <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
            <img
              src={dish.image_url}
              alt={dish.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
              }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md border-2 border-emerald-600 bg-white/95 flex items-center justify-center p-0.5 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              </span>
              {dish.is_bestseller && (
                <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-xs uppercase tracking-wider">
                  ★ Bestseller
                </span>
              )}
            </div>

            {!dish.available ? (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-stone-900 text-white text-xs font-black px-3 py-1.5 rounded-xl border border-stone-700">
                  Sold Out Today
                </span>
              </div>
            ) : (
              <div className="absolute bottom-3 right-3 bg-stone-950/90 backdrop-blur-xs text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-md border border-white/10">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{dish.preparation_time}m prep</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-orange-600">{dish.category}</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                {dish.available ? 'Available Now' : 'Sold Out'}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {dish.name}
            </h3>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="p-4 sm:p-5 pt-0">
          <div className="pt-3 border-t border-orange-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Price
              </span>
              <p className="text-xl font-black text-orange-600 tabular-nums">
                ₹{dish.price}
              </p>
            </div>

            {dish.available ? (
              qty > 0 ? (
                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl p-1 shadow-xs">
                  <button
                    onClick={() => updateQuantity(dish.id, qty - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-stone-800 flex items-center justify-center hover:bg-orange-100 font-bold shadow-2xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-stone-900 tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(dish.id, qty + 1)}
                    className="w-7 h-7 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-2xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(dish, 1)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-105 text-stone-950 text-xs font-black rounded-xl transition-all shadow-sm shadow-orange-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </button>
              )
            ) : (
              <span className="text-xs text-stone-400 font-medium italic">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. TOP ORDERING HERO LAUNCHPAD */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 p-6 sm:p-10 lg:p-12 shadow-2xl border border-orange-900/40">
        <div className="absolute top-0 right-10 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Status Bar: Canteen Open/Closed + Wait Time */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/80 text-emerald-300 rounded-full font-bold border border-emerald-500/40 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Canteen Open Now (8:00 AM – 7:30 PM)</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-950/80 text-amber-300 rounded-full font-bold border border-amber-500/40 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Prep Time: ~8-10 Mins</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-stone-200 rounded-full font-semibold border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Counters 1 & 2 · Student Activity Center</span>
            </div>
          </div>

          {/* Brand Name & Tagline */}
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-amber-400 font-black tracking-widest uppercase text-xs">
                Official Campus Dining
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              BITERUSH
            </h1>
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent mt-2">
              “Skip the Queue. Grab Your Food.”
            </p>
            <p className="text-sm sm:text-base text-stone-300 max-w-2xl mt-3 font-normal leading-relaxed">
              Order your favorite canteen snacks, breakfast dosas, lunch thalis, and hot chai before your lecture break. Pick up hot with your digital token.
            </p>
          </div>

          {/* Primary Action & Instant Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('menu')}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 font-black text-sm rounded-2xl shadow-xl shadow-orange-500/30 transition-all transform active:scale-95 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 stroke-[3]" />
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Fast Home Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                placeholder="Search food (samosa, chai, sandwich, thali, dosa...)"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-900/90 border border-orange-500/40 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              {homeSearch && (
                <button
                  onClick={() => setHomeSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE ORDER LIVE TRACKER CARD (if student has an active order) */}
        {activeOrder && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-rose-500/20 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black text-sm shadow-md shrink-0">
                  {activeOrder.token_number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Live Active Order
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-white bg-stone-900/80 px-2 py-0.5 rounded-md border border-white/10">
                      {activeOrder.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-1">
                    {activeOrder.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')} · Pickup: <strong className="text-amber-300">{activeOrder.pickup_time}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('tracking')}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0"
              >
                <span>Track Live Status</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SEARCH RESULTS IF SEARCHING */}
      {homeSearch.trim() && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-600" />
              <span>Search Results for "{homeSearch}" ({searchMatches.length})</span>
            </h2>
            <button
              onClick={() => setHomeSearch('')}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Reset Search
            </button>
          </div>

          {searchMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-stone-500 border border-stone-200">
              No food items matching "{homeSearch}". Try samosa, coffee, or dosa.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchMatches.map(renderDishCard)}
            </div>
          )}
        </section>
      )}

      {/* 2. POPULAR TODAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Fresh Off The Stove</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Popular Today
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1 transition-colors"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularToday.map(renderDishCard)}
        </div>
      </section>

      {/* 3. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Campus Favorites</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(renderDishCard)}
        </div>
      </section>

      {/* 4. BREAKFAST SPECIALS */}
      {breakfastItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Morning Energy (8:00 AM – 11:30 AM)</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                Breakfast
              </h2>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              See all breakfast
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {breakfastItems.slice(0, 4).map(renderDishCard)}
          </div>
        </section>
      )}

      {/* 5. LUNCH & MEALS */}
      {lunchItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Wholesome Midday Fuel (11:30 AM – 3:30 PM)</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                Lunch & Main Course
              </h2>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              See all lunch
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lunchItems.slice(0, 4).map(renderDishCard)}
          </div>
        </section>
      )}

      {/* 6. SNACKS */}
      {snackItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600" />
                <span>Quick Recess Munchies</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                Snacks
              </h2>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              See all snacks
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {snackItems.slice(0, 4).map(renderDishCard)}
          </div>
        </section>
      )}

      {/* 7. BEVERAGES & CHAI */}
      {beverageItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-600" />
                <span>Cutting Chai & Refreshers</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                Beverages
              </h2>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              See all beverages
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beverageItems.slice(0, 4).map(renderDishCard)}
          </div>
        </section>
      )}

      {/* 8. CANTEEN TIMINGS & PICKUP COUNTER (LOWER SECTION AS REQUIRED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white rounded-3xl border border-orange-200/90 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-stone-950 flex items-center justify-center font-black">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Canteen Operating Hours
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Kitchen operates continuously throughout campus hours. Automated order batching ensures meals are cooked fresh upon receiving orders.
              </p>
              <div className="space-y-1.5 text-xs text-stone-700 pt-1">
                <p>• <strong>Breakfast:</strong> 8:00 AM – 11:30 AM</p>
                <p>• <strong>Lunch Thalis:</strong> 11:30 AM – 3:30 PM</p>
                <p>• <strong>Evening Snacks & Chai:</strong> 3:30 PM – 7:30 PM</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                <MapPin className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Pickup Counters & Collection
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ground Floor, Student Activities Center Food Court. Display your digital token on your phone or show the local QR code.
              </p>
              <div className="space-y-1.5 text-xs text-stone-700 pt-1">
                <p>• <strong>Counters 1 & 2:</strong> Hot meals, thalis & snacks</p>
                <p>• <strong>Counter 3:</strong> Beverages, shakes & cutting chai</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-black">
                <Zap className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Peak Time Recess Tip
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Maximum crowd occurs at 1:00 PM – 1:30 PM. Use the Scheduled Pickup selector at checkout to schedule your meal 15 minutes before lecture dismissal.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
                >
                  <span>Browse Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
