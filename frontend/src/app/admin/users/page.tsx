'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { AdminUserProfile } from '@job-portal/sdk';
import { 
  ShieldCheck, Plus, Search, Mail, Phone, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, AlertCircle, Key, Shield, Activity
} from 'lucide-react';

export default function AdminUsersManagementPage() {
  const { sdk, user: currentUser } = useTheme();

  const [adminUsers, setAdminUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Admin Modal
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
      setAdminUsers(data);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
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
      alert(err.message || 'Failed to update admin user status');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.firstName) {
      setErrorMsg('Email and First Name are required');
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
      setErrorMsg(err.message || 'Failed to provision admin user');
    } finally {
      setSaving(false);
    }
  };

  const filteredAdmins = adminUsers.filter((u) =>
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Privileged Access
              </span>
              <span className="text-xs font-semibold theme-muted">Platform Operators</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-500" />
              Admin Users & Roles
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Manage system administrators who possess platform-wide superadmin privileges, schema access, and broadcast permissions.
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
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              <span>Provision Admin User</span>
            </button>
          </div>
        </div>

        {/* Security Alert Card */}
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black theme-text">Super Administrator Privileges</h4>
            <p className="text-[11px] theme-muted leading-relaxed">
              Users listed below have unrestricted access to all company databases, billing transactions, system taxonomies, and email broadcast servers.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder="Search administrators by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 theme-muted hover:theme-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs theme-muted font-medium">
            Total Authorized Administrators: <span className="font-bold theme-text">{adminUsers.length}</span>
          </div>
        </div>

        {/* Admins Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading administrators...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No administrators found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  No admin matched your search query.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Admin Name & Identity</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4">Created At</th>
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
                            {admin.firstName ? admin.firstName[0].toUpperCase() : 'A'}
                          </div>
                          <div>
                            <span className="font-extrabold theme-text block">
                              {admin.name} {admin.id === currentUser?.id && '(You)'}
                            </span>
                            {admin.phone && (
                              <span className="text-[10px] theme-muted">{admin.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                        {admin.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Key className="w-3 h-3" />
                          SUPER_ADMIN
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          disabled={admin.id === currentUser?.id}
                          onClick={() => handleToggleStatus(admin.id, admin.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                            admin.id === currentUser?.id ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
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
                            className="text-xs font-bold text-rose-500 hover:underline"
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
                  <h3 className="text-sm font-black theme-text">Provision Administrator</h3>
                  <p className="text-[10px] theme-muted">Create a new platform superadmin account</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex"
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
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Admin Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@camzyjobs.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
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
                    placeholder="+1 555-0100"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Provision Superadmin</span>
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
