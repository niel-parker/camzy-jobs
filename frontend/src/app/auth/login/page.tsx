'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Sparkles, KeyRound } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { sdk, login, setUser } = useTheme();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  // Traditional password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 3-Minute Resend Timer (180 Seconds)
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await sdk.requestOtp(identifier);
      setOtpSent(true);
      setResendTimer(180); // Start 3-minute timer
      if (res.otpCode) setDemoOtp(res.otpCode);
      setSuccessMsg(res.message || 'OTP verification code dispatched via Mailgun SMTP.');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authRes = await sdk.verifyOtp(identifier, otpCode);
      setUser(authRes.user);
      setSuccessMsg(authRes.message || 'Authentication successful!');

      setTimeout(() => {
        if (authRes.user.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
        } else if (authRes.user.role === 'COMPANY_ADMIN' || authRes.user.role === 'RECRUITER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/candidate/profile');
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      setSuccessMsg(`Welcome back, ${loggedInUser.firstName}!`);

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
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="theme-surface border theme-border rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-1 border border-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight theme-text">
            Sign In or <span className="text-indigo-500">Register</span>
          </h1>
          <p className="text-xs theme-muted">
            Single entry: Existing users sign in instantly, new candidates are auto-registered via OTP
          </p>
        </div>

        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 theme-border border text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('OTP');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              authMode === 'OTP'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'theme-muted hover:theme-text'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OTP One-Click</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('PASSWORD');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              authMode === 'PASSWORD'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'theme-muted hover:theme-text'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password Login</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OTP Authentication Flow */}
        {authMode === 'OTP' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. alex@example.com or +1234567890"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] theme-muted mt-1.5">
                    Enter your email to receive a 6-digit OTP code via Mailgun SMTP. If your account exists, you will be logged in; otherwise a candidate account is created instantly.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{loading ? 'Sending OTP via Mailgun...' : 'Get Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
                  OTP sent to <strong>{identifier}</strong>. Check your inbox!
                  {demoOtp && (
                    <div className="mt-1.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      Code: <span className="font-bold underline tracking-widest">{demoOtp}</span> (or 123456)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] font-mono font-extrabold py-3 rounded-xl border theme-border theme-input theme-text text-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{loading ? 'Verifying OTP Code...' : 'Verify OTP & Continue'}</span>
                </button>

                {/* 3-Minute Countdown Resend Button */}
                <div className="pt-2 text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs theme-muted flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      Resend OTP available in{' '}
                      <span className="font-mono font-bold text-indigo-500">
                        {formatTimer(resendTimer)}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="text-xs font-bold text-indigo-500 hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend Verification OTP Code Now
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Password Authentication Flow */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
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
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
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
              <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
            </button>
          </form>
        )}

        {/* Quick Demo Fill Options */}
        <div className="pt-4 border-t theme-border text-center space-y-2">
          <p className="text-[11px] theme-muted font-medium">Quick Demo Candidate Login:</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('OTP');
                setIdentifier('candidate@camzyjobs.com');
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg border theme-border hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              candidate@camzyjobs.com
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('PASSWORD');
                setEmail('employer@techcorp.com');
                setPassword('password123');
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg border theme-border hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-semibold"
            >
              Employer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
