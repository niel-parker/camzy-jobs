'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Building2, Plus, Download, Users, Briefcase, ArrowUpRight, Loader2 } from 'lucide-react';
import { JobListing } from '@job-portal/sdk';

export default function EmployerDashboardPage() {
  const { user, sdk } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerData() {
      setLoading(true);
      try {
        const [jobList, appsingsings] = await Promise.all([
          sdk.getJobs().catch(() => []),
          sdk.request<any[]>('/applications').catch(() => []),
        ]);
        setJobs(jobList);
        setApplicationsCount(appsingsings.length);
      } catch (err) {
        console.error('Error loading employer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadEmployerData();
  }, [sdk]);

  const companyName = user?.tenantName || 'TechCorp Global';
  const activeJobsCount = jobs.length;

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold theme-text tracking-tight">{companyName}</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold uppercase">
                Enterprise Active Employer
              </span>
            </div>
            <p className="text-xs theme-muted mt-1">Manage active company postings, applicant pipelines, and quota consumption</p>
          </div>

          <Link
            href="/employer/jobs/create"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
        </div>

        {/* Quota Progress Meters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Jobs Quota Card */}
          <div className="p-6 rounded-xl border theme-border theme-surface space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Active Job Quota
              </span>
              <span className="text-xs font-bold theme-text">{activeJobsCount} / 15 Used</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((activeJobsCount / 15) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] theme-muted">{Math.max(0, 15 - activeJobsCount)} job posting slots available this period</p>
          </div>

          {/* Resume Downloads Quota Card */}
          <div className="p-6 rounded-xl border theme-border theme-surface space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-500" /> Resume DB Downloads
              </span>
              <span className="text-xs font-bold theme-text">12 / 150 Used</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '8%' }} />
            </div>
            <p className="text-[11px] theme-muted">138 candidate resume downloads remaining</p>
          </div>

          {/* Recruiter Seats Card */}
          <div className="p-6 rounded-xl border theme-border theme-surface space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" /> Recruiter Seats
              </span>
              <span className="text-xs font-bold theme-text">1 / 5 Seats</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '20%' }} />
            </div>
            <p className="text-[11px] theme-muted">4 sub-account seats open for team members</p>
          </div>
        </div>

        {/* Active Job Postings Table */}
        <div className="p-6 rounded-xl border theme-border theme-surface space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b theme-border">
            <h3 className="text-sm font-bold theme-text">Company Active Postings</h3>
            <span className="text-xs theme-muted">{jobs.length} Active Openings</span>
          </div>

          {loading ? (
            <div className="p-8 text-center theme-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Fetching live job postings from database...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center theme-muted text-xs">
              No active job postings found for {companyName}. Click &apos;Post New Job&apos; above to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.id} className="flex items-center justify-between p-4 rounded-xl theme-surface border theme-border text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold theme-text">{j.title}</h4>
                    <p className="theme-muted">{j.location} {j.isRemote && '(Remote)'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      {applicationsCount} Applicants
                    </span>
                    <Link href={`/jobs/${j.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                      View <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
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
