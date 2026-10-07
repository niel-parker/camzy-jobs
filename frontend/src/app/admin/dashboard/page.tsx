'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Building2, DollarSign, Briefcase, Users, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, TrendingUp, Search, Sparkles, FileText, ArrowRight, Eye } from 'lucide-react';

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
  const { theme } = useTheme();

  const [pendingCompanies, setPendingCompanies] = useState<PendingOnboardingCompany[]>(INITIAL_PENDING_COMPANIES);
  const [pendingCandidates, setPendingCandidates] = useState<PendingCandidate[]>(INITIAL_PENDING_CANDIDATES);
  const [activeTab, setActiveTab] = useState<'onboarding' | 'companies' | 'candidates'>('onboarding');

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

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold theme-text tracking-tight">Super Admin Control Center</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold uppercase border border-amber-500/30">
                Enterprise Governance
              </span>
            </div>
            <p className="text-xs theme-muted mt-1">
              Real-time platform MRR metrics, company onboarding verification pipeline, and candidate compliance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/tenants"
              className="px-4 py-2 rounded-lg border theme-border theme-surface theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Tenant Directory
            </Link>
            <Link
              href="/admin/settings"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Global App Config
            </Link>
          </div>
        </div>

        {/* Top Level Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Platform MRR
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              $28,950
            </div>
            <p className="text-xs text-emerald-500 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% MRR growth this month
            </p>
          </div>

          <div className="p-6 rounded-xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-indigo-500" /> Registered Companies
            </span>
            <div className="text-3xl font-black theme-text">
              32
            </div>
            <p className="text-xs theme-muted font-medium">
              2 pending verification check
            </p>
          </div>

          <div className="p-6 rounded-xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-purple-500" /> Active Candidates
            </span>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
              3,420
            </div>
            <p className="text-xs theme-muted font-medium">
              98.2% profile completeness
            </p>
          </div>

          <div className="p-6 rounded-xl theme-surface border theme-border space-y-2 shadow-sm">
            <span className="text-xs font-bold theme-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-amber-500" /> Active Job Postings
            </span>
            <div className="text-3xl font-black theme-text">
              148
            </div>
            <p className="text-xs theme-muted font-medium">
              Guarded by quota engine
            </p>
          </div>
        </div>

        {/* Onboarding Verification & Governance Section */}
        <div className="p-6 rounded-xl theme-surface border theme-border space-y-6 shadow-sm">
          {/* Section Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base font-extrabold theme-text">Onboarding & Identity Verification Queue</h2>
            </div>

            <div className="flex space-x-2">
              {[
                { id: 'onboarding', label: `Company Verification (${pendingCompanies.filter(c => c.status === 'PENDING_VERIFICATION').length})` },
                { id: 'candidates', label: `Candidate Verification (${pendingCandidates.filter(c => !c.isVerified).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'theme-surface border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

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

                    <div className="flex items-center space-x-3">
                      {c.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Verified Employer
                        </span>
                      ) : c.status === 'REJECTED' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="h-4 w-4 mr-1" /> Onboarding Rejected
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => rejectCompany(c.id)}
                            className="px-3.5 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveCompany(c.id)}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center"
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" /> Approve & Verify
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Candidate Registration Verification */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              {pendingCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-5 rounded-xl border theme-border theme-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold theme-text">{cand.name}</h3>
                      {cand.isVerified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Profile Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center">
                          <ShieldAlert className="h-3 w-3 mr-1" /> Pending Check
                        </span>
                      )}
                    </div>
                    <p className="text-xs theme-muted">{cand.headline} • {cand.experienceLevel}</p>
                  </div>

                  {!cand.isVerified && (
                    <button
                      onClick={() => verifyCandidate(cand.id)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center"
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" /> Verify Candidate Profile
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
