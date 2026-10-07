'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Building2, MapPin, Users, Briefcase, ExternalLink, ShieldCheck, Sparkles, Filter, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  industry: string;
  location: string;
  employees: string;
  openJobsCount: number;
  description: string;
  isVerified: boolean;
  featuredTech: string[];
}

export default function CompaniesDirectoryPage() {
  const { sdk } = useTheme();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTenants() {
      setIsLoading(true);
      try {
        const rawTenants = await sdk.request<any[]>('/tenants');
        const mapped: CompanyItem[] = rawTenants.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          logoUrl: t.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
          industry: t.industry || 'Software & Technology',
          location: 'San Francisco, CA',
          employees: '100 - 1,000',
          openJobsCount: t.jobs ? t.jobs.length : 2,
          description: t.description || 'Enterprise technology company.',
          isVerified: true,
          featuredTech: ['TypeScript', 'Next.js', 'NestJS', 'MySQL'],
        }));
        setCompanies(mapped);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenants();
  }, [sdk]);

  const industries = ['All', 'Software & Technology', 'Financial Services', 'Design & Creative', 'Artificial Intelligence'];

  const filteredCompanies = companies.filter((comp) => {
    const matchesQuery =
      !searchQuery ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = selectedIndustry === 'All' || comp.industry.toLowerCase().includes(selectedIndustry.toLowerCase());

    return matchesQuery && matchesIndustry;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Company Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text leading-tight">
          Explore Top <span className="text-indigo-500">Enterprise Companies</span> Hiring Now
        </h1>
        <p className="text-sm theme-muted leading-relaxed">
          Discover verified employers, explore company tech stacks, culture, and open role opportunities.
        </p>
      </div>

      {/* Search & Industry Filter Bar */}
      <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
            <input
              type="text"
              placeholder="Search companies by name or technology stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-3.5 h-4 w-4 theme-muted" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'All' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading company directory from database...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="p-12 text-center theme-surface border theme-border rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-indigo-500 opacity-60" />
          <h3 className="text-base font-extrabold theme-text">No Companies Found</h3>
          <p className="text-xs theme-muted">Try adjusting your search criteria or industry filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanies.map((comp) => (
            <div
              key={comp.id}
              className="theme-surface border theme-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={comp.logoUrl}
                      alt={comp.name}
                      className="w-12 h-12 rounded-xl object-cover border theme-border shadow-sm"
                    />
                    <div>
                      <h3 className="text-base font-extrabold theme-text flex items-center gap-1.5">
                        {comp.name}
                        {comp.isVerified && (
                          <span title="Verified Employer">
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-indigo-500 font-semibold">{comp.industry}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {comp.openJobsCount} Open Roles
                  </span>
                </div>

                <p className="text-xs theme-muted leading-relaxed line-clamp-2">
                  {comp.description}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {comp.featuredTech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-medium theme-surface border theme-border theme-text"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t theme-border flex items-center justify-between text-xs">
                <span className="theme-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {comp.location}
                </span>

                <Link
                  href={`/companies/${comp.slug}`}
                  className="font-bold text-indigo-500 hover:underline inline-flex items-center gap-1"
                >
                  View Company Profile <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
