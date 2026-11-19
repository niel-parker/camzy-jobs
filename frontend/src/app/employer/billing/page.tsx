'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  CreditCard, Check, Zap, Download, Users, Briefcase, RefreshCw, 
  Loader2, Sparkles, FileText, Printer, X, ShieldCheck, ArrowRight,
  Lock, AlertTriangle, QrCode, Building2, CheckCircle2, Calendar, Percent, Info
} from 'lucide-react';

interface CheckoutState {
  isOpen: boolean;
  type: 'PLAN' | 'TOPUP';
  planCode?: string;
  topupType?: string;
  title: string;
  priceMonthly: number;
  priceYearly: number;
  billingCycle: 'monthly' | 'yearly';
  features?: string[];
  quotaSummary?: { activeJobs?: number; resumeDownloads?: number; teamSeats?: number };
}

export default function EmployerBillingPage() {
  const { user, sdk } = useTheme();
  const [subscription, setSubscription] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Interactive Payment Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState<CheckoutState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'invoice'>('card');
  const [cardForm, setCardForm] = useState({
    number: '4242 4242 4242 4242',
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'TechCorp Accounts',
    expiry: '12/28',
    cvv: '888',
  });
  const [upiId, setUpiId] = useState('finance@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [corporatePo, setCorporatePo] = useState('');

  const tenantId = user?.tenantId;

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subData, txnsData, plansData] = await Promise.all([
        sdk.getCurrentSubscription(tenantId).catch(() => null),
        sdk.getBillingTransactions(tenantId).catch(() => []),
        sdk.request<any[]>('/subscriptions/plans').catch(() => sdk.getPackages().catch(() => [])),
      ]);
      if (subData) setSubscription(subData);
      setTransactions(txnsData || []);
      if (Array.isArray(plansData) && plansData.length > 0) {
        setPlans(plansData);
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [sdk, tenantId]);

  const handleOpenPlanCheckout = (p: any) => {
    setCheckoutModal({
      isOpen: true,
      type: 'PLAN',
      planCode: p.code || p.id,
      title: p.name,
      priceMonthly: Number(p.priceMonthly),
      priceYearly: Number(p.priceYearly || p.priceMonthly * 10),
      billingCycle: 'monthly',
      features: p.features || [],
      quotaSummary: {
        activeJobs: p.maxActiveJobs,
        resumeDownloads: p.maxResumeDownloads,
        teamSeats: p.maxTeamSeats,
      },
    });
  };

  const handleOpenTopupCheckout = (topupType: string, title: string, price: number) => {
    setCheckoutModal({
      isOpen: true,
      type: 'TOPUP',
      topupType,
      title,
      priceMonthly: price,
      priceYearly: price,
      billingCycle: 'monthly',
    });
  };

  const handleConfirmPayment = async () => {
    if (!checkoutModal) return;
    setIsProcessing(true);
    let methodLabel = '';
    if (paymentMethod === 'card') {
      const last4 = cardForm.number.replace(/\D/g, '').slice(-4) || '4242';
      methodLabel = `Credit Card (•••• ${last4})`;
    } else if (paymentMethod === 'upi') {
      methodLabel = `UPI (${upiId || 'GPay / PhonePe'})`;
    } else if (paymentMethod === 'netbanking') {
      methodLabel = `Net Banking (${selectedBank})`;
    } else {
      methodLabel = `Corporate PO (${corporatePo || 'DIRECT-INVOICE'})`;
    }

    try {
      if (checkoutModal.type === 'PLAN') {
        const res = await sdk.upgradeSubscriptionPlan(
          checkoutModal.planCode!,
          checkoutModal.billingCycle,
          tenantId,
          methodLabel,
        );
        setNotification({
          type: 'success',
          message: `Plan successfully activated for ${checkoutModal.title}! Invoice ${res.transaction?.invoiceNumber || ''} generated.`,
        });
        if (res.transaction) {
          setSelectedInvoice(res.transaction);
        }
      } else {
        const res = await sdk.purchaseQuotaTopup(
          checkoutModal.topupType!,
          tenantId,
          methodLabel,
        );
        setNotification({
          type: 'success',
          message: `Successfully purchased ${checkoutModal.title}! Invoice ${res.transaction?.invoiceNumber || ''} generated.`,
        });
        if (res.transaction) {
          setSelectedInvoice(res.transaction);
        }
      }
      setCheckoutModal(null);
      await loadBillingData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Payment processing failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const plan = subscription?.plan;
  const quotas = subscription?.quotas;
  const isExpired = Boolean(subscription?.isExpired);
  const isNearExpiry = Boolean(subscription?.isNearExpiry);
  const daysRemaining = subscription?.daysRemaining ?? 30;

  // Use dynamic plans from Admin if available, with robust default fallback
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 'free',
      name: 'Starter Company',
      code: 'FREE',
      priceMonthly: 0,
      priceYearly: 0,
      maxActiveJobs: 2,
      maxResumeDownloads: 0,
      maxTeamSeats: 1,
      features: ['2 Active Job Postings', 'Basic ATS Kanban', 'Email Support'],
    },
    {
      id: 'growth',
      name: 'Growth Employer',
      code: 'GROWTH',
      priceMonthly: 99,
      priceYearly: 79,
      maxActiveJobs: 5,
      maxResumeDownloads: 50,
      maxTeamSeats: 3,
      features: ['5 Active Job Postings', '50 Resume DB Downloads', '3 Team Recruiter Seats', 'Standard ATS Kanban'],
    },
    {
      id: 'pro',
      name: 'Professional Employer',
      code: 'PRO',
      priceMonthly: 199,
      priceYearly: 159,
      maxActiveJobs: 15,
      maxResumeDownloads: 150,
      maxTeamSeats: 5,
      features: ['15 Active Job Postings', '150 Resume DB Downloads', '5 Team Recruiter Seats', 'Applicant Screening Questions', 'Priority Support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      code: 'ENTERPRISE',
      priceMonthly: 499,
      priceYearly: 399,
      maxActiveJobs: 50,
      maxResumeDownloads: 500,
      maxTeamSeats: 15,
      features: ['50 Active Job Postings', '500 Resume DB Downloads', '15 Team Recruiter Seats', 'Dedicated Account Manager'],
    },
  ];

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Monetization & Plans
              </span>
              <span className="text-xs font-semibold theme-muted">Company Billing Center</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2 mt-1">
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
            <span className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Expiry Warning Banner */}
        {isExpired && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm">Subscription Expired</h4>
                <p className="text-xs opacity-90 mt-0.5">
                  Your billing cycle has ended. Job posting and candidate database access are paused. Renew or upgrade now to reactivate instantly.
                </p>
              </div>
            </div>
            {plan && (
              <button
                type="button"
                onClick={() => handleOpenPlanCheckout(plan)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 shadow-md transition-all cursor-pointer"
              >
                Renew {plan.name} Now
              </button>
            )}
          </div>
        )}

        {/* Near Expiry Notice */}
        {isNearExpiry && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Plan Renewal Notice:</strong> Your subscription will renew in <strong>{daysRemaining} days</strong> ({subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : ''}).
              </span>
            </div>
            {plan && (
              <button
                type="button"
                onClick={() => handleOpenPlanCheckout(plan)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer"
              >
                Renew Early
              </button>
            )}
          </div>
        )}

        {/* Current Active Plan Status */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  isExpired 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isExpired ? 'EXPIRED' : `${subscription?.status || 'ACTIVE'} PLAN`}
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
              <span className="text-3xl font-black theme-text">₹{plan?.priceMonthly ?? 199}</span>
              <span className="text-xs theme-muted"> / month</span>
              <p className="text-[11px] theme-muted mt-0.5">
                {isExpired ? (
                  <span className="text-rose-500 font-bold">Expired on {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Past Due'}</span>
                ) : (
                  <span>Billing renewal: <strong>{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Next Month'}</strong> ({daysRemaining} days left)</span>
                )}
              </p>
            </div>
          </div>

          {/* Quotas Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Active Job Quota */}
            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold theme-muted">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-indigo-500" /> Active Job Postings</span>
                <span className="theme-text">{quotas?.activeJobs?.used ?? 0} / {quotas?.activeJobs?.limit ?? 15} Used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${quotas?.activeJobs?.percentUsed ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] theme-muted font-medium">
                {quotas?.activeJobs?.remaining ?? 15} job slots available
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
                <span className="theme-text">{quotas?.teamSeats?.used ?? 1} / {quotas?.teamSeats?.limit ?? 5} Used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${quotas?.teamSeats?.percentUsed ?? 20}%` }}
                />
              </div>
              <p className="text-[11px] theme-muted font-medium">
                {quotas?.teamSeats?.remaining ?? 4} sub-account seats available
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
                <p className="text-2xl font-black theme-text mt-1">₹29 <span className="text-xs font-normal theme-muted">one-time</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Instantly top up 50 resume download credits to candidate sourcing quota.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenTopupCheckout('RESUME_50', '+50 Candidate Resume Downloads', 29)}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" /> Buy +50 Pack
              </button>
            </div>

            {/* +150 Resumes */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  Best Value
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+150 Resume Downloads</h3>
                <p className="text-2xl font-black theme-text mt-1">₹69 <span className="text-xs font-normal theme-muted">one-time</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Bulk pack saving 20% on resume downloads with instant database quota credit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenTopupCheckout('RESUME_150', '+150 Candidate Resume Downloads', 69)}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" /> Buy +150 Pack
              </button>
            </div>

            {/* +5 Job Slots */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                  Job Expansion
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+5 Job Posting Slots</h3>
                <p className="text-2xl font-black theme-text mt-1">₹49 <span className="text-xs font-normal theme-muted">one-time</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Unlock 5 additional concurrent active job openings for this billing cycle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenTopupCheckout('JOBS_5', '+5 Active Job Slots', 49)}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Briefcase className="w-3.5 h-3.5" /> Buy +5 Slots
              </button>
            </div>

            {/* +2 Recruiter Seats */}
            <div className="p-5 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                  Team Seats
                </span>
                <h3 className="text-sm font-black theme-text mt-1.5">+2 Team Seats Add-on</h3>
                <p className="text-2xl font-black theme-text mt-1">₹39 <span className="text-xs font-normal theme-muted">/ month</span></p>
                <p className="text-[11px] theme-muted mt-1 leading-relaxed">
                  Invite 2 more recruiters and hiring managers to your company dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenTopupCheckout('SEATS_2', '+2 Recruiter Team Seats Add-on', 39)}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Users className="w-3.5 h-3.5" /> Add 2 Seats
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Tier Packages (Reflecting Admin Packages in Real Time) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black theme-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" /> Available Subscription Plans
              </h2>
              <p className="text-xs theme-muted">
                Admin-managed packages updated in real time. Choose the plan that fits your recruitment velocity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPlans.map((p) => {
              const isCurrent = (plan?.code && p.code && plan.code === p.code) || (plan?.id && p.id && plan.id === p.id);
              const priceMonthly = Number(p.priceMonthly);
              const priceYearly = Number(p.priceYearly || Math.round(priceMonthly * 0.8));
              
              // Intelligent features list fallback
              const featuresList = (p.features && Array.isArray(p.features) && p.features.length > 0)
                ? p.features
                : [
                    `${p.maxActiveJobs} Active Job Openings`,
                    `${p.maxResumeDownloads} Candidate Resume Downloads`,
                    `${p.maxTeamSeats} Recruiter Team Seats`,
                    'Standard ATS & Kanban Pipeline',
                    'Candidate Profile Search',
                    ...(priceMonthly > 100 ? ['Priority Email & Chat Support'] : []),
                  ];

              return (
                <div
                  key={p.id || p.code}
                  className={`theme-surface border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all relative ${
                    isCurrent
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                      : 'theme-border hover:border-indigo-500/40 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold theme-text text-base truncate">{p.name}</h3>
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black shrink-0">
                          CURRENT
                        </span>
                      ) : p.code === 'PRO' ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black shrink-0">
                          POPULAR
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black theme-text">
                          ₹{priceMonthly}
                        </span>
                        <span className="text-xs font-normal theme-muted">/mo</span>
                      </div>
                      {priceYearly > 0 && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          ₹{priceYearly}/mo billed annually
                        </p>
                      )}
                    </div>

                    <ul className="text-xs theme-muted space-y-2 pt-2 border-t theme-border/60">
                      {featuresList.slice(0, 5).map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    {isCurrent ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPlanCheckout(p)}
                        className="w-full py-2.5 px-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {isExpired ? 'Renew Expired Plan' : 'Renew / Extend Plan'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPlanCheckout(p)}
                        disabled={isProcessing}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                          priceMonthly > (plan?.priceMonthly || 0)
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{priceMonthly > (plan?.priceMonthly || 0) ? 'Upgrade to' : 'Switch to'} {p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
                      <td className="py-3.5 px-4 theme-muted">{txn.paymentMethod || 'Online Payment (Verified)'}</td>
                      <td className="py-3.5 px-4 font-black theme-text">₹{Number(txn.amount).toFixed(2)}</td>
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

      {/* Interactive Payment Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] my-auto flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Secure Payment & Plan Activation</h3>
                  <p className="text-[11px] text-slate-400">256-Bit SSL Encrypted • Instant Quota Provisioning</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Order Summary Card */}
              <div className="p-4 rounded-2xl border theme-border bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                      {checkoutModal.type === 'PLAN' ? 'Subscription Tier' : 'Quota Boost'}
                    </span>
                    <h4 className="text-base font-black theme-text">{checkoutModal.title}</h4>
                  </div>

                  {checkoutModal.type === 'PLAN' && (
                    <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCheckoutModal({ ...checkoutModal, billingCycle: 'monthly' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          checkoutModal.billingCycle === 'monthly'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutModal({ ...checkoutModal, billingCycle: 'yearly' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          checkoutModal.billingCycle === 'yearly'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>Yearly</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                          -20%
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {checkoutModal.quotaSummary && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t theme-border text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border theme-border">
                      <span className="text-[10px] theme-muted block font-bold">Active Jobs</span>
                      <strong className="text-sm font-black theme-text">{checkoutModal.quotaSummary.activeJobs}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border theme-border">
                      <span className="text-[10px] theme-muted block font-bold">Resume Downloads</span>
                      <strong className="text-sm font-black theme-text">{checkoutModal.quotaSummary.resumeDownloads}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border theme-border">
                      <span className="text-[10px] theme-muted block font-bold">Team Seats</span>
                      <strong className="text-sm font-black theme-text">{checkoutModal.quotaSummary.teamSeats}</strong>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t theme-border flex items-center justify-between text-xs">
                  <span className="theme-muted font-bold">Total Amount Payable:</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹{checkoutModal.billingCycle === 'yearly' 
                      ? (checkoutModal.priceYearly * 12).toLocaleString('en-IN') 
                      : checkoutModal.priceMonthly.toLocaleString('en-IN')}
                    <span className="text-xs font-normal theme-muted">
                      {checkoutModal.type === 'PLAN' ? (checkoutModal.billingCycle === 'yearly' ? ' / yr' : ' / mo') : ' one-time'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider theme-text">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black ring-1 ring-indigo-500'
                        : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Card / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'upi'
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black ring-1 ring-indigo-500'
                        : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Instant UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'netbanking'
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black ring-1 ring-indigo-500'
                        : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('invoice')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'invoice'
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black ring-1 ring-indigo-500'
                        : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Direct PO</span>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-800/20 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block font-bold theme-text mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text font-mono font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold theme-text mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardForm.name}
                          onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold theme-text mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold theme-text mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                            placeholder="•••"
                            className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-800/20 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shrink-0">
                        <QrCode className="w-24 h-24 text-slate-900 mx-auto" />
                        <span className="text-[10px] text-slate-600 font-bold mt-1 block">Scan with any UPI App</span>
                      </div>
                      <div className="space-y-2 flex-1 w-full">
                        <label className="block font-bold theme-text">Or Enter Virtual Payment Address (UPI ID)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okaxis"
                          className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text font-mono font-bold"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {['GPay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                            <span key={app} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking Form */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-800/20 space-y-3 animate-in fade-in">
                    <label className="block font-bold theme-text mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text font-bold"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                    <p className="text-[11px] theme-muted">You will be securely routed to your bank's portal for one-time verification.</p>
                  </div>
                )}

                {/* Corporate Invoice Form */}
                {paymentMethod === 'invoice' && (
                  <div className="p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-800/20 space-y-3 animate-in fade-in">
                    <label className="block font-bold theme-text mb-1">Corporate Purchase Order / Memo # (Optional)</label>
                    <input
                      type="text"
                      value={corporatePo}
                      onChange={(e) => setCorporatePo(e.target.value)}
                      placeholder="e.g. PO-CORP-2026-88"
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text font-mono"
                    />
                    <p className="text-[11px] theme-muted">
                      Direct invoice will be dispatched to your company billing email with Net-30 enterprise settlement terms.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{checkoutModal.billingCycle === 'yearly' 
                      ? (checkoutModal.priceYearly * 12).toLocaleString('en-IN') 
                      : checkoutModal.priceMonthly.toLocaleString('en-IN')} & Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] my-auto flex flex-col bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <h3 className="font-extrabold text-sm truncate">Tax Invoice: {selectedInvoice.invoiceNumber}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div id="invoice-printable-content" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-xs">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLED TO</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.tenantName || 'TechCorp Global'}</p>
                  <p className="text-slate-600 text-[11px]">Tenant ID: {selectedInvoice.tenantId || 'tnt-active'}</p>
                  <p className="text-slate-600 text-[11px]">Account Status: Active Enterprise Company</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT DETAILS</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.paymentMethod || 'Online Payment (Verified)'}</p>
                  <p className="text-slate-600 text-[11px]">Currency: {selectedInvoice.currency || 'INR'}</p>
                  <p className="text-slate-600 text-[11px]">Type: {selectedInvoice.type}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
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
                      <td className="py-3 text-right text-slate-600">₹{Number(selectedInvoice.amount).toFixed(2)}</td>
                      <td className="py-3 text-right font-black text-slate-900">₹{Number(selectedInvoice.amount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">₹{Number(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (0%):</span>
                    <span className="font-bold">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>Amount Paid:</span>
                    <span className="text-indigo-600">₹{Number(selectedInvoice.amount).toFixed(2)}</span>
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
