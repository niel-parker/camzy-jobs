'use client';

import React, { useState } from 'react';
import { LogIn, Lock, Mail, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successUser, setSuccessUser] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      setSuccessUser(loggedInUser);

      // Redirect based on user role
      setTimeout(() => {
        if (loggedInUser.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
        } else if (loggedInUser.role === 'COMPANY_ADMIN' || loggedInUser.role === 'RECRUITER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/candidate/profile');
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid email address or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="theme-surface border theme-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight theme-text">
            Sign In to <span className="text-indigo-500">Camzy Jobs</span>
          </h1>
          <p className="text-xs theme-muted">
            Enter your email address and password to access your portal account.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successUser ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <Check className="mx-auto h-9 w-9 text-emerald-500" />
            <h4 className="text-base font-extrabold theme-text">Authentication Successful</h4>
            <p className="text-xs theme-muted">
              Welcome back, {successUser.firstName} {successUser.lastName}! Redirecting to workspace...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t theme-border text-center space-y-2">
          <p className="text-xs theme-muted">
            Don&apos;t have an account?{' '}
            <a href="/auth/register/candidate" className="font-bold text-indigo-500 hover:underline">
              Register as Candidate
            </a>{' '}
            or{' '}
            <a href="/auth/register/company" className="font-bold text-indigo-500 hover:underline">
              Onboard Employer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
