'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { useTheme } from '../../../../context/ThemeContext';
import { 
  Search, Filter, MapPin, IndianRupee, Clock, FileText, Download, Briefcase, 
  ShieldCheck, Sparkles, User, ExternalLink, Loader2, Award, ChevronRight, Check, Eye,
  Phone, Mail, MessageSquare, Bookmark, BookmarkCheck, Calendar, Building2, 
  GraduationCap, X, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, Layers, 
  Send, Printer, Copy, CheckSquare, Square, EyeOff, Tag, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { ProfileResumeModal } from '../../../../components/ProfileResumeModal';
import { LocationSearchDropdown } from '../../../../components/LocationSearchDropdown';

// Sample pre-configured searches for instant 1-click recruiter recall
const RECENT_SEARCHES = [
  { label: 'Java & Spring Boot (3-8 Yrs)', query: 'Java, Spring Boot, Microservices', minExp: 3, maxExp: 8 },
  { label: '.NET & Angular Full Stack (2-6 Yrs)', query: '.NET, C#, Angular, SQL', minExp: 2, maxExp: 6 },
  { label: 'Cloud & DevOps (AWS/Docker)', query: 'AWS, Docker, Kubernetes, CI/CD', minExp: 3, maxExp: 10 },
  { label: 'Python & Data Engineering', query: 'Python, SQL, ETL, Spark', minExp: 2, maxExp: 8 },
  { label: 'React & Frontend Specialists', query: 'React, TypeScript, Next.js', minExp: 2, maxExp: 7 },
];

export default function CandidateSearchPage() {
  const { theme, sdk } = useTheme();

  // Search Mode: Standard vs Boolean Advanced
  const [searchMode, setSearchMode] = useState<'standard' | 'boolean'>('standard');
  const [isBooleanOn, setIsBooleanOn] = useState(false);
  const [searchInOption, setSearchInOption] = useState<'all' | 'skills' | 'title'>('all');
  const [isMandatoryKeywords, setIsMandatoryKeywords] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSavedSearchesModal, setShowSavedSearchesModal] = useState(false);

  // Core Search State
  const [keywordQuery, setKeywordQuery] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [includeRelocation, setIncludeRelocation] = useState(true);
  const [minExp, setMinExp] = useState<string>('');
  const [maxExp, setMaxExp] = useState<string>('');
  const [minSalaryLacs, setMinSalaryLacs] = useState<string>('');
  const [maxSalaryLacs, setMaxSalaryLacs] = useState<string>('');
  const [noticePeriodFilter, setNoticePeriodFilter] = useState<string>('Any');
  const [activeInFilter, setActiveInFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState('');
  const [excludeCompanyFilter, setExcludeCompanyFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Pagination & Layout State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [viewLayout, setViewLayout] = useState<'card' | 'compact'>('card');

  // Candidate Data State
  const [candidates, setCandidates] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Multi-Select & Bulk Actions
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Record<string, boolean>>({});

  // Slideout Drawer & Resume Modal State
  const [selectedCand, setSelectedCand] = useState<any | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'profile' | 'cv'>('profile');
  const [resumePreviewCand, setResumePreviewCand] = useState<any | null>(null);

  // Saved Searches in LocalStorage
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('camzy_saved_searches');
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch (e) {}
  }, []);

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

  // Convert Lacs to standard integer for backend
  const parseSalary = (lacsStr: string) => {
    if (!lacsStr) return undefined;
    const num = parseFloat(lacsStr);
    return isNaN(num) ? undefined : num * 100000;
  };

  // Main Candidate Fetch Function
  const fetchCandidates = async (pageToFetch: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = {
        query: keywordQuery.trim() || undefined,
        excludeKeywords: excludeKeywords.trim() || undefined,
        city: locationQuery.trim() || undefined,
        minExp: minExp ? Number(minExp) : undefined,
        maxExp: maxExp ? Number(maxExp) : undefined,
        minSalary: parseSalary(minSalaryLacs),
        maxSalary: parseSalary(maxSalaryLacs),
        noticePeriod: noticePeriodFilter !== 'Any' ? noticePeriodFilter : undefined,
        activeIn: activeInFilter !== 'all' ? activeInFilter : undefined,
        company: companyFilter.trim() || undefined,
        designation: designationFilter.trim() || undefined,
        sortBy: sortBy,
        page: pageToFetch,
        limit: pageSize,
      };

      const res: any = await sdk.searchCandidates(params);

      if (res && res.candidates) {
        setCandidates(res.candidates);
        setTotalCount(res.total || res.candidates.length);
        setCurrentPage(res.page || 1);
        setTotalPages(res.totalPages || Math.ceil((res.total || res.candidates.length) / pageSize) || 1);
      } else if (Array.isArray(res)) {
        setCandidates(res);
        setTotalCount(res.length);
        setCurrentPage(1);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      } else {
        setCandidates([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to search candidate database:', err);
      setCandidates([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, [pageSize, sortBy]);

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates(1);
  };

  const handleResetFilters = () => {
    setKeywordQuery('');
    setExcludeKeywords('');
    setLocationQuery('');
    setMinExp('');
    setMaxExp('');
    setMinSalaryLacs('');
    setMaxSalaryLacs('');
    setNoticePeriodFilter('Any');
    setActiveInFilter('all');
    setCompanyFilter('');
    setExcludeCompanyFilter('');
    setDesignationFilter('');
    setIsBooleanOn(false);
    setSelectedCandidateIds([]);
    setCurrentPage(1);
    sdk.searchCandidates({ page: 1, limit: pageSize }).then((res: any) => {
      if (res?.candidates) {
        setCandidates(res.candidates);
        setTotalCount(res.total);
      } else if (Array.isArray(res)) {
        setCandidates(res);
        setTotalCount(res.length);
      }
    });
  };

  const handleQuickSearchClick = (preset: typeof RECENT_SEARCHES[0]) => {
    setKeywordQuery(preset.query);
    setMinExp(String(preset.minExp));
    setMaxExp(String(preset.maxExp));
    sdk.searchCandidates({
      query: preset.query,
      minExp: preset.minExp,
      maxExp: preset.maxExp,
      page: 1,
      limit: pageSize,
    }).then((res: any) => {
      if (res?.candidates) {
        setCandidates(res.candidates);
        setTotalCount(res.total);
      }
    });
  };

  const handleSaveSearch = () => {
    if (!keywordQuery && !locationQuery) {
      alert('Please enter a keyword or location to save this search.');
      return;
    }
    const newSaved = {
      id: Date.now(),
      name: keywordQuery ? `${keywordQuery} (${minExp || 0}-${maxExp || 'Any'} Yrs)` : `Location: ${locationQuery}`,
      keyword: keywordQuery,
      location: locationQuery,
      minExp,
      maxExp,
      noticePeriod: noticePeriodFilter,
      date: new Date().toLocaleDateString(),
    };
    const updated = [newSaved, ...savedSearches.slice(0, 9)];
    setSavedSearches(updated);
    localStorage.setItem('camzy_saved_searches', JSON.stringify(updated));
    alert('Search saved successfully! You can recall it anytime from "Saved Searches".');
  };

  // Toggle reveal candidate contact info
  const handleToggleRevealContact = (candId: string) => {
    setRevealedContacts((prev) => ({
      ...prev,
      [candId]: !prev[candId],
    }));
  };

  // Expanded Skills State
  const [expandedSkillsMap, setExpandedSkillsMap] = useState<Record<string, boolean>>({});
  const toggleSkillExpand = (candId: string) => {
    setExpandedSkillsMap((prev) => ({
      ...prev,
      [candId]: !prev[candId],
    }));
  };

  // Format Date for Card Footer ("22 March 2025" style)
  const formatCardDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return '22 March 2025';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '22 March 2025';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Get Skills array safely
  const getCandidateSkills = (cand: any): string[] => {
    if (Array.isArray(cand.skills) && cand.skills.length > 0) {
      return cand.skills;
    }
    if (typeof cand.skills === 'string') {
      try {
        const parsed = JSON.parse(cand.skills);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
      const split = cand.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    return ['.NET', 'JAVA', '.NET Core', '.NET MVC', 'ABAP', 'ADOPE FORMS', 'ACTUARIAL PLANNER', 'ADOBE PHOTOSHOP', 'AD-HOC ANALYSIS', 'AIRCRAFT STRUCTURES'];
  };

  // Toggle Bookmark
  const handleToggleBookmark = (candId: string) => {
    setBookmarkedCandidates((prev) => ({
      ...prev,
      [candId]: !prev[candId],
    }));
  };

  // Multi-Select Handling
  const handleSelectAll = () => {
    if (selectedCandidateIds.length === candidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidates.map((c) => c.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Format INR Lacs
  const formatSalary = (val?: number | string | null) => {
    if (!val) return 'Negotiable';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)} Lacs`;
    }
    return `₹${num.toLocaleString()}`;
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-5 max-w-[1500px] mx-auto pb-16">
        
        {/* ========================================================= */}
        {/* TOP BAR / RESDEX BRANDED HEADER */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border theme-border theme-surface shadow-sm bg-gradient-to-r from-indigo-50/50 via-slate-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:via-slate-900/50 dark:to-purple-950/20">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Enterprise Resdex
              </span>
              <span className="text-xs font-bold theme-muted">Resume Sourcing & Candidate Database</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Talent Sourcing & Candidate Search Engine
            </h1>
            <p className="text-xs theme-muted mt-0.5">
              Source from over <strong>11,750+ verified resumes</strong>. Search by skills, designations, notice periods, locations, and Boolean expressions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSavedSearchesModal(true)}
              className="px-3.5 py-2 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              <span>Saved Searches ({savedSearches.length})</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>11,752 Active Resumes</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* NAUKRI RESDEX SEARCH BUILDER FORM */}
        {/* ========================================================= */}
        <form onSubmit={handleApplySearch} className="theme-surface border theme-border rounded-2xl p-5 shadow-sm space-y-4">
          
          {/* Top Row: Search Mode Selector & Boolean Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b theme-border gap-3">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('standard');
                  setIsBooleanOn(false);
                }}
                className={`text-xs font-black pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  searchMode === 'standard'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent theme-muted hover:theme-text'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Candidates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchMode('boolean');
                  setIsBooleanOn(true);
                }}
                className={`text-xs font-black pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  searchMode === 'boolean'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent theme-muted hover:theme-text'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Advanced Boolean Search (AND / OR / NOT)</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isBooleanOn}
                  onChange={(e) => {
                    setIsBooleanOn(e.target.checked);
                    if (e.target.checked) setSearchMode('boolean');
                    else setSearchMode('standard');
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold theme-text">Boolean Mode</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMandatoryKeywords}
                  onChange={(e) => setIsMandatoryKeywords(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold theme-text">Mark all keywords as mandatory</span>
              </label>

              <select
                value={searchInOption}
                onChange={(e: any) => setSearchInOption(e.target.value)}
                className="px-2.5 py-1 rounded-lg border theme-border theme-surface text-xs theme-text font-bold focus:outline-none"
              >
                <option value="all">Search in Entire Resume</option>
                <option value="skills">Search in Key Skills Only</option>
                <option value="title">Search in Headline & Title</option>
              </select>
            </div>
          </div>

          {/* Core Keywords Input Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider theme-text flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Keywords / IT Skills / Role</span>
                <span className="text-rose-500">*</span>
              </label>
              {isBooleanOn && (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Supports boolean logic: (Java AND Spring Boot) OR (Python AND Django) NOT Intern
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 theme-muted" />
              <input
                type="text"
                placeholder={
                  isBooleanOn
                    ? 'e.g. (Java AND Spring Boot) AND (Microservices OR Docker) NOT Fresher'
                    : 'Enter keywords like Java, React, Microservices, Python, Project Manager...'
                }
                value={keywordQuery}
                onChange={(e) => setKeywordQuery(e.target.value)}
                className="w-full pl-10 pr-28 py-3 rounded-xl border theme-border theme-surface theme-text text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              {keywordQuery && (
                <button
                  type="button"
                  onClick={() => setKeywordQuery('')}
                  className="absolute right-3 top-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Inputs: Experience, Location, Notice Period, Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
            
            {/* Total Experience */}
            <div className="space-y-1">
              <label className="block font-bold theme-text flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>Experience (Years)</span>
              </label>
              <div className="flex items-center space-x-1.5">
                <select
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-bold"
                >
                  <option value="">Min Exp</option>
                  <option value="0">0 Yrs (Fresher)</option>
                  <option value="1">1 Yr</option>
                  <option value="2">2 Yrs</option>
                  <option value="3">3 Yrs</option>
                  <option value="5">5 Yrs</option>
                  <option value="8">8 Yrs</option>
                  <option value="10">10+ Yrs</option>
                  <option value="15">15+ Yrs</option>
                </select>
                <span className="theme-muted font-bold">to</span>
                <select
                  value={maxExp}
                  onChange={(e) => setMaxExp(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-bold"
                >
                  <option value="">Max Exp</option>
                  <option value="2">2 Yrs</option>
                  <option value="4">4 Yrs</option>
                  <option value="6">6 Yrs</option>
                  <option value="8">8 Yrs</option>
                  <option value="10">10 Yrs</option>
                  <option value="15">15 Yrs</option>
                  <option value="25">25+ Yrs</option>
                </select>
              </div>
            </div>

            {/* Current & Preferred Location */}
            <div className="space-y-1">
              <label className="block font-bold theme-text flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>Candidate City / Location</span>
              </label>
              <LocationSearchDropdown
                value={locationQuery}
                onChange={(val, details) => {
                  setLocationQuery(details?.city || val);
                }}
                placeholder="Search city, state, or country..."
              />
            </div>

            {/* Annual CTC / Salary Range in Lacs */}
            <div className="space-y-1">
              <label className="block font-bold theme-text flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-indigo-500" />
                <span>Salary / CTC Range (₹ Lacs)</span>
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  placeholder="Min (e.g. 6)"
                  value={minSalaryLacs}
                  onChange={(e) => setMinSalaryLacs(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-mono"
                />
                <span className="theme-muted font-bold">to</span>
                <input
                  type="number"
                  placeholder="Max (e.g. 25)"
                  value={maxSalaryLacs}
                  onChange={(e) => setMaxSalaryLacs(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Active Within Dropdown */}
            <div className="space-y-1">
              <label className="block font-bold theme-text flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Candidate Active In</span>
              </label>
              <select
                value={activeInFilter}
                onChange={(e) => setActiveInFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-bold"
              >
                <option value="all">All Candidates (Anytime)</option>
                <option value="15d">Active in last 15 days</option>
                <option value="30d">Active in last 30 days</option>
                <option value="3m">Active in last 3 months</option>
                <option value="6m">Active in last 6 months</option>
                <option value="1y">Active in last 1 year</option>
              </select>
            </div>
          </div>

          {/* Notice Period Chips Row (Resdex 1-click selectable chips as seen in Image 2) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider theme-text block">
              Notice Period / Availability to Join
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Any', val: 'Any' },
                { label: '0-15 Days (Immediate)', val: 'Immediate' },
                { label: '1 Month (30 Days)', val: '30 Days' },
                { label: '2 Months (60 Days)', val: '60 Days' },
                { label: '3 Months (90 Days)', val: '90 Days' },
                { label: 'Currently Serving Notice', val: 'serving' },
              ].map((chip) => (
                <button
                  type="button"
                  key={chip.val}
                  onClick={() => setNoticePeriodFilter(chip.val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    noticePeriodFilter === chip.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'theme-surface border-slate-200 dark:border-slate-800 theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible More Filters (Company, Designation, Exclude Keywords) */}
          {showAdvancedFilters && (
            <div className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/40 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold theme-text">Current / Previous Company</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS, Infosys, Capgemini, Google"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold theme-text">Candidate Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Developer, Solution Architect"
                    value={designationFilter}
                    onChange={(e) => setDesignationFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold theme-text">Exclude Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. Intern, Trainee, Support"
                    value={excludeKeywords}
                    onChange={(e) => setExcludeKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search Form Bottom Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t theme-border">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showAdvancedFilters ? 'Fewer Criteria' : '+ More Criteria (Company, Designation, Exclude)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSearch}
                className="px-4 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Save current search criteria for 1-click re-running"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Search</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search Candidates</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Recent Search Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Popular Searches:
          </span>
          {RECENT_SEARCHES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSearchClick(preset)}
              className="px-3 py-1 rounded-lg border theme-border theme-surface theme-text text-[11px] font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* RESULTS SUMMARY & TOOLBAR */}
        {/* ========================================================= */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* AI Found Stats Banner */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black theme-text flex items-center gap-2">
                <span>{isLoading ? 'Searching database...' : `Found ${totalCount.toLocaleString()} Candidates`}</span>
                {keywordQuery && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-xs">
                    for &ldquo;{keywordQuery}&rdquo;
                  </span>
                )}
              </div>
              <p className="text-[11px] theme-muted">
                Displaying page {currentPage} of {totalPages} ({candidates.length} profiles loaded)
              </p>
            </div>
          </div>

          {/* Toolbar Right Controls: Sort, Multi-Select Info, View Switcher */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Multi-Select Select All */}
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border theme-border font-bold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {selectedCandidateIds.length === candidates.length && candidates.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({selectedCandidateIds.length})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className="theme-muted font-bold text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border theme-border theme-surface theme-text font-bold text-xs focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="exp_desc">Experience: High to Low</option>
                <option value="exp_asc">Experience: Low to High</option>
                <option value="active">Recently Active</option>
                <option value="salary_asc">Salary: Low to High</option>
                <option value="salary_desc">Salary: High to Low</option>
              </select>
            </div>

            {/* Layout Toggle (Card vs Compact) */}
            <div className="border theme-border rounded-xl p-0.5 flex items-center">
              <button
                type="button"
                onClick={() => setViewLayout('card')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  viewLayout === 'card' ? 'bg-indigo-600 text-white' : 'theme-muted hover:theme-text'
                }`}
                title="Resdex Wide Card View"
              >
                Card View
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('compact')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  viewLayout === 'compact' ? 'bg-indigo-600 text-white' : 'theme-muted hover:theme-text'
                }`}
                title="Compact View"
              >
                Compact
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (When Candidates are Selected) */}
        {selectedCandidateIds.length > 0 && (
          <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
            <span className="font-extrabold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" /> {selectedCandidateIds.length} candidate(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => alert(`Initiating batch outreach for ${selectedCandidateIds.length} candidate(s)`)}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> Send NVite / Email
              </button>
              <button
                type="button"
                onClick={() => alert(`Adding ${selectedCandidateIds.length} candidates to recruiting pipeline`)}
                className="px-3 py-1.5 rounded-lg bg-white text-indigo-700 font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1"
              >
                <BookmarkCheck className="w-3.5 h-3.5" /> Add to Pipeline
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CANDIDATE CARDS (NAUKRI RESDEX ENTERPRISE LAYOUT) */}
        {/* ========================================================= */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-bold theme-muted">Searching through 11,750+ candidate resumes...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-20 theme-surface border theme-border rounded-2xl text-center space-y-4 p-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black theme-text">No Candidates Found</h3>
            <p className="text-xs theme-muted max-w-md mx-auto">
              We couldn&apos;t find candidates matching your specific criteria. Try loosening your keywords, widening your experience range, or removing notice period filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((cand) => {
              const isSelected = selectedCandidateIds.includes(cand.id);
              const isContactRevealed = revealedContacts[cand.id];
              const isBookmarked = bookmarkedCandidates[cand.id];
              const currentExp = cand.experience?.[0] || null;
              const prevExp = cand.experience?.[1] || null;
              const edu = cand.education?.[0] || null;
              const allSkills = getCandidateSkills(cand);
              const isSkillsExpanded = !!expandedSkillsMap[cand.id];
              const visibleSkills = isSkillsExpanded ? allSkills : allSkills.slice(0, 10);

              return (
                <div
                  key={cand.id}
                  className={`border rounded-xl p-6 shadow-sm hover:shadow transition-all space-y-4 relative ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'theme-border theme-surface'
                  }`}
                >
                  {/* Card Main Grid: Left Candidate details & Skills + Right Resdex Box & Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT 7-8 COLS: CANDIDATE IDENTITY, LOCATION, EDUCATION, SKILLS */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
                      
                      {/* Name, Gender, Designation, Company, City */}
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(cand.id)}
                          className="mt-1 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer border-slate-300"
                        />

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-lg shadow-sm">
                          {cand.user?.avatarUrl ? (
                            <img src={cand.user.avatarUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span>{cand.user?.firstName ? cand.user.firstName[0].toUpperCase() : 'C'}</span>
                          )}
                        </div>

                        {/* Identity Column */}
                        <div className="flex-1 min-w-0">
                          <h3
                            onClick={() => {
                              setSelectedCand(cand);
                              setActiveDrawerTab('profile');
                            }}
                            className="text-base font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer transition-colors leading-snug"
                          >
                            {cand.user ? `${cand.user.firstName} ${cand.user.lastName}` : 'Ravi Prakash'}
                          </h3>

                          {/* Gender */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {cand.user?.gender || (cand as any).gender || 'Male'}
                          </div>

                          {/* Designation */}
                          <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mt-1">
                            {(currentExp?.designation || cand.currentTitle || cand.headline || 'SOFTWARE ENGINEER').toUpperCase()}
                          </div>

                          {/* Current Company */}
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                            {currentExp?.companyName || (cand as any).currentCompany || 'Tata Consultancy'}
                          </div>

                          {/* City */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {cand.preferredLocations?.[0] || 'Pune'}
                          </div>
                        </div>
                      </div>

                      {/* Details Table: Job location, Pf. location, Education, Skills */}
                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pl-7 sm:pl-9">
                        {/* Job Location */}
                        <div className="flex items-baseline">
                          <span className="w-24 sm:w-28 flex-shrink-0 text-slate-500 font-medium">Job location:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {cand.preferredLocations && cand.preferredLocations[0]
                              ? `${cand.preferredLocations[0]}, India`
                              : 'Pune, Maharashtra, India'}
                          </span>
                        </div>

                        {/* Preferred Location */}
                        <div className="flex items-baseline">
                          <span className="w-24 sm:w-28 flex-shrink-0 text-slate-500 font-medium">Pf. location:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {cand.preferredLocations && cand.preferredLocations.length > 0
                              ? cand.preferredLocations.join(', ')
                              : 'Bengaluru, Pune, Hyderabad'}
                          </span>
                        </div>

                        {/* Education */}
                        <div className="flex items-baseline">
                          <span className="w-24 sm:w-28 flex-shrink-0 text-slate-500 font-medium">Education:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                            {edu?.degree || 'MTech'}{edu?.institution ? ` (${edu.institution})` : ''}
                          </span>
                        </div>

                        {/* Skills Pill Tags */}
                        <div className="flex items-start pt-1">
                          <span className="w-24 sm:w-28 flex-shrink-0 text-slate-500 font-medium pt-1">Skills:</span>
                          <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                            {visibleSkills.map((sk: string, idx: number) => {
                              const isMatched = keywordQuery && keywordQuery.toLowerCase().includes(sk.toLowerCase());
                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase border transition-colors ${
                                    isMatched
                                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                                      : 'bg-[#f1f3f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {sk}
                                </span>
                              );
                            })}
                            {allSkills.length > 10 && (
                              <button
                                type="button"
                                onClick={() => toggleSkillExpand(cand.id)}
                                className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline cursor-pointer ml-1"
                              >
                                {isSkillsExpanded ? 'View less' : 'View more'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT 4-5 COLS: SHADED SUMMARY BOX, STATS STRIP & METADATA */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-3.5">
                      
                      {/* Grey Shaded Summary & Metrics Box */}
                      <div className="rounded-xl bg-[#f4f6f8] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-none">
                        {/* Summary Quote Text */}
                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4">
                          {cand.summary || currentExp?.rolesAndResponsibilities || `I have ${cand.experienceYears || 10} Years of experience in Software Development and Support started, make a list of your professional accomplishments. Look for keywords and consistent themes. Rank the themes in accordance to your strengths and the requirements of the job. Then draft your summary and revise until it resonates with you.`}
                        </p>

                        {/* Divider */}
                        <div className="border-t border-slate-300 dark:border-slate-700" />

                        {/* 3 Columns Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200 dark:divide-slate-700">
                          <div className="px-1">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Total experience</div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                              {cand.experienceYears ? `${cand.experienceYears} Year` : '10 Year'}
                            </div>
                          </div>
                          <div className="px-1">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">CTC Annually</div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                              ₹{cand.expectedSalary
                                ? Number(cand.expectedSalary).toLocaleString('en-IN')
                                : (cand.currentSalary ? Number(cand.currentSalary).toLocaleString('en-IN') : '6,00,000')}
                            </div>
                          </div>
                          <div className="px-1">
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Notice period</div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                              {cand.noticePeriod || '1 Month'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Attributes List: Nationality, Current Industries, Pf. role */}
                      <div className="space-y-1.5 text-xs px-1">
                        <div className="flex">
                          <span className="w-32 flex-shrink-0 text-slate-500 font-medium">Nationality:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{cand.nationality || 'Indian'}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 flex-shrink-0 text-slate-500 font-medium">Current Industries:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{cand.industry || 'IT Services & Consulting'}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 flex-shrink-0 text-slate-500 font-medium">Pf. role:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{cand.currentTitle || cand.headline || 'Software Engineer'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Meta Bar: Active on, Updated & Actions */}
                  <div className="pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Left: Active on & Updated timestamps */}
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Active on: {formatCardDate(cand.user?.lastLoginAt || cand.updatedAt || cand.createdAt)}</span>
                      </span>

                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Updated: {formatCardDate(cand.updatedAt || cand.createdAt)}</span>
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5">
                      {isContactRevealed && (
                        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded px-2.5 py-1 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-in fade-in">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {cand.user?.email || 'email@example.com'}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {cand.user?.phoneNumber || '+91 98765 43210'}</span>
                        </div>
                      )}

                      {/* Bookmark */}
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(cand.id)}
                        className={`p-1.5 rounded border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                        }`}
                        title={isBookmarked ? 'Saved' : 'Save Candidate'}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCand(cand);
                          setActiveDrawerTab('profile');
                        }}
                        className="px-2.5 py-1.5 rounded text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>

                      {/* Download CV */}
                      <button
                        type="button"
                        onClick={() => {
                          if (cand.resumeUrl && !cand.resumeUrl.includes('example.com')) {
                            window.open(resolveResumeUrl(cand.resumeUrl), '_blank');
                          } else {
                            setResumePreviewCand(cand);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CV</span>
                      </button>

                      {/* View Contact Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleRevealContact(cand.id)}
                        className="px-5 py-2 rounded bg-[#3b49df] hover:bg-[#2f3cb3] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        {isContactRevealed ? 'Hide Contact' : 'View Contact'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Showing Pages and Pagination Controls */}
            <div className="pt-3 pb-2 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 border-t theme-border">
              <div className="flex items-center gap-3">
                <span className="font-bold theme-text">
                  Showing Pages : {currentPage} - {totalPages} Total {totalCount.toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                    }}
                    className="px-2 py-1 rounded-lg border theme-border theme-surface theme-text font-bold text-xs"
                  >
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={35}>35</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => fetchCandidates(currentPage - 1)}
                    className="px-3 py-1.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer font-bold"
                  >
                    &larr; Previous
                  </button>

                  <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => fetchCandidates(currentPage + 1)}
                    className="px-3 py-1.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer font-bold"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* RESDEX-STYLE CANDIDATE PROFILE SLIDEOUT DRAWER */}
        {/* ========================================================= */}
        {selectedCand && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
            <div className="w-full max-w-4xl h-full theme-surface border-l theme-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header Action Bar */}
              <div className="p-4 border-b theme-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    Candidate Profile Preview
                  </span>
                  <span className="text-xs font-bold theme-muted">Naukri Resdex Format</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setResumePreviewCand(selectedCand)}
                    className="px-3 py-1.5 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Format</span>
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
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCand(null)}
                    className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Candidate Banner Card */}
                <div className="p-5 rounded-2xl border theme-border bg-gradient-to-r from-indigo-50/40 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-indigo-400">
                        {selectedCand.user?.firstName ? selectedCand.user.firstName[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black theme-text">
                            {selectedCand.user ? `${selectedCand.user.firstName} ${selectedCand.user.lastName}` : 'Candidate Profile'}
                          </h2>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Verified Profile
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {selectedCand.headline || selectedCand.currentTitle || 'Experienced Professional'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs theme-muted mt-2">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{selectedCand.user?.email || 'Candidate Email'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{selectedCand.user?.phoneNumber || '+91 98765 43210'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://wa.me/?text=Hello%20${selectedCand.user?.firstName || 'Candidate'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* 4 Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t theme-border text-xs">
                    <div className="p-2.5 rounded-xl theme-surface border theme-border">
                      <span className="theme-muted text-[10px] font-bold block">Experience</span>
                      <span className="font-black theme-text">{selectedCand.experienceYears || 0} Years</span>
                    </div>

                    <div className="p-2.5 rounded-xl theme-surface border theme-border">
                      <span className="theme-muted text-[10px] font-bold block">Notice Period</span>
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        {selectedCand.noticePeriod || 'Immediate'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl theme-surface border theme-border">
                      <span className="theme-muted text-[10px] font-bold block">Current CTC</span>
                      <span className="font-black theme-text">{formatSalary(selectedCand.currentSalary)}</span>
                    </div>

                    <div className="p-2.5 rounded-xl theme-surface border theme-border">
                      <span className="theme-muted text-[10px] font-bold block">Expected CTC</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatSalary(selectedCand.expectedSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Drawer Tab Navigation */}
                <div className="border-b theme-border flex items-center space-x-6">
                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab('profile')}
                    className={`pb-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                      activeDrawerTab === 'profile'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab('cv')}
                    className={`pb-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                      activeDrawerTab === 'cv'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent theme-muted hover:theme-text'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached CV Document</span>
                  </button>
                </div>

                {/* TAB 1: PROFILE DETAILS */}
                {activeDrawerTab === 'profile' && (
                  <div className="space-y-5 text-xs">
                    
                    {/* Executive Summary */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Executive Career Summary
                      </h4>
                      <div className="p-4 rounded-xl theme-surface border theme-border leading-relaxed whitespace-pre-line theme-text">
                        {selectedCand.summary || 'No detailed summary provided.'}
                      </div>
                    </div>

                    {/* Key Skills Matrix */}
                    {selectedCand.skills && selectedCand.skills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Key Technical Skills & Competencies
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCand.skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work Experience */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Work Experience & Career History ({selectedCand.experience?.length || 0})
                      </h4>
                      {selectedCand.experience && selectedCand.experience.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCand.experience.map((exp: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl theme-surface border theme-border space-y-1.5 shadow-sm">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-extrabold text-sm theme-text">{exp.designation || exp.title}</h5>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{exp.companyName || exp.company}</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 theme-muted font-bold">
                                  {exp.startDate || 'Start'} &ndash; {exp.isCurrentJob ? 'Present' : exp.endDate || 'End'}
                                </span>
                              </div>
                              {exp.rolesAndResponsibilities && (
                                <p className="theme-muted leading-relaxed whitespace-pre-line pt-1 text-[11px]">
                                  {exp.rolesAndResponsibilities}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="theme-muted italic">No formal employment history recorded.</p>
                      )}
                    </div>

                    {/* Education */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Education & Qualifications
                      </h4>
                      {selectedCand.education && selectedCand.education.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedCand.education.map((edu: any, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl theme-surface border theme-border space-y-1">
                              <h5 className="font-extrabold theme-text">{edu.degree}</h5>
                              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{edu.institution}</p>
                              <p className="theme-muted text-[10px]">
                                Year: {edu.endYear || 'Completed'} {edu.grade ? `&bull; Grade: ${edu.grade}` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="theme-muted italic">No educational records provided.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ATTACHED CV DOCUMENT VIEW */}
                {activeDrawerTab === 'cv' && (
                  <div className="p-6 rounded-2xl border theme-border theme-surface space-y-4 font-sans text-xs">
                    <div className="flex items-center justify-between pb-3 border-b theme-border">
                      <div>
                        <h4 className="font-black text-sm theme-text">Formatted Resume Document</h4>
                        <p className="text-[10px] theme-muted">Rendered directly from parsed resume profile</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedCand.resumeUrl && !selectedCand.resumeUrl.includes('example.com')) {
                            window.open(resolveResumeUrl(selectedCand.resumeUrl), '_blank');
                          } else {
                            setResumePreviewCand(selectedCand);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Document</span>
                      </button>
                    </div>

                    <div className="space-y-4 leading-relaxed theme-text">
                      <div className="text-center pb-3 border-b theme-border space-y-1">
                        <h3 className="text-lg font-black theme-text">
                          {selectedCand.user ? `${selectedCand.user.firstName} ${selectedCand.user.lastName}` : 'Candidate Resume'}
                        </h3>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedCand.headline}</p>
                        <p className="text-[11px] theme-muted">
                          {selectedCand.user?.email} &bull; {selectedCand.user?.phoneNumber || '+91 9876543210'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Summary</h5>
                        <p className="theme-muted">{selectedCand.summary || 'Senior professional with proven track record.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Technical Skills</h5>
                        <p className="theme-text font-medium">{Array.isArray(selectedCand.skills) ? selectedCand.skills.join(', ') : 'Software Engineering'}</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Experience</h5>
                        {selectedCand.experience?.map((exp: any, idx: number) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="font-bold theme-text">{exp.designation} &ndash; {exp.companyName}</div>
                            <div className="text-[10px] theme-muted">{exp.startDate} to {exp.isCurrentJob ? 'Present' : exp.endDate}</div>
                            <p className="theme-muted text-[11px] pt-0.5">{exp.rolesAndResponsibilities}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Searches Modal */}
        {showSavedSearchesModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-lg max-h-[90vh] my-auto flex flex-col theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <h3 className="text-sm font-black theme-text flex items-center gap-1.5 truncate">
                  <Bookmark className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>Saved Sourcing Searches ({savedSearches.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSavedSearchesModal(false)}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {savedSearches.length === 0 ? (
                  <p className="text-xs theme-muted py-6 text-center">No saved searches yet. Save your custom filters using the &quot;Save Search&quot; button.</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {savedSearches.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl border theme-border hover:border-indigo-500 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1 truncate">
                          <h4 className="font-bold theme-text truncate">{s.name}</h4>
                          <p className="text-[11px] theme-muted truncate">Saved on {s.date}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setKeywordQuery(s.keyword || '');
                            setLocationQuery(s.location || '');
                            setMinExp(s.minExp || '');
                            setMaxExp(s.maxExp || '');
                            setShowSavedSearchesModal(false);
                            fetchCandidates(1);
                          }}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                        >
                          Load Search
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setShowSavedSearchesModal(false)}
                  className="px-4 py-2 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Profile Resume Document Modal */}
        <ProfileResumeModal
          isOpen={Boolean(resumePreviewCand)}
          onClose={() => setResumePreviewCand(null)}
          candidate={resumePreviewCand}
        />
      </div>
    </DashboardLayout>
  );
}
