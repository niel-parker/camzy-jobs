'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { AdminUserProfile, CompanyDirectoryItem } from '@job-portal/sdk';
import { 
  Users, UserCheck, ShieldCheck, Search, Plus, Download, Eye, 
  Building2, Mail, Phone, CheckCircle2, XCircle, Loader2, RefreshCw, X, AlertCircle, Activity 
} from 'lucide-react';
import { ProfileResumeModal } from '../../../components/ProfileResumeModal';

function AdminUserProfilesContent() {
  const { sdk } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab') || 'candidates';
  const [activeTab, setActiveTab] = useState<'candidates' | 'employers' | 'admins'>(
    currentTab === 'employers' || currentTab === 'admins' ? currentTab : 'candidates'
  );

  const [profiles, setProfiles] = useState<AdminUserProfile[]>([]);
  const [companies, setCompanies] = useState<CompanyDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Candidate Resume / Detail Preview Modal State
  const [previewCandidate, setPreviewCandidate] = useState<any>(null);
  const [loadingCandidateId, setLoadingCandidateId] = useState<string | null>(null);

  // Helper to resolve resume URLs
  const resolveResumeUrl = (rawUrl?: string) => {
    if (!rawUrl || rawUrl.includes('example.com')) {
      return 'http://localhost:4000/uploads/resumes/sample-resume.pdf';
    }
    if (rawUrl.startsWith('/uploads')) {
      const apiHost = typeof window !== 'undefined' && window.location.hostname === 'jobs.camzytech.com'
        ? 'https://api.jobs.camzytech.com'
        : 'http://localhost:4000';
      return `${apiHost}${rawUrl}`;
    }
    return rawUrl;
  };

  const handleViewCandidate = async (candidateId: string) => {
    setLoadingCandidateId(candidateId);
    try {
      const data = await sdk.request<any>(`/candidates/${candidateId}`);
      setPreviewCandidate(data);
    } catch (err) {
      console.error('Failed to load candidate profile:', err);
    } finally {
      setLoadingCandidateId(null);
    }
  };

  const handleDownloadResume = async (cand: any) => {
    if (cand.resumeUrl && !cand.resumeUrl.includes('example.com')) {
      window.open(resolveResumeUrl(cand.resumeUrl), '_blank');
    } else if (cand.candidateId) {
      await handleViewCandidate(cand.candidateId);
    }
  };

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addingUser, setAddingUser] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CANDIDATE',
    tenantId: '',
    phoneNumber: '',
  });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      let roleFilter: string | undefined = undefined;
      if (activeTab === 'candidates') roleFilter = 'CANDIDATE';
      else if (activeTab === 'employers') roleFilter = 'EMPLOYER';
      else if (activeTab === 'admins') roleFilter = 'SUPER_ADMIN';

      const [data, companiesList] = await Promise.all([
        sdk.getAdminProfiles(roleFilter, searchQuery || undefined),
        sdk.getAdminCompanies().catch(() => []),
      ]);
      setProfiles(data);
      setCompanies(companiesList);
    } catch (err: any) {
      console.error('Failed to load profiles:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [activeTab, sdk]);

  const handleTabChange = (tab: 'candidates' | 'employers' | 'admins') => {
    setActiveTab(tab);
    router.push(`/admin/profiles?tab=${tab}`);
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await sdk.updateAdminUserStatus(userId, nextStatus);
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, status: nextStatus } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.firstName) {
      setAddError('Email and First Name are required');
      return;
    }

    setAddingUser(true);
    setAddError(null);

    try {
      await sdk.createAdminUser({
        email: newUserForm.email.trim(),
        password: newUserForm.password || 'TemporaryPass123!',
        firstName: newUserForm.firstName.trim(),
        lastName: newUserForm.lastName.trim(),
        role: newUserForm.role,
        tenantId: newUserForm.tenantId || undefined,
        phoneNumber: newUserForm.phoneNumber.trim() || undefined,
      });

      setIsAddModalOpen(false);
      setNewUserForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'CANDIDATE',
        tenantId: '',
        phoneNumber: '',
      });
      loadProfiles();
    } catch (err: any) {
      setAddError(err.message || 'Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  const filteredProfiles = profiles.filter((p) =>
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.companyName && p.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.headline && p.headline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                User Profiles 3-in-1
              </span>
              <span className="text-xs font-semibold theme-muted">Candidates, Employers & Admins</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              Unified User Directory
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Inspect candidates, employer team recruiters, and administrators. Download resumes or provision new accounts directly.
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
              onClick={loadProfiles}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setIsAddModalOpen(true);
                setAddError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* 3 Submenus / Tab Navigation */}
        <div className="border-b theme-border flex items-center space-x-6">
          <button
            onClick={() => handleTabChange('candidates')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'candidates'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Candidates Directory</span>
          </button>

          <button
            onClick={() => handleTabChange('employers')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'employers'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Employer Users</span>
          </button>

          <button
            onClick={() => handleTabChange('admins')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'admins'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Administrator Users</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, email, or headline...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            Showing <span className="font-bold theme-text">{filteredProfiles.length}</span> profiles
          </div>
        </div>

        {/* Profiles Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading user profiles...</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No users found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  No {activeTab} matched your criteria. You can add one using the button above.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">User & Contact</th>
                    <th className="py-3 px-4">Role / Permissions</th>
                    {activeTab === 'employers' && <th className="py-3 px-4">Associated Company</th>}
                    {activeTab === 'candidates' && <th className="py-3 px-4">Headline / Professional Focus</th>}
                    {activeTab === 'candidates' && <th className="py-3 px-4">Experience</th>}
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredProfiles.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                            {p.firstName ? p.firstName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold theme-text block">{p.name}</span>
                            <div className="flex items-center gap-1 text-[11px] theme-muted">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{p.email}</span>
                            </div>
                            {p.phone && (
                              <div className="flex items-center gap-1 text-[11px] theme-muted">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{p.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 theme-text border theme-border">
                          {p.role}
                        </span>
                      </td>

                      {activeTab === 'employers' && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold theme-text">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{p.companyName || 'Unassigned'}</span>
                          </div>
                        </td>
                      )}

                      {activeTab === 'candidates' && (
                        <td className="py-3.5 px-4 max-w-xs truncate theme-muted">
                          <div className="font-semibold theme-text truncate">{p.currentTitle || p.headline || 'Active Candidate'}</div>
                          {p.headline && p.headline !== p.currentTitle && (
                            <div className="text-[11px] theme-muted truncate">{p.headline}</div>
                          )}
                        </td>
                      )}

                      {activeTab === 'candidates' && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {p.experienceYears ? `${p.experienceYears} Years` : 'Fresher'}
                          </span>
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          {p.status === 'ACTIVE' ? (
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
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {activeTab === 'candidates' && p.candidateId && (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => handleViewCandidate(p.candidateId!)}
                              disabled={loadingCandidateId === p.candidateId}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border theme-border text-xs font-bold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View full candidate profile & resume preview"
                            >
                              {loadingCandidateId === p.candidateId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                              )}
                              <span>View CV</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadResume(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                              title="Directly download candidate resume file"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add New User Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">Add New User</h3>
                  <p className="text-[10px] theme-muted">Provision a candidate, employer, or administrator account</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-5 space-y-3.5">
                {addError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{addError}</span>
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
                      placeholder="Jane"
                      value={newUserForm.firstName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={newUserForm.lastName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank for auto-generated temporary password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Role & Permissions <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CANDIDATE">Candidate (Job Seeker)</option>
                    <option value="COMPANY_ADMIN">Company Admin (Employer Owner)</option>
                    <option value="RECRUITER">Recruiter (Team Member)</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </select>
                </div>

                {['COMPANY_ADMIN', 'RECRUITER'].includes(newUserForm.role) && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Assign Company <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={newUserForm.tenantId}
                      onChange={(e) => setNewUserForm({ ...newUserForm, tenantId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Company --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={newUserForm.phoneNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    disabled={addingUser}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    {addingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create User</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Candidate Resume & Full Profile Preview Modal (Viewed directly inside Super Admin) */}
        <ProfileResumeModal
          isOpen={Boolean(previewCandidate)}
          onClose={() => setPreviewCandidate(null)}
          candidate={previewCandidate}
        />
      </div>
    </DashboardLayout>
  );
}

export default function AdminUserProfilesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs theme-muted">Loading user profiles...</div>}>
      <AdminUserProfilesContent />
    </Suspense>
  );
}
