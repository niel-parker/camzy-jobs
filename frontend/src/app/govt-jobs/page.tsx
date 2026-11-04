'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, Landmark, Search, Filter, Globe, Calendar, Clock, 
  ExternalLink, FileText, CheckCircle2, AlertCircle, Sparkles, 
  ChevronRight, Award, ShieldCheck, MapPin, IndianRupee, Layers, 
  Share2, ArrowUpRight, Loader2, RefreshCw, Bell, BookOpen
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { GovtJobItem, GovtJobCategoryType } from '@job-portal/sdk';

// Major Indian States for the state govt jobs filter
const INDIAN_STATES = [
  { en: 'All States', hi: 'सभी राज्य' },
  { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  { en: 'Bihar', hi: 'बिहार' },
  { en: 'Rajasthan', hi: 'राजस्थान' },
  { en: 'Delhi', hi: 'दिल्ली' },
  { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  { en: 'Gujarat', hi: 'गुजरात' },
  { en: 'Haryana', hi: 'हरियाणा' },
  { en: 'Punjab', hi: 'पंजाब' },
  { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
  { en: 'Karnataka', hi: 'कर्नाटक' },
  { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
  { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  { en: 'Telangana', hi: 'तेलंगाना' },
  { en: 'Kerala', hi: 'केरल' },
  { en: 'Odisha', hi: 'ओडिशा' },
  { en: 'Jharkhand', hi: 'झारखंड' },
  { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  { en: 'Assam', hi: 'असम' },
];

const SECTOR_CATEGORIES = [
  { en: 'All Sectors', hi: 'सभी क्षेत्र' },
  { en: 'UPSC / Civil Services', hi: 'यूपीएससी / सिविल सेवा' },
  { en: 'SSC / Staff Selection', hi: 'एसएससी / कर्मचारी चयन' },
  { en: 'Railways / RRB', hi: 'रेलवे / आरआरबी' },
  { en: 'Banking / IBPS', hi: 'बैंकिंग / आईबीपीएस' },
  { en: 'Police / Law Enforcement', hi: 'पुलिस / सुरक्षा बल' },
  { en: 'Defence / Armed Forces', hi: 'रक्षा / थलसेना / नौसेना' },
  { en: 'Teaching / Education', hi: 'शिक्षक भर्ती / शिक्षा' },
  { en: 'State PSC / Civil Services', hi: 'राज्य लोक सेवा आयोग' },
];

export default function GovtJobsPublicPage() {
  const { sdk } = useTheme();

  // Language State: 'en' | 'hi'
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Tab State: 'CENTRAL' | 'STATE' | 'ALL'
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'CENTRAL' | 'STATE'>('CENTRAL');

  // State Filter for State Govt Jobs
  const [selectedState, setSelectedState] = useState<string>('All States');

  // Sector Filter
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');

  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View Mode: 'cards' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Data & Loading
  const [jobs, setJobs] = useState<GovtJobItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGovtJobs() {
      setIsLoading(true);
      try {
        const data = await sdk.getGovtJobs({
          status: 'active',
        });
        setJobs(data);
      } catch (err) {
        console.error('Failed to load government jobs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGovtJobs();
  }, [sdk]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Tab filter
      if (selectedTab !== 'ALL' && job.category !== selectedTab) {
        return false;
      }

      // State filter (applicable especially for State Govt Jobs)
      if (selectedTab === 'STATE' && selectedState !== 'All States') {
        if (!job.state || !job.state.toLowerCase().includes(selectedState.toLowerCase())) {
          return false;
        }
      }

      // Sector filter
      if (selectedSector !== 'All Sectors') {
        if (!job.sector || !job.sector.toLowerCase().includes(selectedSector.toLowerCase().split(' / ')[0])) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = (job.titleEn && job.titleEn.toLowerCase().includes(query)) ||
                           (job.titleHi && job.titleHi.toLowerCase().includes(query));
        const matchDept = (job.departmentEn && job.departmentEn.toLowerCase().includes(query)) ||
                          (job.departmentHi && job.departmentHi.toLowerCase().includes(query));
        const matchSector = job.sector && job.sector.toLowerCase().includes(query);
        const matchState = job.state && job.state.toLowerCase().includes(query);
        if (!matchTitle && !matchDept && !matchSector && !matchState) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, selectedTab, selectedState, selectedSector, searchQuery]);

  // Counts
  const centralCount = useMemo(() => jobs.filter(j => j.category === 'CENTRAL').length, [jobs]);
  const stateCount = useMemo(() => jobs.filter(j => j.category === 'STATE').length, [jobs]);

  // Copy share link
  const handleShare = (job: GovtJobItem) => {
    const text = `${job.titleEn} - Official Government Recruitment. Apply at: ${job.applyUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(job.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Check if last date is within 10 days
  const isClosingSoon = (lastDateStr: string) => {
    try {
      const lastDate = new Date(lastDateStr);
      const diffTime = lastDate.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 12;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* ========================================================================= */}
      {/* OFFICIAL TRICOLOR TOP STRIP & GOVERNMENT PORTAL BANNER */}
      {/* ========================================================================= */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shadow-sm" />

      {/* Official Government Portal Sub-Header */}
      <div className="border-b theme-border bg-white dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-3">
            {/* National Ashoka Pillar / Emblem Motif */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-indigo-800 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Landmark className="w-5 h-5 text-amber-200" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold theme-text text-sm sm:text-base tracking-tight">
                  {lang === 'en' ? 'Government Jobs Portal (Sarkari)' : 'सरकारी नौकरी सूचना पोर्टल'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {lang === 'en' ? '100% Official Links' : 'प्रमाणित सरकारी लिंक'}
                </span>
              </div>
              <p className="text-[11px] theme-muted font-medium">
                {lang === 'en'
                  ? 'National Career Service & State Commission Recruitment Notifications'
                  : 'भारत सरकार एवं राज्य लोक सेवा आयोग आधिकारिक भर्ती सूचनाएं'}
              </p>
            </div>
          </div>

          {/* LANGUAGE SWITCHER BUTTON (HINDI / ENGLISH) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold theme-muted flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === 'en' ? 'Language:' : 'भाषा चुनें:'}</span>
            </span>

            <div className="inline-flex p-1 rounded-xl border theme-border bg-slate-100 dark:bg-slate-800/80 shadow-xs">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'theme-muted hover:theme-text'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'theme-muted hover:theme-text'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* LIVE URGENT NOTIFICATION TICKER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b theme-border py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 animate-pulse flex-shrink-0">
            <Bell className="w-3 h-3" /> {lang === 'en' ? 'LIVE NOTICES' : 'नवीनतम सूचनाएं'}
          </span>
          <div className="overflow-x-auto whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-6">
            <span>🔴 <strong>UPSC:</strong> Civil Services 2026 Prelims Notification Published</span>
            <span>•</span>
            <span>🟢 <strong>SSC CGL 2026:</strong> 17,727 Officers Vacancies - Online Form Closing Soon</span>
            <span>•</span>
            <span>🔵 <strong>UP Police:</strong> 60,244 Constables & Sub-Inspectors Online Application Active</span>
            <span>•</span>
            <span>🟠 <strong>RRB Railways:</strong> 18,799 Assistant Loco Pilot Exam Schedule Released</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HERO TITLE & INTRO */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight theme-text leading-tight">
            {lang === 'en' ? (
              <>Central & State <span className="text-indigo-600 dark:text-indigo-400">Government Jobs</span> 2026</>
            ) : (
              <>केंद्र एवं राज्य <span className="text-indigo-600 dark:text-indigo-400">सरकारी नौकरी</span> 2026</>
            )}
          </h1>
          <p className="text-xs sm:text-sm theme-muted leading-relaxed">
            {lang === 'en'
              ? 'Explore verified recruitment notices from Union Ministries, Staff Selection, UPSC, Railways, Banking, and State Public Service Commissions with direct official apply links.'
              : 'संघीय मंत्रालयों, कर्मचारी चयन आयोग (SSC), यूपीएससी, रेलवे, बैंकिंग एवं राज्य लोक सेवा आयोगों की प्रमाणित भर्ती अधिसूचनाएं एवं आधिकारिक आवेदन लिंक।'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* PRIMARY SECTION TABS: CENTRAL GOVT JOBS vs STATE GOVT JOBS */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b theme-border pb-4">
          
          <div className="flex items-center gap-2 p-1.5 rounded-2xl theme-surface border theme-border shadow-xs w-full sm:w-auto">
            {/* Central Govt Jobs Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab('CENTRAL');
                setSelectedState('All States');
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedTab === 'CENTRAL'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'theme-muted hover:theme-text'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>{lang === 'en' ? 'Central Govt Jobs' : 'केंद्र सरकार नौकरियां'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === 'CENTRAL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {centralCount}
              </span>
            </button>

            {/* State Govt Jobs Tab */}
            <button
              type="button"
              onClick={() => setSelectedTab('STATE')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedTab === 'STATE'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'theme-muted hover:theme-text'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'State Govt Jobs' : 'राज्य सरकार नौकरियां'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === 'STATE' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {stateCount}
              </span>
            </button>

            {/* All Notifications Tab */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab('ALL');
                setSelectedState('All States');
              }}
              className={`hidden md:flex px-4 py-2.5 rounded-xl font-black text-xs transition-all items-center gap-2 cursor-pointer ${
                selectedTab === 'ALL'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'theme-muted hover:theme-text'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{lang === 'en' ? 'All Notifications' : 'सभी अधिसूचनाएं'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {jobs.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle (Cards vs Table) */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-bold theme-muted">{lang === 'en' ? 'Display:' : 'प्रदर्शन:'}</span>
            <div className="inline-flex p-1 rounded-xl border theme-border theme-surface">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'theme-muted hover:theme-text'
                }`}
              >
                {lang === 'en' ? 'Official Cards' : 'कार्ड व्यू'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'theme-muted hover:theme-text'
                }`}
              >
                {lang === 'en' ? 'Gazette Table' : 'तालिका व्यू'}
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* FILTERS & SEARCH ROW: STATE DROPDOWN, SECTOR FILTER, SEARCH INPUT */}
        {/* ========================================================================= */}
        <div className="theme-surface border theme-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Search Input */}
            <div className={`relative ${selectedTab === 'STATE' ? 'md:col-span-5' : 'md:col-span-7'}`}>
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
              <input
                type="text"
                placeholder={
                  lang === 'en'
                    ? 'Search by Exam name, Post, Ministry, or Department...'
                    : 'परीक्षा, पद का नाम, मंत्रालय अथवा विभाग द्वारा खोजें...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* STATE DROPDOWN FILTER (Prominent in State Govt Jobs tab or All) */}
            {selectedTab === 'STATE' && (
              <div className="md:col-span-4 relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs sm:text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.en} value={st.en}>
                      {lang === 'en' ? `📍 ${st.en}` : `📍 ${st.hi} (${st.en})`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            )}

            {/* Sector / Ministry Filter */}
            <div className={`relative ${selectedTab === 'STATE' ? 'md:col-span-3' : 'md:col-span-5'}`}>
              <Filter className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs sm:text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
              >
                {SECTOR_CATEGORIES.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {lang === 'en' ? cat.en : cat.hi}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

          </div>

          {/* Quick Filter Tag Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t theme-border text-xs">
            <span className="theme-muted font-bold text-[11px]">
              {lang === 'en' ? 'Quick Sector Filters:' : 'त्वरित चयन:'}
            </span>
            {SECTOR_CATEGORIES.slice(0, 6).map((sec) => (
              <button
                key={sec.en}
                type="button"
                onClick={() => setSelectedSector(sec.en)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSector === sec.en
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'theme-surface border theme-border theme-muted hover:theme-text'
                }`}
              >
                {lang === 'en' ? sec.en : sec.hi}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* JOBS CONTENT: CARD VIEW OR GAZETTE TABLE VIEW */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs theme-muted font-bold">
              {lang === 'en' ? 'Loading verified government job notices...' : 'सरकारी भर्ती सूचनाएं लोड हो रही हैं...'}
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center theme-surface border theme-border rounded-3xl space-y-3">
            <Landmark className="w-12 h-12 text-indigo-400 mx-auto opacity-60" />
            <h3 className="text-base font-black theme-text">
              {lang === 'en' ? 'No Government Job Notices Found' : 'कोई सरकारी भर्ती सूचना नहीं मिली'}
            </h3>
            <p className="text-xs theme-muted">
              {lang === 'en'
                ? 'Try adjusting your state filter or search keywords.'
                : 'कृपया अपना राज्य चयन या खोज शब्द बदलकर पुनः प्रयास करें।'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedState('All States');
                setSelectedSector('All Sectors');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Reset All Filters' : 'फ़िल्टर रीसेट करें'}</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* ========================================================= */
          /* CARD VIEW: AUTHENTIC SARKARI NOTIFICATION CARDS */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job) => {
              const closingSoon = isClosingSoon(job.lastDate);
              const title = lang === 'hi' && job.titleHi ? job.titleHi : job.titleEn;
              const department = lang === 'hi' && job.departmentHi ? job.departmentHi : job.departmentEn;
              const qualification = lang === 'hi' && job.qualificationHi ? job.qualificationHi : job.qualificationEn;

              return (
                <div
                  key={job.id}
                  className="theme-surface border theme-border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-indigo-500/40"
                >
                  {/* Top Header Strip with Category & Urgency */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Central vs State Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          job.category === 'CENTRAL'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {job.category === 'CENTRAL' ? (
                            <>
                              <Landmark className="w-3 h-3 text-amber-500" />
                              <span>{lang === 'en' ? 'Central Govt' : 'केंद्र सरकार'}</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3 h-3 text-emerald-500" />
                              <span>{job.state ? `${job.state} Govt` : (lang === 'en' ? 'State Govt' : 'राज्य सरकार')}</span>
                            </>
                          )}
                        </span>

                        {/* Sector Badge */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {job.sector}
                        </span>
                      </div>

                      {/* Vacancies Count Badge */}
                      <span className="px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-xs shadow-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>{job.totalVacancies}</span>
                      </span>
                    </div>

                    {/* Department / Ministry Name */}
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>{department}</span>
                    </p>

                    {/* Post Title */}
                    <h3 className="text-base font-black theme-text group-hover:text-indigo-600 transition-colors leading-snug">
                      {title}
                    </h3>

                    {/* Qualification & Age Info */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border theme-border space-y-1.5 text-xs">
                      {qualification && (
                        <div className="flex items-baseline gap-2">
                          <span className="theme-muted font-bold text-[11px] flex-shrink-0">
                            {lang === 'en' ? 'Eligibility:' : 'योग्यता:'}
                          </span>
                          <span className="font-semibold theme-text text-[11px] leading-tight">
                            {qualification}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-[11px] theme-muted pt-1">
                        {job.ageLimit && (
                          <span>
                            <strong>{lang === 'en' ? 'Age:' : 'आयु:'}</strong> {job.ageLimit}
                          </span>
                        )}
                        {job.salaryScale && (
                          <span>
                            <strong>{lang === 'en' ? 'Pay Scale:' : 'वेतनमान:'}</strong> {job.salaryScale}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip: Dates & Apply Actions */}
                  <div className="pt-3 border-t theme-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      {/* Last Date */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span className="theme-muted text-[11px]">
                          {lang === 'en' ? 'Last Date:' : 'अंतिम तिथि:'}
                        </span>
                        <strong className="font-black text-rose-600 dark:text-rose-400">
                          {job.lastDate}
                        </strong>
                      </div>

                      {closingSoon && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                          {lang === 'en' ? 'Closing Soon!' : 'अंतिम तिथि निकट!'}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Apply Online & Notification PDF */}
                    <div className="flex items-center gap-2">
                      {/* DIRECT OFFICIAL APPLY BUTTON */}
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Apply Online' : 'ऑनलाइन आवेदन करें'}</span>
                      </a>

                      {/* OFFICIAL NOTIFICATION PDF LINK */}
                      {job.notificationUrl && (
                        <a
                          href={job.notificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3.5 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Official Notification PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{lang === 'en' ? 'Notification' : 'अधिसूचना'}</span>
                        </a>
                      )}

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => handleShare(job)}
                        className="p-2.5 rounded-xl border theme-border theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={copiedId === job.id ? 'Copied!' : 'Share recruitment link'}
                      >
                        {copiedId === job.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* GAZETTE TABLE VIEW: OFFICIAL GOVT JOB NOTIFICATION TABLE */
          /* ========================================================= */
          <div className="theme-surface border theme-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b theme-border text-[11px] font-black uppercase tracking-wider theme-muted">
                  <tr>
                    <th className="py-3 px-4">{lang === 'en' ? 'Post & Examination' : 'पद एवं परीक्षा नाम'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Department / Ministry' : 'विभाग / मंत्रालय'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Category / State' : 'श्रेणी / राज्य'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Total Posts' : 'कुल पद'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Qualification' : 'योग्यता'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Last Date' : 'अंतिम तिथि'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'en' ? 'Official Link' : 'आवेदन लिंक'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border font-medium">
                  {filteredJobs.map((job) => {
                    const title = lang === 'hi' && job.titleHi ? job.titleHi : job.titleEn;
                    const department = lang === 'hi' && job.departmentHi ? job.departmentHi : job.departmentEn;
                    const qualification = lang === 'hi' && job.qualificationHi ? job.qualificationHi : job.qualificationEn;

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold theme-text max-w-xs">
                          <p className="line-clamp-2">{title}</p>
                        </td>
                        <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold max-w-[200px] truncate">
                          {department}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            job.category === 'CENTRAL'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {job.category === 'CENTRAL' ? 'Central' : (job.state || 'State')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black theme-text">
                          {job.totalVacancies}
                        </td>
                        <td className="py-3.5 px-4 theme-muted max-w-xs truncate" title={qualification}>
                          {qualification || 'Graduate / 10th'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {job.lastDate}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs"
                          >
                            <span>{lang === 'en' ? 'Apply' : 'आवेदन'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL GOVERNMENT RECRUITMENT PORTALS QUICK DIRECTORY */}
        {/* ========================================================================= */}
        <div className="theme-surface border theme-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black theme-text">
                {lang === 'en'
                  ? 'Official Government Commission Portals & Direct Links'
                  : 'प्रमुख सरकारी आयोग एवं भर्ती बोर्ड के आधिकारिक पोर्टल'}
              </h2>
              <p className="text-xs theme-muted">
                {lang === 'en'
                  ? 'Access official government recruitment notice boards directly'
                  : 'भारत सरकार एवं आयोगों के सीधे नोटिस बोर्ड लिंक'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {[
              { name: 'UPSC Online', url: 'https://upsconline.nic.in', desc: 'Civil Services & NDA' },
              { name: 'SSC Portal', url: 'https://ssc.gov.in', desc: 'CGL, CHSL, MTS & GD' },
              { name: 'Indian Railways', url: 'https://www.rrbapply.gov.in', desc: 'RRB ALP, NTPC, Group D' },
              { name: 'IBPS Banking', url: 'https://www.ibps.in', desc: 'Bank PO, Clerk, SO' },
              { name: 'National Career (NCS)', url: 'https://www.ncs.gov.in', desc: 'Ministry of Labour' },
              { name: 'Join Indian Army', url: 'https://joinindianarmy.nic.in', desc: 'Officer & Agniveer' },
            ].map((p, idx) => (
              <a
                key={idx}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-500 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-indigo-600 font-extrabold text-xs">
                    <span>{p.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[10px] theme-muted mt-1 leading-tight">{p.desc}</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 mt-2 font-bold block">
                  .gov.in / .nic.in
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
