'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { AdminUserProfile, CompanyDirectoryItem } from '@job-portal/sdk';
import { 
  Users, UserCheck, ShieldCheck, Search, Plus, Download, Eye, 
  Building2, Mail, Phone, CheckCircle2, XCircle, Loader2, RefreshCw, X, AlertCircle, Activity, ArrowUpRight,
  Pencil, KeyRound, Copy, Check, EyeOff, Lock, Briefcase, MapPin, DollarSign, Clock, Sparkles
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

  // Edit User Profile Modal State
  const [editingProfile, setEditingProfile] = useState<AdminUserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    status: 'ACTIVE',
    role: 'CANDIDATE',
    tenantId: '',
    password: '',
    currentTitle: '',
    headline: '',
    experienceYears: '',
    skills: '',
    noticePeriod: '',
    currentSalary: '',
    expectedSalary: '',
    preferredLocations: '',
    summary: '',
    resumeUrl: '',
  });

  // Reset Password Modal State
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUserProfile | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [resettingPassword, setResettingPassword] = useState<boolean>(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null);

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
        password: newUserForm.password?.trim() || undefined,
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

  // Open Edit Profile Modal
  const handleOpenEditModal = (p: AdminUserProfile) => {
    setEditingProfile(p);
    setEditForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      phoneNumber: p.phone || '',
      status: p.status || 'ACTIVE',
      role: p.role || (activeTab === 'candidates' ? 'CANDIDATE' : activeTab === 'employers' ? 'COMPANY_ADMIN' : 'SUPER_ADMIN'),
      tenantId: p.tenantId || '',
      password: '',
      currentTitle: p.currentTitle || '',
      headline: p.headline || '',
      experienceYears: p.experienceYears !== undefined && p.experienceYears !== null ? String(p.experienceYears) : '',
      skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
      noticePeriod: p.noticePeriod || '',
      currentSalary: p.currentSalary ? String(p.currentSalary) : '',
      expectedSalary: p.expectedSalary ? String(p.expectedSalary) : '',
      preferredLocations: Array.isArray(p.preferredLocations) ? p.preferredLocations.join(', ') : '',
      summary: p.summary || '',
      resumeUrl: p.resumeUrl || '',
    });
    setEditError(null);
    setEditSuccess(null);
    setIsEditModalOpen(true);
  };

  // Save Edit Profile
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    if (!editForm.firstName.trim() || !editForm.email.trim()) {
      setEditError('First Name and Email are required');
      return;
    }

    setSavingEdit(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const payload: any = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim() || null,
        status: editForm.status,
        role: editForm.role,
        tenantId: editForm.tenantId || null,
      };

      if (editForm.password && editForm.password.trim()) {
        if (editForm.password.trim().length < 6) {
          setEditError('Password must be at least 6 characters long');
          setSavingEdit(false);
          return;
        }
        payload.password = editForm.password.trim();
      }

      const isCandidate = activeTab === 'candidates' || editingProfile.role === 'CANDIDATE' || editForm.role === 'CANDIDATE';
      if (isCandidate) {
        payload.currentTitle = editForm.currentTitle.trim();
        payload.headline = editForm.headline.trim();
        payload.experienceYears = editForm.experienceYears ? Number(editForm.experienceYears) : 0;
        payload.noticePeriod = editForm.noticePeriod.trim();
        payload.currentSalary = editForm.currentSalary ? Number(editForm.currentSalary) : null;
        payload.expectedSalary = editForm.expectedSalary ? Number(editForm.expectedSalary) : null;
        payload.skills = editForm.skills ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
        payload.preferredLocations = editForm.preferredLocations ? editForm.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean) : [];
        payload.summary = editForm.summary.trim();
        payload.resumeUrl = editForm.resumeUrl.trim();
      }

      await sdk.updateAdminUserProfile(editingProfile.id, payload);
      setEditSuccess('Profile saved successfully!');

      // Update in local state
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === editingProfile.id) {
            const selectedCompany = companies.find((c) => c.id === payload.tenantId);
            return {
              ...p,
              firstName: payload.firstName,
              lastName: payload.lastName,
              name: `${payload.firstName} ${payload.lastName}`.trim(),
              email: payload.email,
              phone: payload.phoneNumber,
              status: payload.status,
              role: payload.role,
              tenantId: payload.tenantId,
              companyName: selectedCompany ? selectedCompany.name : p.companyName,
              currentTitle: payload.currentTitle !== undefined ? payload.currentTitle : p.currentTitle,
              headline: payload.headline !== undefined ? payload.headline : p.headline,
              experienceYears: payload.experienceYears !== undefined ? payload.experienceYears : p.experienceYears,
              skills: payload.skills !== undefined ? payload.skills : p.skills,
              noticePeriod: payload.noticePeriod !== undefined ? payload.noticePeriod : p.noticePeriod,
              currentSalary: payload.currentSalary !== undefined ? payload.currentSalary : p.currentSalary,
              expectedSalary: payload.expectedSalary !== undefined ? payload.expectedSalary : p.expectedSalary,
              preferredLocations: payload.preferredLocations !== undefined ? payload.preferredLocations : p.preferredLocations,
              summary: payload.summary !== undefined ? payload.summary : p.summary,
              resumeUrl: payload.resumeUrl !== undefined ? payload.resumeUrl : p.resumeUrl,
            };
          }
          return p;
        })
      );

      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditingProfile(null);
        setEditSuccess(null);
      }, 1200);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetPasswordModal = (p: AdminUserProfile) => {
    setResetPasswordUser(p);
    setNewPasswordInput('');
    setShowPassword(false);
    setCopiedPassword(false);
    setResetPasswordError(null);
    setResetPasswordSuccess(null);
    setIsResetPasswordOpen(true);
  };

  // Generate Strong Random Password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = 'Camzy!';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(pass);
  };

  // Copy Password to Clipboard
  const handleCopyPassword = () => {
    if (!newPasswordInput) return;
    navigator.clipboard.writeText(newPasswordInput);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser) return;
    if (!newPasswordInput || newPasswordInput.trim().length < 6) {
      setResetPasswordError('Password must be at least 6 characters long');
      return;
    }

    setResettingPassword(true);
    setResetPasswordError(null);
    setResetPasswordSuccess(null);

    try {
      const res = await sdk.resetAdminUserPassword(resetPasswordUser.id, newPasswordInput.trim());
      setResetPasswordSuccess(res.message || `Password successfully reset for ${resetPasswordUser.email}`);
      setTimeout(() => {
        setIsResetPasswordOpen(false);
        setResetPasswordUser(null);
        setResetPasswordSuccess(null);
      }, 1600);
    } catch (err: any) {
      setResetPasswordError(err.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
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
                Super Admin Console
              </span>
              <span className="text-xs font-semibold theme-muted">Complete User Governance</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              User Profiles & Directory Management
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Inspect and edit user profiles across all roles (Candidates, Employers, and Internal Staff) including full profile detail editing and password resets.
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
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
              <span>Add Platform User</span>
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
            <span>1. Candidates Directory (Job Seekers)</span>
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
            <span>2. Employer Users (Recruiters & Companies)</span>
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
            <span>3. Camzy Internal Staff (Staff Only)</span>
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
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Candidate Specific View / Download */}
                          {activeTab === 'candidates' && p.candidateId && (
                            <>
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
                                <span>CV</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadResume(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                                title="Download resume file"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Universal Edit Profile Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border theme-border text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={`Edit ${p.name || p.email} details`}
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-500" />
                            <span>Edit</span>
                          </button>

                          {/* Universal Reset Password Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPasswordModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer"
                            title={`Reset password for ${p.name || p.email}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Pass</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* EDIT USER PROFILE MODAL (CANDIDATE, EMPLOYER, STAFF) */}
        {/* ============================================================ */}
        {isEditModalOpen && editingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-2xl w-full max-h-[90vh] flex flex-col theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b theme-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black theme-text">
                      Edit Profile: {editingProfile.name || editingProfile.email}
                    </h3>
                    <p className="text-[10px] theme-muted">
                      Role: <span className="font-bold">{editingProfile.role}</span> &bull; User ID: {editingProfile.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4">
                {editError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                {editSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{editSuccess}</span>
                  </div>
                )}

                {/* Section 1: User Identity & Account Details */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Account & Contact Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Account Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACTIVE">ACTIVE (Full Access)</option>
                        <option value="INACTIVE">INACTIVE / SUSPENDED</option>
                        <option value="BANNED">BANNED (Blocked)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">System Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="CANDIDATE">Candidate (Job Seeker)</option>
                        <option value="COMPANY_ADMIN">Company Admin (Employer Owner)</option>
                        <option value="RECRUITER">Recruiter (Team Member)</option>
                        <option value="CONSULTANCY_ADMIN">Consultancy Admin</option>
                        <option value="AGENCY_AGENT">Agency Agent</option>
                        <option value="SUPER_ADMIN">Super Admin (Camzy Internal Staff)</option>
                      </select>
                    </div>
                  </div>

                  {/* Company Association (For Employers) */}
                  {['COMPANY_ADMIN', 'RECRUITER', 'CONSULTANCY_ADMIN', 'AGENCY_AGENT'].includes(editForm.role) && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold theme-text flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Assigned Company / Tenant</span>
                      </label>
                      <select
                        value={editForm.tenantId}
                        onChange={(e) => setEditForm({ ...editForm, tenantId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- No Company Assigned --</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Section 2: Candidate Professional Details (Shown if Candidate) */}
                {(activeTab === 'candidates' || editForm.role === 'CANDIDATE') && (
                  <div className="space-y-3 pt-3 border-t theme-border">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Candidate Professional Profile
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold theme-text">Current Job Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Frontend Engineer"
                          value={editForm.currentTitle}
                          onChange={(e) => setEditForm({ ...editForm, currentTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold theme-text">Total Experience (Years)</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          placeholder="e.g. 5"
                          value={editForm.experienceYears}
                          onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Headline / Professional Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Developer | React, Node.js & AWS"
                        value={editForm.headline}
                        onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Key Skills (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. TypeScript, React, Next.js, Node.js, SQL"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold theme-text">Notice Period</label>
                        <select
                          value={editForm.noticePeriod}
                          onChange={(e) => setEditForm({ ...editForm, noticePeriod: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">-- Select Notice --</option>
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold theme-text">Current Salary (Annual)</label>
                        <input
                          type="number"
                          placeholder="e.g. 900000"
                          value={editForm.currentSalary}
                          onChange={(e) => setEditForm({ ...editForm, currentSalary: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold theme-text">Expected Salary (Annual)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1200000"
                          value={editForm.expectedSalary}
                          onChange={(e) => setEditForm({ ...editForm, expectedSalary: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Preferred Job Locations (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, Mumbai, Remote"
                        value={editForm.preferredLocations}
                        onChange={(e) => setEditForm({ ...editForm, preferredLocations: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Professional Bio / Summary</label>
                      <textarea
                        rows={2}
                        placeholder="Candidate career summary and objectives..."
                        value={editForm.summary}
                        onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold theme-text">Resume File URL</label>
                      <input
                        type="text"
                        placeholder="https://... or /uploads/resumes/..."
                        value={editForm.resumeUrl}
                        onChange={(e) => setEditForm({ ...editForm, resumeUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Section 3: Optional Password Reset during Edit */}
                <div className="space-y-2 pt-3 border-t theme-border">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Security & Password Update (Optional)
                  </h4>
                  <p className="text-[10px] theme-muted">
                    Leave blank to preserve current credentials, or enter a new password to reset it now.
                  </p>
                  <input
                    type="password"
                    placeholder="Enter new password (min 6 characters) or leave blank"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* DEDICATED RESET PASSWORD MODAL (ALL ROLES) */}
        {/* ============================================================ */}
        {isResetPasswordOpen && resetPasswordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b theme-border flex items-center justify-between bg-rose-500/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black theme-text">Reset Password</h3>
                    <p className="text-[10px] theme-muted">Admin credential override & security reset</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleResetPassword} className="p-5 space-y-4">
                {/* Target User Summary Card */}
                <div className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/40 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-xs flex-shrink-0">
                    {resetPasswordUser.firstName ? resetPasswordUser.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black theme-text truncate">{resetPasswordUser.name}</h4>
                    <p className="text-[11px] theme-muted truncate">{resetPasswordUser.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 theme-text">
                    {resetPasswordUser.role}
                  </span>
                </div>

                {resetPasswordError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{resetPasswordError}</span>
                  </div>
                )}

                {resetPasswordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{resetPasswordSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      New Security Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Strong</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full pl-3 pr-20 py-2.5 rounded-xl text-xs font-mono theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="absolute right-2 top-2 flex items-center space-x-1">
                      {newPasswordInput && (
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy password to clipboard"
                        >
                          {copiedPassword ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {copiedPassword && (
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied password to clipboard!
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] leading-relaxed">
                  <strong>Notice:</strong> This immediately updates the user's encrypted credentials in the database. Provide the user with the new password so they can log in.
                </div>

                {/* Footer */}
                <div className="pt-3 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {resettingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Reset Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ADD NEW USER MODAL */}
        {/* ============================================================ */}
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
                    placeholder="jane.doe@example.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Initial Password (Optional)
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
                  </select>
                  <p className="text-[10px] theme-muted mt-1">
                    Looking to add Camzy internal staff? Use the <Link href="/admin/users" className="text-rose-500 font-bold hover:underline">Camzy Internal Team</Link> console.
                  </p>
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

        {/* Candidate Resume & Full Profile Preview Modal */}
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
