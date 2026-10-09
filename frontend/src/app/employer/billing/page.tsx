'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { CreditCard, Check, Zap, Download, Users, Briefcase, RefreshCw, Loader2 } from 'lucide-react';

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
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight theme-text flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-500" /> Company Subscription & Billing
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Manage billing cycles, active job posting limits, and candidate resume download quotas.
            </p>
          </div>
        </div>

        {/* Current Active Plan Status */}
        <div className="theme-surface border theme-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-4">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE PLAN
              </span>
              <h2 className="text-xl font-black theme-text mt-1">PRO Employer Tier</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black theme-text">$199</span>
              <span className="text-xs theme-muted"> / month</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2 text-xs theme-muted mb-1">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Active Job Quota</span>
              </div>
              <p className="text-lg font-black theme-text">15 Positions</p>
            </div>

            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2 text-xs theme-muted mb-1">
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Resume Downloads</span>
              </div>
              <p className="text-lg font-black theme-text">150 Candidates/mo</p>
            </div>

            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2 text-xs theme-muted mb-1">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Team Recruiter Seats</span>
              </div>
              <p className="text-lg font-black theme-text">5 Recruiter Seats</p>
            </div>
          </div>
        </div>

        {/* Upgrade Plan Options */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold theme-text">Available Subscription Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GROWTH */}
            <div className="theme-surface border theme-border rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-extrabold theme-text text-lg">Growth Plan</h3>
                <p className="text-2xl font-black theme-text">$49 <span className="text-xs font-normal theme-muted">/mo</span></p>
                <ul className="text-xs theme-muted space-y-2 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 10 Active Job Postings</li>
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 50 Resume Downloads</li>
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 2 Team Recruiter Seats</li>
                </ul>
              </div>
              <button
                onClick={() => handleUpgrade('GROWTH')}
                disabled={isUpgrading}
                className="w-full py-2.5 rounded-lg border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Switch to Growth
              </button>
            </div>

            {/* PRO */}
            <div className="theme-surface border-2 border-indigo-500 rounded-xl p-6 shadow-md flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                Current Plan
              </span>
              <div className="space-y-2">
                <h3 className="font-extrabold theme-text text-lg">PRO Plan</h3>
                <p className="text-2xl font-black theme-text">$199 <span className="text-xs font-normal theme-muted">/mo</span></p>
                <ul className="text-xs theme-muted space-y-2 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 25 Active Job Postings</li>
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 150 Resume Downloads</li>
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 5 Team Recruiter Seats</li>
                </ul>
              </div>
              <button
                onClick={() => handleUpgrade('PRO')}
                disabled={isUpgrading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Renew via Stripe
              </button>
            </div>

            {/* ENTERPRISE */}
            <div className="theme-surface border theme-border rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-extrabold theme-text text-lg">Enterprise Plan</h3>
                <p className="text-2xl font-black theme-text">$499 <span className="text-xs font-normal theme-muted">/mo</span></p>
                <ul className="text-xs theme-muted space-y-2 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 100 Active Job Postings</li>
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Resume Downloads</li>
                  <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 20 Team Recruiter Seats</li>
                </ul>
              </div>
              <button
                onClick={() => handleUpgrade('ENTERPRISE')}
                disabled={isUpgrading}
                className="w-full py-2.5 rounded-lg border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
