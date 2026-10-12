'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Building2, Plus, Download, Users, Briefcase, ArrowUpRight, Loader2, Search, Sparkles, CreditCard } from 'lucide-react';
import { JobListing } from '@job-portal/sdk';

export default function EmployerDashboardPage() {
  const { user, sdk } = useTheme();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tenantId = user?.tenantId;

  useEffect(() => {
    async function loadEmployerData() {
      setLoading(true);
      try {
        const [jobList, appsings, subOverview] = await Promise.all([
          sdk.getJobs().catch(() => []),
          sdk.request<any[]>('/applications').catch(() => []),
          sdk.getCurrentSubscription(tenantId).catch(() => null),
        ]);
        setJobs(jobList);
        setApplicationsCount(appsings.length);
        if (subOverview) {
          setSubscription(subOverview);
        }
      } catch (err) {
        console.error('Error loading employer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadEmployerData();
  }, [sdk, tenantId]);

  const companyName = user?.tenantName || subscription?.tenantName || 'TechCorp Global';
  const planName = subscription?.plan?.name || 'Professional Employer';

  // Live Quota Metrics
  const activeJobsUsed = subscription?.quotas?.activeJobs?.used ?? jobs.length;
  const activeJobsLimit = subscription?.quotas?.activeJobs?.limit ?? 15;
  const activeJobsPercent = subscription?.quotas?.activeJobs?.percentUsed ?? Math.min(100, Math.round((activeJobsUsed / activeJobsLimit) * 100));

  const resumeDownloadsUsed = subscription?.quotas?.resumeDownloads?.used ?? 0;
  const resumeDownloadsLimit = subscription?.quotas?.resumeDownloads?.limit ?? 150;
  const resumeDownloadsRemaining = subscription?.quotas?.resumeDownloads?.remaining ?? Math.max(0, resumeDownloadsLimit - resumeDownloadsUsed);
  const resumeDownloadsPercent = subscription?.quotas?.resumeDownloads?.percentUsed ?? Math.min(100, Math.round((resumeDownloadsUsed / resumeDownloadsLimit) * 100));

  const teamSeatsUsed = subscription?.quotas?.teamSeats?.used ?? 2;
  const teamSeatsLimit = subscription?.quotas?.teamSeats?.limit ?? 5;
  const teamSeatsRemaining = subscription?.quotas?.teamSeats?.remaining ?? Math.max(0, teamSeatsLimit - teamSeatsUsed);
  const teamSeatsPercent = subscription?.quotas?.teamSeats?.percentUsed ?? Math.min(100, Math.round((teamSeatsUsed / teamSeatsLimit) * 100));

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold theme-text tracking-tight">{companyName}</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold uppercase border border-indigo-500/20">
                {planName}
              </span>
            </div>
            <p className="text-xs theme-muted mt-1">Manage active company postings, applicant pipelines, and quota consumption</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/employer/billing"
              className="px-4 py-2.5 rounded-xl font-bold text-xs border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-500" /> Plan Billing & Invoices
            </Link>

            <Link
              href="/employer/candidates/search"
              className="px-4 py-2.5 rounded-xl font-bold text-xs border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-indigo-500" /> Candidate Search
            </Link>

            <Link
              href="/employer/jobs/create"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </Link>
          </div>
        </div>

        {/* Quota Progress Meters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Jobs Quota Card */}
          <div className="p-6 rounded-xl border theme-border theme-surface space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Active Job Quota
              </span>
              <span className="text-xs font-bold theme-text">{activeJobsUsed} / {activeJobsLimit} Used</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeJobsPercent}%` }}
              />
            </div>
            <p className="text-[11px] theme-muted">{Math.max(0, activeJobsLimit - activeJobsUsed)} job posting slots available this period</p>
          </div>

          {/* Resume Downloads Quota Card */}
          <div className="p-6 rounded-xl border theme-border theme-surface space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-500" /> Resume DB Downloads
              </span>
              <span className="text-xs font-bold theme-text">{resumeDownloadsUsed} / {resumeDownloadsLimit} Used</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${resumeDownloadsPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] theme-muted">{resumeDownloadsRemaining} candidate resume downloads remaining</p>
              <Link href="/employer/candidates/search" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
                Search Talent DB →
              </Link>
            </div>
          </div>

          {/* Recruiter Seats Card */}
          <div className="p-6 rounded-xl border theme-border theme-surface space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" /> Recruiter Seats
              </span>
              <span className="text-xs font-bold theme-text">{teamSeatsUsed} / {teamSeatsLimit} Seats</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${teamSeatsPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] theme-muted">{teamSeatsRemaining} sub-account seats open for team members</p>
              <Link href="/employer/seats" className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5">
                Manage Team →
              </Link>
            </div>
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
            <div className="divide-y theme-border">
              {jobs.map((job) => (
                <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm theme-text">{job.title}</h4>
                      {job.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs theme-muted">
                      {job.location} • {job.employmentType} • {job.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/jobs/${job.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                    >
                      View Live <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/employer/candidates/kanban"
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-all"
                    >
                      Pipeline Kanban
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
