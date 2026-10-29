import React, { useEffect, useRef } from 'react';
import {
  Check,
  Clock,
  ChefHat,
  Bell,
  ArrowLeft,
  MapPin,
  Volume2,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { OrderStatus } from '../types/canteen';
import { OrderQrCode } from '../components/OrderQrCode';

interface OrderTrackingPageProps {
  orderId?: string | null;
  onNavigate: (tab: string) => void;
}

const CANONICAL_STEPS: { statusKey: string; label: string; description: string }[] = [
  {
    statusKey: 'received',
    label: 'Order Received',
    description: 'Sent to BiteRush kitchen console',
  },
  {
    statusKey: 'preparing',
    label: 'Preparing',
    description: 'Cook is preparing fresh meal',
  },
  {
    statusKey: 'ready',
    label: 'Ready for Pickup',
    description: 'Waiting at Counters 1 & 2',
  },
  {
    statusKey: 'completed',
    label: 'Completed',
    description: 'Picked up by student',
  },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const { orders, activeOrder } = useOrders();
  const chimePlayedRef = useRef(false);

  const currentOrder = orderId
    ? orders.find((o) => o.id === orderId) || activeOrder
    : activeOrder || orders[0];

  const isReady = currentOrder?.order_status === 'Ready for Pickup';
  const isCancelled = currentOrder?.order_status === 'Cancelled';

  // Sound chime synthesizer via Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 2-tone melodic notification chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      if (navigator.vibrate) {
        navigator.vibrate([150, 100, 200]);
      }
    } catch {
      // Audio context policy fallback
    }
  };

  useEffect(() => {
    if (isReady && !chimePlayedRef.current) {
      playChime();
      chimePlayedRef.current = true;
    }
  }, [isReady]);

  if (!currentOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Clock className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">No active order to track</h2>
        <p className="text-xs text-stone-500">
          Place a fresh order from our BiteRush menu to track live kitchen preparation.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs shadow-md shadow-orange-500/20"
        >
          View Menu
        </button>
      </div>
    );
  }

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Order Placed':
      case 'Accepted':
        return 0; // Order Received
      case 'Preparing':
        return 1;
      case 'Ready for Pickup':
        return 2;
      case 'Completed':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder.order_status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-orange-100">
        <div>
          <button
            onClick={() => onNavigate('orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All My Orders</span>
          </button>
          <h1 className="text-2xl font-black text-stone-900">
            Real-Time Order Tracking
          </h1>
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">QueueBite Realtime Synced</span>
        </div>
      </div>

      {/* PROMINENT READY NOTIFICATION BANNER */}
      {isReady && (
        <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 text-stone-950 p-6 sm:p-7 rounded-3xl border-3 border-stone-950 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 animate-pulse">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xl">
              <Bell className="w-8 h-8 animate-bounce text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest bg-stone-950 text-amber-300 px-3 py-1 rounded-md">
                Token {currentOrder.token_number}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-950 mt-1 leading-tight">
                Your order is ready! Please collect it from the canteen.
              </h2>
              <p className="text-xs sm:text-sm text-stone-900 font-bold mt-1">
                Head to Counter 1 & 2 at the Student Activity Center with this token screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={playChime}
              className="p-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 flex items-center gap-1.5 shadow-md"
              title="Test Sound Chime"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Chime</span>
            </button>
            <span className="px-5 py-3 bg-stone-950 text-white rounded-xl text-xs font-black shadow-md uppercase tracking-wider">
              Collect Tray
            </span>
          </div>
        </div>
      )}

      {/* Token Header Banner */}
      <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-white rounded-3xl border border-orange-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-black text-orange-600 uppercase tracking-widest">
            QueueBite Order Token
          </span>
          <div className="text-5xl sm:text-6xl font-black text-stone-950 tabular-nums">
            {currentOrder.token_number}
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Ordered at {new Date(currentOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Scheduled for: <strong className="text-orange-700 font-bold">{currentOrder.pickup_time}</strong>
          </p>
        </div>

        {/* Offline QR Code embedded directly on tracking page */}
        <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-orange-100 shadow-xs self-start sm:self-auto">
          <OrderQrCode orderId={currentOrder.id} tokenNumber={currentOrder.token_number} size={90} />
          <div className="text-left text-xs space-y-1">
            <span className="font-bold text-stone-900 block">Express Pickup</span>
            <span className="text-stone-500 text-[11px] block">
              Staff can scan this code or match token {currentOrder.token_number}.
            </span>
            <div className="pt-1">
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Paid Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Progress Tracker */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-6">
          Order Progress Tracker
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl text-xs font-bold border border-rose-200">
            This order has been cancelled by the canteen administration. Any refund will reflect in your UPI account.
          </div>
        ) : (
          <div className="relative">
            {/* Timeline track line */}
            <div className="hidden sm:block absolute top-1/2 left-8 right-8 h-1.5 bg-stone-100 -translate-y-1/2 z-0" />
            <div
              className="hidden sm:block absolute top-1/2 left-8 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentStepIdx / (CANONICAL_STEPS.length - 1)) * 100)}%`,
              }}
            />

            {/* Steps icons & labels */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
              {CANONICAL_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.statusKey} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-stone-950 ring-4 ring-orange-200 scale-110 shadow-lg shadow-orange-500/30'
                          : isPassed
                          ? 'bg-stone-950 text-white'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isPassed ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-black leading-tight ${
                          isCurrent
                            ? 'text-orange-600 font-black'
                            : isPassed
                            ? 'text-stone-900 font-bold'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ordered Items Summary */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
          Tray Summary ({currentOrder.items.length} items)
        </h3>

        <div className="divide-y divide-stone-100">
          {currentOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 tabular-nums bg-stone-100 px-2 py-0.5 rounded">
                  {item.quantity}x
                </span>
                <span className="text-stone-800 font-medium">{item.item_name}</span>
              </div>
              <span className="font-bold text-stone-900 tabular-nums">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm font-bold text-stone-900">
          <span>Total Paid (Online):</span>
          <span className="text-xl font-black text-orange-600 tabular-nums">
            ₹{currentOrder.total_amount}
          </span>
        </div>
      </div>

      {/* Pickup instructions */}
      <div className="bg-stone-100 rounded-3xl p-5 border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-900 block mb-0.5">Counter Instructions</span>
          <span>
            Please walk up to Counter 1 or 2 at the Student Activity Center. Staff will match your token number{' '}
            <strong className="text-stone-900">{currentOrder.token_number}</strong> or scan the QR code to hand over your meal tray.
          </span>
        </div>
      </div>
    </div>
  );
};
