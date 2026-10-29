import React from 'react';
import { ShoppingBag, User as UserIcon, Shield, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, isAdmin, switchDemoRole } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element with vibrant badge) */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black tracking-tighter text-stone-950">BR</span>
            </div>
            <div className="leading-tight">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent whitespace-nowrap">
                BITERUSH
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-orange-700 font-extrabold bg-orange-100/90 px-2 py-0.5 rounded-full border border-orange-200">
                Skip the Queue
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links with energetic hover */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-600">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'home' ? 'text-orange-600 font-bold border-b-2 border-orange-500' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'menu' ? 'text-orange-600 font-bold border-b-2 border-orange-500' : ''
              }`}
            >
              Canteen Menu
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'orders' ? 'text-orange-600 font-bold border-b-2 border-orange-500' : ''
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className={`relative flex items-center gap-1.5 hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'cart' ? 'text-orange-600 font-bold border-b-2 border-orange-500' : ''
              }`}
            >
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-black bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full tabular-nums shadow-xs animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'admin' ? 'text-orange-600 font-bold border-b-2 border-orange-500' : ''
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (Role toggle / User Account) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Demo Role Switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                onClick={() => switchDemoRole('student')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  !isAdmin
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch view to Student role"
              >
                Student
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  isAdmin
                    ? 'bg-gradient-to-r from-stone-900 to-stone-800 text-amber-400 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch view to Canteen Admin role"
              >
                Staff Admin
              </button>
            </div>

            {user ? (
              <button
                onClick={() => onNavigate(isAdmin ? 'admin' : 'profile')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 bg-orange-50/80 hover:bg-orange-100 border border-orange-200/80 rounded-xl transition-all whitespace-nowrap shadow-2xs cursor-pointer"
                title="View Profile & Orders"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-xs text-stone-950 shadow-xs">
                  {user.full_name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.full_name}</span>
                {isAdmin ? (
                  <span className="text-[10px] bg-stone-900 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                    Staff
                  </span>
                ) : (
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Profile
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md shadow-orange-500/20 active:scale-95"
              >
                Sign In
              </button>
            )}

            {/* Mobile Cart Trigger */}
            <button
              onClick={() => onNavigate('cart')}
              className="md:hidden relative p-2 text-stone-800 hover:text-orange-600"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-black bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
