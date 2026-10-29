import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_MENU_ITEMS } from '../data/initialMenu';
import { MenuItem, Order, OrderStatus, UserProfile } from '../types/canteen';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================================
// REACTIVE LOCAL CANTEEN STORE (Fallback & Immediate Execution Engine)
// Used when Supabase keys are not yet provided in the environment.
// =========================================================================

const MENU_STORAGE_KEY = 'biterush_menu_items_v4';
const ORDERS_STORAGE_KEY = 'biterush_orders_v4';
const CURRENT_USER_KEY = 'biterush_current_user_v4';

// Seed initial demo orders if empty
const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-101',
    user_id: 'usr-student-1',
    user_name: 'Ayan Ansari',
    user_email: 'ansariayan7351@gmail.com',
    student_id: 'CS-2024-042',
    token_number: '#BR-101',
    total_amount: 110,
    payment_status: 'paid',
    payment_id: 'pay_test_901a1',
    order_status: 'Preparing',
    pickup_time: 'ASAP',
    special_instructions: 'Pack separately with extra mint chutney',
    items: [
      {
        id: 'oi-1',
        order_id: 'ord-101',
        menu_item_id: 'item-1',
        item_name: 'Crispy Samosa (2 pcs)',
        quantity: 2,
        price: 15,
      },
      {
        id: 'oi-2',
        order_id: 'ord-101',
        menu_item_id: 'item-3',
        item_name: 'Classic College Maggi',
        quantity: 2,
        price: 40,
      },
    ],
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-102',
    user_id: 'usr-student-2',
    user_name: 'Priya Sharma',
    user_email: 'priya.s@campus.edu',
    student_id: 'EC-2023-118',
    token_number: '#BR-102',
    total_amount: 120,
    payment_status: 'paid',
    payment_id: 'pay_test_901a2',
    order_status: 'Ready for Pickup',
    pickup_time: '1:15 PM',
    items: [
      {
        id: 'oi-3',
        order_id: 'ord-102',
        menu_item_id: 'item-6',
        item_name: 'Mysore Masala Dosa',
        quantity: 1,
        price: 70,
      },
      {
        id: 'oi-4',
        order_id: 'ord-102',
        menu_item_id: 'item-10',
        item_name: 'Thick Cold Coffee with Chocolate',
        quantity: 1,
        price: 50,
      },
    ],
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-103',
    user_id: 'usr-student-1',
    user_name: 'Ayan Ansari',
    user_email: 'ansariayan7351@gmail.com',
    student_id: 'CS-2024-042',
    token_number: '#BR-098',
    total_amount: 115,
    payment_status: 'paid',
    payment_id: 'pay_test_887b1',
    order_status: 'Completed',
    pickup_time: '12:30 PM',
    items: [
      {
        id: 'oi-5',
        order_id: 'ord-103',
        menu_item_id: 'item-5',
        item_name: 'Spicy Paneer Tikka Kathi Roll',
        quantity: 1,
        price: 65,
      },
      {
        id: 'oi-6',
        order_id: 'ord-103',
        menu_item_id: 'item-10',
        item_name: 'Thick Cold Coffee with Chocolate',
        quantity: 1,
        price: 50,
      },
    ],
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
];

export class LocalCanteenStore {
  private static listeners: Array<() => void> = [];

  static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach((fn) => fn());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('biterush_store_updated'));
    }
  }

  // --- MENU ITEMS ---
  static getMenuItems(): MenuItem[] {
    if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  }

  static saveMenuItem(item: MenuItem): void {
    const items = this.getMenuItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  static toggleItemAvailability(id: string): void {
    const items = this.getMenuItems();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.available = !item.available;
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
      this.notify();
    }
  }

  static deleteMenuItem(id: string): void {
    const items = this.getMenuItems().filter((i) => i.id !== id);
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  // --- ORDERS ---
  static getOrders(): Order[] {
    if (typeof window === 'undefined') return DEMO_ORDERS;
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEMO_ORDERS));
      return DEMO_ORDERS;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
      return DEMO_ORDERS;
    } catch {
      return DEMO_ORDERS;
    }
  }

  static addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    this.notify();
  }

  static updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      target.order_status = status;
      target.updated_at = new Date().toISOString();
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      this.notify();
    }
  }

  // --- AUTH PROFILE EMULATION ---
  static getCurrentProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) {
      // Default to student profile for Ayan Ansari
      const defaultUser: UserProfile = {
        id: 'usr-student-1',
        full_name: 'Ayan Ansari',
        email: 'ansariayan7351@gmail.com',
        student_id: 'CS-2024-042',
        role: 'student',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static setCurrentProfile(profile: UserProfile | null): void {
    if (profile) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    this.notify();
  }
}
