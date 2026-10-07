'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Briefcase, Plus, Sparkles, Eye, Users, PauseCircle, PlayCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { JobListing } from '@job-portal/sdk';

export default function EmployerJobListingsPage() {
  const { sdk } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const data = await sdk.getJobListings();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching company jobs:', err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [sdk]);

  const featureJob = async (id: string) => {
    try {
      await sdk.featureJob(id);
      const updated = await sdk.getJobListings();
      setJobs(updated);
    } catch (err) {
      console.error('Error featuring job:', err);
    }
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight theme-text">
              Company Job Listings
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Manage active job postings, feature listing boosts, and applicant counts.
            </p>
          </div>

          <a
            href="/employer/jobs/create"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="h-4 w-4 mr-1" /> Post New Position
          </a>
        </div>

        {/* Jobs Table */}
        <div className="theme-surface border theme-border rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Loading job postings from database...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center theme-muted text-xs space-y-2">
              <Briefcase className="w-8 h-8 mx-auto text-indigo-500 opacity-50" />
              <p className="font-bold theme-text">No Job Postings Found</p>
              <p>Click &apos;Post New Position&apos; above to create your company posting.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold theme-muted uppercase tracking-wider">
                    <th className="py-3 px-6">Job Position & Category</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Applicants</th>
                    <th className="py-3 px-6">Posted Date</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold theme-text text-sm">{job.title}</div>
                        <div className="text-xs theme-muted flex items-center space-x-2 mt-0.5">
                          <span>{job.category}</span>
                          <span>•</span>
                          <span>{job.location} {job.isRemote && '(Remote)'}</span>
                          {job.isFeatured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              <Sparkles className="h-3 w-3 mr-0.5" /> Featured
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <a
                          href="/employer/candidates/kanban"
                          className="inline-flex items-center text-indigo-500 font-bold hover:underline"
                        >
                          <Users className="h-4 w-4 mr-1" /> View Applicants
                        </a>
                      </td>

                      <td className="py-4 px-6 theme-muted">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!job.isFeatured && (
                            <button
                              onClick={() => featureJob(job.id)}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
                              title="Promote Job to Featured"
                            >
                              Boost Job
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
