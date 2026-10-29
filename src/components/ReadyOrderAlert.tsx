import React from 'react';
import { BellRing, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useOrders } from '../context/OrderContext';

interface ReadyOrderAlertProps {
  onViewOrder: (orderId: string) => void;
}

export const ReadyOrderAlert: React.FC<ReadyOrderAlertProps> = ({ onViewOrder }) => {
  const { readyOrderNotification, dismissReadyNotification } = useOrders();

  if (!readyOrderNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full animate-bounce shadow-2xl">
      <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 text-stone-950 p-4 sm:p-5 rounded-2xl border-2 border-stone-950 shadow-2xl flex items-start gap-3.5">
        <div className="p-2.5 bg-stone-950 text-amber-400 rounded-xl shrink-0 mt-0.5 shadow-md">
          <BellRing className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-black uppercase tracking-wider bg-stone-950 text-amber-300 px-2.5 py-0.5 rounded-md">
              Token {readyOrderNotification.token_number}
            </span>
            <span className="text-xs font-bold text-stone-950">
              Canteen Counter 1 & 2
            </span>
          </div>
          <p className="text-sm font-black text-stone-950 leading-snug">
            Your order is ready! Please collect it from the canteen.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                onViewOrder(readyOrderNotification.id);
                dismissReadyNotification();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Show Token to Staff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={dismissReadyNotification}
              className="px-2 py-1.5 text-xs text-stone-800 hover:text-stone-950 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={dismissReadyNotification}
          className="text-stone-900 hover:text-stone-950 p-1 rounded-lg"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
