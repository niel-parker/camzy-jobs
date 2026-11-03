'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { JobCard } from '../components/JobCard';
import { PricingTable } from '../components/PricingTable';
import { SearchableSelect } from '../components/SearchableSelect';
import { LocationSearchDropdown } from '../components/LocationSearchDropdown';
import { MultiSkillSearchInput } from '../components/MultiSkillSearchInput';
import { JobListing } from '@job-portal/sdk';
import { Search, MapPin, Building2, Award, Sparkles, Filter, ShieldCheck, ArrowRight, Palette, CheckCircle2, Tag, X, Clock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { theme, sdk, user } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExpRangeId, setSelectedExpRangeId] = useState<string>('all');
  const [masterExpRanges, setMasterExpRanges] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Workday-Style Suggestions State
  const [workdaySuggestions, setWorkdaySuggestions] = useState<string[]>([]);
  const [showWorkdaySuggestions, setShowWorkdaySuggestions] = useState(false);

  const categories = [
    { value: 'All', label: 'All Categories' },
    { value: 'Engineering', label: 'Engineering & Full Stack' },
    { value: 'DevOps & Architecture', label: 'DevOps & Cloud Architecture' },
    { value: 'Design & Creative', label: 'Design & UI/UX Systems' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence & LLMs' },
  ];

  // Load Master Experience Ranges
  useEffect(() => {
    async function loadRanges() {
      try {
        const ranges = await sdk.getExperienceRanges();
        if (ranges && Array.isArray(ranges)) {
          setMasterExpRanges(ranges);
        }
      } catch (err) {
        console.warn('Could not load experience ranges on homepage:', err);
      }
    }
    loadRanges();
  }, [sdk]);

  // Fetch live matching jobs for homepage
  useEffect(() => {
    let isCancelled = false;
    async function fetchJobs() {
      setIsLoadingJobs(true);
      try {
        const loc = selectedLocation && selectedLocation !== 'all' ? selectedLocation.split(',')[0].trim() : undefined;
        const cat = selectedCategory === 'All' || selectedCategory === 'all' ? undefined : selectedCategory;
        
        const selectedRange = masterExpRanges.find((r) => r.id === selectedExpRangeId);
        const minExp = selectedRange ? selectedRange.minYears : undefined;
        const maxExp = selectedRange ? selectedRange.maxYears : undefined;

        const skillsQuery = selectedSkills.length > 0 ? selectedSkills.join(', ') : (searchQuery.trim() || undefined);

        const data = await sdk.getJobs({
          category: cat,
          location: loc,
          query: skillsQuery,
          skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
          minExp,
          maxExp,
        });
        if (!isCancelled) {
          // Requirement: Only featured jobs visible on home page, and strictly omit expired jobs
          let featuredOnly = data.filter((j) => Boolean(j.isFeatured) && !j.isExpired && j.status !== 'EXPIRED');
          
          if (selectedSkills.length > 0) {
            featuredOnly = featuredOnly.filter((j) => {
              return selectedSkills.some((s) => {
                const sLower = s.toLowerCase();
                return (
                  (j.skills && j.skills.some((sk) => sk.toLowerCase().includes(sLower) || sLower.includes(sk.toLowerCase()))) ||
                  j.title.toLowerCase().includes(sLower) ||
                  (j.description && j.description.toLowerCase().includes(sLower))
                );
              });
            });
          }

          setJobs(featuredOnly);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        if (!isCancelled) setJobs([]);
      } finally {
        if (!isCancelled) setIsLoadingJobs(false);
      }
    }

    const debounceTimer = setTimeout(fetchJobs, 200);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [sdk, selectedCategory, selectedLocation, selectedExpRangeId, searchQuery, selectedSkills, masterExpRanges]);

  // Handle Search Submission & Navigation to /jobs
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowWorkdaySuggestions(false);
    const params = new URLSearchParams();
    if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));
    if (searchQuery.trim()) params.append('query', searchQuery.trim());
    if (selectedExpRangeId && selectedExpRangeId !== 'all') params.append('expRange', selectedExpRangeId);
    if (selectedLocation && selectedLocation !== 'all' && selectedLocation.trim()) params.append('location', selectedLocation);
    if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'all') params.append('category', selectedCategory);

    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-800/80">
        {/* Glow Effects */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] opacity-20 pointer-events-none theme-transition"
          style={{ backgroundColor: theme.primaryColor }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Discover Top Opportunities Across Companies & Placement Agencies
            </h1>

            {/* 3-Filter Hero Search Box */}
            <form
              onSubmit={handleSearch}
              className="max-w-5xl mx-auto glass-card rounded-2xl p-3 sm:p-4 shadow-xl border-slate-200 dark:border-slate-700/60 mt-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                {/* 1. Skills Multi-Select with Workday Autocomplete & Chips */}
                <div className="md:col-span-5 relative">
                  <MultiSkillSearchInput
                    selectedSkills={selectedSkills}
                    onChangeSkills={setSelectedSkills}
                    inputValue={searchQuery}
                    onChangeInput={setSearchQuery}
                    placeholder="Skills, job title, keywords..."
                    onSearch={handleSearch}
                  />
                </div>

                {/* 2. Experience Level Dropdown */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <select
                      value={selectedExpRangeId}
                      onChange={(e) => setSelectedExpRangeId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer appearance-none"
                    >
                      <option value="all">All Experience Levels</option>
                      {masterExpRanges.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* 3. Locations Dropdown */}
                <div className="md:col-span-3">
                  <LocationSearchDropdown
                    value={selectedLocation}
                    onChange={(val) => setSelectedLocation(val)}
                    placeholder="Location (City, Country)..."
                  />
                </div>

                {/* Submit Search Button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-1.5 theme-transition hover:opacity-90 active:scale-95 cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Search className="w-3.5 h-3.5" /> Search
                  </button>
                </div>
              </div>
            </form>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800/80 max-w-4xl mx-auto">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">140+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Companies</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">45+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Placement Centers</div>
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">12,800+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Candidates Applied</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quota Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Center / Consultancy Highlight Section */}
      <section id="consultancies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border-emerald-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Award className="w-4 h-4" /> Specialized Job Consultancy Module
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Placement Agencies & Recruitment Centers
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Placement agencies can register multiple client companies, post jobs on behalf of external clients, manage shared talent candidate pools, and submit candidate profiles securely.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Agency Multi-Client Profile Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resume Bulk Upload & Automated Parsing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Client Postings under Agency Subscription
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    AP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Apex Placement Agency</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Registered Agency Tenant</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                  12 Active Clients
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Current Clients Managed:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60">
                    FinTech Dynamics
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60">
                    Neural Mind AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Listing (Only Featured Jobs on Homepage) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Featured Job Openings</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                {jobs.length} Featured
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked verified premium positions. Explore all active listings in the job directory.
              {(searchQuery || selectedSkills.length > 0 || selectedLocation || selectedCategory !== 'All') && (
                <span className="ml-1 text-indigo-600 dark:text-indigo-400 font-medium">
                  • Filtered {selectedSkills.length > 0 ? `[Skills: ${selectedSkills.join(', ')}]` : ''} {searchQuery ? `by "${searchQuery}"` : ''} {selectedLocation ? `in ${selectedLocation}` : ''} {selectedCategory !== 'All' ? `[${selectedCategory}]` : ''}
                </span>
              )}
            </p>
          </div>

          {/* Category Filter Pills & Reset */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {(searchQuery || selectedSkills.length > 0 || selectedLocation || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSkills([]);
                  setSearchQuery('');
                  setSelectedLocation('');
                  setSelectedCategory('All');
                }}
                className="px-2.5 py-1.5 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Reset all search filters"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Jobs Feed Grid */}
        {isLoadingJobs ? (
          <div className="py-16 text-center text-slate-500 text-xs animate-pulse">Loading featured jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center space-y-3 glass-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <Sparkles className="w-10 h-10 text-amber-500/60 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No featured jobs match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any featured job postings matching your current keyword, location, or department criteria. Browse all active jobs in our directory.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedSkills([]);
                  setSearchQuery('');
                  setSelectedLocation('');
                  setSelectedCategory('All');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 shadow-sm cursor-pointer transition-all"
              >
                Clear all filters
              </button>
              <button
                onClick={() => router.push('/jobs')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer transition-all"
              >
                Browse All Openings <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="pt-2 text-center">
              <button
                onClick={() => router.push('/jobs')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border theme-border shadow-sm transition-all cursor-pointer"
              >
                Explore All Job Openings in Directory <ArrowRight className="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Subscription Pricing Table Section (Commented out per request) */}
      {/* <PricingTable /> */}
    </div>
  );
}
