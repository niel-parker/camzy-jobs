'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { CreditCard, Check, Zap, ArrowLeft, Download, Users, Briefcase, RefreshCw } from 'lucide-react';

export default function EmployerBillingPage() {
  const { theme, sdk } = useTheme();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      const res = await sdk.request<{ checkoutUrl: string }>('/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ tenantId: 'tnt-techcorp', planId }),
      });
      if (res.checkoutUrl) {
        window.open(res.checkoutUrl, '_blank');
      }
    } catch (err) {
      console.warn('Checkout error:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Employer Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Company Subscription & Quota Usage</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage billing cycles, active job limits, and resume database download quotas</p>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className="glass-card rounded-3xl p-8 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold">
              Current Plan
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Professional Employer Plan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Renews automatically on November 3, 2026 ($199/month)</p>
          </div>

          <button
            onClick={() => handleUpgrade('enterprise')}
            disabled={isUpgrading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg theme-transition hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {isUpgrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Upgrade to Enterprise ($499/mo)
          </button>
        </div>

        {/* Quotas Progress Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Active Job Postings</span>
              <span className="font-bold text-slate-900 dark:text-white">4 / 15 Used</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '26%' }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Resume DB Downloads</span>
              <span className="font-bold text-slate-900 dark:text-white">42 / 150 Used</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28%' }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Recruiter Seats</span>
              <span className="font-bold text-slate-900 dark:text-white">2 / 5 Used</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
