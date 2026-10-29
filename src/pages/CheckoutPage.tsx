import React, { useState } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Zap, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types/canteen';

interface CheckoutPageProps {
  onNavigate: (tab: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { cart, subtotal, estimatedPrepTime, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();

  const [pickupOption, setPickupOption] = useState<'ASAP' | 'scheduled'>('ASAP');
  const [scheduledTime, setScheduledTime] = useState<string>('1:15 PM');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback student details if not signed in
  const [studentName, setStudentName] = useState<string>(user?.full_name || 'Ayan Ansari');
  const [studentEmail, setStudentEmail] = useState<string>(user?.email || 'ansariayan7351@gmail.com');
  const [studentRoll, setStudentRoll] = useState<string>(user?.student_id || 'CS-2024-042');

  const scheduledSlots = [
    '11:15 AM (Morning Break)',
    '12:45 PM (Lunch Session 1)',
    '1:15 PM (Lunch Session 2)',
    '1:45 PM (Lunch Session 3)',
    '3:30 PM (Evening Break)',
    '4:15 PM (Post-Lab Session)',
  ];

  const handlePayAndPlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const effectivePickupTime = pickupOption === 'ASAP' ? 'ASAP' : scheduledTime;

    try {
      // 1. Call Backend to create order & calculate authoritative amount
      const orderPayload = {
        items: cart.map((ci) => ({
          menuItemId: ci.menuItem.id,
          name: ci.menuItem.name,
          quantity: ci.quantity,
          price: ci.menuItem.price,
        })),
        pickupTime: effectivePickupTime,
        studentEmail,
        studentName,
      };

      const createRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'Failed to initialize payment order');
      }

      // Check if standard window.Razorpay SDK is available
      const RazorpaySDK = (window as any).Razorpay;

      if (RazorpaySDK && createData.keyId && !createData.isTestMode) {
        // Real Razorpay modal execution
        const options = {
          key: createData.keyId,
          amount: createData.amount,
          currency: createData.currency,
          name: 'BiteRush College Canteen',
          description: `Order Token Payment - ${cart.length} item(s)`,
          image: '/src/assets/images/dish_samosa_plate_1793265932853.jpg',
          order_id: createData.orderId,
          handler: async function (response: any) {
            await finalizePaymentVerification(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              createData.calculatedTotal,
              effectivePickupTime
            );
          },
          prefill: {
            name: studentName,
            email: studentEmail,
          },
          theme: {
            color: '#f59e0b',
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new RazorpaySDK(options);
        rzp.open();
      } else {
        // Simulated test payment execution with server HMAC verification
        setTimeout(async () => {
          const testPaymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await finalizePaymentVerification(
            createData.orderId,
            testPaymentId,
            'test_hmac_signature',
            createData.calculatedTotal,
            effectivePickupTime
          );
        }, 1200);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const finalizePaymentVerification = async (
    orderId: string,
    paymentId: string,
    signature: string,
    finalAmount: number,
    pickupTime: string
  ) => {
    try {
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment signature verification failed.');
      }

      // Create new confirmed order
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        user_id: user?.id || 'usr-student-1',
        user_name: studentName,
        user_email: studentEmail,
        student_id: studentRoll,
        token_number: verifyData.tokenNumber,
        total_amount: finalAmount,
        payment_status: 'paid',
        payment_id: paymentId,
        order_status: 'Order Placed',
        pickup_time: pickupTime,
        special_instructions: specialNotes,
        items: cart.map((ci) => ({
          id: `oi-${Math.random().toString(36).substring(2, 8)}`,
          order_id: '',
          menu_item_id: ci.menuItem.id,
          item_name: ci.menuItem.name,
          quantity: ci.quantity,
          price: ci.menuItem.price,
        })),
        created_at: new Date().toISOString(),
      };

      await createOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Finalize payment error:', err);
      setErrorMessage(err.message || 'Payment verification failed');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    onNavigate('menu');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back button */}
      <div>
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tray</span>
        </button>
        <h1 className="text-2xl font-extrabold text-stone-900">Checkout & Token Pickup</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Choose your pickup time, confirm details and pay securely.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span> {errorMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details, Pickup Time, Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Pickup Time Preference */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>When will you pick up your order?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupOption('ASAP')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  pickupOption === 'ASAP'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>ASAP Pickup</span>
                  </span>
                  {pickupOption === 'ASAP' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-stone-500">
                  Ready in approx ~{estimatedPrepTime} minutes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPickupOption('scheduled')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  pickupOption === 'scheduled'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-600" />
                    <span>Schedule For Break</span>
                  </span>
                  {pickupOption === 'scheduled' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-stone-500">
                  Select your lecture / recess time slot.
                </p>
              </button>
            </div>

            {pickupOption === 'scheduled' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Recess Slot:
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
                >
                  {scheduledSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Student Information */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-stone-900">
              Student Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Student Roll / ID
                </label>
                <input
                  type="text"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="e.g. CS-2024-042"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  College Email
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Kitchen Notes / Special Request (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra mint chutney, less spicy Maggi, no onions..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-sm font-bold text-stone-900 flex items-center justify-between">
              <span>Payment Gateway</span>
              <span className="text-[11px] font-medium text-stone-500">Powered by Razorpay</span>
            </h2>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-stone-50 border-stone-200">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-amber-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Instant UPI / QR Code (Recommended)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      GPay, PhonePe, Paytm, BHIM, CRED
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  0% Fee
                </span>
              </label>

              <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-stone-50 border-stone-200">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-amber-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Debit / Credit Card
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Visa, Mastercard, RuPay
                    </span>
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-stone-400" />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-stone-50 border-stone-200">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="accent-amber-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Net Banking
                    </span>
                    <span className="text-[11px] text-stone-500">
                      SBI, HDFC, ICICI, Axis & 50+ Banks
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Pay Action */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs sticky top-24">
          <h2 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Order Review
          </h2>

          {/* List of items */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 tabular-nums">{quantity}x</span>
                  <span className="text-stone-700 font-medium truncate max-w-[160px]">
                    {menuItem.name}
                  </span>
                </div>
                <span className="font-bold text-stone-900 tabular-nums">
                  ₹{menuItem.price * quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-stone-900 tabular-nums">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Pickup Scheduled For:</span>
              <span className="font-bold text-amber-700">
                {pickupOption === 'ASAP' ? `ASAP (~${estimatedPrepTime}m)` : scheduledTime}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-stone-900">Total Amount:</span>
              <span className="text-2xl font-black text-stone-900 tabular-nums">₹{subtotal}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayAndPlaceOrder}
            disabled={isProcessing}
            className={`w-full py-4 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
              isProcessing
                ? 'bg-stone-400 text-stone-100 cursor-wait'
                : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 text-stone-950 shadow-orange-500/30 active:scale-98 cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying with Canteen Server...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Pay ₹{subtotal} & Generate Token</span>
              </>
            )}
          </button>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">Campus Canteen Security Policy:</p>
            <p>
              • Server authenticates prices directly from menu database.<br />
              • Duplicate transactions are automatically blocked.<br />
              • Order token is assigned immediately upon payment confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
