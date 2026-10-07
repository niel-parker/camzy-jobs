'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, ShieldAlert, CheckCircle2, Ban, Search, Edit3, Sparkles } from 'lucide-react';

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  industry: string;
  planCode: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  isVerified: boolean;
  activeJobsCount: number;
  seatsUsed: number;
  createdAt: string;
}

const INITIAL_TENANTS: TenantItem[] = [
  {
    id: 'tnt-techcorp',
    name: 'TechCorp Global',
    slug: 'techcorp-global',
    industry: 'Software & Technology',
    planCode: 'PROFESSIONAL',
    status: 'ACTIVE',
    isVerified: true,
    activeJobsCount: 8,
    seatsUsed: 3,
    createdAt: 'Aug 10, 2026',
  },
  {
    id: 'tnt-innovate',
    name: 'Innovate AI Labs',
    slug: 'innovate-ai-labs',
    industry: 'Artificial Intelligence',
    planCode: 'ENTERPRISE',
    status: 'ACTIVE',
    isVerified: true,
    activeJobsCount: 15,
    seatsUsed: 12,
    createdAt: 'Sep 01, 2026',
  },
  {
    id: 'tnt-nexus',
    name: 'Nexus Analytics',
    slug: 'nexus-analytics',
    industry: 'Data & Analytics',
    planCode: 'STARTER',
    status: 'PENDING',
    isVerified: false,
    activeJobsCount: 1,
    seatsUsed: 1,
    createdAt: 'Oct 03, 2026',
  },
];

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantItem[]>(INITIAL_TENANTS);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTenantStatus = (id: string) => {
    setTenants(
      tenants.map((t) => {
        if (t.id === id) {
          const nextStatus: TenantItem['status'] =
            t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const toggleVerification = (id: string) => {
    setTenants(
      tenants.map((t) => (t.id === id ? { ...t, isVerified: !t.isVerified } : t))
    );
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight theme-text">
          Super Admin — Tenant Governance Directory
        </h1>
        <p className="mt-1 text-sm theme-muted">
          Inspect registered hiring company tenants, approve verifications, and enforce governance controls.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
          <input
            type="text"
            placeholder="Search tenant by company name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="theme-surface border theme-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold theme-muted uppercase tracking-wider">
                <th className="py-3.5 px-6">Company Tenant</th>
                <th className="py-3.5 px-6">Subscription Plan</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Verification</th>
                <th className="py-3.5 px-6">Active Jobs / Seats</th>
                <th className="py-3.5 px-6 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border text-sm">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold theme-text flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      <span>{tenant.name}</span>
                    </div>
                    <div className="text-xs theme-muted mt-0.5">{tenant.industry}</div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="h-3 w-3 mr-1" /> {tenant.planCode}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tenant.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : tenant.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleVerification(tenant.id)}
                      className="flex items-center space-x-1.5 text-xs font-bold"
                    >
                      {tenant.isVerified ? (
                        <span className="text-emerald-500 flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-500 flex items-center hover:underline">
                          <ShieldAlert className="h-4 w-4 mr-1" /> Unverified (Click)
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-6 theme-muted text-xs">
                    {tenant.activeJobsCount} Jobs • {tenant.seatsUsed} Seats
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => toggleTenantStatus(tenant.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                          tenant.status === 'ACTIVE'
                            ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                        }`}
                      >
                        {tenant.status === 'ACTIVE' ? 'Suspend' : 'Approve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
