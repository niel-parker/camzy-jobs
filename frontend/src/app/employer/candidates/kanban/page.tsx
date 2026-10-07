'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../../context/ThemeContext';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { Star, ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';

export default function EmployerKanbanPage() {
  const { sdk } = useTheme();
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const apps = await sdk.request<any[]>('/applications');
        setCandidates(apps);
      } catch (err) {
        console.error('Error fetching applications for Kanban:', err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [sdk]);

  const stages = [
    { code: 'APPLIED', title: 'Applied', color: 'bg-slate-500' },
    { code: 'UNDER_REVIEW', title: 'Under Review', color: 'bg-indigo-500' },
    { code: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-emerald-500' },
    { code: 'INTERVIEW', title: 'Interview', color: 'bg-amber-500' },
    { code: 'OFFERED', title: 'Offered', color: 'bg-purple-500' },
  ];

  const moveStage = async (appId: string, newStage: string) => {
    try {
      await sdk.request(`/applications/${appId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      });
      setCandidates((prev) =>
        prev.map((c) => (c.id === appId ? { ...c, stage: newStage } : c)),
      );
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-6">
        <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold theme-muted hover:text-indigo-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employer Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold theme-text tracking-tight">Applicant ATS Kanban Pipeline</h1>
          <p className="text-xs theme-muted">Track, evaluate, and transition applicants across recruitment stages</p>
        </div>

        {loading ? (
          <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading Kanban pipeline from database...</span>
          </div>
        ) : (
          /* Kanban Stages Grid */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
            {stages.map((stg) => {
              const stageCandidates = candidates.filter((c) => c.stage === stg.code);
              return (
                <div key={stg.code} className="glass-card rounded-2xl p-4 border-slate-200 dark:border-slate-800 space-y-4 min-w-[220px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stg.color}`} /> {stg.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageCandidates.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{c.candidateName}</span>
                          <div className="flex items-center text-amber-500 text-[10px]">
                            <Star className="w-3 h-3 fill-amber-500" /> {c.rating || 5}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{c.candidateHeadline || c.jobTitle}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                            title="View Candidate Information"
                          >
                            <HelpCircle className="w-3 h-3" /> Info
                          </button>

                          <select
                            value={c.stage}
                            onChange={(e) => moveStage(c.id, e.target.value)}
                            className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-200 outline-none cursor-pointer font-semibold"
                          >
                            {stages.map((s) => (
                              <option key={s.code} value={s.code}>{s.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md theme-surface border theme-border rounded-xl shadow-xl p-6 relative space-y-4">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <div>
                <h3 className="text-sm font-extrabold theme-text">{selectedCandidate.candidateName}</h3>
                <p className="text-[11px] theme-muted">{selectedCandidate.jobTitle}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-xs font-bold theme-muted hover:theme-text"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" /> Cover Letter / Application Summary
              </h4>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border theme-border text-xs leading-relaxed theme-text">
                "{selectedCandidate.coverLetter || 'No cover letter provided.'}"
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
