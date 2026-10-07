'use client';

import React, { useEffect, useState } from 'react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight theme-text flex items-center">
          <Bookmark className="h-8 w-8 text-indigo-500 mr-2" /> Bookmarked & Saved Jobs
        </h1>
        <p className="mt-1 text-sm theme-muted">
          Positions you saved for later review or one-click application submission.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading bookmarked jobs from database...</span>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-16 theme-surface border theme-border rounded-xl">
          <Bookmark className="mx-auto h-12 w-12 theme-muted mb-3" />
          <h3 className="text-lg font-semibold theme-text">No saved jobs yet</h3>
          <p className="text-sm theme-muted mt-1">Browse active jobs and click the bookmark icon to save positions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-xl border theme-border theme-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold theme-text">{job.title}</h3>
                <p className="text-sm font-semibold text-indigo-500">{job.companyName}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs theme-muted pt-1">
                  <span className="inline-flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" /> {job.location} {job.isRemote && '(Remote)'}
                  </span>
                  <span className="inline-flex items-center font-medium theme-text">
                    <DollarSign className="h-3.5 w-3.5 mr-0.5 text-emerald-500" />
                    {job.isSalaryVisible && job.salaryMin
                      ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`
                      : 'Competitive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => removeSavedJob(job.id)}
                  className="p-2 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Remove from saved"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <a
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
