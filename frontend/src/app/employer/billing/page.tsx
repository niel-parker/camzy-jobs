'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  CreditCard, Check, Zap, Download, Users, Briefcase, RefreshCw, 
  Loader2, Sparkles, FileText, Printer, X, ShieldCheck, ArrowRight 
} from 'lucide-react';

export default function EmployerBillingPage() {
  const { user, sdk } = useTheme();
  const [subscription, setSubscription] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const tenantId = user?.tenantId;

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subData, txnsData] = await Promise.all([
        sdk.getCurrentSubscription(tenantId).catch(() => null),
        sdk.getBillingTransactions(tenantId).catch(() => []),
      ]);
      if (subData) setSubscription(subData);
      setTransactions(txnsData);
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [sdk, tenantId]);

  const handleUpgradePlan = async (planCode: string) => {
    setIsProcessing(true);
    try {
      const res = await sdk.upgradeSubscriptionPlan(planCode, 'monthly', tenantId);
      setNotification({
        type: 'success',
        message: `Plan successfully upgraded to ${planCode}! Invoice ${res.transaction?.invoiceNumber || ''} generated.`,
      });
      await loadBillingData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to upgrade plan. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTopupQuota = async (topupType: string, label: string) => {
    setIsProcessing(true);
    try {
      const res = await sdk.purchaseQuotaTopup(topupType, tenantId);
      setNotification({
        type: 'success',
        message: `Successfully purchased ${label}! Invoice ${res.transaction?.invoiceNumber || ''} generated.`,
      });
      await loadBillingData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to purchase quota pack.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const plan = subscription?.plan;
  const quotas = subscription?.quotas;

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-500" /> Company Subscription & Billing
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Manage subscription plans, live quota usage, quota top-ups, and transaction invoices.
            </p>
          </div>

          <button
            onClick={loadBillingData}
            disabled={loading}
            className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Quotas & Invoices
          </button>
        </div>

        {/* Status notification toast */}
        {notification && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current Active Plan Status */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {subscription?.status || 'ACTIVE'} PLAN
                </span>
                <span className="text-xs theme-muted">
                  Company: <strong className="theme-text">{subscription?.tenantName || user?.tenantName || 'TechCorp Global'}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-black theme-text mt-1.5">
                {plan?.name || 'Professional Employer'}
              </h2>
            </div>
            <div className="sm:text-right">
              <span className="text-3xl font-black theme-text">${plan?.priceMonthly || 199}</span>
              <span className="text-xs theme-muted"> / month</span>
              <p className="text-[11px] theme-muted mt-0.5">
                Next billing renewal: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Next Month'}
              </p>
            </div>
          </div>

          {/* Quotas Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Active Job Quota */}
            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold theme-muted">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-indigo-500" /> Active Job Postings</span>
                <span className="theme-text">{quotas?.activeJobs?.used ?? 2} / {quotas?.activeJobs?.limit ?? 15} Used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${quotas?.activeJobs?.percentUsed ?? 13}%` }}
                />
              </div>
              <p className="text-[11px] theme-muted font-medium">
                {quotas?.activeJobs?.remaining ?? 13} job slots available
              </p>
            </div>

            {/* Resume Downloads */}
            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold theme-muted">
                <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-emerald-500" /> Resume DB Downloads</span>
                <span className="theme-text">{quotas?.resumeDownloads?.used ?? 0} / {quotas?.resumeDownloads?.limit ?? 150} Used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${quotas?.resumeDownloads?.percentUsed ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] theme-muted font-medium">
                {quotas?.resumeDownloads?.remaining ?? 150} candidate resume downloads left
              </p>
            </div>

            {/* Recruiter Seats */}
            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold theme-muted">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-500" /> Recruiter Team Seats</span>
                <span className="theme-text">{quotas?.teamSeats?.used ?? 2} / {quotas?.teamSeats?.limit ?? 5} Used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${quotas?.teamSeats?.percentUsed ?? 40}%` }}
                />
              </div>
              <p className="text-[11px] theme-muted font-medium">
                {quotas?.teamSeats?.remaining ?? 3} sub-account seats available
              </p>
            </div>
          </div>
        </div>

        {/* Quota Top-Up Packs (Instant Purchase) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black theme-text flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Quota Top-Up Add-ons
              </h2>
              <p className="text-xs theme-muted">Need extra candidate resume downloads or job posting slots without upgrading your full plan?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* +50 Resumes */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  Resume Boost
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+50 Resume Downloads</h3>
                <p className="text-2xl font-black theme-text mt-1">$29 <span className="text-xs font-normal theme-muted">one-time</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Instantly top up 50 resume download credits to candidate sourcing quota.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTopupQuota('RESUME_50', '+50 Resume Downloads')}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} Buy +50 Pack
              </button>
            </div>

            {/* +150 Resumes */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  Best Value
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+150 Resume Downloads</h3>
                <p className="text-2xl font-black theme-text mt-1">$69 <span className="text-xs font-normal theme-muted">one-time</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Bulk pack saving 20% on resume downloads with instant database quota credit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTopupQuota('RESUME_150', '+150 Resume Downloads')}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} Buy +150 Pack
              </button>
            </div>

            {/* +5 Job Slots */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                  Job Expansion
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+5 Job Posting Slots</h3>
                <p className="text-2xl font-black theme-text mt-1">$49 <span className="text-xs font-normal theme-muted">one-time</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Unlock 5 additional concurrent active job openings for this billing cycle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTopupQuota('JOBS_5', '+5 Job Slots')}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />} Buy +5 Slots
              </button>
            </div>

            {/* +2 Recruiter Seats */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                  Team Seats
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+2 Team Seats Add-on</h3>
                <p className="text-2xl font-black theme-text mt-1">$39 <span className="text-xs font-normal theme-muted">/ month</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Invite 2 more recruiters and hiring managers to your company dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTopupQuota('SEATS_2', '+2 Team Seats')}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-3.5 h-3.5" />} Add 2 Seats
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Tier Packages */}
        <div className="space-y-4">
          <h2 className="text-lg font-black theme-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Available Subscription Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GROWTH */}
            <div className={`theme-surface border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 ${
              plan?.code === 'GROWTH' ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'theme-border'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold theme-text text-lg">Growth Plan</h3>
                  {plan?.code === 'GROWTH' && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black theme-text">$99 <span className="text-xs font-normal theme-muted">/mo</span></p>
                <ul className="text-xs theme-muted space-y-2.5 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 5 Active Job Postings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 50 Resume DB Downloads</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 3 Team Recruiter Seats</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Candidate Pipeline Kanban</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleUpgradePlan('GROWTH')}
                disabled={isProcessing || plan?.code === 'GROWTH'}
                className="w-full py-2.5 px-4 rounded-xl border theme-border font-black text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {plan?.code === 'GROWTH' ? 'Current Plan' : 'Switch to Growth'}
              </button>
            </div>

            {/* PRO */}
            <div className={`theme-surface border rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4 relative ${
              plan?.code === 'PRO' ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'theme-border'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold theme-text text-lg">Professional Plan</h3>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-3xl font-black theme-text">$199 <span className="text-xs font-normal theme-muted">/mo</span></p>
                <ul className="text-xs theme-muted space-y-2.5 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 15 Active Job Postings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 150 Resume DB Downloads</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 5 Team Recruiter Seats</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Applicant Screening Questions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Priority Support</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleUpgradePlan('PRO')}
                disabled={isProcessing || plan?.code === 'PRO'}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {plan?.code === 'PRO' ? 'Current Plan' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* ENTERPRISE */}
            <div className={`theme-surface border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 ${
              plan?.code === 'ENTERPRISE' ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'theme-border'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold theme-text text-lg">Enterprise Scale</h3>
                  {plan?.code === 'ENTERPRISE' && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black theme-text">$499 <span className="text-xs font-normal theme-muted">/mo</span></p>
                <ul className="text-xs theme-muted space-y-2.5 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 50 Active Job Postings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 500 Resume DB Downloads</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 15 Team Recruiter Seats</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Dedicated Account Manager</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleUpgradePlan('ENTERPRISE')}
                disabled={isProcessing || plan?.code === 'ENTERPRISE'}
                className="w-full py-2.5 px-4 rounded-xl border theme-border font-black text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {plan?.code === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions & Invoices History Table */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b theme-border pb-4">
            <div>
              <h3 className="text-base font-black theme-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Billing Transactions & Invoices
              </h3>
              <p className="text-xs theme-muted">
                Complete audit trail of all subscription charges, quota top-ups, and downloadable tax receipts.
              </p>
            </div>
            <span className="text-xs font-bold theme-muted">
              {transactions.length} Total Invoices
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading invoice transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center theme-muted text-xs">
              No transactions recorded yet for this company account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b theme-border text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold theme-text">{txn.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold theme-text">{txn.description}</td>
                      <td className="py-3.5 px-4 theme-muted">
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          txn.type === 'SUBSCRIPTION' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                          txn.type === 'QUOTA_TOPUP' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {txn.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 theme-muted">{txn.paymentMethod || 'Stripe Card (•••• 4242)'}</td>
                      <td className="py-3.5 px-4 font-black theme-text">${Number(txn.amount).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                          {txn.status || 'PAID'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(txn)}
                          className="px-2.5 py-1 rounded-lg border theme-border font-bold text-[11px] theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm">Tax Invoice: {selectedInvoice.invoiceNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div id="invoice-printable-content" className="p-8 overflow-y-auto space-y-6 text-xs">
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Camzy Jobs Technologies</h2>
                  <p className="text-slate-500 text-[11px] mt-1">Enterprise Multi-Tenant Recruitment Platform</p>
                  <p className="text-slate-500 text-[11px]">support@camzyjobs.com • https://jobs.camzytech.com</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wider uppercase border border-emerald-300">
                    PAID IN FULL
                  </span>
                  <p className="font-mono font-bold text-slate-800 mt-2 text-sm">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-slate-500 text-[11px]">
                    Date: {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLED TO</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.tenantName || 'TechCorp Global'}</p>
                  <p className="text-slate-600 text-[11px]">Tenant ID: {selectedInvoice.tenantId || 'tnt-active'}</p>
                  <p className="text-slate-600 text-[11px]">Account Status: Active Enterprise Company</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT DETAILS</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.paymentMethod || 'Stripe Card'}</p>
                  <p className="text-slate-600 text-[11px]">Currency: {selectedInvoice.currency || 'USD'}</p>
                  <p className="text-slate-600 text-[11px]">Type: {selectedInvoice.type}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b border-slate-200">
                  <tr>
                    <td className="py-3 font-bold text-slate-900">
                      {selectedInvoice.description}
                      <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                        Active quota provisions applied automatically to platform database.
                      </p>
                    </td>
                    <td className="py-3 text-center text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600">${Number(selectedInvoice.amount).toFixed(2)}</td>
                    <td className="py-3 text-right font-black text-slate-900">${Number(selectedInvoice.amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">${Number(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (0%):</span>
                    <span className="font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>Amount Paid:</span>
                    <span className="text-indigo-600">${Number(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  This receipt is digitally verified by Camzy Jobs Enterprise Monetization Service. All quota allocations have been provisioned immediately.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
