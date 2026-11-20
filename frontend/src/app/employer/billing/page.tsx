'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  CreditCard, Check, Zap, Download, Users, Briefcase, RefreshCw, 
  Loader2, Sparkles, FileText, Printer, X, ShieldCheck, ArrowRight,
  Lock, AlertTriangle, Building2, CheckCircle2, Calendar, ExternalLink
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
  const [isVerifyingStripe, setIsVerifyingStripe] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Interactive Payment Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState<CheckoutState | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const effectiveTenantId = user?.tenantId || subscription?.tenantId || '895c2926-0596-4115-a3e5-03a9d8fe042d';

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subData, txnsData, plansData] = await Promise.all([
        sdk.getCurrentSubscription(effectiveTenantId).catch(() => null),
        sdk.getBillingTransactions(effectiveTenantId).catch(() => []),
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
  }, [sdk, effectiveTenantId]);

  // Handle Stripe Redirect Return (?session_id=cs_test_...&success=true)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const isSuccess = params.get('success');
    const isCanceled = params.get('canceled');

    if (sessionId && isSuccess === 'true') {
      setIsVerifyingStripe(true);
      sdk.verifyStripeSession(sessionId)
        .then((res: any) => {
          if (res?.success) {
            setNotification({
              type: 'success',
              message: '🎉 Stripe Payment Succeeded! Your subscription plan has been activated.',
            });
            if (res.transaction) setSelectedInvoice(res.transaction);
            loadBillingData();
          } else {
            setNotification({
              type: 'error',
              message: res?.message || 'Stripe payment verification pending. Please check again in a moment.',
            });
          }
        })
        .catch((err: any) => {
          setNotification({
            type: 'error',
            message: err?.message || 'Failed to verify Stripe payment session.',
          });
        })
        .finally(() => {
          setIsVerifyingStripe(false);
          // Clean query parameters from browser URL
          window.history.replaceState({}, '', window.location.pathname);
        });
    } else if (isCanceled === 'true') {
      setNotification({
        type: 'error',
        message: 'Stripe checkout was canceled. No charges were made.',
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [sdk]);

  // Direct Stripe Hosted Checkout Initiator (Instant 1-Click Redirect)
  const handleInitiateStripeCheckout = async (params: {
    planCodeOrId?: string;
    billingCycle?: 'monthly' | 'yearly';
    topupType?: string;
    title?: string;
    price?: number;
  }) => {
    // If selecting a completely Free plan, activate directly without Stripe
    if (params.price === 0 && params.planCodeOrId) {
      setIsProcessing(true);
      try {
        const res = await sdk.upgradeSubscriptionPlan(
          params.planCodeOrId,
          params.billingCycle || 'monthly',
          effectiveTenantId,
          'Free Starter Plan',
        );
        setNotification({
          type: 'success',
          message: 'Free Starter Plan activated successfully!',
        });
        if (res.transaction) setSelectedInvoice(res.transaction);
        setCheckoutModal(null);
        await loadBillingData();
      } catch (err: any) {
        setNotification({
          type: 'error',
          message: err?.message || 'Failed to activate free plan.',
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const res = await sdk.createStripeCheckoutSession({
        tenantId: effectiveTenantId,
        planCodeOrId: params.planCodeOrId,
        billingCycle: params.billingCycle || billingCycle,
        topupType: params.topupType,
        successUrl: `${origin}/employer/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/employer/billing?canceled=true`,
      });

      if (res?.checkoutUrl) {
        // Instant top-level redirect to official Stripe hosted checkout
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error('No Stripe Checkout URL received from payment service');
      }
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to initialize Stripe checkout. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  const handleOpenPlanCheckout = (p: any) => {
    setCheckoutModal({
      isOpen: true,
      type: 'PLAN',
      planCode: p.code || p.id,
      title: p.name,
      priceMonthly: Number(p.priceMonthly),
      priceYearly: Number(p.priceYearly || p.priceMonthly * 10),
      billingCycle: billingCycle,
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
                Stripe Payments & Monetization
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

        {/* Stripe Verification Loader Overlay */}
        {isVerifyingStripe && (
          <div className="p-4 rounded-2xl bg-indigo-600 text-white flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <div>
                <p className="font-extrabold text-sm">Verifying Stripe Payment Session...</p>
                <p className="text-xs text-indigo-100">Synchronizing subscription quotas and generating paid invoice.</p>
              </div>
            </div>
          </div>
        )}

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
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Renew with Stripe</span>
                <ArrowRight className="w-3.5 h-3.5" />
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

        {/* Quota Top-Up Packs (Instant Purchase with Stripe) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black theme-text flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Quota Top-Up Add-ons
              </h2>
              <p className="text-xs theme-muted">Instant candidate resume downloads or job posting slots powered by Stripe Checkout.</p>
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
                onClick={() => handleInitiateStripeCheckout({
                  topupType: 'RESUME_50',
                  title: '+50 Candidate Resume Downloads',
                  price: 29,
                })}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5249f3] text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5" /> Buy via Stripe (₹29)
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
                onClick={() => handleInitiateStripeCheckout({
                  topupType: 'RESUME_150',
                  title: '+150 Candidate Resume Downloads',
                  price: 69,
                })}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5249f3] text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5" /> Buy via Stripe (₹69)
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
                onClick={() => handleInitiateStripeCheckout({
                  topupType: 'JOBS_5',
                  title: '+5 Active Job Slots',
                  price: 49,
                })}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5249f3] text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Briefcase className="w-3.5 h-3.5" /> Buy via Stripe (₹49)
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
                onClick={() => handleInitiateStripeCheckout({
                  topupType: 'SEATS_2',
                  title: '+2 Recruiter Team Seats Add-on',
                  price: 39,
                })}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5249f3] text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-3.5 h-3.5" /> Add via Stripe (₹39)
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Tier Packages (Reflecting Admin Packages in Real Time) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black theme-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" /> Available Subscription Plans
              </h2>
              <p className="text-xs theme-muted">
                Admin-managed packages updated in real time. Pay securely via Stripe hosted checkout.
              </p>
            </div>

            {/* Monthly / Yearly Billing Cycle Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border theme-border self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPlans.map((p) => {
              const isCurrent = (plan?.code && p.code && plan.code === p.code) || (plan?.id && p.id && plan.id === p.id);
              const priceMonthly = Number(p.priceMonthly);
              const priceYearly = Number(p.priceYearly || Math.round(priceMonthly * 0.8));
              const effectivePrice = billingCycle === 'yearly' ? priceYearly : priceMonthly;
              
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
                          ₹{effectivePrice}
                        </span>
                        <span className="text-xs font-normal theme-muted">/mo</span>
                      </div>
                      {billingCycle === 'yearly' && priceYearly > 0 ? (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          ₹{(priceYearly * 12).toLocaleString('en-IN')} billed annually
                        </p>
                      ) : priceMonthly > 0 ? (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Billed monthly
                        </p>
                      ) : null}
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
                        onClick={() => handleInitiateStripeCheckout({
                          planCodeOrId: p.code || p.id,
                          billingCycle,
                          title: p.name,
                          price: effectivePrice,
                        })}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-4 rounded-xl border border-[#635BFF]/40 bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {isExpired ? 'Renew with Stripe' : 'Renew / Extend via Stripe'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInitiateStripeCheckout({
                          planCodeOrId: p.code || p.id,
                          billingCycle,
                          title: p.name,
                          price: effectivePrice,
                        })}
                        disabled={isProcessing}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                          priceMonthly > (plan?.priceMonthly || 0)
                            ? 'bg-[#635BFF] hover:bg-[#5249f3] text-white shadow-[#635BFF]/20 shadow-md'
                            : 'border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{priceMonthly > (plan?.priceMonthly || 0) ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}</span>
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
                Complete audit trail of all Stripe subscription charges, quota top-ups, and downloadable tax receipts.
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
                      <td className="py-3.5 px-4 theme-muted">{txn.paymentMethod || 'Stripe Card (Verified)'}</td>
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

      {/* Stripe Payment Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] my-auto flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <span>Stripe Secure Payment & Plan Activation</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#635BFF] text-white text-[9px] font-black tracking-wider uppercase">
                      Stripe Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">256-Bit SSL Encrypted • PCI-DSS Level 1 Certified • Instant Activation</p>
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
                      {checkoutModal.type === 'PLAN' ? 'Selected Subscription Tier' : 'Selected Quota Add-on'}
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

              {/* Stripe Payment Gateway (Sole Official Payment Method) */}
              <div className="p-5 rounded-2xl border-2 border-[#635BFF]/30 bg-[#635BFF]/5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#635BFF] text-white shadow-md">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-[#635BFF] flex items-center gap-2">
                        <span>Official Stripe Hosted Checkout</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#635BFF] text-white text-[9px] font-black tracking-wider uppercase">
                          PCI-DSS Level 1
                        </span>
                      </h5>
                      <p className="text-xs theme-muted mt-0.5 leading-relaxed">
                        Instant activation upon payment completion. Accepts all major debit/credit cards, Netbanking, UPI, Apple Pay, and Google Pay with 3D Secure verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#635BFF]/20 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border theme-border shadow-2xs">Credit & Debit Cards</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border theme-border shadow-2xs">Visa / Mastercard / Amex / RuPay</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border theme-border shadow-2xs">Google Pay / Apple Pay</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border theme-border shadow-2xs">Instant Quota Sync</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleInitiateStripeCheckout({
                  planCodeOrId: checkoutModal.planCode,
                  billingCycle: checkoutModal.billingCycle,
                  topupType: checkoutModal.topupType,
                  title: checkoutModal.title,
                  price: checkoutModal.billingCycle === 'yearly' ? checkoutModal.priceYearly : checkoutModal.priceMonthly,
                })}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249f3] disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-[#635BFF]/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Stripe Checkout (₹{checkoutModal.billingCycle === 'yearly' 
                      ? (checkoutModal.priceYearly * 12).toLocaleString('en-IN') 
                      : checkoutModal.priceMonthly.toLocaleString('en-IN')})</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Stripe Redirection Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in">
          <div className="p-4 rounded-3xl bg-[#635BFF] text-white shadow-2xl mb-4 animate-pulse">
            <Lock className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Connecting to Stripe Secure Checkout...</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            Redirecting you to Stripe&apos;s encrypted payment checkout page. Please do not close or refresh this tab.
          </p>
          <div className="flex items-center gap-2 mt-5 text-xs text-indigo-200">
            <Loader2 className="w-4 h-4 animate-spin text-[#635BFF]" />
            <span>Redirecting to checkout.stripe.com...</span>
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
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.paymentMethod || 'Stripe Card (Verified)'}</p>
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
