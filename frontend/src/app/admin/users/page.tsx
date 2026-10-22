'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { AdminUserProfile } from '@job-portal/sdk';
import { 
  ShieldCheck, Plus, Search, Mail, Phone, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, AlertCircle, Key, Shield, Activity, Users, ArrowUpRight
} from 'lucide-react';

export default function CamzyInternalTeamManagementPage() {
  const { sdk, user: currentUser } = useTheme();

  const [adminUsers, setAdminUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Internal Team Member Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await sdk.getAdminProfiles('SUPER_ADMIN');
      // Enforce strict internal role filter so candidates and employers NEVER leak into this console
      const internalStaff = data.filter((u) => u.role === 'SUPER_ADMIN');
      setAdminUsers(internalStaff);
    } catch (err: any) {
      console.error('Failed to load Camzy internal staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [sdk]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot suspend your own active administrator account.');
      return;
    }
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await sdk.updateAdminUserStatus(userId, nextStatus);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update team member status');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.firstName) {
      setErrorMsg('Work email and First Name are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await sdk.createAdminUser({
        email: form.email.trim(),
        password: form.password || 'AdminSecurity@2026',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: 'SUPER_ADMIN',
        phoneNumber: form.phoneNumber.trim() || undefined,
      });

      setIsAddModalOpen(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
      });
      loadAdmins();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to provision Camzy internal team member');
    } finally {
      setSaving(false);
    }
  };

  const filteredAdmins = adminUsers.filter((u) =>
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = adminUsers.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = adminUsers.length - activeCount;

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Camzy Staff Only • Internal Access
              </span>
              <span className="text-xs font-semibold theme-muted">Operations & Platform Engineers</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-500" />
              Camzy Internal Team & Staff
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Strictly for Camzy Infotech internal personnel, platform operators, and system superadmins. External candidate profiles and employer recruiter accounts are isolated under <Link href="/admin/profiles" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5">Job Seekers & Employers <ArrowUpRight className="w-3 h-3" /></Link>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login-activity"
              className="px-3.5 py-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-2 transition-all"
              title="View Authentication & Login Activity Audit Logs"
            >
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Login Activity</span>
            </Link>
            <button
              onClick={loadAdmins}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setIsAddModalOpen(true);
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Camzy Team Member</span>
            </button>
          </div>
        </div>

        {/* Security & Scope Clarity Notice Banner */}
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-start justify-between gap-3 flex-col sm:flex-row">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-black theme-text">Internal Team Governance & Superadmin Roles</h4>
              <p className="text-[11px] theme-muted leading-relaxed">
                Users registered in this console belong strictly to the <strong>Camzy Infotech Internal Team</strong> (Superadmins). They hold root permissions across all client company portals, active jobs, resume databases, and billing gateways.
              </p>
            </div>
          </div>
          <Link
            href="/admin/profiles"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Candidates & Employers</span>
          </Link>
        </div>

        {/* KPI Counter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl theme-surface border theme-border shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-wider theme-muted">Total Internal Staff</div>
            <div className="text-2xl font-black theme-text mt-1">{adminUsers.length}</div>
            <div className="text-[10px] theme-muted mt-0.5">Camzy Infotech authorized users</div>
          </div>
          <div className="p-4 rounded-2xl theme-surface border theme-border shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Operators</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
            <div className="text-[10px] theme-muted mt-0.5">Full console privileges enabled</div>
          </div>
          <div className="p-4 rounded-2xl theme-surface border theme-border shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-wider text-rose-500">Suspended Staff</div>
            <div className="text-2xl font-black text-rose-500 mt-1">{suspendedCount}</div>
            <div className="text-[10px] theme-muted mt-0.5">Login privileges disabled</div>
          </div>
          <div className="p-4 rounded-2xl theme-surface border theme-border shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-wider text-indigo-500">Access Level</div>
            <div className="text-sm font-black theme-text mt-2 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-500" />
              SUPER_ADMIN
            </div>
            <div className="text-[10px] theme-muted mt-0.5">Full multi-tenant platform control</div>
          </div>
        </div>

        {/* Search & Counter Filter Row */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder="Search Camzy staff by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 theme-muted hover:theme-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs theme-muted font-medium">
            Authorized Camzy Staff: <span className="font-bold theme-text">{filteredAdmins.length}</span>
          </div>
        </div>

        {/* Admins Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading internal staff members...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No internal staff found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  No Camzy staff matched your search query.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Internal Staff Member</th>
                    <th className="py-3 px-4">Work Email Address</th>
                    <th className="py-3 px-4">Internal Role</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4">Provisioned On</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-black flex items-center justify-center text-xs flex-shrink-0">
                            {admin.firstName ? admin.firstName[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="font-extrabold theme-text block">
                              {admin.name} {admin.id === currentUser?.id && <span className="ml-1 text-[10px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">(You)</span>}
                            </span>
                            {admin.phone && (
                              <span className="text-[10px] theme-muted">{admin.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 theme-muted" />
                          <span>{admin.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Key className="w-3 h-3" />
                          Camzy Super Admin
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          disabled={admin.id === currentUser?.id}
                          onClick={() => handleToggleStatus(admin.id, admin.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                            admin.id === currentUser?.id ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-105'
                          } ${
                            admin.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {admin.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Suspended
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {admin.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleStatus(admin.id, admin.status)}
                            className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            {admin.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Provision Admin Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">Add Camzy Internal Team Member</h3>
                  <p className="text-[10px] theme-muted">Provision a privileged Camzy Infotech superadmin account</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-start gap-2 leading-relaxed">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Internal Staff Alert:</strong> Accounts created here receive system-wide Super Admin privileges. Do NOT use this form for employer recruiters or candidate job seekers.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shashank"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kashyap"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Work Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@camzyinfotech.com or @camzyjobs.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-[10px] theme-muted">Only Camzy corporate email addresses should be provisioned.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Initial Security Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 characters (default: AdminSecurity@2026)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Provision Camzy Member</span>
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
