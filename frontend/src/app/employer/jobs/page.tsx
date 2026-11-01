'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { 
  Briefcase, Plus, Sparkles, Users, Loader2, Pencil, Trash2, X, Check, 
  RotateCcw, Calendar, Clock, AlertCircle, Info, Lock, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { JobListing } from '@job-portal/sdk';
import { LocationSearchDropdown } from '../../../components/LocationSearchDropdown';
import { ExperienceRangeSelector } from '../../../components/ExperienceRangeSelector';
import { SkillKeywordAutocomplete } from '../../../components/SkillKeywordAutocomplete';
import { SearchableSelect } from '../../../components/SearchableSelect';

export default function EmployerJobListingsPage() {
  const { user, sdk } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Edit / Repost Modal State
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [isRepostMode, setIsRepostMode] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    title: string;
    category: string;
    location: string;
    isRemote: boolean;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
    experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    salaryMin: number;
    salaryMax: number;
    minExperience: number;
    maxExperience: number;
    skills: string[];
    description: string;
  }>({
    title: '',
    category: 'Engineering',
    location: '',
    isRemote: true,
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    salaryMin: 100000,
    salaryMax: 150000,
    minExperience: 2,
    maxExperience: 5,
    skills: [],
    description: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const effectiveTenantId = user?.tenantId || '895c2926-0596-4115-a3e5-03a9d8fe042d';
      const data: any = await sdk.getJobListings({ tenantId: effectiveTenantId });
      const companyOnly = Array.isArray(data)
        ? data.filter((j: any) => j.tenantId === effectiveTenantId || j.companyName?.toLowerCase().includes('camzy') || j.companyName?.toLowerCase().includes('techcorp'))
        : [];
      setJobs(companyOnly.length > 0 ? companyOnly : (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Error fetching company jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [sdk, user?.tenantId]);

  const featureJob = async (id: string) => {
    try {
      await sdk.featureJob(id);
      fetchJobs();
    } catch (err) {
      console.error('Error featuring job:', err);
    }
  };

  const populateFormWithJob = (job: JobListing) => {
    setEditForm({
      title: job.title || '',
      category: job.category || 'Engineering',
      location: job.location || '',
      isRemote: job.isRemote ?? true,
      employmentType: (job.employmentType as any) || 'Full-time',
      experienceLevel: (job.experienceLevel as any) || 'Mid',
      salaryMin: job.salaryMin || 100000,
      salaryMax: job.salaryMax || 150000,
      minExperience: job.minExperience ?? 2,
      maxExperience: job.maxExperience ?? 5,
      skills: job.skills || [],
      description: job.description || '',
    });
    setActionError(null);
  };

  const openEditModal = (job: JobListing) => {
    setIsRepostMode(false);
    setEditingJob(job);
    populateFormWithJob(job);
  };

  const openRepostModal = (job: JobListing) => {
    setIsRepostMode(true);
    setEditingJob(job);
    populateFormWithJob(job);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setIsSaving(true);
    setActionError(null);

    try {
      if (isRepostMode) {
        // 2. Job repost - consume -1 job from quota, create fresh 30-day posting with edits
        await sdk.repostJob(editingJob.id, editForm);
        setSuccessToast(`Job "${editForm.title}" successfully reposted! 1 job deducted from quota. Active for 30 days.`);
      } else {
        // Standard edit (cannot change expiry)
        await sdk.updateJob(editingJob.id, editForm);
        setSuccessToast(`Job details for "${editForm.title}" updated successfully.`);
      }
      setEditingJob(null);
      fetchJobs();
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: any) {
      setActionError(err.message || (isRepostMode ? 'Failed to repost job (Quota limit reached).' : 'Failed to update job posting'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await sdk.deleteJob(id);
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job posting');
    }
  };

  const formatDate = (d?: string | Date) => {
    if (!d) return '30 Days Standard';
    const date = new Date(d);
    return isNaN(date.getTime())
      ? 'Recently'
      : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return 30;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6">
        {/* Success Alert Banner */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Company Talent Portal
              </span>
              <span className="text-xs font-semibold theme-muted">Auto-expires after 30 days</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight theme-text mt-1 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-500" />
              Company Job Postings
            </h1>
            <p className="mt-1 text-xs theme-muted max-w-2xl">
              Postings remain live for 30 days. Expired jobs can be reposted with edits anytime to consume 1 active job slot from your plan quota.
            </p>
          </div>

          <a
            href="/employer/jobs/create"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Post New Position
          </a>
        </div>

        {/* Jobs Table */}
        <div className="theme-surface border theme-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center theme-muted text-xs flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="font-semibold">Loading company job postings...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-16 text-center theme-muted text-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="font-black text-sm theme-text">No Job Postings Found</p>
              <p className="max-w-md mx-auto">Click &apos;Post New Position&apos; above to create your company posting. Positions auto-expire in 30 days.</p>
              <a
                href="/employer/jobs/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Post Position Now
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold theme-muted uppercase tracking-wider">
                    <th className="py-3.5 px-5">Job Position & Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Expiry & Timeline</th>
                    <th className="py-3.5 px-4">Applicants</th>
                    <th className="py-3.5 px-4">Posted Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {jobs
                    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                    .map((job) => {
                    const isExpired = job.status === 'EXPIRED' || job.isExpired || (job.expiresAt ? new Date(job.expiresAt).getTime() <= Date.now() : false);
                    const daysRemaining = getDaysRemaining(job.expiresAt);

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-extrabold theme-text text-sm hover:text-indigo-600 transition-colors">
                            {job.title}
                          </div>
                          <div className="text-xs theme-muted flex flex-wrap items-center gap-1.5 mt-1 font-medium">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{job.category}</span>
                            <span>•</span>
                            <span>{job.location} {job.isRemote && '(Remote)'}</span>
                            {job.isFeatured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Sparkles className="h-3 w-3 mr-0.5" /> Boosted
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isExpired ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <AlertCircle className="w-3 h-3 mr-1" /> EXPIRED
                            </span>
                          ) : job.status === 'ARCHIVED' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20">
                              ARCHIVED
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Clock className="w-3 h-3 mr-1" /> ACTIVE
                            </span>
                          )}
                        </td>

                        {/* Expiry Date & Countdown */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isExpired ? (
                            <div>
                              <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                Expired on {formatDate(job.expiresAt)}
                              </div>
                              <div className="text-[10px] theme-muted mt-0.5">
                                Repost to renew for 30 days
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-xs font-semibold theme-text flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-indigo-500" />
                                <span>{formatDate(job.expiresAt)}</span>
                              </div>
                              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expiring today'}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <a
                            href="/employer/candidates/kanban"
                            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            <Users className="h-4 w-4 mr-1" /> View Applicants
                          </a>
                        </td>

                        <td className="py-4 px-4 theme-muted whitespace-nowrap">
                          {formatDate(job.createdAt)}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {/* 2. REPOST BUTTON (Opens in edit mode, consumes -1 quota, applies fresh 30 days) */}
                            <button
                              onClick={() => openRepostModal(job)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                isExpired
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                              }`}
                              title="Repost Position (-1 Quota, 30 Days Timeline)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Repost</span>
                            </button>

                            {/* Regular Edit */}
                            <button
                              onClick={() => openEditModal(job)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                              title="Edit Job Details"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>

                            {/* Boost to Featured */}
                            {!job.isFeatured && (
                              <button
                                onClick={() => featureJob(job.id)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                                title="Promote Job to Featured"
                              >
                                Boost
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Delete Job Posting"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Jobs Table Pagination */}
              {jobs.length > PAGE_SIZE && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 border-t theme-border bg-slate-50/50 dark:bg-slate-900/40 text-xs theme-muted gap-3">
                  <span className="font-medium">
                    Showing {(page - 1) * PAGE_SIZE + 1} &ndash;{' '}
                    {Math.min(page * PAGE_SIZE, jobs.length)} of {jobs.length} jobs
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1.5 rounded-lg border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-xs theme-text px-2">
                      Page {page} of {Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(Math.max(1, Math.ceil(jobs.length / PAGE_SIZE)), p + 1)
                        )
                      }
                      disabled={page >= Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))}
                      className="p-1.5 rounded-lg border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit / Repost Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <div>
                <h3 className="text-base font-black theme-text flex items-center gap-2">
                  {isRepostMode ? (
                    <>
                      <RotateCcw className="w-5 h-5 text-indigo-600" />
                      <span>Repost Job Position</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-5 h-5 text-indigo-500" />
                      <span>Edit Job Posting</span>
                    </>
                  )}
                </h3>
                <p className="text-[11px] theme-muted mt-0.5">
                  {isRepostMode 
                    ? 'Review or modify details before publishing. Consumes 1 active job from plan quota.'
                    : 'Update position details and requirements.'}
                </p>
              </div>

              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Repost Policy & Quota Banner */}
            {isRepostMode ? (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black text-indigo-700 dark:text-indigo-300">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Reposting Policy & 30-Day Expiry Timeline</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  • Reposting will <strong>consume 1 job posting credit</strong> from your subscription quota.
                  <br />
                  • A fresh <strong>30-day listing timeline</strong> ({new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}) will be applied immediately.
                  <br />
                  • Any modifications you save below will be published with the new posting.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border theme-border flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium theme-muted">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Job Expiry: {formatDate(editingJob.expiresAt)}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  * Only Super Admin can change expiry date
                </span>
              </div>
            )}

            {actionError && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold theme-text mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Category</label>
                  <SearchableSelect
                    value={editForm.category}
                    onChange={(val) => setEditForm({ ...editForm, category: val })}
                    placeholder="Select category..."
                    searchPlaceholder="Search category..."
                    options={[
                      { value: 'Engineering', label: 'Engineering & Technology' },
                      { value: 'Product', label: 'Product Management' },
                      { value: 'Design', label: 'UI/UX & Design' },
                      { value: 'Marketing', label: 'Marketing & Growth' },
                      { value: 'Sales', label: 'Sales & Business Development' },
                      { value: 'Finance', label: 'Finance & Accounting' },
                      { value: 'Human Resources', label: 'Human Resources & Talent' },
                      { value: 'Operations', label: 'Operations & Logistics' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Location</label>
                  <LocationSearchDropdown
                    value={editForm.location}
                    onChange={(val) => setEditForm({ ...editForm, location: val })}
                    placeholder="Search city, state, or country..."
                  />
                </div>
              </div>

              {/* Experience Range & Skills */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border theme-border space-y-4">
                <ExperienceRangeSelector
                  minYears={editForm.minExperience}
                  maxYears={editForm.maxExperience}
                  experienceLevel={editForm.experienceLevel}
                  onChange={(min, max, lvl) => {
                    setEditForm((prev) => ({
                      ...prev,
                      minExperience: min,
                      maxExperience: max,
                      experienceLevel: (lvl as any) || prev.experienceLevel,
                    }));
                  }}
                />

                <div className="pt-2 border-t theme-border">
                  <SkillKeywordAutocomplete
                    selectedSkills={editForm.skills}
                    onChange={(newSkills) => setEditForm({ ...editForm, skills: newSkills })}
                    label="Required Skills & Tech Keywords"
                    placeholder="Type 'java', 'spring', 'python'..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Employment Type</label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={editForm.salaryMin}
                    onChange={(e) => setEditForm({ ...editForm, salaryMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={editForm.salaryMax}
                    onChange={(e) => setEditForm({ ...editForm, salaryMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isRemoteCheckbox"
                  checked={editForm.isRemote}
                  onChange={(e) => setEditForm({ ...editForm, isRemote: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isRemoteCheckbox" className="text-xs font-semibold theme-text">
                  Remote Position Allowed
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold theme-text mb-1">Job Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border theme-border text-xs font-bold theme-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
                    isRepostMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRepostMode ? 'Reposting & Deducting Quota...' : 'Saving Changes...'}</span>
                    </>
                  ) : (
                    <>
                      {isRepostMode ? (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Confirm & Repost Job (-1 Quota)</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
