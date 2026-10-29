import React, { useState } from 'react';
import {
  Clock,
  RotateCcw,
  ShoppingBag,
  ArrowUpRight,
  Receipt,
  X,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { Order, OrderStatus } from '../types/canteen';
import { OrderQrCode } from '../components/OrderQrCode';

interface MyOrdersPageProps {
  onNavigate: (tab: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigate, onTrackOrder }) => {
  const { myOrders, loading } = useOrders();
  const { addToCart } = useCart();
  const { items: allMenuItems } = useMenu();

  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const handleReorder = (order: Order) => {
    let addedCount = 0;
    const unavailableList: string[] = [];

    order.items.forEach((item) => {
      const liveItem = allMenuItems.find(
        (m) => m.name.toLowerCase() === item.item_name.toLowerCase() || m.id === item.menu_item_id
      );

      if (liveItem && liveItem.available) {
        addToCart(liveItem, item.quantity);
        addedCount += 1;
      } else {
        unavailableList.push(item.item_name);
      }
    });

    if (addedCount > 0) {
      if (unavailableList.length > 0) {
        alert(
          `Added available items to tray. Note: ${unavailableList.join(', ')} are currently out of stock.`
        );
      }
      onNavigate('cart');
    } else {
      alert('None of these items are currently available in the kitchen.');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed':
        return <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold">Placed</span>;
      case 'Accepted':
        return <span className="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full text-xs font-bold">Accepted</span>;
      case 'Preparing':
        return <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full text-xs font-black animate-pulse">Preparing 🍳</span>;
      case 'Ready for Pickup':
        return <span className="bg-emerald-500 text-stone-950 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">Ready for Pickup 🔔</span>;
      case 'Completed':
        return <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-xs font-medium">Completed</span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Cancelled</span>;
    }
  };

  const activeOrders = myOrders.filter(
    (o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
  );
  const pastOrders = myOrders.filter(
    (o) => o.order_status === 'Completed' || o.order_status === 'Cancelled'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            My Canteen Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            View active QueueBite kitchen tokens, track meal preparation, and view order receipts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('menu')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 w-fit"
        >
          <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Order</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-stone-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : myOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <Clock className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-900">No canteen orders yet</h3>
          <p className="text-xs text-stone-500">
            You haven't placed any food orders today. Try our hot crispy samosas, thalis, or cutting chai!
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs shadow-md shadow-orange-500/20"
          >
            Explore Today's Menu
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Active Kitchen Orders ({activeOrders.length})</span>
              </h2>

              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white rounded-3xl border-2 border-orange-300 p-6 shadow-md space-y-4 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-orange-100">
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl sm:text-4xl font-black text-stone-950 tabular-nums bg-gradient-to-tr from-amber-400 to-orange-500 px-4 py-1.5 rounded-2xl shadow-sm">
                          {order.token_number}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.order_status)}
                            <span className="text-xs text-stone-600 font-medium">
                              Pickup: <strong className="text-orange-700 font-bold">{order.pickup_time}</strong>
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Placed at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="px-3.5 py-2.5 bg-white border border-orange-200 hover:bg-orange-50 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="View Order Details & QR"
                        >
                          <Receipt className="w-3.5 h-3.5 text-orange-600" />
                          <span>Receipt</span>
                        </button>

                        <button
                          onClick={() => onTrackOrder(order.id)}
                          className="px-5 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <span>Track Live</span>
                          <ArrowUpRight className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between py-1.5 bg-white/80 px-3 rounded-xl border border-orange-100/60">
                          <span className="text-stone-800 font-medium">
                            <strong className="text-stone-950 tabular-nums">{it.quantity}x</strong> {it.item_name}
                          </span>
                          <span className="font-extrabold text-stone-900 tabular-nums">
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-stone-500 text-[11px]">
                        Payment Ref: {order.payment_id}
                      </span>
                      <span className="text-base font-black text-stone-900 tabular-nums">
                        Total: ₹{order.total_amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest">
                Order History ({pastOrders.length})
              </h2>

              <div className="space-y-3">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-200 transition-colors shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-black text-stone-900 tabular-nums">
                          {order.token_number}
                        </span>
                        <span>·</span>
                        {getStatusBadge(order.order_status)}
                        <span>·</span>
                        <span className="text-xs text-stone-500">
                          {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-1">
                        {order.items.map((it) => `${it.quantity}x ${it.item_name}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Paid</span>
                        <span className="text-sm font-black text-stone-900 tabular-nums">
                          ₹{order.total_amount}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-orange-200"
                        title="Reorder available items"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDER DETAILS RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-stone-900">
                  QueueBite Token Receipt
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Token and QR */}
            <div className="text-center space-y-3 py-2 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-orange-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                Official Pickup Token
              </span>
              <div className="text-5xl font-black text-stone-950 tabular-nums">
                {selectedReceiptOrder.token_number}
              </div>
              <div className="flex justify-center pt-1">
                <OrderQrCode
                  orderId={selectedReceiptOrder.id}
                  tokenNumber={selectedReceiptOrder.token_number}
                  size={120}
                />
              </div>
            </div>

            {/* Details Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Order Status:</span>
                <span className="font-bold">{selectedReceiptOrder.order_status}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Pickup Time:</span>
                <span className="font-bold text-orange-700">{selectedReceiptOrder.pickup_time}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Date & Time:</span>
                <span>{new Date(selectedReceiptOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment Reference:</span>
                <span className="font-mono text-[11px] text-stone-500">{selectedReceiptOrder.payment_id}</span>
              </div>
            </div>

            {/* Items */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Ordered Items
              </span>
              <div className="divide-y divide-stone-100 text-xs">
                {selectedReceiptOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span>
                      <strong className="text-stone-900">{it.quantity}x</strong> {it.item_name}
                    </span>
                    <span className="font-bold text-stone-900">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                <span>Total Paid:</span>
                <span className="text-orange-600">₹{selectedReceiptOrder.total_amount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleReorder(selectedReceiptOrder);
                  setSelectedReceiptOrder(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs shadow-md"
              >
                Reorder This Meal
              </button>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="py-3 px-4 bg-stone-100 text-stone-700 font-bold rounded-xl text-xs hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
