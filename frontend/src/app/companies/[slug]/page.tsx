'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '../../../context/ThemeContext';
import { JobCard } from '../../../components/JobCard';
import { JobListing } from '@job-portal/sdk';
import { Building2, Globe, ShieldCheck, MapPin, ArrowLeft, Briefcase } from 'lucide-react';

export default function CompanyProfilePage() {
  const { slug } = useParams();
  const { theme, sdk } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const company = {
    name: 'TechCorp Global',
    slug: String(slug),
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
    website: 'https://techcorp.example.com',
    industry: 'Software & Technology',
    location: 'San Francisco, CA',
    description: 'TechCorp Global is a leading enterprise software provider specializing in cloud infrastructure, microservices, and AI-driven workflow automation. We empower organizations worldwide with next-generation developer tooling.',
    isVerified: true,
  };

  useEffect(() => {
    async function loadCompanyJobs() {
      setIsLoading(true);
      try {
        const allJobs = await sdk.getJobs();
        setJobs(allJobs);
      } catch (err) {
        console.warn('Backend API offline, rendering company jobs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanyJobs();
  }, [sdk]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Job Listings
      </Link>

      {/* Company Header Glass Card */}
      <div className="glass-card rounded-3xl p-8 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-indigo-500" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{company.name}</h1>
                {company.isVerified && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Tax Verified Employer
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {company.industry}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {company.location}</span>
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-4 border-t border-slate-200 dark:border-slate-800">
          {company.description}
        </p>
      </div>

      {/* Company Open Positions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" /> Open Positions at {company.name}
          </h2>
          <span className="text-xs text-slate-500 font-mono">{jobs.length} Active Jobs</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs animate-pulse">Loading company job openings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
