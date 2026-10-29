import React, { useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  MapPin,
  Utensils,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types/canteen';
import { OrderQrCode } from '../components/OrderQrCode';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (tab: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
  onTrackOrder,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#f59e0b', '#10b981', '#ef4444', '#fbbf24'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Your order has reached the BiteRush kitchen console. Show your token at the pickup counter.
        </p>
      </div>

      {/* Hero Token Card with Eye-Catching Gradient & Local Offline QR */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white p-6 sm:p-8 rounded-3xl shadow-2xl shadow-orange-500/25 text-center relative overflow-hidden border-2 border-amber-300">
        <div className="relative z-10 space-y-4">
          <span className="text-[11px] uppercase font-black tracking-widest bg-stone-950/85 text-amber-300 px-3.5 py-1 rounded-full border border-amber-400/30">
            ★ Official BiteRush Canteen Token
          </span>

          <div className="text-6xl sm:text-7xl font-black tracking-tight tabular-nums text-white drop-shadow-md">
            {order.token_number}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-stone-950 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full shadow-sm max-w-fit mx-auto">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Pickup: {order.pickup_time}</span>
            <span>·</span>
            <span>Counters 1 & 2</span>
          </div>

          {/* Offline local QR code embedded in card */}
          <div className="pt-2 flex justify-center">
            <OrderQrCode orderId={order.id} tokenNumber={order.token_number} size={130} />
          </div>

          <p className="text-[11px] text-white/90 font-medium">
            Scan this offline QR at the counter scanner or tell the staff your token number.
          </p>
        </div>

        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-yellow-300/30 blur-2xl pointer-events-none" />
      </div>

      {/* Order Details Receipt */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
              BiteRush Order Receipt
            </span>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            ID: {order.id}
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-stone-900 tabular-nums bg-stone-100 px-2 py-0.5 rounded">
                  {item.quantity}x
                </span>
                <span className="text-stone-800 font-semibold">{item.item_name}</span>
              </div>
              <span className="font-extrabold text-stone-900 tabular-nums">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Payment Status:</span>
            <span className="text-emerald-700 font-bold uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paid (Razorpay Verified)</span>
            </span>
          </div>

          <div className="flex justify-between text-stone-600">
            <span>Transaction Reference:</span>
            <span className="font-mono text-[11px] text-stone-500">{order.payment_id}</span>
          </div>

          {order.special_instructions && (
            <div className="flex justify-between text-stone-600 pt-1">
              <span>Kitchen Request:</span>
              <span className="text-stone-800 font-semibold italic">
                "{order.special_instructions}"
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-100">
            <span>Total Amount Paid:</span>
            <span className="tabular-nums text-orange-600">₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Counter Collection Instructions */}
      <div className="bg-orange-50/70 border border-orange-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-700">
        <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-900 block mb-0.5">Pickup Counter Instructions</span>
          <span>
            Head to <strong>Counters 1 & 2</strong> at the Student Activities Center. When your token status shows <strong className="text-emerald-700">Ready for Pickup</strong>, step forward to grab your tray.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onTrackOrder(order.id)}
          className="flex-1 py-4 px-5 bg-stone-950 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <span>Track Live Kitchen Progress</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onNavigate('menu')}
          className="py-4 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-bold transition-colors"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
