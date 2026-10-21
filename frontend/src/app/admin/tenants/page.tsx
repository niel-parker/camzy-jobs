'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Building2, ShieldCheck, ShieldAlert, Search, Sparkles, Loader2, Zap, Award, ArrowUpRight, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // Register Company Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    industry: 'Technology & Software',
    type: 'COMPANY',
    planCode: 'GROWTH',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
  });

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

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.adminEmail || !registerForm.adminFirstName) {
      setRegisterError('Company name, admin email, and first name are required');
      return;
    }

    setRegistering(true);
    setRegisterError(null);

    try {
      await sdk.registerCompanyDirect({
        name: registerForm.name.trim(),
        type: registerForm.type,
        planCode: registerForm.planCode,
        adminEmail: registerForm.adminEmail.trim(),
        adminFirstName: registerForm.adminFirstName.trim(),
        adminLastName: registerForm.adminLastName.trim(),
      });

      setIsRegisterOpen(false);
      setRegisterForm({
        name: '',
        industry: 'Technology & Software',
        type: 'COMPANY',
        planCode: 'GROWTH',
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
      });
      loadTenants();
    } catch (err: any) {
      setRegisterError(err.message || 'Failed to register company');
    } finally {
      setRegistering(false);
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
              Companies Directory & Quota Governance
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Inspect company tenants, provision direct enterprise registrations, and upgrade plan quotas.
            </p>
          </div>

          <button
            onClick={() => {
              setIsRegisterOpen(true);
              setRegisterError(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Company</span>
          </button>
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

        {/* Register Company Direct Modal */}
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    Register New Company Tenant
                  </h3>
                  <p className="text-[10px] theme-muted">Provision tenant organization and company admin account</p>
                </div>
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterCompany} className="p-5 space-y-3.5">
                {registerError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Company Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Technologies Inc."
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Organization Type
                    </label>
                    <select
                      value={registerForm.type}
                      onChange={(e) => setRegisterForm({ ...registerForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="COMPANY">Direct Employer (Company)</option>
                      <option value="CONSULTANCY">Recruitment Consultancy</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Assigned Plan
                    </label>
                    <select
                      value={registerForm.planCode}
                      onChange={(e) => setRegisterForm({ ...registerForm, planCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="GROWTH">Growth (20 Jobs)</option>
                      <option value="PRO">Pro (50 Jobs)</option>
                      <option value="ENTERPRISE">Enterprise (200 Jobs)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t theme-border space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    Designated Company Administrator
                  </span>
                  <p className="text-[10px] theme-muted">Will receive initial login credentials</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Admin First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={registerForm.adminFirstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, adminFirstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Admin Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Smith"
                      value={registerForm.adminLastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, adminLastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Admin Corporate Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={registerForm.adminEmail}
                    onChange={(e) => setRegisterForm({ ...registerForm, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    {registering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Register Company</span>
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
