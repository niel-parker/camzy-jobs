'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { 
  Building2, DollarSign, Briefcase, Users, ShieldCheck, ShieldAlert, 
  CheckCircle2, XCircle, TrendingUp, Search, Sparkles, FileText, ArrowRight, 
  Eye, Download, RefreshCw, Printer, X, CreditCard, Loader2 
} from 'lucide-react';

interface PendingOnboardingCompany {
  id: string;
  name: string;
  industry: string;
  taxId: string;
  website: string;
  appliedDate: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  plan: string;
}

interface PendingCandidate {
  id: string;
  name: string;
  email: string;
  headline: string;
  experienceLevel: string;
  appliedDate: string;
  isVerified: boolean;
}

const INITIAL_PENDING_COMPANIES: PendingOnboardingCompany[] = [
  {
    id: 'tnt-nexus',
    name: 'Nexus Analytics Corp',
    industry: 'Data & Analytics',
    taxId: 'US-889911223',
    website: 'https://nexusanalytics.io',
    appliedDate: 'Oct 05, 2026',
    status: 'PENDING_VERIFICATION',
    plan: 'Starter Company',
  },
  {
    id: 'tnt-quantum',
    name: 'Quantum HealthTech Inc',
    industry: 'Healthcare Tech',
    taxId: 'US-445566778',
    website: 'https://quantumhealth.tech',
    appliedDate: 'Oct 04, 2026',
    status: 'PENDING_VERIFICATION',
    plan: 'Professional Growth',
  },
];

const INITIAL_PENDING_CANDIDATES: PendingCandidate[] = [
  {
    id: 'cand-101',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    headline: 'Senior Full Stack Engineer (React, NestJS)',
    experienceLevel: 'Senior Level',
    appliedDate: 'Oct 05, 2026',
    isVerified: true,
  },
  {
    id: 'cand-102',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    headline: 'Lead AI Engineer (PyTorch, LLMs)',
    experienceLevel: 'Executive Level',
    appliedDate: 'Oct 04, 2026',
    isVerified: false,
  },
];

export default function SuperAdminDashboardPage() {
  const { theme, sdk } = useTheme();

  const [metrics, setMetrics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTxn, setSearchTxn] = useState('');

  const [pendingCompanies, setPendingCompanies] = useState<PendingOnboardingCompany[]>(INITIAL_PENDING_COMPANIES);
  const [pendingCandidates, setPendingCandidates] = useState<PendingCandidate[]>(INITIAL_PENDING_CANDIDATES);
  const [activeTab, setActiveTab] = useState<'onboarding' | 'candidates' | 'transactions'>('transactions');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [m, txns] = await Promise.all([
        sdk.getDashboardMetrics().catch(() => null),
        sdk.getAdminTransactions().catch(() => []),
      ]);
      if (m) setMetrics(m);
      setTransactions(txns);
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [sdk]);

  const approveCompany = (id: string) => {
    setPendingCompanies(
      pendingCompanies.map((c) => (c.id === id ? { ...c, status: 'VERIFIED' } : c))
    );
  };

  const rejectCompany = (id: string) => {
    setPendingCompanies(
      pendingCompanies.map((c) => (c.id === id ? { ...c, status: 'REJECTED' } : c))
    );
  };

  const verifyCandidate = (id: string) => {
    setPendingCandidates(
      pendingCandidates.map((c) => (c.id === id ? { ...c, isVerified: true } : c))
    );
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTxn.trim()) return true;
    const q = searchTxn.toLowerCase();
    return (
      t.invoiceNumber?.toLowerCase().includes(q) ||
      t.tenantName?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black theme-text tracking-tight">Super Admin Control Center</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold uppercase border border-amber-500/30">
                Enterprise Governance
              </span>
            </div>
            <p className="text-xs theme-muted mt-1">
              Live platform metrics, company quota consumption, billing transactions audit, and onboarding verification.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              href="/admin/tenants"
              className="px-4 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Tenant Directory
            </Link>
            <Link
              href="/admin/settings"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Global App Config
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Platform Total Revenue */}
          <div className="p-5 rounded-2xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Platform Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ${Number(metrics?.totalRevenue || 2773).toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> MRR: ${metrics?.monthlyRevenue || 398}/mo
            </p>
          </div>

          {/* Registered Companies */}
          <div className="p-5 rounded-2xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-indigo-500" /> Registered Companies
            </span>
            <div className="text-2xl sm:text-3xl font-black theme-text">
              {metrics?.totalCompanies ?? 4}
            </div>
            <p className="text-[11px] theme-muted font-medium">
              {metrics?.activeSubscriptions ?? 2} active subscriptions
            </p>
          </div>

          {/* Active Job Postings */}
          <div className="p-5 rounded-2xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-amber-500" /> Active Platform Jobs
            </span>
            <div className="text-2xl sm:text-3xl font-black theme-text">
              {metrics?.totalJobs ?? 7}
            </div>
            <p className="text-[11px] theme-muted font-medium">
              Across all company employers
            </p>
          </div>

          {/* Active Candidates */}
          <div className="p-5 rounded-2xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-purple-500" /> Talent & Candidates
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {metrics?.totalCandidates ?? 4}
            </div>
            <p className="text-[11px] theme-muted font-medium">
              {metrics?.totalApplications ?? 2} job applications placed
            </p>
          </div>
        </div>

        {/* Second Row: Quota Consumption Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border theme-border theme-surface flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black theme-muted uppercase tracking-wider">Total Candidate Resume Downloads</h4>
                <p className="text-xl font-black theme-text mt-0.5">{metrics?.totalResumeDownloads ?? 1} Consumed</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Tracked Live
            </span>
          </div>

          <div className="p-5 rounded-2xl border theme-border theme-surface flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black theme-muted uppercase tracking-wider">Total Recruiter Team Seats Provisioned</h4>
                <p className="text-xl font-black theme-text mt-0.5">{metrics?.totalTeamSeats ?? 2} Active Recruiter Users</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Multi-Tenant
            </span>
          </div>
        </div>

        {/* Section with Tabs */}
        <div className="p-6 rounded-2xl theme-surface border theme-border space-y-6 shadow-sm">
          {/* Section Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base font-black theme-text">Governance & Financial Records</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'transactions'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'theme-surface border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Company Invoices & Transactions ({transactions.length})
              </button>

              <button
                onClick={() => setActiveTab('onboarding')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'onboarding'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'theme-surface border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Company Verification ({pendingCompanies.filter(c => c.status === 'PENDING_VERIFICATION').length})
              </button>

              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'candidates'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'theme-surface border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Candidate Verification ({pendingCandidates.filter(c => !c.isVerified).length})
              </button>
            </div>
          </div>

          {/* TAB: Global Transactions & Invoices Audit Table */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTxn}
                    onChange={(e) => setSearchTxn(e.target.value)}
                    placeholder="Search by invoice number, company name, or plan..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border theme-border theme-surface theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-xs theme-muted font-bold">
                  Showing {filteredTransactions.length} of {transactions.length} invoices
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Loading platform billing transactions...</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 text-center theme-muted text-xs">
                  No transactions match your search filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b theme-border text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {filteredTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold theme-text">{txn.invoiceNumber}</td>
                          <td className="py-3.5 px-4 font-extrabold theme-text">{txn.tenantName || 'TechCorp Global'}</td>
                          <td className="py-3.5 px-4 theme-text font-medium">{txn.description}</td>
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
                          <td className="py-3.5 px-4 font-black theme-text">${Number(txn.amount).toFixed(2)}</td>
                          <td className="py-3.5 px-4 theme-muted text-[11px]">{txn.paymentMethod || 'Stripe Card (•••• 4242)'}</td>
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
                              <FileText className="w-3.5 h-3.5 text-indigo-500" /> View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: Company Onboarding Verification Queue */}
          {activeTab === 'onboarding' && (
            <div className="space-y-4">
              {pendingCompanies.length === 0 ? (
                <div className="text-center py-10 theme-muted text-sm">
                  No company onboarding verification requests pending.
                </div>
              ) : (
                pendingCompanies.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-xl border theme-border theme-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold theme-text">{c.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                          {c.plan}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs theme-muted">
                        <span>Industry: <strong className="theme-text">{c.industry}</strong></span>
                        <span>•</span>
                        <span>Tax ID: <strong className="font-mono text-indigo-500">{c.taxId}</strong></span>
                        <span>•</span>
                        <span>Applied {c.appliedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {c.status === 'PENDING_VERIFICATION' ? (
                        <>
                          <button
                            onClick={() => approveCompany(c.id)}
                            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify & Approve</span>
                          </button>
                          <button
                            onClick={() => rejectCompany(c.id)}
                            className="px-3.5 py-2 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center space-x-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            c.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Candidate Verification Queue */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              {pendingCandidates.length === 0 ? (
                <div className="text-center py-10 theme-muted text-sm">
                  No candidate identity verification items pending.
                </div>
              ) : (
                pendingCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-5 rounded-xl border theme-border theme-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold theme-text">{cand.name}</h3>
                        <span className="text-xs theme-muted">({cand.email})</span>
                      </div>
                      <p className="text-xs font-medium text-indigo-500">{cand.headline}</p>
                      <div className="flex items-center space-x-3 text-xs theme-muted">
                        <span>Level: <strong className="theme-text">{cand.experienceLevel}</strong></span>
                        <span>•</span>
                        <span>Registered {cand.appliedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!cand.isVerified ? (
                        <button
                          onClick={() => verifyCandidate(cand.id)}
                          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify Candidate Profile</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          VERIFIED CANDIDATE
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm">Invoice Audit: {selectedInvoice.invoiceNumber}</h3>
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

            <div className="p-8 overflow-y-auto space-y-6 text-xs">
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Camzy Jobs Technologies</h2>
                  <p className="text-slate-500 text-[11px] mt-1">Enterprise Multi-Tenant Recruitment Platform</p>
                  <p className="text-slate-500 text-[11px]">billing@camzyjobs.com • https://jobs.camzytech.com</p>
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

              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CLIENT COMPANY</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.tenantName || 'TechCorp Global'}</p>
                  <p className="text-slate-600 text-[11px]">Tenant ID: {selectedInvoice.tenantId || 'tnt-active'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TRANSACTION TYPE</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedInvoice.type}</p>
                  <p className="text-slate-600 text-[11px]">Gateway: {selectedInvoice.paymentMethod || 'Stripe Corporate'}</p>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Price</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b border-slate-200">
                  <tr>
                    <td className="py-3 font-bold text-slate-900">{selectedInvoice.description}</td>
                    <td className="py-3 text-center text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600">${Number(selectedInvoice.amount).toFixed(2)}</td>
                    <td className="py-3 text-right font-black text-slate-900">${Number(selectedInvoice.amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

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
                    <span>Total Paid:</span>
                    <span className="text-indigo-600">${Number(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
