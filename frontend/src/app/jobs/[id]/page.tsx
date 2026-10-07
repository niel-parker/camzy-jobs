'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '../../../context/ThemeContext';
import { JobListing } from '@job-portal/sdk';
import { Building2, MapPin, DollarSign, Calendar, Sparkles, ArrowLeft, CheckCircle2, ShieldCheck, Share2, Bookmark } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const { theme, sdk } = useTheme();
  const [job, setJob] = useState<JobListing | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      setIsLoading(true);
      try {
        const data = await sdk.request<JobListing>(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        console.error('Error loading job details:', err);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) loadJob();
  }, [id, sdk]);

  if (isLoading || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 animate-pulse text-xs">
        Loading job posting details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Job Listings
      </Link>

      {/* Main Header Glass Card */}
      <div className="glass-card rounded-3xl p-8 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              {job.companyLogoUrl ? (
                <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-indigo-500" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.companyName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-medium flex items-center gap-1 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Direct Employer
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplied(true)}
              disabled={isApplied}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white shadow-lg theme-transition hover:opacity-90 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: isApplied ? '#10b981' : theme.primaryColor }}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted
                </>
              ) : (
                'Apply Now'
              )}
            </button>
          </div>
        </div>

        {/* Metadata Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Location</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} {job.isRemote && '(Remote)'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Salary Range</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              {job.isSalaryVisible && job.salaryMin
                ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`
                : 'Competitive'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Employment Type</span>
            <span className="font-semibold text-slate-900 dark:text-white">{job.employmentType}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Experience Level</span>
            <span className="font-semibold text-slate-900 dark:text-white">{job.experienceLevel}</span>
          </div>
        </div>
      </div>

      {/* Description Content Glass Card */}
      <div className="glass-card rounded-3xl p-8 border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Job Description & Requirements</h2>
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {job.description}
        </div>
      </div>
    </div>
  );
}
