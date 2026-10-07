'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Briefcase, Building2, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface CandidateApp {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  appliedDate: string;
  stage: string;
  stageStep: number;
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  APPLIED: { label: 'Applied', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  INTERVIEW: { label: 'Interview Scheduled', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  OFFERED: { label: 'Offer Extended', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  REJECTED: { label: 'Not Selected', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

export default function CandidateApplicationsPage() {
  const { sdk } = useTheme();
  const [applications, setApplications] = useState<CandidateApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const raw = await sdk.request<any[]>('/applications');
        const mapped: CandidateApp[] = raw.map((a) => ({
          id: a.id,
          jobTitle: a.jobTitle || 'Senior Full Stack Engineer',
          companyName: 'TechCorp Global',
          location: 'San Francisco, CA',
          appliedDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent',
          stage: a.stage || 'APPLIED',
          stageStep: a.stage === 'SHORTLISTED' ? 3 : a.stage === 'INTERVIEW' ? 4 : 2,
        }));
        setApplications(mapped);
      } catch (err) {
        console.error('Error fetching candidate applications:', err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [sdk]);

  return (
    <DashboardLayout role="CANDIDATE">
      <div className="space-y-6">
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
            <span>Fetching submitted applications from database...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center theme-surface border theme-border rounded-xl space-y-2">
            <Briefcase className="w-8 h-8 mx-auto text-indigo-500 opacity-50" />
            <p className="font-bold theme-text">No Applications Submitted Yet</p>
            <p className="text-xs theme-muted">Browse active job listings to apply for open roles.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-6 rounded-xl border theme-border theme-surface hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold theme-text">{app.jobTitle}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          STAGE_LABELS[app.stage]?.color || 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}
                      >
                        {STAGE_LABELS[app.stage]?.label || app.stage}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs theme-muted">
                      <span className="inline-flex items-center font-semibold text-indigo-500">
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

                {/* Stage Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-medium theme-muted mb-1.5">
                    <span>Application Stage Timeline:</span>
                    <span className="text-indigo-500 font-bold">Step {app.stageStep} of 5</span>
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
