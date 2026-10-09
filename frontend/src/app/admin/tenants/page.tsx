'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Building2, ShieldCheck, ShieldAlert, Search, Sparkles, Loader2, Zap, Award, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  industry: string;
  planCode: 'FREE' | 'GROWTH' | 'PRO' | 'ENTERPRISE';
  planName: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  maxActiveJobs: number;
  maxResumeDownloads: number;
  maxTeamSeats: number;
  activeJobsCount: number;
  createdAt: string;
}

export default function SuperAdminTenantsPage() {
  const { sdk } = useTheme();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Upgrade Modal State
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<'FREE' | 'GROWTH' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await sdk.request<TenantItem[]>('/admin/tenants');
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [sdk]);

  const toggleTenantStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await sdk.request(`/admin/tenants/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadTenants();
    } catch (err) {
      console.error('Error updating tenant status:', err);
    }
  };

  const handleUpgradePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setIsUpgrading(true);
    setUpgradeMsg(null);

    try {
      await sdk.request(`/admin/tenants/${selectedTenant.id}/plan`, {
        method: 'PUT',
        body: JSON.stringify({ planCode: selectedPlanCode }),
      });
      setUpgradeMsg(`Plan successfully updated to ${selectedPlanCode}!`);
      setTimeout(() => {
        setSelectedTenant(null);
        setUpgradeMsg(null);
        loadTenants();
      }, 1200);
    } catch (err: any) {
      setUpgradeMsg(err.message || 'Error updating plan');
    } finally {
      setIsUpgrading(false);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight theme-text">
              Tenant Directory & Company Quota Governance
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Super Admin control panel to inspect company tenants, upgrade plan tiers, and manage job & candidate quotas.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
            <input
              type="text"
              placeholder="Search tenant by company name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tenants Table */}
        <div className="theme-surface border theme-border rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Loading tenant directory from database...</span>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-12 text-center theme-muted text-xs space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-indigo-500 opacity-50" />
              <p className="font-bold theme-text">No Company Tenants Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold theme-muted uppercase tracking-wider">
                    <th className="py-3.5 px-6">Company Tenant</th>
                    <th className="py-3.5 px-6">Subscription Tier</th>
                    <th className="py-3.5 px-6">Active Quotas (Jobs / Downloads / Seats)</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Admin Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold theme-text text-sm flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-indigo-500" />
                          <span>{tenant.name}</span>
                        </div>
                        <div className="text-xs theme-muted mt-0.5">{tenant.industry}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <Sparkles className="h-3 w-3 mr-1 text-amber-500" /> {tenant.planCode} PLAN
                        </span>
                      </td>

                      <td className="py-4 px-6 theme-muted text-xs space-y-0.5">
                        <div className="font-semibold theme-text">
                          {tenant.activeJobsCount} / {tenant.maxActiveJobs} Active Jobs
                        </div>
                        <div>
                          {tenant.maxResumeDownloads} Resumes • {tenant.maxTeamSeats} Team Seats
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tenant.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setSelectedPlanCode(tenant.planCode);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5" /> Upgrade Plan & Quota
                          </button>

                          <button
                            onClick={() => toggleTenantStatus(tenant.id, tenant.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              tenant.status === 'ACTIVE'
                                ? 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                                : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                            }`}
                          >
                            {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upgrade Plan Modal */}
        {selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 theme-modal">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <div>
                  <h3 className="text-base font-extrabold theme-text flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <span>Admin Support: Upgrade Company Plan & Billing</span>
                  </h3>
                  <p className="text-xs theme-muted mt-0.5">{selectedTenant.name}</p>
                </div>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="text-xs font-bold theme-muted hover:theme-text"
                >
                  Close
                </button>
              </div>

              {upgradeMsg && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold text-center">
                  {upgradeMsg}
                </div>
              )}

              <form onSubmit={handleUpgradePlan} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-2">
                    Select Target Subscription Tier
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { code: 'FREE', name: 'Starter (FREE)', jobs: '2 Jobs', downloads: '0 Downloads', seats: '1 Seat' },
                      { code: 'GROWTH', name: 'Growth ($99/mo)', jobs: '5 Jobs', downloads: '50 Downloads', seats: '3 Seats' },
                      { code: 'PRO', name: 'Professional ($199/mo)', jobs: '15 Jobs', downloads: '150 Downloads', seats: '5 Seats' },
                      { code: 'ENTERPRISE', name: 'Enterprise ($499/mo)', jobs: '50 Jobs', downloads: '500 Downloads', seats: '15 Seats' },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.code}
                        onClick={() => setSelectedPlanCode(p.code as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
                          selectedPlanCode === p.code
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                            : 'theme-border theme-surface hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-extrabold text-xs theme-text flex items-center justify-between">
                          <span>{p.name}</span>
                        </div>
                        <p className="text-[11px] theme-muted">{p.jobs} • {p.downloads}</p>
                        <p className="text-[10px] font-semibold text-indigo-500">{p.seats}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t theme-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTenant(null)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUpgrading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isUpgrading ? 'Upgrading Quota...' : 'Apply Plan Upgrade'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
