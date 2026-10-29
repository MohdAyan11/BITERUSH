-- =========================================================================
-- CAMPUSBITE - DIGITAL COLLEGE CANTEEN MANAGEMENT SYSTEM
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- =========================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for searching and profile role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Snacks', 'Main Course', 'Beverages', 'Desserts')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  preparation_time INTEGER NOT NULL DEFAULT 10 CHECK (preparation_time >= 0),
  available BOOLEAN NOT NULL DEFAULT true,
  is_veg BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  token_number TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  payment_id TEXT NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'Order Placed' CHECK (order_status IN ('Order Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled')),
  pickup_time TEXT NOT NULL DEFAULT 'ASAP',
  special_instructions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_token_number ON public.orders(token_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- -------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Anyone authenticated can view their own profile; admins can view all profiles
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own full_name and student_id, but NOT change their role to admin
CREATE POLICY "Users can update own profile details"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Enforce that a regular user cannot escalate their role to 'admin'
    AND (
      (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
      OR public.is_admin()
    )
  );

-- MENU ITEMS POLICIES
-- Everyone (students and public) can view menu items
CREATE POLICY "Public read access for menu items"
  ON public.menu_items FOR SELECT
  USING (true);

-- Only admins can insert, update, or delete menu items
CREATE POLICY "Only admins can insert menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update menu items"
  ON public.menu_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete menu items"
  ON public.menu_items FOR DELETE
  USING (public.is_admin());

-- ORDERS POLICIES
-- Students can view their own orders; admins can view all orders
CREATE POLICY "Students view own orders or admin views all"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Authenticated users can insert orders where user_id = auth.uid()
CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update order status
CREATE POLICY "Only admins can update order status"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ORDER ITEMS POLICIES
-- Users can view order items for their own orders; admins can view all
CREATE POLICY "Users view items of their orders or admin views all"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Authenticated users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- REALTIME PUBLICATION
-- Enable Supabase Realtime for orders and menu updates
-- -------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
