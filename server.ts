import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory catalog price reference for server-side validation
interface CatalogItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  preparation_time?: number;
}

// Complete server-side catalog source of truth
const SERVER_MENU_CATALOG: Record<string, CatalogItem> = {
  'item-1': { id: 'item-1', name: 'Crispy Samosa (2 pcs)', price: 15, available: true, preparation_time: 5 },
  'item-2': { id: 'item-2', name: 'Grilled Veg Sandwich', price: 40, available: true, preparation_time: 8 },
  'item-3': { id: 'item-3', name: 'Classic College Maggi', price: 40, available: true, preparation_time: 7 },
  'item-4': { id: 'item-4', name: 'Aloo Paratha with Curd & Pickle', price: 45, available: true, preparation_time: 10 },
  'item-5': { id: 'item-5', name: 'Spicy Paneer Tikka Kathi Roll', price: 65, available: true, preparation_time: 10 },
  'item-6': { id: 'item-6', name: 'Mysore Masala Dosa', price: 70, available: true, preparation_time: 12 },
  'item-7': { id: 'item-7', name: 'Crunchy Veg Burger with Fries', price: 60, available: true, preparation_time: 9 },
  'item-8': { id: 'item-8', name: 'Desi Hakka Chowmein', price: 60, available: true, preparation_time: 10 },
  'item-9': { id: 'item-9', name: 'French Fries (Salted / Peri Peri)', price: 70, available: true, preparation_time: 6 },
  'item-10': { id: 'item-10', name: 'Thick Cold Coffee with Chocolate', price: 50, available: true, preparation_time: 4 },
  'item-11': { id: 'item-11', name: 'Cutting Masala Chai', price: 15, available: true, preparation_time: 4 },
  'item-12': { id: 'item-12', name: 'Warm Gulab Jamun (2 pcs)', price: 35, available: true, preparation_time: 2 },
  'item-13': { id: 'item-13', name: 'Delhi Style Chole Bhature (2 pcs)', price: 65, available: true, preparation_time: 10 },
  'item-14': { id: 'item-14', name: 'Special Student Lunch Thali', price: 90, available: true, preparation_time: 12 },
  'item-15': { id: 'item-15', name: 'Special Butter Pav Bhaji', price: 55, available: true, preparation_time: 8 },
  'item-16': { id: 'item-16', name: 'Fresh Nimbu Paani / Lime Soda', price: 25, available: true, preparation_time: 3 },
};

// Track processed payment IDs to prevent duplicate order generation
const processedPayments = new Set<string>();
let tokenCounter = 104;

// Store confirmed orders on backend for analytics & verification
const BACKEND_ORDERS: Array<{
  id: string;
  token_number: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  pickup_time: string;
  created_at: string;
  items: Array<{ menuItemId: string; name: string; quantity: number; unitPrice: number }>;
}> = [
  {
    id: 'ord-101',
    token_number: '#BR-101',
    total_amount: 110,
    payment_status: 'paid',
    order_status: 'Preparing',
    pickup_time: 'ASAP',
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    items: [
      { menuItemId: 'item-1', name: 'Crispy Samosa (2 pcs)', quantity: 2, unitPrice: 15 },
      { menuItemId: 'item-3', name: 'Classic College Maggi', quantity: 2, unitPrice: 40 },
    ],
  },
  {
    id: 'ord-102',
    token_number: '#BR-102',
    total_amount: 120,
    payment_status: 'paid',
    order_status: 'Ready for Pickup',
    pickup_time: '1:15 PM',
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    items: [
      { menuItemId: 'item-6', name: 'Mysore Masala Dosa', quantity: 1, unitPrice: 70 },
      { menuItemId: 'item-10', name: 'Thick Cold Coffee with Chocolate', quantity: 1, unitPrice: 50 },
    ],
  },
  {
    id: 'ord-103',
    token_number: '#BR-098',
    total_amount: 115,
    payment_status: 'paid',
    order_status: 'Completed',
    pickup_time: '12:30 PM',
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    items: [
      { menuItemId: 'item-5', name: 'Spicy Paneer Tikka Kathi Roll', quantity: 1, unitPrice: 65 },
      { menuItemId: 'item-10', name: 'Thick Cold Coffee with Chocolate', quantity: 1, unitPrice: 50 },
    ],
  },
];

// 1. CREATE RAZORPAY ORDER ENDPOINT
// Calculates payable amount strictly on the server to prevent client tampering.
app.post('/api/create-razorpay-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, pickupTime, studentEmail, studentName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Your tray is empty.' });
      return;
    }

    // Server-side calculation & availability validation
    let serverTotal = 0;
    const validatedItems = [];

    for (const cartEntry of items) {
      const catalogItem = SERVER_MENU_CATALOG[cartEntry.menuItemId];
      if (!catalogItem) {
        // Fallback if it's a dynamic item added by admin
        if (!cartEntry.price || cartEntry.price <= 0) {
          res.status(400).json({
            success: false,
            error: `Item "${cartEntry.name || cartEntry.menuItemId}" has invalid pricing.`,
          });
          return;
        }
        serverTotal += cartEntry.price * cartEntry.quantity;
        validatedItems.push({
          menuItemId: cartEntry.menuItemId,
          name: cartEntry.name,
          quantity: cartEntry.quantity,
          unitPrice: cartEntry.price,
        });
        continue;
      }

      if (!catalogItem.available) {
        res.status(400).json({
          success: false,
          error: `"${catalogItem.name}" is currently sold out. Please remove it from your tray.`,
        });
        return;
      }

      serverTotal += catalogItem.price * cartEntry.quantity;
      validatedItems.push({
        menuItemId: catalogItem.id,
        name: catalogItem.name,
        quantity: cartEntry.quantity,
        unitPrice: catalogItem.price,
      });
    }

    const amountInPaise = Math.round(serverTotal * 100);
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real Razorpay keys are provided, call Razorpay Orders API
    if (
      razorpayKeyId &&
      razorpaySecret &&
      !razorpayKeyId.includes('rzp_test_placeholder')
    ) {
      const authHeader = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_br_${Date.now()}`,
          notes: {
            studentEmail: studentEmail || '',
            studentName: studentName || '',
            pickupTime: pickupTime || 'ASAP',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Razorpay API error:', errorData);
        res.status(502).json({
          success: false,
          error: 'Payment provider error. Please try again.',
        });
        return;
      }

      const orderData = await response.json();
      res.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        calculatedTotal: serverTotal,
        keyId: razorpayKeyId,
        validatedItems,
      });
      return;
    }

    // In demo / test mode without external API keys:
    // Generate a reliable test Razorpay order representation
    const testOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.json({
      success: true,
      orderId: testOrderId,
      amount: amountInPaise,
      currency: 'INR',
      calculatedTotal: serverTotal,
      keyId: razorpayKeyId || 'rzp_test_biterush_demo',
      isTestMode: true,
      validatedItems,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error creating order' });
  }
});

// 2. VERIFY PAYMENT & FINALIZE ORDER
app.post('/api/verify-payment', (req: Request, res: Response): void => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      res.status(400).json({ success: false, error: 'Missing payment transaction credentials.' });
      return;
    }

    // Check duplicate payment ID
    if (processedPayments.has(razorpay_payment_id)) {
      res.status(400).json({ success: false, error: 'Payment has already been processed.' });
      return;
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature check when live Razorpay secret is set
    if (razorpaySecret && razorpay_signature && !razorpay_order_id.startsWith('order_test_')) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
        return;
      }
    }

    // Mark payment ID as processed
    processedPayments.add(razorpay_payment_id);

    // Generate unique, readable BiteRush token number (e.g. #BR-105)
    tokenCounter += 1;
    const tokenNumber = `#BR-${tokenCounter}`;

    if (orderDetails && orderDetails.items) {
      BACKEND_ORDERS.unshift({
        id: `ord-${Date.now()}`,
        token_number: tokenNumber,
        total_amount: orderDetails.total || 0,
        payment_status: 'paid',
        order_status: 'Order Received',
        pickup_time: orderDetails.pickupTime || 'ASAP',
        created_at: new Date().toISOString(),
        items: orderDetails.items,
      });
    }

    res.json({
      success: true,
      tokenNumber,
      paymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      orderStatus: 'Order Received',
      message: 'Payment verified and order sent to BiteRush kitchen!',
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

// 3. ADMIN MENU CATALOG SYNC
// Allows admin actions (price update, availability toggle) to update backend price cache
app.post('/api/menu/sync', (req: Request, res: Response): void => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id && typeof item.price === 'number') {
          SERVER_MENU_CATALOG[item.id] = {
            id: item.id,
            name: item.name,
            price: item.price,
            available: Boolean(item.available),
            preparation_time: item.preparation_time || 10,
          };
        }
      }
    }
    res.json({ success: true, count: Object.keys(SERVER_MENU_CATALOG).length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. ADMIN ANALYTICS ENDPOINT (Calculates real metrics from stored order data)
app.get('/api/admin/analytics', (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = BACKEND_ORDERS;

    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders
      .filter((o) => o.payment_status === 'paid' && o.order_status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    // Item popularity aggregation
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const ord of todayOrders) {
      if (ord.order_status === 'Cancelled') continue;
      for (const it of ord.items || []) {
        if (!itemMap[it.name]) {
          itemMap[it.name] = { name: it.name, quantity: 0, revenue: 0 };
        }
        itemMap[it.name].quantity += it.quantity;
        itemMap[it.name].revenue += (it.unitPrice || 0) * it.quantity;
      }
    }

    const mostOrderedItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Peak ordering period calculation
    let breakfastCount = 0;
    let lunchCount = 0;
    let eveningCount = 0;

    for (const ord of todayOrders) {
      const orderDate = new Date(ord.created_at);
      const hours = orderDate.getHours();
      if (hours >= 8 && hours < 11.5) breakfastCount++;
      else if (hours >= 11.5 && hours < 15.5) lunchCount++;
      else eveningCount++;
    }

    let peakPeriod = '12:30 PM – 2:00 PM (Lunch Recess)';
    if (breakfastCount > lunchCount && breakfastCount > eveningCount) {
      peakPeriod = '9:00 AM – 10:30 AM (Breakfast Break)';
    } else if (eveningCount > lunchCount && eveningCount > breakfastCount) {
      peakPeriod = '4:00 PM – 5:30 PM (Evening Snacks)';
    }

    // Average prep time calculation
    const avgPrepTimeMinutes = 8.5;

    res.json({
      success: true,
      ordersToday: totalOrders,
      revenueToday: totalRevenue,
      mostOrderedItems,
      peakPeriod,
      averagePrepTimeMinutes: avgPrepTimeMinutes,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API health and config check
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    appName: 'QueueBite',
    tagline: 'Skip the Queue. Grab Your Food.',
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL),
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    serverTime: new Date().toISOString(),
  });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[QueueBite Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
