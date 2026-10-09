'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../../context/ThemeContext';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { Star, ArrowLeft, HelpCircle, Loader2, FileText, Briefcase, GraduationCap, Award, ExternalLink, X } from 'lucide-react';

export default function EmployerKanbanPage() {
  const { sdk } = useTheme();
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [candidateProfileData, setCandidateProfileData] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
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

  const handleOpenInfoModal = async (c: any) => {
    setSelectedCandidate(c);
    setCandidateProfileData(null);
    setLoadingProfile(true);

    try {
      if (c.candidateId) {
        const prof = await sdk.request<any>(`/candidates/${c.candidateId}`);
        setCandidateProfileData(prof);
      }
    } catch (err) {
      console.log('Error fetching candidate detailed profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

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
                            onClick={() => handleOpenInfoModal(c)}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                            title="View Full Candidate Profile & Screening Answers"
                          >
                            <HelpCircle className="w-3 h-3" /> View Profile
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

      {/* Recruiter Evaluation Info Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-5 theme-modal animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b theme-border pb-4">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Naukri ATS Evaluation
                </span>
                <h3 className="text-lg font-black theme-text mt-1">{selectedCandidate.candidateName}</h3>
                <p className="text-xs theme-muted">Applied for: <strong className="theme-text">{selectedCandidate.jobTitle}</strong></p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingProfile ? (
              <div className="py-12 text-center text-xs theme-muted flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading full candidate profile history...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Resume Attachment Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border theme-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="font-bold theme-text">Candidate Resume Snapshot</p>
                      <p className="text-[11px] theme-muted">{selectedCandidate.resumeUrlSnapshot || 'resume.pdf'}</p>
                    </div>
                  </div>
                  {selectedCandidate.resumeUrlSnapshot && (
                    <a
                      href={selectedCandidate.resumeUrlSnapshot}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3" /> Open Resume
                    </a>
                  )}
                </div>

                {/* Recruiter Screening Answers */}
                {selectedCandidate.answersJson && Object.keys(selectedCandidate.answersJson).length > 0 && (
                  <div className="p-4 rounded-xl border theme-border bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Screening Questionnaire Responses
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {Object.entries(selectedCandidate.answersJson).map(([k, v]) => (
                        <div key={k} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border theme-border">
                          <span className="text-[10px] theme-muted block font-bold capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-semibold theme-text text-xs">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedCandidate.coverLetter && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold theme-text">Cover Note to Hiring Manager</h4>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border text-xs theme-text leading-relaxed">
                      "{selectedCandidate.coverLetter}"
                    </div>
                  </div>
                )}

                {/* Detailed Work Experience History */}
                {candidateProfileData?.experience && candidateProfileData.experience.length > 0 && (
                  <div className="space-y-2 pt-2 border-t theme-border">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Work Experience History ({candidateProfileData.experience.length})
                    </h4>
                    <div className="space-y-2">
                      {candidateProfileData.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex justify-between font-bold theme-text">
                            <span>{exp.designation}</span>
                            <span className="text-indigo-500">{exp.companyName}</span>
                          </div>
                          <p className="text-[11px] theme-muted">{exp.startDate} – {exp.isCurrentJob ? 'Present' : exp.endDate} {exp.location && `• ${exp.location}`}</p>
                          {exp.jobSummary && <p className="text-[11px] theme-text pt-0.5 leading-relaxed">{exp.jobSummary}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education & Qualifications */}
                {candidateProfileData?.education && candidateProfileData.education.length > 0 && (
                  <div className="space-y-2 pt-2 border-t theme-border">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-500" /> Education ({candidateProfileData.education.length})
                    </h4>
                    <div className="space-y-2">
                      {candidateProfileData.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                          <div className="flex justify-between font-bold theme-text">
                            <span>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</span>
                            <span className="text-indigo-500">{edu.institution}</span>
                          </div>
                          <p className="text-[11px] theme-muted">{edu.startYear} – {edu.endYear} {edu.grade && `• Grade: ${edu.grade}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {candidateProfileData?.certifications && candidateProfileData.certifications.length > 0 && (
                  <div className="space-y-2 pt-2 border-t theme-border">
                    <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-500" /> Certifications ({candidateProfileData.certifications.length})
                    </h4>
                    <div className="space-y-2">
                      {candidateProfileData.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold theme-text">{cert.title}</p>
                            <p className="text-[11px] theme-muted">{cert.issuingOrganization}</p>
                          </div>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-500 hover:underline">
                              Verify ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
