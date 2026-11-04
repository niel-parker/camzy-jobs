'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { GovtJobItem, GovtJobCategoryType } from '@job-portal/sdk';
import { 
  Landmark, Building2, Plus, Search, Edit3, Trash2, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, AlertCircle, ExternalLink, Calendar, 
  MapPin, ShieldCheck, Award, Eye, Globe, FileText, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';

const INDIAN_STATES = [
  'All States',
  'Uttar Pradesh',
  'Maharashtra',
  'Bihar',
  'Rajasthan',
  'Delhi',
  'Madhya Pradesh',
  'Gujarat',
  'Haryana',
  'Punjab',
  'West Bengal',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Assam',
];

const SECTOR_OPTIONS = [
  'UPSC / Civil Services',
  'SSC / Staff Selection',
  'Railways / RRB',
  'Banking / IBPS',
  'Police / Law Enforcement',
  'Defence / Armed Forces',
  'Teaching / Education',
  'State PSC / Civil Services',
  'PSU / Engineering',
  'Healthcare / Medical',
  'General Administration',
];

export default function AdminGovtJobsManagementPage() {
  const { sdk } = useTheme();

  const [jobs, setJobs] = useState<GovtJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabFilter, setTabFilter] = useState<'ALL' | 'CENTRAL' | 'STATE'>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('All States');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<GovtJobItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete modal state
  const [deletingJob, setDeletingJob] = useState<GovtJobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form State
  const [form, setForm] = useState<{
    category: GovtJobCategoryType;
    state: string;
    sector: string;
    titleEn: string;
    titleHi: string;
    departmentEn: string;
    departmentHi: string;
    totalVacancies: string;
    qualificationEn: string;
    qualificationHi: string;
    ageLimit: string;
    salaryScale: string;
    startDate: string;
    lastDate: string;
    applyUrl: string;
    notificationUrl: string;
    officialWebsiteUrl: string;
    descriptionEn: string;
    descriptionHi: string;
    isActive: boolean;
    isFeatured: boolean;
    orderIndex: number;
  }>({
    category: 'CENTRAL',
    state: 'Uttar Pradesh',
    sector: 'UPSC / Civil Services',
    titleEn: '',
    titleHi: '',
    departmentEn: '',
    departmentHi: '',
    totalVacancies: '',
    qualificationEn: '',
    qualificationHi: '',
    ageLimit: '',
    salaryScale: '',
    startDate: '',
    lastDate: '',
    applyUrl: '',
    notificationUrl: '',
    officialWebsiteUrl: '',
    descriptionEn: '',
    descriptionHi: '',
    isActive: true,
    isFeatured: false,
    orderIndex: 0,
  });

  const loadGovtJobs = async () => {
    setLoading(true);
    try {
      const data = await sdk.getGovtJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Failed to load government jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovtJobs();
  }, [sdk]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (tabFilter !== 'ALL' && j.category !== tabFilter) return false;
      if (tabFilter === 'STATE' && stateFilter !== 'All States') {
        if (!j.state || !j.state.toLowerCase().includes(stateFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mTitle = (j.titleEn && j.titleEn.toLowerCase().includes(q)) ||
                       (j.titleHi && j.titleHi.toLowerCase().includes(q));
        const mDept = (j.departmentEn && j.departmentEn.toLowerCase().includes(q)) ||
                      (j.departmentHi && j.departmentHi.toLowerCase().includes(q));
        const mState = j.state && j.state.toLowerCase().includes(q);
        if (!mTitle && !mDept && !mState) return false;
      }
      return true;
    });
  }, [jobs, tabFilter, stateFilter, searchQuery]);

  const openAddModal = () => {
    setEditingJob(null);
    setForm({
      category: tabFilter === 'STATE' ? 'STATE' : 'CENTRAL',
      state: stateFilter !== 'All States' ? stateFilter : 'Uttar Pradesh',
      sector: 'UPSC / Civil Services',
      titleEn: '',
      titleHi: '',
      departmentEn: '',
      departmentHi: '',
      totalVacancies: '',
      qualificationEn: '',
      qualificationHi: '',
      ageLimit: '',
      salaryScale: '',
      startDate: new Date().toISOString().split('T')[0],
      lastDate: '',
      applyUrl: '',
      notificationUrl: '',
      officialWebsiteUrl: '',
      descriptionEn: '',
      descriptionHi: '',
      isActive: true,
      isFeatured: false,
      orderIndex: jobs.length + 1,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job: GovtJobItem) => {
    setEditingJob(job);
    setForm({
      category: job.category,
      state: job.state || 'Uttar Pradesh',
      sector: job.sector || 'General',
      titleEn: job.titleEn || '',
      titleHi: job.titleHi || '',
      departmentEn: job.departmentEn || '',
      departmentHi: job.departmentHi || '',
      totalVacancies: job.totalVacancies || '',
      qualificationEn: job.qualificationEn || '',
      qualificationHi: job.qualificationHi || '',
      ageLimit: job.ageLimit || '',
      salaryScale: job.salaryScale || '',
      startDate: job.startDate || '',
      lastDate: job.lastDate || '',
      applyUrl: job.applyUrl || '',
      notificationUrl: job.notificationUrl || '',
      officialWebsiteUrl: job.officialWebsiteUrl || '',
      descriptionEn: job.descriptionEn || '',
      descriptionHi: job.descriptionHi || '',
      isActive: Boolean(job.isActive),
      isFeatured: Boolean(job.isFeatured),
      orderIndex: job.orderIndex || 0,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    if (!form.titleEn.trim() || !form.departmentEn.trim() || !form.lastDate.trim() || !form.applyUrl.trim()) {
      setErrorMsg('English post title, department, application last date, and official apply URL are required.');
      setSaving(false);
      return;
    }

    try {
      const payload: Partial<GovtJobItem> = {
        category: form.category,
        state: form.category === 'STATE' ? form.state : undefined,
        sector: form.sector,
        titleEn: form.titleEn.trim(),
        titleHi: form.titleHi.trim() || form.titleEn.trim(),
        departmentEn: form.departmentEn.trim(),
        departmentHi: form.departmentHi.trim() || form.departmentEn.trim(),
        totalVacancies: form.totalVacancies.trim() || 'Multiple Posts',
        qualificationEn: form.qualificationEn.trim(),
        qualificationHi: form.qualificationHi.trim(),
        ageLimit: form.ageLimit.trim(),
        salaryScale: form.salaryScale.trim(),
        startDate: form.startDate.trim(),
        lastDate: form.lastDate.trim(),
        applyUrl: form.applyUrl.trim(),
        notificationUrl: form.notificationUrl.trim(),
        officialWebsiteUrl: form.officialWebsiteUrl.trim(),
        descriptionEn: form.descriptionEn.trim(),
        descriptionHi: form.descriptionHi.trim(),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        orderIndex: Number(form.orderIndex) || 0,
      };

      if (editingJob) {
        payload.id = editingJob.id;
      }

      await sdk.saveGovtJob(payload);
      setIsModalOpen(false);
      setSuccessMsg(editingJob ? 'Government job notice updated successfully!' : 'New Government job notice published successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadGovtJobs();
    } catch (err: any) {
      console.error('Failed to save govt job:', err);
      setErrorMsg(err.message || 'Failed to save government job.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingJob) return;
    setIsDeleting(true);
    try {
      await sdk.deleteGovtJob(deletingJob.id);
      setDeletingJob(null);
      setSuccessMsg(`Govt job notice '${deletingJob.titleEn}' deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadGovtJobs();
    } catch (err: any) {
      console.error('Failed to delete govt job:', err);
      setErrorMsg(err.message || 'Failed to delete government job.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (job: GovtJobItem) => {
    try {
      await sdk.saveGovtJob({
        id: job.id,
        isActive: !job.isActive,
      });
      setJobs(jobs.map(j => j.id === job.id ? { ...j, isActive: !j.isActive } : j));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleReseedDefaults = async () => {
    if (!confirm('This will load all official default Central and State Govt notifications. Continue?')) return;
    setLoading(true);
    try {
      await sdk.seedGovtJobDefaults();
      setSuccessMsg('Official default government job notifications loaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadGovtJobs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reseed default notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Government Recruitment Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Bilingual (Hindi / English)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight theme-text mt-1 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-indigo-500" /> Government Jobs Management (Sarkari Portal)
            </h1>
            <p className="text-xs theme-muted">Manage Central Govt, State Govt notifications, official apply URLs, and bilingual Hindi/English content</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/govt-jobs"
              target="_blank"
              className="px-3.5 py-2 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Preview Live Portal</span>
            </Link>

            <button
              type="button"
              onClick={handleReseedDefaults}
              className="px-3.5 py-2 rounded-xl border theme-border font-bold text-xs theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              title="Reseed official notices"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reseed Defaults</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Govt Job</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">Total Govt Postings</span>
            <span className="text-2xl font-black theme-text mt-1 block">{jobs.length}</span>
            <span className="text-[10px] text-indigo-500 font-bold">Central & State Combined</span>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">Central Govt Jobs</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {jobs.filter(j => j.category === 'CENTRAL').length}
            </span>
            <span className="text-[10px] text-amber-500 font-bold">UPSC, SSC, Railways, Banks</span>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">State Govt Jobs</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {jobs.filter(j => j.category === 'STATE').length}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">State PSC & Police Boards</span>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">Active Public Listings</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
              {jobs.filter(j => j.isActive).length}
            </span>
            <span className="text-[10px] text-indigo-500 font-bold">Visible on /govt-jobs</span>
          </div>
        </div>

        {/* FILTER BAR: CATEGORY TABS, STATE DROPDOWN, SEARCH */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Category Tab Buttons */}
            <div className="inline-flex p-1 rounded-xl border theme-border bg-slate-100 dark:bg-slate-800/80 w-full md:w-auto">
              <button
                type="button"
                onClick={() => { setTabFilter('ALL'); setStateFilter('All States'); }}
                className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tabFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'theme-muted hover:theme-text'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                type="button"
                onClick={() => { setTabFilter('CENTRAL'); setStateFilter('All States'); }}
                className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tabFilter === 'CENTRAL' ? 'bg-indigo-600 text-white shadow-xs' : 'theme-muted hover:theme-text'
                }`}
              >
                Central Govt ({jobs.filter(j => j.category === 'CENTRAL').length})
              </button>
              <button
                type="button"
                onClick={() => setTabFilter('STATE')}
                className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tabFilter === 'STATE' ? 'bg-indigo-600 text-white shadow-xs' : 'theme-muted hover:theme-text'
                }`}
              >
                State Govt ({jobs.filter(j => j.category === 'STATE').length})
              </button>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {/* State Filter Dropdown */}
              {tabFilter === 'STATE' && (
                <div className="relative flex-1 md:w-48">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" />
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              )}

              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 theme-muted" />
                <input
                  type="text"
                  placeholder="Search notices, post, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* JOBS TABLE */}
        <div className="theme-surface border theme-border rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs theme-muted font-bold">Loading government job postings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Landmark className="w-10 h-10 text-indigo-400 mx-auto opacity-50" />
              <p className="text-sm font-bold theme-text">No government job records found matching filters.</p>
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                + Create First Govt Job
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b theme-border text-[11px] font-black uppercase tracking-wider theme-muted">
                  <tr>
                    <th className="py-3 px-4">Post & Department</th>
                    <th className="py-3 px-4">Category / State</th>
                    <th className="py-3 px-4">Vacancies</th>
                    <th className="py-3 px-4">Last Date</th>
                    <th className="py-3 px-4">Apply URL</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors">
                      {/* Title & Department */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-0.5">
                          <p className="font-extrabold theme-text line-clamp-1">{job.titleEn}</p>
                          {job.titleHi && job.titleHi !== job.titleEn && (
                            <p className="text-[11px] theme-muted line-clamp-1 italic font-medium">{job.titleHi}</p>
                          )}
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{job.departmentEn}</p>
                        </div>
                      </td>

                      {/* Category & State */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            job.category === 'CENTRAL'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {job.category === 'CENTRAL' ? 'Central' : 'State'}
                          </span>
                          {job.state && (
                            <p className="text-[11px] font-bold theme-text flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-500" />
                              <span>{job.state}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Vacancies */}
                      <td className="py-3.5 px-4 font-black theme-text whitespace-nowrap">
                        {job.totalVacancies}
                      </td>

                      {/* Last Date */}
                      <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {job.lastDate}
                      </td>

                      {/* Apply URL */}
                      <td className="py-3.5 px-4 whitespace-nowrap max-w-[140px] truncate">
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-bold"
                        >
                          <span className="truncate">{job.applyUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>

                      {/* Active Toggle Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className="cursor-pointer transition-transform hover:scale-105"
                          title="Toggle active status"
                        >
                          {job.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20">
                              <XCircle className="w-3 h-3" /> Draft
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(job)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit notice"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingJob(job)}
                            className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* ========================================================================= */}
        {/* ADD / EDIT GOVT JOB MODAL */}
        {/* ========================================================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-3xl max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black theme-text">
                      {editingJob ? 'Edit Government Job Notification' : 'Post New Government Job Notification'}
                    </h3>
                    <p className="text-xs theme-muted">Configure bilingual Hindi and English title, dates, and official government portal apply links</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Section A: Category, State & Sector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border theme-border">
                  
                  {/* Category: Central vs State */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Govt Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="CENTRAL">🏛️ Central Government (Union)</option>
                      <option value="STATE">🏢 State Government</option>
                    </select>
                  </div>

                  {/* State (if State Govt) */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">
                      {form.category === 'STATE' ? 'State / Region *' : 'State (Optional)'}
                    </label>
                    <select
                      disabled={form.category !== 'STATE'}
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      {INDIAN_STATES.filter(s => s !== 'All States').map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Sector / Stream *</label>
                    <select
                      value={form.sector}
                      onChange={(e) => setForm({ ...form, sector: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {SECTOR_OPTIONS.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section B: Bilingual Post Titles & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Title in English */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1 flex items-center gap-1">
                      <span>Post Title (English) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SSC Combined Graduate Level (CGL) 2026 Examination"
                      value={form.titleEn}
                      onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Title in Hindi */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1 flex items-center gap-1">
                      <span>Post Title (हिंदी में)</span>
                      <span className="text-[10px] theme-muted font-normal">(Hindi)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. कर्मचारी चयन आयोग संयुक्त स्नातक स्तरीय (CGL) 2026 परीक्षा"
                      value={form.titleHi}
                      onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Department in English */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">
                      Department / Ministry (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Staff Selection Commission (SSC), Govt of India"
                      value={form.departmentEn}
                      onChange={(e) => setForm({ ...form, departmentEn: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Department in Hindi */}
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">
                      Department / Ministry (हिंदी में)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. कर्मचारी चयन आयोग (एसएससी), भारत सरकार"
                      value={form.departmentHi}
                      onChange={(e) => setForm({ ...form, departmentHi: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section C: Vacancies, Eligibility, Age & Pay Scale */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Total Vacancies *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 17,727 Posts"
                      value={form.totalVacancies}
                      onChange={(e) => setForm({ ...form, totalVacancies: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Age Limit</label>
                    <input
                      type="text"
                      placeholder="e.g. 18 - 32 Years"
                      value={form.ageLimit}
                      onChange={(e) => setForm({ ...form, ageLimit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Pay Scale / Level</label>
                    <input
                      type="text"
                      placeholder="e.g. Pay Level 7 (₹44,900 - ₹1,42,400)"
                      value={form.salaryScale}
                      onChange={(e) => setForm({ ...form, salaryScale: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Display Order</label>
                    <input
                      type="number"
                      value={form.orderIndex}
                      onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Eligibility / Qualification (Bilingual) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Qualification (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor's Degree in any discipline from recognized University"
                      value={form.qualificationEn}
                      onChange={(e) => setForm({ ...form, qualificationEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Qualification (हिंदी में)</label>
                    <input
                      type="text"
                      placeholder="उदा. किसी भी मान्यता प्राप्त विश्वविद्यालय से स्नातक डिग्री"
                      value={form.qualificationHi}
                      onChange={(e) => setForm({ ...form, qualificationHi: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section D: Important Dates & Official Apply URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-500/20">
                  <div>
                    <label className="block text-xs font-bold theme-text mb-1">Application Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Application Last Date *</label>
                    <input
                      type="date"
                      required
                      value={form.lastDate}
                      onChange={(e) => setForm({ ...form, lastDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 theme-surface theme-text text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Official Online Application Portal Link (Apply URL) *</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://ssc.gov.in OR https://upsconline.nic.in"
                      value={form.applyUrl}
                      onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-700 theme-surface theme-text text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] theme-muted mt-1">Candidates clicking 'Apply Online' will directly land on this official government website.</p>
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold theme-text mb-1">Official Notification PDF Link</label>
                      <input
                        type="url"
                        placeholder="https://.../advt_notification.pdf"
                        value={form.notificationUrl}
                        onChange={(e) => setForm({ ...form, notificationUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold theme-text mb-1">Official Commission Home URL</label>
                      <input
                        type="url"
                        placeholder="https://ssc.gov.in"
                        value={form.officialWebsiteUrl}
                        onChange={(e) => setForm({ ...form, officialWebsiteUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold theme-text">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Active & Visible Publicly</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold theme-text">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Highlight as Featured Notice</span>
                  </label>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t theme-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{editingJob ? 'Update Notice' : 'Publish Notice'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {deletingJob && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black theme-text">Delete Government Job Notice?</h3>
                <p className="text-xs theme-muted">
                  Are you sure you want to delete <strong className="theme-text">"{deletingJob.titleEn}"</strong>? This will permanently remove it from the public portal.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingJob(null)}
                  className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
