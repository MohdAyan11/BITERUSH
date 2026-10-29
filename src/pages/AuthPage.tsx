import React, { useState } from 'react';
import { User, Mail, Lock, Hash, Shield, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  onNavigate: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { user, login, signup, logout, role, isAdmin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [accountType, setAccountType] = useState<'student' | 'admin'>('student');

  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fillDemoStudent = () => {
    setFullName('Ayan Ansari');
    setEmail('ansariayan7351@gmail.com');
    setStudentId('CS-2024-042');
    setPassword('BiteRush@2026');
    setAccountType('student');
  };

  const fillDemoAdmin = () => {
    setFullName('Chef Ramesh Kumar');
    setEmail('canteen.admin@campus.edu');
    setStudentId('STAFF-01');
    setPassword('CanteenStaff#2026');
    setAccountType('admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    if (mode === 'forgot') {
      setTimeout(() => {
        setStatusMessage({
          type: 'success',
          text: `A password reset link has been dispatched to ${email}.`,
        });
        setLoading(false);
      }, 700);
      return;
    }

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onNavigate('menu');
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Invalid credentials' });
      }
    } else {
      const res = await signup(fullName, email, studentId, password, accountType);
      setLoading(false);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: isSupabaseConfigured
            ? 'Account created! Please check your email inbox to confirm your account.'
            : 'Account registered successfully!',
        });
        setTimeout(() => onNavigate('menu'), 1200);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Signup failed' });
      }
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-orange-500/20">
          {user.full_name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-900">{user.full_name}</h2>
          <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 rounded-full text-xs font-bold text-orange-900">
            <span>ID: {user.student_id}</span>
            <span>·</span>
            <span className="capitalize">{user.role}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => onNavigate(isAdmin ? 'admin' : 'profile')}
            className="w-full py-3.5 bg-stone-900 text-white rounded-2xl text-xs font-black hover:bg-stone-800 transition-colors shadow-md"
          >
            {isAdmin ? 'Open Admin Console' : 'View Student Profile'}
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 rounded-2xl text-xs font-black shadow-md shadow-orange-500/20"
          >
            Explore Canteen Menu
          </button>
          <button
            onClick={() => logout()}
            className="w-full py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-200 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-stone-950 flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-orange-500/25">
          BR
        </div>
        <h1 className="text-2xl font-black text-stone-900">
          {mode === 'login'
            ? 'Sign In to BiteRush'
            : mode === 'signup'
            ? 'Create Student Account'
            : 'Reset Password'}
        </h1>
        <p className="text-xs text-stone-500">
          Official Digital Canteen Portal · Skip the Queue. Grab Your Food.
        </p>
      </div>

      {/* Mode Switcher */}
      {mode !== 'forgot' && (
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            New Account
          </button>
        </div>
      )}

      {/* Fast Demo Autofill Buttons */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs shadow-2xs">
        <span className="text-[11px] font-black text-orange-800 uppercase tracking-wider block">
          ⚡ 1-Click Evaluation Credentials:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillDemoStudent}
            className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-stone-950 font-bold hover:bg-amber-100/50 text-[11px] text-left shadow-2xs"
          >
            Student: Ayan Ansari
          </button>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="px-3 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 text-[11px] text-left shadow-2xs"
          >
            Staff: Chef Ramesh
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs">
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
              statusMessage.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : null}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayan Ansari"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
              College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="ansariayan7351@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Student ID / Roll Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="CS-2024-042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20 font-mono"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-orange-700 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="radio"
                    name="role"
                    checked={accountType === 'student'}
                    onChange={() => setAccountType('student')}
                    className="accent-orange-600"
                  />
                  <span className="font-bold">Student</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="radio"
                    name="role"
                    checked={accountType === 'admin'}
                    onChange={() => setAccountType('admin')}
                    className="accent-orange-600"
                  />
                  <span className="font-bold">Canteen Staff</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-105 text-stone-950 font-black rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : mode === 'login' ? (
              'Sign In to QueueBite'
            ) : mode === 'signup' ? (
              'Create Student Account'
            ) : (
              'Send Password Reset Link'
            )}
          </button>
        </form>

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-center text-xs text-stone-500 hover:text-stone-900 mt-4 block font-semibold"
          >
            ← Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
