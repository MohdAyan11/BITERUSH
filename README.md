# QUEUEBITE - Digital College Canteen Management System

> **“Skip the Queue. Grab Your Food.”**

A modern, responsive, full-stack digital college canteen platform built for university students and canteen staff. Students can browse live cafeteria menus, pre-order meals, pay securely via Razorpay UPI/cards, receive an instant digital token number (e.g. `#QB-101`), scan a local offline QR code at the counter, and track preparation status in real-time to avoid waiting in long queues during peak lecture breaks.

---

## 🌟 Key Features

### 🎓 1. Student Ordering Experience
- **Ordering-First Home Page**: Immediate canteen open/close status, live preparation queue timer (~8-10 mins), active token tracker widget, instant search bar, and curated sections (*Popular Today, Best Sellers, Breakfast, Lunch & Thalis, Snacks, Beverages*).
- **Live Canteen Menu**: Real-time menu browsing with instant search, dietary toggles (*Pure Veg*), category filters, and prep time badges.
- **Interactive Tray / Cart**: Add items with 1 click, adjust quantities, view individual prices, calculated total, and estimated kitchen preparation time.
- **Smart Pickup Scheduling**: Choose between `⚡ ASAP Pickup` (~8-10 mins) or `🕒 Scheduled Break Slots` (11:15 AM morning recess, 1:15 PM lunch session, 3:30 PM evening break). Optional kitchen instructions (e.g. *"Extra green chutney"*).
- **Secure Payment Integration**: Powered by Razorpay with UPI (GPay, PhonePe, Paytm, CRED), Debit/Credit Cards, and Net Banking. Payment verification is executed and cryptographically authenticated on the backend server.
- **Unique Digital Token Generation**: Instantly receive human-readable tokens (e.g., `#QB-101`) upon verified payment.
- **Offline / Local QR Code**: Generates a fast, offline QR code containing only safe token identifiers (`queuebite:order:<id>:token:<token>`) for instant verification at the counter without external network dependency.
- **Canonical 4-Stage Real-Time Live Order Tracker**:
  $$\text{Order Received} \longrightarrow \text{Preparing} \longrightarrow \text{Ready for Pickup} \longrightarrow \text{Completed}$$
  Automatically updates via Supabase Realtime without manual refreshing.
- **Ready for Pickup Notification**: Prominent alert banner and Web Audio chime when meals are ready to collect from Counters 1 & 2.
- **Student Profile (`/profile`)**:
  - Name: **Ayan Ansari**
  - Student Roll: **CS-2024-042**
  - Email: **ansariayan7351@gmail.com**
  - Order metrics, profile edit modal, and fast reorder button with live ingredient availability check.

### 👨‍🍳 2. Canteen Staff Admin Portal (`/admin`)
- **Kitchen KPI Metrics**: Live count of Today's Orders, Pending Placed Orders, In-Kitchen Prep, Ready for Pickup, and Verified Today's Revenue.
- **Live Order Dispatching Table**: View student name, roll number, items, total amount, payment status, special requests, and pickup time.
- **Incoming Order Sound Alert**: Melodic kitchen bell triggers automatically upon new incoming orders.
- **Dispatch Controls**: Instant action buttons: `Accept`, `Preparing`, `Mark Ready 🔔`, `Complete ✓`, and `Cancel` with custom reason.
- **Menu Catalog & Inventory Manager**:
  - Add new dishes with image, price, prep time, pure veg indicator, and category.
  - 1-click **Availability Toggle** (`In Stock` vs `Sold Out`): Immediately reflects on the student menu.
  - Edit or delete food items with backend catalog sync.
- **Canteen Analytics & Insights**:
  - Daily revenue breakdown
  - Most ordered dishes (ranking by order frequency and sales)
  - Peak ordering times (e.g. 1:00 PM – 1:45 PM)
  - Average preparation time metrics

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons + Canvas Confetti + QRCode
- **Backend**: Node.js + Express (`server.ts`) with Vite dev middleware
- **Database**: Supabase PostgreSQL with complete RLS (Row Level Security) policies
- **Realtime**: Supabase Realtime Postgres Changes
- **Payment Gateway**: Razorpay (Client Checkout SDK + Server-side HMAC SHA-256 verification and order creation)
- **Deployment**: Ready for Vercel, Netlify, Railway, Render, or Docker

---

## 🗄️ Database Schema & RLS

The database migration SQL is located at `supabase/schema.sql`. It includes:

1. **`profiles`**: Linked to `auth.users(id)`. Stores `full_name`, `email`, `student_id`, and `role` (`'student' | 'admin'`).
2. **`menu_items`**: Menu catalog with categories, price in ₹, prep time, availability status, and pure veg indicators. Only admins can edit or delete items.
3. **`orders`**: Stores `token_number` (`#QB-xxx`), `user_id`, `total_amount`, `payment_status`, `order_status`, `pickup_time`, and timestamps.
4. **`order_items`**: Itemized list for each order with quantity and unit price snapshot.
5. **Row Level Security (RLS)**: Enforces that students only see their own orders while canteen admins can manage and view all orders.

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd queuebite
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your credentials:
```env
# Supabase
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
VITE_RAZORPAY_KEY_ID="rzp_test_your_key_id"

PORT=3000
```
> **Note**: The app is built with a resilient reactive local fallback store. If external credentials are not set yet, the application runs seamlessly in test mode with demo authentication, seed menu items, and mock Razorpay flows!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
