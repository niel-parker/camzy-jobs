'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../../context/ThemeContext';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import {
  Star,
  ArrowLeft,
  HelpCircle,
  Loader2,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  X,
  LayoutGrid,
  List,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  CheckCircle2,
  User,
  Download,
  Eye,
} from 'lucide-react';

export default function EmployerKanbanPage() {
  const { sdk } = useTheme();
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [candidateProfileData, setCandidateProfileData] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'name'>('newest');

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const apps = await sdk.request<any[]>('/applications');
        setCandidates(apps || []);
      } catch (err) {
        console.error('Error fetching applications for Kanban:', err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [sdk]);

  const handleOpenInfoModal = async (c: any) => {
    setSelectedCandidate(c);
    setCandidateProfileData(null);
    setLoadingProfile(true);

    try {
      if (c.candidateId) {
        const prof = await sdk.request<any>(`/candidates/${c.candidateId}`);
        setCandidateProfileData(prof);
      }
    } catch (err) {
      console.log('Error fetching candidate detailed profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const stages = [
    { code: 'APPLIED', title: 'Applied', color: 'bg-slate-500', badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' },
    { code: 'UNDER_REVIEW', title: 'Under Review', color: 'bg-indigo-500', badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
    { code: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-emerald-500', badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    { code: 'INTERVIEW', title: 'Interview', color: 'bg-amber-500', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
    { code: 'OFFERED', title: 'Offered', color: 'bg-purple-500', badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
  ];

  const moveStage = async (appId: string, newStage: string) => {
    try {
      await sdk.request(`/applications/${appId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      });
      setCandidates((prev) =>
        prev.map((c) => (c.id === appId ? { ...c, stage: newStage } : c)),
      );
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  // Distinct jobs for filter dropdown
  const uniqueJobs = useMemo(() => {
    const map = new Map<string, string>();
    candidates.forEach((c) => {
      if (c.jobTitle) {
        map.set(c.jobTitle, c.jobTitle);
      }
    });
    return Array.from(map.values());
  }, [candidates]);

  // Filtered and sorted candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = c.candidateName?.toLowerCase().includes(q);
          const headlineMatch = c.candidateHeadline?.toLowerCase().includes(q);
          const jobMatch = c.jobTitle?.toLowerCase().includes(q);
          const emailMatch = c.candidateEmail?.toLowerCase().includes(q);
          if (!nameMatch && !headlineMatch && !jobMatch && !emailMatch) {
            return false;
          }
        }
        // Job filter
        if (selectedJobFilter !== 'ALL' && c.jobTitle !== selectedJobFilter) {
          return false;
        }
        // Stage filter
        if (selectedStageFilter !== 'ALL' && c.stage !== selectedStageFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'name') {
          return (a.candidateName || '').localeCompare(b.candidateName || '');
        }
        return 0;
      });
  }, [candidates, searchQuery, selectedJobFilter, selectedStageFilter, sortBy]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6">
        {/* Top Breadcrumb */}
        <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold theme-muted hover:text-indigo-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employer Dashboard
        </Link>

        {/* Header with Title and View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold theme-text tracking-tight">Applicant ATS Kanban Pipeline</h1>
            <p className="text-xs theme-muted mt-0.5">Track, evaluate, and transition applicants across recruitment stages</p>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border theme-border">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'theme-muted hover:theme-text'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'theme-muted hover:theme-text'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stage Metric Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedStageFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              selectedStageFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border theme-border theme-text hover:border-indigo-500'
            }`}
          >
            <span>All Applicants</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              selectedStageFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 theme-muted'
            }`}>
              {candidates.length}
            </span>
          </button>

          {stages.map((stg) => {
            const count = candidates.filter((c) => c.stage === stg.code).length;
            const isSelected = selectedStageFilter === stg.code;
            return (
              <button
                key={stg.code}
                onClick={() => setSelectedStageFilter(isSelected ? 'ALL' : stg.code)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border theme-border theme-text hover:border-indigo-500'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${stg.color}`} />
                <span>{stg.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 theme-muted'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter, and Sort Toolbar */}
        <div className="glass-card rounded-2xl p-4 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 theme-muted" />
            <input
              type="text"
              placeholder="Search candidate, job, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 theme-muted hover:theme-text">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Job Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <Briefcase className="w-3.5 h-3.5 theme-muted hidden sm:block" />
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none font-semibold cursor-pointer max-w-[180px] truncate"
              >
                <option value="ALL">All Jobs ({uniqueJobs.length})</option>
                {uniqueJobs.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 theme-muted hidden sm:block" />
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none font-semibold cursor-pointer"
              >
                <option value="ALL">All Stages</option>
                {stages.map((s) => (
                  <option key={s.code} value={s.code}>{s.title}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none font-semibold cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Candidate Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading candidates & recruitment pipeline...</span>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-3 border-slate-200 dark:border-slate-800">
            <User className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <h3 className="text-sm font-bold theme-text">No applicants found matching criteria</h3>
            <p className="text-xs theme-muted max-w-sm mx-auto">
              Try adjusting your search query, selecting "All Jobs", or resetting the stage filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedJobFilter('ALL');
                setSelectedStageFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* ========================================================= */
          /* LIST VIEW: HIGH-DENSITY APPLICANT ATS TABLE              */
          /* ========================================================= */
          <div className="glass-card rounded-2xl border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/90 border-b theme-border text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Applied Job</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Current ATS Stage</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {filteredCandidates.map((c) => {
                    const currentStageObj = stages.find((s) => s.code === c.stage) || stages[0];
                    const initials = (c.candidateName || 'Candidate')
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors">
                        {/* Candidate Name & Contact */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                              {initials}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-extrabold text-xs theme-text truncate flex items-center gap-1.5">
                                <span>{c.candidateName}</span>
                              </div>
                              <p className="text-[11px] theme-muted truncate max-w-[200px]">
                                {c.candidateHeadline || 'Candidate'}
                              </p>
                              {(c.candidateEmail || c.candidatePhone) && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  {c.candidateEmail && (
                                    <span className="flex items-center gap-1 truncate max-w-[150px]" title={c.candidateEmail}>
                                      <Mail className="w-2.5 h-2.5 flex-shrink-0 text-indigo-400" />
                                      {c.candidateEmail}
                                    </span>
                                  )}
                                  {c.candidatePhone && (
                                    <span className="flex items-center gap-1" title={c.candidatePhone}>
                                      <Phone className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400" />
                                      {c.candidatePhone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Applied Job */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span className="font-bold text-xs theme-text block">
                              {c.jobTitle}
                            </span>
                            {c.coverLetter && (
                              <span className="text-[10px] theme-muted line-clamp-1 italic max-w-[220px]" title={c.coverLetter}>
                                "{c.coverLetter}"
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{c.rating || 5}</span>
                          </div>
                        </td>

                        {/* Current Stage Dropdown */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center">
                            <select
                              value={c.stage}
                              onChange={(e) => moveStage(c.id, e.target.value)}
                              className={`text-[11px] font-black rounded-lg px-2.5 py-1 border outline-none cursor-pointer shadow-2xs transition-all ${currentStageObj.badgeClass}`}
                            >
                              {stages.map((s) => (
                                <option key={s.code} value={s.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Applied Date */}
                        <td className="py-3 px-4 text-xs theme-muted whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 theme-muted" />
                            {formatDate(c.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.resumeUrlSnapshot && (
                              <a
                                href={c.resumeUrlSnapshot}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                                title="Open Candidate Resume"
                              >
                                <FileText className="w-3 h-3 text-indigo-500" />
                                <span>CV</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenInfoModal(c)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              title="View Full Candidate Profile & Screening Evaluation"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Evaluate</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* List Footer Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t theme-border flex items-center justify-between text-xs theme-muted">
              <span>Showing {filteredCandidates.length} of {candidates.length} total applicants</span>
              <span className="font-semibold text-indigo-500">Recruiter ATS Pipeline Live</span>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* KANBAN BOARD: 5 STAGES COLUMNS GRID                      */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
            {stages.map((stg) => {
              const stageCandidates = filteredCandidates.filter((c) => c.stage === stg.code);
              return (
                <div key={stg.code} className="glass-card rounded-2xl p-4 border-slate-200 dark:border-slate-800 space-y-4 min-w-[230px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stg.color}`} /> {stg.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageCandidates.length === 0 ? (
                      <div className="py-6 text-center text-[11px] theme-muted border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        No candidates in this stage
                      </div>
                    ) : (
                      stageCandidates.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-indigo-400 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                              {c.candidateName}
                            </span>
                            <div className="flex items-center text-amber-500 text-[10px] font-bold">
                              <Star className="w-3 h-3 fill-amber-500 mr-0.5" /> {c.rating || 5}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {c.candidateHeadline || c.jobTitle}
                          </p>

                          {c.candidateEmail && (
                            <p className="text-[10px] text-slate-400 truncate">
                              {c.candidateEmail}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <button
                              onClick={() => handleOpenInfoModal(c)}
                              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                              title="View Full Candidate Profile & Screening Answers"
                            >
                              <HelpCircle className="w-3 h-3" /> View Profile
                            </button>

                            <select
                              value={c.stage}
                              onChange={(e) => moveStage(c.id, e.target.value)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-200 outline-none cursor-pointer font-semibold"
                            >
                              {stages.map((s) => (
                                <option key={s.code} value={s.code}>{s.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recruiter Evaluation Info Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-5 theme-modal animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b theme-border pb-4">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Naukri ATS Evaluation
                </span>
                <h3 className="text-lg font-black theme-text mt-1">{selectedCandidate.candidateName}</h3>
                <p className="text-xs theme-muted">Applied for: <strong className="theme-text">{selectedCandidate.jobTitle}</strong></p>
                {(selectedCandidate.candidateEmail || selectedCandidate.candidatePhone) && (
                  <div className="flex items-center gap-3 text-xs theme-muted pt-1">
                    {selectedCandidate.candidateEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-indigo-500" /> {selectedCandidate.candidateEmail}
                      </span>
                    )}
                    {selectedCandidate.candidatePhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" /> {selectedCandidate.candidatePhone}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingProfile ? (
              <div className="py-12 text-center text-xs theme-muted flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading full candidate profile history...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Resume Attachment Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border theme-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="font-bold theme-text">Candidate Resume Snapshot</p>
                      <p className="text-[11px] theme-muted">{selectedCandidate.resumeUrlSnapshot || 'resume.pdf'}</p>
                    </div>
                  </div>
                  {selectedCandidate.resumeUrlSnapshot && (
                    <a
                      href={selectedCandidate.resumeUrlSnapshot}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3" /> Open Resume
                    </a>
                  )}
                </div>

                {/* Recruiter Screening Answers */}
                {selectedCandidate.answersJson && Object.keys(selectedCandidate.answersJson).length > 0 && (
                  <div className="p-4 rounded-xl border theme-border bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Screening Questionnaire Responses
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {Object.entries(selectedCandidate.answersJson).map(([k, v]) => (
                        <div key={k} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border theme-border">
                          <span className="text-[10px] theme-muted block font-bold capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-semibold theme-text text-xs">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedCandidate.coverLetter && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold theme-text">Cover Note to Hiring Manager</h4>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border text-xs theme-text leading-relaxed">
                      "{selectedCandidate.coverLetter}"
                    </div>
                  </div>
                )}

                {/* Detailed Work Experience History */}
                {candidateProfileData?.experience && candidateProfileData.experience.length > 0 && (
                  <div className="space-y-2 pt-2 border-t theme-border">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Work Experience History ({candidateProfileData.experience.length})
                    </h4>
                    <div className="space-y-2">
                      {candidateProfileData.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex justify-between font-bold theme-text">
                            <span>{exp.designation || exp.title}</span>
                            <span className="text-indigo-500">{exp.companyName || exp.company}</span>
                          </div>
                          <p className="text-[11px] theme-muted">
                            {exp.startDate || exp.startYear} – {exp.isCurrentJob || exp.isCurrent ? 'Present' : exp.endDate || exp.endYear || exp.year} {exp.location && `• ${exp.location}`}
                          </p>
                          {(exp.jobSummary || exp.rolesAndResponsibilities || exp.description) && (
                            <p className="text-[11px] theme-text pt-0.5 leading-relaxed">
                              {exp.jobSummary || exp.rolesAndResponsibilities || exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education & Qualifications */}
                {candidateProfileData?.education && candidateProfileData.education.length > 0 && (
                  <div className="space-y-2 pt-2 border-t theme-border">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-500" /> Education ({candidateProfileData.education.length})
                    </h4>
                    <div className="space-y-2">
                      {candidateProfileData.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex justify-between font-bold theme-text">
                            <span>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</span>
                            <span className="text-indigo-500">{edu.institution}</span>
                          </div>
                          <p className="text-[11px] theme-muted">
                            {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear || edu.year} {(edu.grade || edu.result) && `• Grade: ${edu.grade || edu.result}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {candidateProfileData?.certifications && candidateProfileData.certifications.length > 0 && (
                  <div className="space-y-2 pt-2 border-t theme-border">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-500" /> Certifications ({candidateProfileData.certifications.length})
                    </h4>
                    <div className="space-y-2">
                      {candidateProfileData.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold theme-text">{cert.title}</p>
                            <p className="text-[11px] theme-muted">{cert.issuingOrganization}</p>
                          </div>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-500 hover:underline">
                              Verify ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
