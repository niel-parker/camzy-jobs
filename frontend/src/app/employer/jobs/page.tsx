'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Briefcase, Plus, Sparkles, Users, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { JobListing } from '@job-portal/sdk';

export default function EmployerJobListingsPage() {
  const { sdk } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    category: string;
    location: string;
    isRemote: boolean;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
    experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    salaryMin: number;
    salaryMax: number;
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
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await sdk.getJobListings();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching company jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [sdk]);

  const featureJob = async (id: string) => {
    try {
      await sdk.featureJob(id);
      fetchJobs();
    } catch (err) {
      console.error('Error featuring job:', err);
    }
  };

  const openEditModal = (job: JobListing) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      category: job.category || 'Engineering',
      location: job.location || '',
      isRemote: job.isRemote ?? true,
      employmentType: (job.employmentType as 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship') || 'Full-time',
      experienceLevel: (job.experienceLevel as 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive') || 'Mid',
      salaryMin: job.salaryMin || 100000,
      salaryMax: job.salaryMax || 150000,
      description: job.description || '',
    });
    setActionError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setIsSaving(true);
    setActionError(null);

    try {
      await sdk.updateJob(editingJob.id, editForm);
      setEditingJob(null);
      fetchJobs();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update job posting');
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

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight theme-text">
              Company Job Listings
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Manage active job postings, edit details, remove old roles, and feature listing boosts.
            </p>
          </div>

          <a
            href="/employer/jobs/create"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="h-4 w-4 mr-1" /> Post New Position
          </a>
        </div>

        {/* Jobs Table */}
        <div className="theme-surface border theme-border rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Loading job postings from database...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center theme-muted text-xs space-y-2">
              <Briefcase className="w-8 h-8 mx-auto text-indigo-500 opacity-50" />
              <p className="font-bold theme-text">No Job Postings Found</p>
              <p>Click &apos;Post New Position&apos; above to create your company posting.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold theme-muted uppercase tracking-wider">
                    <th className="py-3 px-6">Job Position & Category</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Applicants</th>
                    <th className="py-3 px-6">Posted Date</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold theme-text text-sm">{job.title}</div>
                        <div className="text-xs theme-muted flex items-center space-x-2 mt-0.5">
                          <span>{job.category}</span>
                          <span>•</span>
                          <span>{job.location} {job.isRemote && '(Remote)'}</span>
                          {job.isFeatured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              <Sparkles className="h-3 w-3 mr-0.5" /> Featured
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <a
                          href="/employer/candidates/kanban"
                          className="inline-flex items-center text-indigo-500 font-bold hover:underline"
                        >
                          <Users className="h-4 w-4 mr-1" /> View Applicants
                        </a>
                      </td>

                      <td className="py-4 px-6 theme-muted">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!job.isFeatured && (
                            <button
                              onClick={() => featureJob(job.id)}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
                              title="Promote Job to Featured"
                            >
                              Boost
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(job)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 flex items-center gap-1 transition-all"
                            title="Edit Job Details"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>

                          <button
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center gap-1 transition-all"
                            title="Delete Job Posting"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
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
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 theme-modal">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <h3 className="text-lg font-extrabold theme-text flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-500" /> Edit Job Posting
              </h3>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 text-xs rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold theme-text mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Employment Type</label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={editForm.salaryMax}
                    onChange={(e) => setEditForm({ ...editForm, salaryMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 text-xs rounded-lg theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-lg border theme-border text-xs font-bold theme-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
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
