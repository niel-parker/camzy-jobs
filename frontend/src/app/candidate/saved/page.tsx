'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Bookmark, Building2, MapPin, DollarSign, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { JobListing } from '@job-portal/sdk';

export default function CandidateSavedJobsPage() {
  const { sdk } = useTheme();
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedJobs() {
      setLoading(true);
      try {
        const jobs = await sdk.getJobListings();
        setSavedJobs(jobs.filter((j) => j.isFeatured));
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setSavedJobs([]);
      } finally {
        setLoading(false);
      }
    }
    loadSavedJobs();
  }, [sdk]);

  const removeSavedJob = (id: string) => {
    setSavedJobs(savedJobs.filter((job) => job.id !== id));
  };

  return (
    <DashboardLayout role="CANDIDATE">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight theme-text flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-indigo-500" /> Bookmarked & Saved Jobs
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Positions you saved for later review or candidate application submission.
            </p>
          </div>
        </div>

        <div className="theme-surface border theme-border rounded-xl p-6 shadow-sm">
          {loading ? (
            <div className="p-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Loading saved jobs from database...</span>
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="p-12 text-center theme-muted text-xs space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-indigo-500 opacity-50" />
              <p className="font-bold theme-text">No Saved Jobs Found</p>
              <p>Explore all active jobs and click bookmark to save positions here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-xl border theme-border theme-surface hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {job.category}
                      </span>
                      <button
                        onClick={() => removeSavedJob(job.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-extrabold theme-text text-base">{job.title}</h3>
                    <p className="text-xs theme-muted flex items-center gap-1 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" /> {job.companyName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs theme-muted pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location} {job.isRemote && '(Remote)'}
                      </span>
                      {job.salaryMin && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t theme-border flex items-center justify-between">
                    <span className="text-[11px] theme-muted">{job.employmentType}</span>
                    <a
                      href={`/jobs/${job.id}`}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
