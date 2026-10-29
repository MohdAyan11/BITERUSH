import React from 'react';
import { Search, Clock, Plus, Minus, Check, ShoppingBag, AlertCircle } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { FoodCategory, MenuItem } from '../types/canteen';

interface MenuPageProps {
  onNavigate: (tab: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigate }) => {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    vegOnly,
    setVegOnly,
    filteredItems,
    loading,
  } = useMenu();

  const { cart, addToCart, updateQuantity, totalItems, subtotal } = useCart();

  const getCartQuantity = (itemId: string): number => {
    const found = cart.find((c) => c.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Canteen Live Menu
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Freshly cooked meals, quick snacks, hot tea, and beverages prepared daily on campus.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input
              type="text"
              placeholder="Search samosa, sandwich, maggi, coffee, dosa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              vegOnly
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white border-orange-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700'
            }`}
          >
            <span className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center p-0.5 ${vegOnly ? 'border-white bg-emerald-700' : 'border-emerald-600 bg-white'}`}>
              <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
            </span>
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat: FoodCategory) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-stone-950 shadow-md shadow-orange-500/25 scale-102'
                    : 'bg-white text-stone-700 hover:text-orange-600 border border-orange-200/80 hover:border-orange-400'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-4">
              <div className="aspect-[4/3] bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-2/3" />
              <div className="h-3 bg-stone-200 rounded w-full" />
              <div className="h-8 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900 mb-1">No food items found</h3>
          <p className="text-xs text-stone-500 mb-4">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setVegOnly(false);
            }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: MenuItem) => {
            const qty = getCartQuantity(item.id);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                  item.available
                    ? 'border-orange-100 hover:border-orange-300'
                    : 'border-stone-200 opacity-60 bg-stone-50'
                }`}
              >
                <div>
                  {/* Food Image */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Veg indicator & badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md border-2 border-emerald-600 bg-white/95 flex items-center justify-center p-0.5 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      </span>
                      {item.is_bestseller && (
                        <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
                          ★ Bestseller
                        </span>
                      )}
                    </div>

                    {!item.available && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-700">
                          Sold Out for Today
                        </span>
                      </div>
                    )}

                    {item.available && (
                      <div className="absolute bottom-3 right-3 bg-stone-900/90 backdrop-blur-xs text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-md border border-white/10">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{item.preparation_time}m prep</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                      <span className="font-bold uppercase tracking-wider text-orange-600 text-[11px]">{item.category}</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        {item.available ? 'In Stock' : 'Unavailable'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-stone-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer price & cart stepper */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-orange-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                        Price
                      </span>
                      <p className="text-2xl font-black text-orange-600 tabular-nums">
                        ₹{item.price}
                      </p>
                    </div>

                    {item.available ? (
                      qty > 0 ? (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-stone-800 flex items-center justify-center hover:bg-orange-100 font-bold shadow-2xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900 tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-2xs"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item, 1)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 text-xs font-black rounded-xl transition-all transform active:scale-95 shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add to Cart</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-stone-400 font-medium italic">
                        Not available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart summary bar for mobile/desktop when items are added */}
      {totalItems > 0 && (
        <aside
          aria-label="Cart summary"
          className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-30 bg-gradient-to-r from-stone-950 via-stone-900 to-orange-950 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-orange-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-orange-500/30">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-300">
                {totalItems} item{totalItems > 1 ? 's' : ''} in tray
              </p>
              <p className="text-base font-black text-white tabular-nums">
                Total: ₹{subtotal}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('cart')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 text-stone-950 text-xs font-black rounded-xl transition-transform active:scale-95 shadow-lg shadow-orange-500/30 flex items-center gap-1.5"
          >
            <span>View Tray</span>
            <span>→</span>
          </button>
        </aside>
      )}
    </div>
  );
};
