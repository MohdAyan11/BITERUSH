import React, { useState } from 'react';
import { User, Mail, Hash, Shield, LogOut, ShoppingBag, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

interface ProfilePageProps {
  onNavigate: (tab: string) => void;
  onTrackOrder: (orderId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onTrackOrder }) => {
  const { user, logout, updateProfile, isAdmin, switchDemoRole } = useAuth();
  const { myOrders } = useOrders();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.full_name || '');
  const [studentIdInput, setStudentIdInput] = useState(user?.student_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900">Student Profile</h2>
        <p className="text-xs text-stone-500">
          Sign in with your college account to view your details, token queue, and order history.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs shadow-md shadow-orange-500/20"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateProfile({
        full_name: nameInput,
        student_id: studentIdInput,
      });
      setIsEditing(false);
      setFeedback('Profile details saved successfully.');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeOrders = myOrders.filter(
    (o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
  );
  const completedOrders = myOrders.filter((o) => o.order_status === 'Completed');
  const totalSpent = myOrders
    .filter((o) => o.payment_status === 'paid' && o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your campus identification, pickup credentials, and order history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Canteen Admin Portal</span>
            </button>
          ) : (
            <button
              onClick={() => switchDemoRole('admin')}
              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-xl text-xs font-bold"
              title="Switch role for testing"
            >
              Switch to Staff Admin
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout();
                onNavigate('home');
              }
            }}
            className="p-2 text-stone-500 hover:text-rose-600 bg-white border border-stone-200 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
            title="Sign out of QueueBite"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Card & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: User Details Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black text-2xl shadow-md shadow-orange-500/20">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900">{user.full_name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-stone-900 text-amber-400'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">{user.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4 pt-4 border-t border-stone-100 text-xs">
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Full Name</span>
                </span>
                <span className="font-bold text-stone-900">{user.full_name}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span>College Email</span>
                </span>
                <span className="font-bold text-stone-900">{user.email}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500 font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-500" />
                  <span>Student Roll / ID</span>
                </span>
                <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-md font-mono">
                  {user.student_id}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setNameInput(user.full_name);
                    setStudentIdInput(user.student_id);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-stone-100 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Student ID / Roll
                </label>
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-xl text-xs shadow-md shadow-orange-500/20"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-stone-500 hover:text-stone-900 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Quick Stats & Active Orders */}
        <div className="lg:col-span-5 space-y-6">
          {/* Canteen Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Total Orders
              </span>
              <p className="text-3xl font-black text-stone-900 tabular-nums">
                {myOrders.length}
              </p>
              <span className="text-[10px] text-stone-500">{completedOrders.length} completed</span>
            </div>

            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white p-5 rounded-3xl shadow-md shadow-orange-500/20">
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider block mb-1">
                Total Spent
              </span>
              <p className="text-3xl font-black text-white tabular-nums">
                ₹{totalSpent}
              </p>
              <span className="text-[10px] text-white/80">100% verified</span>
            </div>
          </div>

          {/* Active Orders Widget */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Active Orders Queue ({activeOrders.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                View All
              </button>
            </div>

            {activeOrders.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">
                No food in the kitchen queue right now.
              </p>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-stone-950 tabular-nums bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                          {ord.token_number}
                        </span>
                        <span className="text-xs font-bold text-orange-700">
                          {ord.order_status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                        {ord.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                      </p>
                    </div>

                    <button
                      onClick={() => onTrackOrder(ord.id)}
                      className="p-2 bg-stone-900 text-amber-400 rounded-xl hover:bg-stone-800 shrink-0"
                      title="Track Order Status"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Order Food from Canteen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
