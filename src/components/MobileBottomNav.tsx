import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, Clock, User, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onNavigate }) => {
  const { totalItems } = useCart();
  const { isAdmin } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 px-2 py-1.5 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold transition-colors ${
          currentTab === 'home' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate('menu')}
        className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold transition-colors ${
          currentTab === 'menu' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <UtensilsCrossed className="w-5 h-5 mb-0.5" />
        <span>Menu</span>
      </button>

      <button
        onClick={() => onNavigate('cart')}
        className={`relative flex flex-col items-center justify-center p-1.5 text-xs font-semibold transition-colors ${
          currentTab === 'cart' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 text-[9px] font-black bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full tabular-nums shadow-xs">
              {totalItems}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>

      <button
        onClick={() => onNavigate('orders')}
        className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold transition-colors ${
          currentTab === 'orders' || currentTab === 'tracking' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <Clock className="w-5 h-5 mb-0.5" />
        <span>Orders</span>
      </button>

      {isAdmin ? (
        <button
          onClick={() => onNavigate('admin')}
          className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold transition-colors ${
            currentTab === 'admin' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5 text-amber-600" />
          <span>Staff Admin</span>
        </button>
      ) : (
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold transition-colors ${
            currentTab === 'profile' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      )}
    </nav>
  );
};
