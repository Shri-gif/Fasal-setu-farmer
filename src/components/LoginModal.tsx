import React, { useState } from 'react';
import { Sprout, LogIn, UserPlus, Sparkles, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  onSignup: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  onQuickDemoLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLogin,
  onSignup,
  onQuickDemoLogin,
}) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('vimalshukla282@gmail.com');
  const [password, setPassword] = useState('khet2ghar123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    if (isSignUpMode && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);

    try {
      const res = isSignUpMode
        ? await onSignup(email.trim(), password)
        : await onLogin(email.trim(), password);

      if (res.success) {
        setMessage({
          type: 'success',
          text: isSignUpMode
            ? 'Account created! Logging in...'
            : 'Welcome back! Opening your farmer dashboard...',
        });
      } else {
        setMessage({ type: 'error', text: res.message || 'Authentication failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Authentication error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-100">
        {/* Brand Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-200 text-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-sm mb-3">
            🌱
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            Khet2Ghar Farmer Hub
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sell Directly. <span className="text-emerald-700">Earn Better.</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Apni farm ki fresh produce ko directly customers tak pahunchao aur poora munafa paao.
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-950 block">⚡ Instant Sandbox Mode</span>
              <span className="text-[11px] text-amber-900/80">Explore full features with pre-seeded harvest & orders</span>
            </div>
            <button
              onClick={onQuickDemoLogin}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Demo Login
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="farmerLoginForm">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Email Address (ईमेल) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vimalshukla282@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Password (पासवर्ड) *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            id="loginBtn"
          >
            <span>{loading ? 'Authenticating...' : isSignUpMode ? 'Create Farmer Account' : 'Login to Farmer Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setMessage(null);
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            {isSignUpMode ? 'Already have an account? Login here' : 'New farmer? Create a free producer account'}
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          🌾 Seedha Khet Se, Aapke Ghar Tak • 100% Direct Payouts
        </p>
      </div>
    </div>
  );
};
