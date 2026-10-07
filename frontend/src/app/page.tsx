'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { JobCard } from '../components/JobCard';
import { PricingTable } from '../components/PricingTable';
import { SearchableSelect } from '../components/SearchableSelect';
import { JobListing } from '@job-portal/sdk';
import { Search, MapPin, Building2, Award, Sparkles, Filter, ShieldCheck, ArrowRight, Palette, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { theme, sdk, user } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const categories = [
    { value: 'All', label: 'All Categories' },
    { value: 'Engineering', label: 'Engineering & Full Stack' },
    { value: 'DevOps & Architecture', label: 'DevOps & Cloud Architecture' },
    { value: 'Design & Creative', label: 'Design & UI/UX Systems' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence & LLMs' },
  ];

  useEffect(() => {
    async function fetchJobs() {
      setIsLoadingJobs(true);
      try {
        const data = await sdk.getJobs({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          query: searchQuery || undefined,
        });
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    }

    fetchJobs();
  }, [sdk, selectedCategory, searchQuery]);

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
            {/* Super Admin Theme Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Active Theme Config:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{theme.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold uppercase">
                {theme.mode}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Discover Top Opportunities Across Companies & Placement Agencies
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Enterprise Job Portal empowering Companies and Recruitment Consultancies with quota-controlled subscriptions, candidate ATS, and live Super Admin UI theme configuration.
            </p>

            {/* Search Box */}
            <div className="max-w-3xl mx-auto glass-card rounded-2xl p-3 shadow-xl border-slate-200 dark:border-slate-700/60 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Keyword Input */}
                <div className="md:col-span-5 flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, skill, or keyword..."
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                  />
                </div>

                {/* Searchable & Select Category Combobox */}
                <div className="md:col-span-4">
                  <SearchableSelect
                    options={categories}
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                    placeholder="Search category..."
                    searchPlaceholder="Filter category..."
                  />
                </div>

                {/* Submit Search Button */}
                <div className="md:col-span-3">
                  <button
                    className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 theme-transition hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Search className="w-4 h-4" /> Search Jobs
                  </button>
                </div>
              </div>
            </div>

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

      {/* Featured & Active Jobs Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active Job Openings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Explore jobs posted by direct employers and placement agencies</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat.value}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Feed Grid */}
        {isLoadingJobs ? (
          <div className="py-12 text-center text-slate-500 text-xs animate-pulse">Loading active jobs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Subscription Pricing Table Section */}
      <PricingTable />
    </div>
  );
}
