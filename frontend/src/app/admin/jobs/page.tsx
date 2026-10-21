'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { CrossCompanyJobItem, CompanyDirectoryItem } from '@job-portal/sdk';
import { 
  Briefcase, Plus, Search, Building2, MapPin, Users, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, Filter, ExternalLink, Sparkles, AlertCircle 
} from 'lucide-react';

export default function AdminCrossCompanyJobsPage() {
  const { sdk } = useTheme();

  const [jobs, setJobs] = useState<CrossCompanyJobItem[]>([]);
  const [companies, setCompanies] = useState<CompanyDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('');

  // Post Job on Behalf Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);

  const [jobForm, setJobForm] = useState({
    tenantId: '',
    title: '',
    category: 'Engineering & Technology',
    location: 'Bangalore, Karnataka, India',
    jobType: 'Full-time',
    minExperience: 3,
    maxExperience: 7,
    salaryMin: 1200000,
    salaryMax: 2400000,
    description: '',
    skills: 'TypeScript, React, Node.js',
    isRemote: true,
    isFeatured: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, companiesData] = await Promise.all([
        sdk.getAdminJobs({
          tenantId: selectedTenantFilter || undefined,
          search: searchQuery || undefined,
        }),
        sdk.getAdminCompanies().catch(() => []),
      ]);
      setJobs(jobsData);
      setCompanies(companiesData);
    } catch (err: any) {
      console.error('Failed to load admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTenantFilter, sdk]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await sdk.updateAdminJobStatus(jobId, nextStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.tenantId) {
      setPostError('Please select a company to post on behalf of');
      return;
    }
    if (!jobForm.title.trim()) {
      setPostError('Job title is required');
      return;
    }

    setPosting(true);
    setPostError(null);
    setPostSuccess(null);

    try {
      const skillsArray = jobForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await sdk.postJobAsCompany({
        tenantId: jobForm.tenantId,
        title: jobForm.title.trim(),
        category: jobForm.category,
        location: jobForm.location,
        jobType: jobForm.jobType,
        minExperience: Number(jobForm.minExperience),
        maxExperience: Number(jobForm.maxExperience),
        salaryMin: Number(jobForm.salaryMin),
        salaryMax: Number(jobForm.salaryMax),
        description: jobForm.description || `Opportunity for ${jobForm.title} at ${companies.find(c => c.id === jobForm.tenantId)?.name || 'our company'}.`,
        skills: skillsArray,
        isRemote: jobForm.isRemote,
        isFeatured: jobForm.isFeatured,
      });

      setPostSuccess('Job successfully posted on behalf of company (quota bypassed)!');
      setTimeout(() => {
        setIsPostModalOpen(false);
        setPostSuccess(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setPostError(err.message || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const activeJobsCount = jobs.filter((j) => j.status === 'ACTIVE').length;
  const totalApplications = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Cross-Company Master
              </span>
              <span className="text-xs font-semibold theme-muted">All Registered Tenants</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-500" />
              Jobs Across All Companies
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Inspect, moderate, and post jobs on behalf of any registered employer company without quota blocks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setIsPostModalOpen(true);
                setPostError(null);
                setPostSuccess(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Job On Behalf of Company</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Total Posted Jobs</p>
              <h3 className="text-2xl font-black theme-text mt-0.5">{jobs.length}</h3>
              <p className="text-[10px] text-indigo-500 font-bold mt-1">Across all companies</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Active Listings</p>
              <h3 className="text-2xl font-black text-emerald-500 mt-0.5">{activeJobsCount}</h3>
              <p className="text-[10px] theme-muted mt-1">Visible on public job search</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Total ATS Applications</p>
              <h3 className="text-2xl font-black theme-text mt-0.5">{totalApplications}</h3>
              <p className="text-[10px] text-purple-500 font-bold mt-1">Candidate submissions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedTenantFilter}
                onChange={(e) => setSelectedTenantFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Companies ({companies.length})</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Jobs Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading cross-company jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No jobs found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  No jobs matched your current search filters. Try clearing the company or search term.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Job Title & Company</th>
                    <th className="py-3 px-4">Location & Remote</th>
                    <th className="py-3 px-4">Exp & Salary Bracket</th>
                    <th className="py-3 px-4 text-center">Applications</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold theme-text">{job.title}</span>
                            {job.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-semibold">
                            <Building2 className="w-3 h-3" />
                            <span>{job.companyName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 theme-text">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                          {job.isRemote && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-500">
                              Remote Friendly
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="theme-text font-medium">
                            {job.minExperience ?? 0} - {job.maxExperience ?? '+'} Yrs Exp
                          </div>
                          {job.salaryMin && job.salaryMax ? (
                            <div className="theme-muted font-mono">
                              ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                            </div>
                          ) : (
                            <div className="theme-muted text-[10px]">Competitive</div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          <Users className="w-3 h-3" />
                          {job.applicationCount || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(job.id, job.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            job.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          {job.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              ACTIVE
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              {job.status}
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/jobs/${job.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Post Job on Behalf Modal */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="max-w-xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Post Job On Behalf of Company
                  </h3>
                  <p className="text-[10px] theme-muted">Bypasses plan quota checks for administrative posting</p>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="p-5 space-y-4">
                {postError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{postError}</span>
                  </div>
                )}

                {postSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{postSuccess}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Select Target Company <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={jobForm.tenantId}
                    onChange={(e) => setJobForm({ ...jobForm, tenantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Company --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.planName || 'Plan'} - {c.activeJobs || 0} active jobs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Full Stack Architect"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Job Category
                    </label>
                    <input
                      type="text"
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Job Type
                    </label>
                    <select
                      value={jobForm.jobType}
                      onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Experience (Min - Max Yrs)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={jobForm.minExperience}
                        onChange={(e) => setJobForm({ ...jobForm, minExperience: parseInt(e.target.value) || 0 })}
                        className="px-2 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={jobForm.maxExperience}
                        onChange={(e) => setJobForm({ ...jobForm, maxExperience: parseInt(e.target.value) || 0 })}
                        className="px-2 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Annual Salary Range (₹)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min Salary"
                        value={jobForm.salaryMin}
                        onChange={(e) => setJobForm({ ...jobForm, salaryMin: parseInt(e.target.value) || 0 })}
                        className="px-2 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Max Salary"
                        value={jobForm.salaryMax}
                        onChange={(e) => setJobForm({ ...jobForm, salaryMax: parseInt(e.target.value) || 0 })}
                        className="px-2 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, TypeScript, PostgreSQL"
                    value={jobForm.skills}
                    onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Job Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key responsibilities and role summary..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobForm.isRemote}
                      onChange={(e) => setJobForm({ ...jobForm, isRemote: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold theme-text">Remote Allowed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobForm.isFeatured}
                      onChange={(e) => setJobForm({ ...jobForm, isFeatured: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold theme-text">Mark as Featured</span>
                  </label>
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={posting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    {posting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Post Job Now</span>
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
