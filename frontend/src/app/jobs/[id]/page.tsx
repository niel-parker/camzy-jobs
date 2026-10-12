'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../../../context/ThemeContext';
import { JobListing } from '@job-portal/sdk';
import { 
  Building2, MapPin, DollarSign, ArrowLeft, CheckCircle2, ShieldCheck, 
  AlertCircle, Loader2, Sparkles, FileText, Send, User, Upload, Clock, X, ChevronRight, AlertTriangle, Briefcase, Check, Share2, Mail, Gift, Bookmark
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, sdk, user } = useTheme();

  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Bookmark / Save Job State
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);

  // Naukri-style Apply Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Share Job Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareFriendEmail, setShareFriendEmail] = useState('');
  const [shareSenderName, setShareSenderName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [shareMessage, setShareMessage] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  // Candidate Profile & Resume Completeness State
  const [candidateProfile, setCandidateProfile] = useState<{
    headline?: string;
    skills?: string[];
    resumeUrl?: string;
    experienceYears?: number;
    expectedSalary?: number;
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Resume File & Inline Profile Edit State
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [inlineHeadline, setInlineHeadline] = useState<string>('');
  const [inlineSkills, setInlineSkills] = useState<string>('');
  const [isSavingInlineProfile, setIsSavingInlineProfile] = useState(false);

  // Naukri Questionnaire State
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 15 Days');
  const [currentCtc, setCurrentCtc] = useState('120000');
  const [expectedCtc, setExpectedCtc] = useState('150000');
  const [currentLocation, setCurrentLocation] = useState('New York, NY');
  const [willingToRelocate, setWillingToRelocate] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

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

  // Check URL query param ?apply=true
  useEffect(() => {
    if (searchParams.get('apply') === 'true') {
      if (!user) {
        router.push(`/auth/login?redirect=/jobs/${id}?apply=true`);
      } else {
        handleOpenApplyModal();
      }
    }
  }, [searchParams, user, id]);

  // Check if job is saved by current candidate
  useEffect(() => {
    async function checkSavedStatus() {
      if (!user || !id) return;
      try {
        const candidateId = user.candidateId || user.id;
        const profile = await sdk.getCandidateProfile(candidateId);
        if (profile?.savedJobIds?.includes(id as string)) {
          setIsSaved(true);
        }
      } catch (err) {
        console.warn('Could not check saved job status:', err);
      }
    }
    checkSavedStatus();
  }, [user, id, sdk]);

  const handleToggleSaveJob = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${id}`);
      return;
    }
    setIsSavingBookmark(true);
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const candidateId = user.candidateId || user.id;
      const res = await sdk.toggleSaveJob(candidateId, id as string);
      if (res && typeof res.saved === 'boolean') {
        setIsSaved(res.saved);
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
      setIsSaved(prev);
    } finally {
      setIsSavingBookmark(false);
    }
  };

  // Load Candidate Profile to check completeness & resume
  useEffect(() => {
    async function loadCandidateProfile() {
      if (!user) return;
      setIsLoadingProfile(true);
      try {
        const profile = await sdk.request<any>(`/candidates/${user.candidateId || user.id}`);
        setCandidateProfile(profile);
        if (profile) {
          if (profile.resumeUrl) {
            const parts = profile.resumeUrl.split('/');
            setResumeFileName(parts[parts.length - 1] || 'resume.pdf');
          } else {
            setResumeFileName('');
          }
          setInlineHeadline(profile.headline || `${user.firstName} ${user.lastName} - Professional Candidate`);
          setInlineSkills(Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '');
        }
      } catch (err) {
        console.log('Candidate profile not found or endpoint empty:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    if (user && isModalOpen) {
      loadCandidateProfile();
    }
  }, [user, isModalOpen, sdk]);

  const calculateProfileScore = () => {
    let score = 0;
    if (resumeFileName || candidateProfile?.resumeUrl) score += 40; // Mandatory resume
    if (inlineHeadline || candidateProfile?.headline) score += 25;
    if (inlineSkills || (candidateProfile?.skills && candidateProfile.skills.length > 0)) score += 20;
    if (user?.email && user?.firstName) score += 15;
    return score;
  };

  const profileScore = calculateProfileScore();
  const isResumePresent = Boolean(resumeFileName || candidateProfile?.resumeUrl);
  const isProfileComplete = profileScore >= 60 && isResumePresent;

  const handleOpenApplyModal = async () => {
    setApplyError(null);

    // 1. Unauthenticated check - redirect immediately to login page
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${id}?apply=true`);
      return;
    }

    // 2. Candidate role check
    if (user.role !== 'CANDIDATE' && user.role !== 'SUPER_ADMIN') {
      setApplyError('Only Candidate accounts can apply for positions. Please sign in with a candidate account.');
      return;
    }

    // 3. External Apply URL Mode
    if (job?.applyType === 'EXTERNAL' && job?.applyUrl) {
      try {
        const resumeSnapshot = candidateProfile?.resumeUrl 
          ? (candidateProfile.resumeUrl.includes('example.com') ? 'http://localhost:4000/uploads/resumes/sample-resume.pdf' : candidateProfile.resumeUrl)
          : 'http://localhost:4000/uploads/resumes/sample-resume.pdf';

        await sdk.request('/applications', {
          method: 'POST',
          body: JSON.stringify({
            jobId: id,
            candidateId: user.candidateId || user.id,
            candidateName: `${user.firstName} ${user.lastName}`,
            candidateEmail: user.email,
            resumeUrlSnapshot: resumeSnapshot,
            answersJson: { externalRedirect: true, applyUrl: job.applyUrl },
          }),
        });
      } catch (err) {
        console.log('External app log error:', err);
      }
      setIsApplied(true);
      window.open(job.applyUrl, '_blank');
      return;
    }

    // Open Naukri-style internal apply modal
    setIsModalOpen(true);
  };

  const handleSendShareJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !shareFriendEmail) return;
    setShareLoading(true);
    setShareSuccess(null);

    try {
      const jobUrl = typeof window !== 'undefined' ? window.location.href : `https://jobs.camzytech.com/jobs/${job.id}`;
      const res = await sdk.shareJob({
        toEmail: shareFriendEmail,
        senderName: shareSenderName || (user ? `${user.firstName} ${user.lastName}` : 'A friend'),
        jobTitle: job.title,
        companyName: job.companyName,
        jobUrl,
        personalNote: shareMessage,
      });

      setShareSuccess(res.message || 'Job recommendation sent successfully via Mailgun SMTP!');
      setTimeout(() => {
        setIsShareModalOpen(false);
        setShareSuccess(null);
        setShareFriendEmail('');
        setShareMessage('');
      }, 2000);
    } catch (err: any) {
      setShareSuccess(err.message || 'Failed to dispatch email.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleSaveInlineProfile = async () => {
    if (!user) return;
    setIsSavingInlineProfile(true);
    setApplyError(null);

    try {
      const updatedResumeName = resumeFileName || `${user.firstName?.toLowerCase() || 'candidate'}-resume-2026.pdf`;
      const updatedResumeUrl = `https://example.com/resumes/${updatedResumeName}`;
      setResumeFileName(updatedResumeName);

      const updated = await sdk.request<any>(`/candidates/${user.candidateId || user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          headline: inlineHeadline,
          skills: inlineSkills.split(',').map((s) => s.trim()).filter(Boolean),
          resumeUrl: updatedResumeUrl,
        }),
      });

      setCandidateProfile(updated);
    } catch (err: any) {
      console.error('Failed to update candidate profile:', err);
      setApplyError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSavingInlineProfile(false);
    }
  };

  const handleFinalSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !user) return;

    if (!isProfileComplete) {
      setApplyError('Your candidate profile is incomplete! Please upload a resume and fill required details to submit application.');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      const answersJson = {
        noticePeriod,
        currentCtc,
        expectedCtc,
        currentLocation,
        willingToRelocate,
        ...customAnswers,
      };

      await sdk.request('/applications', {
        method: 'POST',
        body: JSON.stringify({
          jobId: id,
          candidateId: user.candidateId || user.id,
          candidateName: `${user.firstName} ${user.lastName}`,
          candidateEmail: user.email,
          coverLetter,
          resumeUrlSnapshot: candidateProfile?.resumeUrl && !candidateProfile.resumeUrl.includes('example.com')
            ? candidateProfile.resumeUrl
            : 'http://localhost:4000/uploads/resumes/sample-resume.pdf',
          answersJson,
        }),
      });

      setIsApplied(true);
      setShowSuccessScreen(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setApplyError(err.message || 'Failed to submit job application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Job Listings
      </Link>

      {applyError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{applyError}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="theme-surface border theme-border rounded-3xl p-8 space-y-6 shadow-sm">
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
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-1 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified Employer
                </span>
                {job.applyType === 'INTERNAL' ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                    Apply on Camzy Jobs
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                    External Site Apply ↗
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSaveJob}
              disabled={isSavingBookmark}
              className={`px-4 py-3 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? 'Job Bookmarked' : 'Save Job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>{isSaved ? 'Saved' : 'Save Job'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-3 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-indigo-500" /> Share Job
            </button>

            <button
              onClick={handleOpenApplyModal}
              disabled={isApplied}
              className="px-8 py-3.5 rounded-xl font-extrabold text-xs text-white shadow-lg theme-transition hover:opacity-90 active:scale-95 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: isApplied ? '#10b981' : theme.primaryColor }}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" /> Application Submitted
                </>
              ) : job.applyType === 'EXTERNAL' ? (
                <>
                  <Send className="w-4 h-4" /> Apply on Company Site ↗
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Apply on Camzy Jobs
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Job Details Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Location</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} {job.isRemote && '(Remote)'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Salary Disclosure</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              {job.isSalaryVisible && job.salaryMin
                ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`
                : 'Salary Hidden / Negotiable'}
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

        {/* Required Skills & Benefits */}
        {((job.skills && job.skills.length > 0) || (job.benefits && job.benefits.length > 0)) && (
          <div className="space-y-3 pt-2 border-t theme-border">
            {job.skills && job.skills.length > 0 && (
              <div>
                <span className="text-[11px] font-bold theme-muted uppercase tracking-wider block mb-1.5">Required Skills & Tech Stack:</span>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <span className="text-[11px] font-bold theme-muted uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-emerald-500" /> Key Perks & Job Benefits:
                </span>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description Content Card */}
      <div className="theme-surface border theme-border rounded-3xl p-8 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Job Description & Requirements</h2>
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {job.description}
        </div>
      </div>

      {/* SHARE JOB MODAL (Email to Friend via Mailgun) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 theme-modal animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <h3 className="text-base font-extrabold theme-text flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-500" /> Share Job with a Friend
              </h3>
              <button onClick={() => setIsShareModalOpen(null as any)} className="p-1 theme-muted hover:theme-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {shareSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {shareSuccess}
              </div>
            )}

            <form onSubmit={handleSendShareJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold theme-text mb-1">Friend&apos;s Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                  <input
                    type="email"
                    required
                    placeholder="friend@example.com"
                    value={shareFriendEmail}
                    onChange={(e) => setShareFriendEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold theme-text mb-1">Your Name</label>
                <input
                  type="text"
                  value={shareSenderName}
                  onChange={(e) => setShareSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold theme-text mb-1">Personal Message / Note (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Hey, check out this job opening at Camzy Jobs!"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={shareLoading || !shareFriendEmail}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Job Email via Mailgun
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAUKRI.COM STYLE APPLY MODAL */}
      {isModalOpen && user && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 theme-modal animate-in fade-in zoom-in-95 duration-200 relative z-50">
            
            {showSuccessScreen ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black theme-text">Application Sent Successfully!</h3>
                  <p className="text-xs theme-muted max-w-md mx-auto leading-relaxed">
                    Your candidate profile, attached resume, and recruiter screening answers have been delivered directly to <strong className="theme-text">{job.companyName}</strong>.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/candidate/applications"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    Track Application Status <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setShowSuccessScreen(false);
                    }}
                    className="px-5 py-2.5 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Back to Job Listing
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFinalSubmitApplication} className="space-y-5">
                <div className="flex items-center justify-between border-b theme-border pb-4">
                  <div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Apply on Camzy Jobs
                    </span>
                    <h3 className="text-lg font-black theme-text mt-1">{job.title}</h3>
                    <p className="text-xs theme-muted">{job.companyName} • {job.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Candidate Profile Score & Completeness Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border theme-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                        {user?.firstName ? user.firstName[0] : 'C'}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold theme-text">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[11px] theme-muted">{user?.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        profileScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        Profile {profileScore}% Complete
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${profileScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${profileScore}%` }}
                    />
                  </div>
                </div>

                {/* Screening Questionnaire Grid */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" /> Recruiter Screening Questions
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold theme-text mb-1">Notice Period / Availability</label>
                      <select
                        value={noticePeriod}
                        onChange={(e) => setNoticePeriod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl theme-surface border theme-border theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                      >
                        <option value="Immediate / 15 Days">Immediate / 15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold theme-text mb-1">Current Annual CTC ($)</label>
                      <input
                        type="text"
                        value={currentCtc}
                        onChange={(e) => setCurrentCtc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl theme-surface border theme-border theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-4 border-t theme-border">
                  <span className="text-[11px] theme-muted">
                    {!isProfileComplete ? '⚠️ Resume required to submit' : '✓ Ready to apply'}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
