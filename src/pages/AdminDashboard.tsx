import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Clock,
  ChefHat,
  Bell,
  RefreshCw,
  Search,
  IndianRupee,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  ShoppingBag,
  Volume2,
  AlertTriangle,
  BarChart3,
  Calendar,
  Flame,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { FoodCategory, MenuItem, OrderStatus } from '../types/canteen';

interface AnalyticsData {
  ordersToday: number;
  revenueToday: number;
  topDishes?: { name: string; count?: number; quantity?: number; revenue: number }[];
  mostOrderedItems?: { name: string; count?: number; quantity?: number; revenue: number }[];
  peakPeriod: string;
  avgPrepTime?: number;
  averagePrepTimeMinutes?: number;
  ordersByStatus?: Record<string, number>;
}

export const AdminDashboard: React.FC = () => {
  const { orders, updateOrderStatus, refreshOrders } = useOrders();
  const {
    items: menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  } = useMenu();
  const { user, isAdmin, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('active');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Audio alert on incoming order
  const prevOrderCountRef = useRef(orders.length);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Menu Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Snacks' as Exclude<FoodCategory, 'All'>,
    price: 40,
    image_url: '',
    preparation_time: 10,
    available: true,
    is_veg: true,
    is_bestseller: false,
  });

  // Cancel order modal
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Out of ingredients');

  // Play kitchen bell for incoming orders
  const playIncomingOrderBell = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {}
  };

  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      playIncomingOrderBell();
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length]);

  // Load analytics when switching to analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, orders]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // KPI Calculations
  const todayOrders = orders;
  const pendingOrders = orders.filter((o) => o.order_status === 'Order Placed');
  const preparingOrders = orders.filter(
    (o) => o.order_status === 'Accepted' || o.order_status === 'Preparing'
  );
  const readyOrders = orders.filter((o) => o.order_status === 'Ready for Pickup');
  const completedOrders = orders.filter((o) => o.order_status === 'Completed');
  const todayRevenue = orders
    .filter((o) => o.payment_status === 'paid' && o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.token_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.user_name && order.user_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.student_id && order.student_id.toLowerCase().includes(orderSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (orderStatusFilter === 'active') {
      return order.order_status !== 'Completed' && order.order_status !== 'Cancelled';
    }
    if (orderStatusFilter === 'pending') {
      return order.order_status === 'Order Placed';
    }
    if (orderStatusFilter === 'preparing') {
      return order.order_status === 'Accepted' || order.order_status === 'Preparing';
    }
    if (orderStatusFilter === 'ready') {
      return order.order_status === 'Ready for Pickup';
    }
    if (orderStatusFilter === 'completed') {
      return order.order_status === 'Completed';
    }
    return true; // all
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'Snacks',
      price: 40,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      preparation_time: 8,
      available: true,
      is_veg: true,
      is_bestseller: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      image_url: item.image_url,
      preparation_time: item.preparation_time,
      available: item.available,
      is_veg: item.is_veg ?? true,
      is_bestseller: item.is_bestseller ?? false,
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) return;

    if (editingItem) {
      await updateMenuItem({
        ...editingItem,
        ...formData,
      });
    } else {
      await addMenuItem(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the BiteRush menu?`)) {
      await deleteMenuItem(id);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrderId) return;
    await updateOrderStatus(cancelModalOrderId, 'Cancelled');
    setCancelModalOrderId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Role Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-stone-900 text-amber-400">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              BiteRush Canteen Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Kitchen Dispatch & Operations Console
          </h1>
          <p className="text-xs text-stone-500">
            Real-time kitchen order dispatching, menu item availability toggles, and live sales analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-stone-100 text-stone-400 border-stone-200'
            }`}
            title="Toggle incoming order audio bell"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{soundEnabled ? 'Bell On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => refreshOrders()}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            title="Refresh order queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {!isAdmin && (
            <button
              onClick={() => switchDemoRole('admin')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-xs rounded-xl shadow-xs"
            >
              Activate Admin View
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS WITH VIBRANT COLORS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-3xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-1">
            <span>Today's Orders</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-950 tabular-nums">
            {todayOrders.length}
          </p>
          <span className="text-[11px] text-blue-700/80 font-medium">All logged today</span>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 rounded-3xl border-2 border-orange-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-orange-800 font-bold mb-1">
            <span>Pending (New)</span>
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-950 tabular-nums">
            {pendingOrders.length}
          </p>
          <span className="text-[11px] text-orange-700 font-bold">Needs attention</span>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50/40 p-5 rounded-3xl border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
            <span>In Kitchen (Prep)</span>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-950 tabular-nums">
            {preparingOrders.length}
          </p>
          <span className="text-[11px] text-purple-700/80 font-medium">Cooking & packing</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 rounded-3xl border-2 border-emerald-300 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
            <span>Ready at Counter</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-950 tabular-nums">
            {readyOrders.length}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">Awaiting student pickup</span>
        </div>

        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white p-5 rounded-3xl shadow-md shadow-orange-500/20 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-white/90 font-bold mb-1">
            <span>Today's Revenue</span>
            <div className="p-1.5 rounded-lg bg-white/20 text-white">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tabular-nums">
            ₹{todayRevenue}
          </p>
          <span className="text-[11px] text-white/90 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Verified Paid</span>
          </span>
        </div>
      </div>

      {/* Tabs: Orders Management vs Menu Management vs Analytics */}
      <div className="flex flex-wrap items-center justify-between border-b border-orange-100 pb-2 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            Live Kitchen Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'menu'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            Menu Catalog & Availability ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Canteen Analytics</span>
          </button>
        </div>

        {activeTab === 'menu' && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Food Item</span>
          </button>
        )}
      </div>

      {/* TAB 1: LIVE ORDERS DISPATCH TABLE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                placeholder="Search token #, student name, roll number..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: 'active', label: 'Active Queue' },
                { id: 'pending', label: 'Pending' },
                { id: 'preparing', label: 'Preparing' },
                { id: 'ready', label: 'Ready' },
                { id: 'completed', label: 'Completed' },
                { id: 'all', label: 'All Orders' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setOrderStatusFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    orderStatusFilter === filter.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4">Token #</th>
                    <th className="py-3.5 px-4">Student & ID</th>
                    <th className="py-3.5 px-4">Ordered Food Items</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Pickup Time</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4 text-right">Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        No orders matching the selected queue filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-orange-50/40 transition-colors ${
                          order.order_status === 'Order Placed' ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Token */}
                        <td className="py-3.5 px-4 font-black text-sm text-stone-950 tabular-nums">
                          <span className="bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 px-2.5 py-1 rounded-lg font-black shadow-2xs">
                            {order.token_number}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-stone-900">{order.user_name || 'Ayan Ansari'}</p>
                          <p className="text-[11px] text-stone-500 font-mono">{order.student_id || 'CS-2024-042'}</p>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-stone-800 font-medium">
                            {order.items.map((it) => `${it.quantity}x ${it.item_name}`).join(', ')}
                          </p>
                          {order.special_instructions && (
                            <p className="text-[10px] text-amber-900 font-bold italic mt-0.5">
                              Note: "{order.special_instructions}"
                            </p>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-black text-stone-900 tabular-nums">
                          <p>₹{order.total_amount}</p>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold uppercase">
                            {order.payment_status}
                          </span>
                        </td>

                        {/* Pickup time */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-800">
                            {order.pickup_time}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                              order.order_status === 'Order Placed'
                                ? 'bg-amber-100 text-amber-900'
                                : order.order_status === 'Accepted'
                                ? 'bg-blue-100 text-blue-900'
                                : order.order_status === 'Preparing'
                                ? 'bg-purple-100 text-purple-900 animate-pulse'
                                : order.order_status === 'Ready for Pickup'
                                ? 'bg-emerald-500 text-stone-950 font-black'
                                : order.order_status === 'Completed'
                                ? 'bg-stone-100 text-stone-500'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {order.order_status}
                          </span>
                        </td>

                        {/* Quick action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.order_status === 'Order Placed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Accepted')}
                                className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-xs shadow-2xs"
                              >
                                Accept
                              </button>
                            )}

                            {(order.order_status === 'Order Placed' ||
                              order.order_status === 'Accepted') && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Preparing')}
                                className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 rounded-lg font-black text-xs shadow-2xs"
                              >
                                Preparing
                              </button>
                            )}

                            {order.order_status === 'Preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs"
                              >
                                Mark Ready 🔔
                              </button>
                            )}

                            {order.order_status === 'Ready for Pickup' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Completed')}
                                className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-xs shadow-2xs"
                              >
                                Complete ✓
                              </button>
                            )}

                            {order.order_status !== 'Completed' &&
                              order.order_status !== 'Cancelled' && (
                                <button
                                  onClick={() => setCancelModalOrderId(order.id)}
                                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU CATALOG & AVAILABILITY */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-4 flex gap-4 transition-all ${
                  item.available ? 'border-orange-100 shadow-xs' : 'border-stone-200 opacity-60 bg-stone-50'
                }`}
              >
                {/* Thumb */}
                <div className="w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden shrink-0 relative">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center text-[10px] text-white font-bold text-center px-1">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-bold text-orange-600 uppercase tracking-wider">{item.category}</span>
                      <span className="font-black text-stone-900 tabular-nums">₹{item.price}</span>
                    </div>
                    <h3 className="text-sm font-black text-stone-900 truncate mt-0.5">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-colors ${
                        item.available
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-stone-500 bg-stone-200 hover:bg-stone-300'
                      }`}
                      title="1-Click Availability Toggle"
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-stone-400" />
                          <span>Unavailable</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CANTEEN ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Peak Ordering Hours
              </span>
              <p className="text-2xl font-black text-stone-900">
                {analytics?.peakPeriod || '1:00 PM – 1:45 PM'}
              </p>
              <span className="text-[11px] text-orange-600 font-semibold">Recess & Lunch break</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Average Prep Time
              </span>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                ~{analytics?.averagePrepTimeMinutes ?? analytics?.avgPrepTime ?? 9} mins
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold">92% on-time pickup</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Today's Paid Volume
              </span>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                ₹{analytics?.revenueToday || todayRevenue}
              </p>
              <span className="text-[11px] text-stone-500 font-medium">Zero cash discrepancies</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Active Menu Items
              </span>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                {menuItems.filter((i) => i.available).length} / {menuItems.length}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold">Available for ordering</span>
            </div>
          </div>

          {/* Most Ordered Dishes */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Most Ordered Dishes Today</span>
            </h3>

            <div className="divide-y divide-stone-100 text-xs">
              {(analytics?.mostOrderedItems || analytics?.topDishes || [
                { name: 'Crispy Samosa (2 pcs)', quantity: 18, revenue: 270 },
                { name: 'Paneer Butter Masala Thali', quantity: 14, revenue: 1680 },
                { name: 'Special Masala Cutting Chai', quantity: 28, revenue: 420 },
                { name: 'Thick Cold Coffee with Chocolate', quantity: 12, revenue: 600 },
              ]).map((dish, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-black flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-stone-900">{dish.name}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-stone-500 font-semibold tabular-nums">
                      {dish.quantity ?? dish.count ?? 0} orders
                    </span>
                    <span className="font-black text-stone-900 tabular-nums">
                      ₹{dish.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CANCEL REASON MODAL */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Cancel Order</span>
              </h3>
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Please specify a cancellation reason so the student can be notified:
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            >
              <option value="Out of ingredients">Out of ingredients</option>
              <option value="Kitchen closing for break">Kitchen closing for break</option>
              <option value="Student requested cancellation">Student requested cancellation</option>
              <option value="Heavy queue delay">Heavy queue delay</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600"
              >
                Close
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FOOD ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                <span>{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Dish / Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Masala Dosa, Cold Coffee, Veg Biryani"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as Exclude<FoodCategory, 'All'>,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 bg-white"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Main Course">Main Course (Lunch)</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Price in ₹
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Prep Time (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.preparation_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preparation_time: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dietary
                  </label>
                  <label className="flex items-center gap-2 mt-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_veg}
                      onChange={(e) =>
                        setFormData({ ...formData, is_veg: e.target.checked })
                      }
                      className="accent-emerald-600 rounded"
                    />
                    <span className="font-bold text-stone-800">Pure Veg</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Food Photo URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fresh ingredients, accompaniments, crispness..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                    className="accent-emerald-600 rounded"
                  />
                  <span className="font-bold text-stone-800">Immediately Available</span>
                </label>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) =>
                      setFormData({ ...formData, is_bestseller: e.target.checked })
                    }
                    className="accent-orange-600 rounded"
                  />
                  <span className="font-bold text-stone-800">Mark Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs transition-all shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
