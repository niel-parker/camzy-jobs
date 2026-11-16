'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Briefcase, Building2, Calendar, MapPin, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { resolveMediaUrl } from '../../../utils/media';

interface CandidateApp {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  appliedDate: string;
  stage: string;
  stageStep: number;
}

const STAGE_LABELS: Record<string, { label: string; color: string; step: number }> = {
  APPLIED: { label: 'Applied', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', step: 1 },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', step: 2 },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', step: 3 },
  INTERVIEW: { label: 'Interview Scheduled', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', step: 4 },
  OFFERED: { label: 'Offer Extended', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', step: 5 },
  REJECTED: { label: 'Not Selected', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', step: 1 },
};

export default function CandidateApplicationsPage() {
  const { user, sdk } = useTheme();
  const [applications, setApplications] = useState<CandidateApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadApplications() {
      setLoading(true);
      try {
        const queryParams: { candidateId?: string; userId?: string } = {};
        if (user?.candidateId) queryParams.candidateId = user.candidateId;
        if (user?.id) queryParams.userId = user.id;

        const raw = await sdk.getAtsApplications(queryParams);

        if (isMounted) {
          const mapped: CandidateApp[] = (raw || []).map((a: any) => {
            const stageConfig = STAGE_LABELS[a.stage] || { label: a.stage || 'Applied', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', step: 1 };
            return {
              id: a.id,
              jobId: a.jobId,
              jobTitle: a.jobTitle || 'Job Opening',
              companyName: a.companyName || 'Hiring Company',
              companyLogo: a.companyLogo || '',
              location: a.location || 'Remote',
              appliedDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent',
              stage: a.stage || 'APPLIED',
              stageStep: stageConfig.step,
            };
          });
          setApplications(mapped);
        }
      } catch (err) {
        console.error('Error fetching candidate applications:', err);
        if (isMounted) setApplications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, [sdk, user?.candidateId, user?.id]);

  return (
    <DashboardLayout role="CANDIDATE">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight theme-text">
            My Submitted Applications
          </h1>
          <p className="mt-1 text-xs theme-muted">
            Track real-time hiring stage progress and interview updates from company recruiters.
          </p>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Fetching your submitted applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center theme-surface border theme-border rounded-2xl space-y-3">
            <Briefcase className="w-10 h-10 mx-auto text-indigo-500 opacity-60" />
            <p className="text-base font-bold theme-text">No Applications Submitted Yet</p>
            <p className="text-xs theme-muted max-w-sm mx-auto">
              You haven't submitted any job applications yet. Browse verified company openings to apply.
            </p>
            <div className="pt-2">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                Explore Active Jobs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-6 rounded-2xl border theme-border theme-surface hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Company Logo or Icon */}
                    <div className="w-12 h-12 rounded-xl border theme-border bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {app.companyLogo ? (
                        <img
                          src={resolveMediaUrl(app.companyLogo)}
                          alt={app.companyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-indigo-500" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/jobs/${app.jobId}`}
                          className="text-base font-bold theme-text hover:text-indigo-600 transition-colors"
                        >
                          {app.jobTitle}
                        </Link>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            STAGE_LABELS[app.stage]?.color || 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          }`}
                        >
                          {STAGE_LABELS[app.stage]?.label || app.stage}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs theme-muted">
                        <span className="inline-flex items-center font-semibold text-indigo-600 dark:text-indigo-400">
                          <Building2 className="h-3.5 w-3.5 mr-1" /> {app.companyName}
                        </span>
                        <span className="inline-flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" /> {app.location}
                        </span>
                        <span className="inline-flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" /> Applied {app.appliedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/jobs/${app.jobId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 self-start sm:self-center"
                  >
                    View Job <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Stage Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-medium theme-muted mb-1.5">
                    <span>Application Stage Timeline:</span>
                    <span className="text-indigo-500 font-bold">Step {app.stageStep} of 5 ({STAGE_LABELS[app.stage]?.label || app.stage})</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 flex overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(app.stageStep / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
