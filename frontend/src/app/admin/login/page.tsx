'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { login } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'SUPER_ADMIN') {
        setError('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="theme-surface border border-purple-500/30 rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight theme-text">
            Super Admin Portal
          </h1>
          <p className="text-xs theme-muted">
            Restricted access portal for Camzy Jobs system administrators.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <Check className="mx-auto h-9 w-9 text-emerald-500" />
            <h4 className="text-base font-extrabold theme-text">Administrator Verified</h4>
            <p className="text-xs theme-muted">Opening platform governance dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
                <input
                  type="email"
                  required
                  placeholder="admin@camzyjobs.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? 'Verifying Credentials...' : 'Authenticate Admin'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
