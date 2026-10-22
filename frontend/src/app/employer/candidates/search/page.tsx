'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { useTheme } from '../../../../context/ThemeContext';
import { 
  Search, Filter, MapPin, DollarSign, Clock, FileText, Download, Briefcase, 
  ShieldCheck, Sparkles, User, ExternalLink, Loader2, Award, ChevronRight, Check, Eye
} from 'lucide-react';
import { ProfileResumeModal } from '../../../../components/ProfileResumeModal';

export default function CandidateSearchPage() {
  const { theme, sdk } = useTheme();

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

  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search Filters State
  const [skillQuery, setSkillQuery] = useState('');
  const [noticePeriodFilter, setNoticePeriodFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minExpFilter, setMinExpFilter] = useState('');
  const [maxSalaryFilter, setMaxSalaryFilter] = useState('');

  // Selected Candidate Drawer State
  const [selectedCand, setSelectedCand] = useState<any | null>(null);
  const [resumePreviewCand, setResumePreviewCand] = useState<any | null>(null);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await sdk.searchCandidates({
        skill: skillQuery || undefined,
        noticePeriod: noticePeriodFilter || undefined,
        city: cityFilter || undefined,
        minExp: minExpFilter ? Number(minExpFilter) : undefined,
        maxSalary: maxSalaryFilter ? Number(maxSalaryFilter) : undefined,
      });
      setCandidates(data);
    } catch (err) {
      console.error('Failed to search candidate database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleResetFilters = () => {
    setSkillQuery('');
    setNoticePeriodFilter('');
    setCityFilter('');
    setMinExpFilter('');
    setMaxSalaryFilter('');
    sdk.searchCandidates({}).then((data) => setCandidates(data));
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2">
              <Search className="w-6 h-6 text-indigo-500" /> Resume & Candidate Sourcing Search Engine
            </h1>
            <p className="text-xs theme-muted">Filter active candidates by skills, notice period, preferred cities, salary expectations & download resumes</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-extrabold flex items-center gap-1.5 w-fit">
            <Sparkles className="w-4 h-4 text-amber-500" /> {candidates.length} Candidates Available
          </span>
        </div>

        {/* Filter Toolbar Card */}
        <form onSubmit={handleApplySearch} className="theme-surface border theme-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Skill Query */}
            <div>
              <label className="block font-bold theme-text mb-1">Key Skill / Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 theme-muted" />
                <input
                  type="text"
                  placeholder="e.g. Next.js, React, Python"
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                />
              </div>
            </div>

            {/* Notice Period */}
            <div>
              <label className="block font-bold theme-text mb-1">Notice Period</label>
              <select
                value={noticePeriodFilter}
                onChange={(e) => setNoticePeriodFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-bold"
              >
                <option value="">All Notice Periods</option>
                <option value="Immediate">Immediate / Serving Notice</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
              </select>
            </div>

            {/* Preferred City */}
            <div>
              <label className="block font-bold theme-text mb-1">Preferred City</label>
              <input
                type="text"
                placeholder="e.g. Bangalore, Mumbai"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
              />
            </div>

            {/* Min Experience */}
            <div>
              <label className="block font-bold theme-text mb-1">Min Exp (Years)</label>
              <input
                type="number"
                placeholder="e.g. 3"
                value={minExpFilter}
                onChange={(e) => setMinExpFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
              />
            </div>

            {/* Max Expected Salary */}
            <div>
              <label className="block font-bold theme-text mb-1">Max Expected Salary ($)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={maxSalaryFilter}
                onChange={(e) => setMaxSalaryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t theme-border">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
              Apply Talent Filters
            </button>
          </div>
        </form>

        {/* Candidate Results Grid */}
        {isLoading ? (
          <div className="py-20 text-center theme-muted text-xs animate-pulse">
            Sourcing candidates from database...
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 rounded-2xl border theme-border theme-surface text-center space-y-3">
            <User className="w-10 h-10 mx-auto theme-muted" />
            <h3 className="text-base font-bold theme-text">No Candidates Found</h3>
            <p className="text-xs theme-muted">Try broadening your search query or notice period filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {candidates.map((cand) => (
              <div key={cand.id} className="theme-surface border theme-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                        {cand.user?.firstName ? cand.user.firstName[0] : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black theme-text">
                            {cand.user ? `${cand.user.firstName} ${cand.user.lastName}` : 'Alex Candidate'}
                          </h3>
                          {cand.user?.isEmailVerified && (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-extrabold text-indigo-500">{cand.headline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border theme-border font-medium">
                    <div>
                      <span className="theme-muted block text-[10px]">Notice Period</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {cand.noticePeriod || 'Immediate'}
                      </span>
                    </div>

                    <div>
                      <span className="theme-muted block text-[10px]">Expected Salary</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> ${cand.expectedSalary ? cand.expectedSalary.toLocaleString() : '120,000'}
                      </span>
                    </div>

                    <div>
                      <span className="theme-muted block text-[10px]">Total Experience</span>
                      <span className="font-bold theme-text">{cand.experienceYears || 0} Years</span>
                    </div>

                    <div>
                      <span className="theme-muted block text-[10px]">Preferred Cities</span>
                      <span className="font-bold theme-text truncate block">
                        {cand.preferredLocations && cand.preferredLocations.length > 0 ? cand.preferredLocations.join(', ') : 'Bangalore'}
                      </span>
                    </div>
                  </div>

                  {/* Skills Badges */}
                  {cand.skills && cand.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.skills.slice(0, 5).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold border border-indigo-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Resume Actions */}
                <div className="pt-3 border-t theme-border flex items-center justify-between">
                  <span className="text-[11px] theme-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Active Today
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setResumePreviewCand(cand)}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="View Profile in Resume Format"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile Resume
                    </button>

                    <button
                      onClick={() => setSelectedCand(cand)}
                      className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold theme-text transition-all"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => {
                        if (cand.resumeUrl && !cand.resumeUrl.includes('example.com')) {
                          window.open(resolveResumeUrl(cand.resumeUrl), '_blank');
                        } else {
                          setResumePreviewCand(cand);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CANDIDATE FULL PROFILE DRAWER */}
        {selectedCand && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full p-6 space-y-6 overflow-y-auto border-l theme-border shadow-2xl animate-in slide-in-from-right-8 duration-200">
              <div className="flex items-center justify-between border-b theme-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                    {selectedCand.user?.firstName ? selectedCand.user.firstName[0] : 'C'}
                  </div>
                  <div>
                    <h2 className="text-base font-black theme-text">
                      {selectedCand.user ? `${selectedCand.user.firstName} ${selectedCand.user.lastName}` : 'Candidate Profile'}
                    </h2>
                    <p className="text-xs font-extrabold text-indigo-500">{selectedCand.headline}</p>
                  </div>
                </div>

                <button onClick={() => setSelectedCand(null)} className="p-1 theme-muted hover:theme-text">
                  ✕
                </button>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border theme-border space-y-2">
                  <h4 className="font-extrabold theme-text uppercase tracking-wider text-[11px]">Contact & Recruitment Metadata</h4>
                  <p className="theme-text">Email: <strong>{selectedCand.user?.email || 'Not provided'}</strong></p>
                  {selectedCand.user?.phoneNumber && <p className="theme-text">Phone: <strong>{selectedCand.user.phoneNumber}</strong></p>}
                  <p className="theme-text">Notice Period: <strong>{selectedCand.noticePeriod || 'Immediate'}</strong></p>
                  <p className="theme-text">Total Experience: <strong>{selectedCand.experienceYears || 0} Years</strong></p>
                  <p className="theme-text">Current Salary: <strong>{selectedCand.currentSalary ? `${Number(selectedCand.currentSalary).toLocaleString()} INR` : 'Not Disclosed'}</strong></p>
                  <p className="theme-text">Expected Salary: <strong>{selectedCand.expectedSalary ? `${Number(selectedCand.expectedSalary).toLocaleString()} INR` : 'Negotiable'}</strong></p>
                </div>

                {selectedCand.skills && selectedCand.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold theme-text uppercase tracking-wider text-[11px]">Key Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCand.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCand.summary && (
                  <div className="space-y-1">
                    <h4 className="font-extrabold theme-text uppercase tracking-wider text-[11px]">Executive Summary</h4>
                    <p className="theme-text leading-relaxed whitespace-pre-line">{selectedCand.summary}</p>
                  </div>
                )}

                {selectedCand.experience && selectedCand.experience.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold theme-text uppercase tracking-wider text-[11px]">Work Experience ({selectedCand.experience.length})</h4>
                    <div className="space-y-2">
                      {selectedCand.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border theme-border bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                          <div className="font-bold theme-text">{exp.designation || exp.title || 'Role'} <span className="font-normal text-indigo-500">at {exp.companyName || exp.company || 'Company'}</span></div>
                          <div className="text-[10px] theme-muted">{exp.startDate || 'Started'} – {exp.isCurrentJob || exp.isCurrent ? 'Present' : exp.endDate || 'Ended'} {exp.location && `• ${exp.location}`}</div>
                          {(exp.rolesAndResponsibilities || exp.description) && (
                            <p className="text-[11px] theme-text/90 whitespace-pre-line leading-relaxed pt-1">{exp.rolesAndResponsibilities || exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCand.education && selectedCand.education.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold theme-text uppercase tracking-wider text-[11px]">Education ({selectedCand.education.length})</h4>
                    <div className="space-y-2">
                      {selectedCand.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg border theme-border bg-slate-50/50 dark:bg-slate-800/40 space-y-0.5">
                          <div className="font-bold theme-text">{edu.degree || edu.degree_title}</div>
                          <div className="text-[11px] text-indigo-500 font-semibold">{edu.institution}</div>
                          <div className="text-[10px] theme-muted">
                            {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear || edu.year || 'Completed'} {(edu.grade || edu.result) && `• Grade: ${edu.grade || edu.result}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setResumePreviewCand(selectedCand)}
                    className="w-full py-3 rounded-xl border theme-border font-extrabold text-xs theme-text text-center flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-indigo-500" /> View Profile in Resume Format
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCand.resumeUrl && !selectedCand.resumeUrl.includes('example.com')) {
                        window.open(resolveResumeUrl(selectedCand.resumeUrl), '_blank');
                      } else {
                        setResumePreviewCand(selectedCand);
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Candidate Resume PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Resume Modal View & Download */}
        <ProfileResumeModal
          isOpen={Boolean(resumePreviewCand)}
          onClose={() => setResumePreviewCand(null)}
          candidate={resumePreviewCand}
        />
      </div>
    </DashboardLayout>
  );
}
