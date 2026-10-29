export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  role: UserRole;
  created_at?: string;
}

export type FoodCategory =
  | 'All'
  | 'Breakfast'
  | 'Snacks'
  | 'Main Course'
  | 'Beverages'
  | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Exclude<FoodCategory, 'All'>;
  price: number; // in Indian Rupees ₹
  image_url: string;
  preparation_time: number; // in minutes
  available: boolean;
  is_veg?: boolean;
  is_bestseller?: boolean;
  created_at?: string;
}

// Canonical 4-stage kitchen order progression
export type OrderStatus =
  | 'Order Received'
  | 'Order Placed' // for backwards compatibility
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  price: number; // Unit price at order time
}

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  student_id?: string;
  token_number: string; // e.g. "#QB-101"
  total_amount: number;
  payment_status: PaymentStatus;
  payment_id: string;
  order_status: OrderStatus;
  pickup_time: string; // "ASAP" or "1:15 PM"
  special_instructions?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
