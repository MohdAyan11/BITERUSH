import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, MenuItem } from '../types/canteen';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  estimatedPrepTime: number; // in minutes
  lastAddedItem: MenuItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campusbite_student_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastAddedItem, setLastAddedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Could not save cart:', e);
    }
  }, [cart]);

  const addToCart = (item: MenuItem, quantity: number = 1): boolean => {
    if (!item.available) {
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: Math.min(ci.quantity + quantity, 15) }
            : ci
        );
      }
      return [...prev, { menuItem: item, quantity }];
    });

    setLastAddedItem(item);
    setTimeout(() => setLastAddedItem(null), 2500);
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.menuItem.id === itemId
          ? { ...ci, quantity: Math.min(quantity, 15) }
          : ci
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  // Maximum prep time among items + 1 min for each additional dish
  const estimatedPrepTime = cart.length === 0
    ? 0
    : Math.max(...cart.map((ci) => ci.menuItem.preparation_time || 10)) +
      Math.max(0, cart.length - 1) * 2;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        estimatedPrepTime,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
