'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  User,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Eye,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  Languages,
  Clock,
  IndianRupee,
  MapPin,
  CheckCircle2,
  ExternalLink,
  FileText,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CandidateRecruiterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id?: string;
    userId?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      isEmailVerified?: boolean;
      isPhoneVerified?: boolean;
    };
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    headline?: string;
    summary?: string;
    currentTitle?: string;
    experienceYears?: number | string;
    currentSalary?: number | string;
    expectedSalary?: number | string;
    noticePeriod?: string;
    preferredLocations?: string[];
    location?: string;
    currentLocation?: string;
    resumeUrl?: string;
    resumes?: Array<any>;
    skills?: string[] | string;
    experience?: Array<any>;
    education?: Array<any>;
    certifications?: Array<any>;
    projects?: Array<any>;
    languages?: Array<any>;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      website?: string;
      twitter?: string;
    };
  } | null;
  onOpenResumePreview?: () => void;
}

export const CandidateRecruiterDrawer: React.FC<CandidateRecruiterDrawerProps> = ({
  isOpen,
  onClose,
  candidate,
  onOpenResumePreview,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'cv'>('profile');

  if (!isOpen || !candidate) return null;

  // Candidate Data Normalization
  const user = candidate.user || {
    firstName: candidate.firstName || '',
    lastName: candidate.lastName || '',
    email: candidate.email || '',
    phoneNumber: candidate.phoneNumber || '',
    avatarUrl: candidate.avatarUrl || '',
    isEmailVerified: true,
    isPhoneVerified: true,
  };

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Candidate Profile';
  const headline = candidate.headline || candidate.currentTitle || 'Experienced Professional';

  // Skills parsing
  const skillsList: string[] = Array.isArray(candidate.skills)
    ? candidate.skills
    : typeof candidate.skills === 'string'
    ? candidate.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const formatSalary = (val?: number | string) => {
    if (!val || Number(val) === 0) return 'Not Disclosed';
    const num = Number(val);
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)} Lakhs / Yr`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const resolveResumeUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const activeResumeUrl = candidate.resumeUrl || (candidate.resumes && candidate.resumes[0]?.resumeUrl);

  const handleDownloadCV = () => {
    if (activeResumeUrl && !activeResumeUrl.includes('example.com')) {
      window.open(resolveResumeUrl(activeResumeUrl), '_blank');
    } else if (onOpenResumePreview) {
      onOpenResumePreview();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
      {/* Slide-over Panel from Right */}
      <div className="w-full max-w-4xl h-full theme-surface border-l theme-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Top Header Action Bar */}
        <div className="p-4 border-b theme-border flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Recruiter Live View
            </span>
            <span className="text-xs font-bold theme-muted hidden sm:inline">
              Exact profile drawer seen in Recruiter Talent Search
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenResumePreview && (
              <button
                type="button"
                onClick={onOpenResumePreview}
                className="px-3 py-1.5 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Open formatted Camzy Resume PDF/Print preview"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Resume (By Camzy)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadCV}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download Attached CV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Recruiter View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Perspective Pill Bar */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-b theme-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Recruiter Mode Preview:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              This preview matches the slide-out drawer that employers see when they click your candidate card.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active in Sourcing DB
          </span>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Candidate Banner Card */}
          <div className="p-5 rounded-2xl border theme-border bg-gradient-to-r from-indigo-50/50 via-purple-50/20 to-slate-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-900/40 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-indigo-400 overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black theme-text tracking-tight">
                      {fullName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Profile
                    </span>
                  </div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {headline}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs theme-muted mt-2">
                    {user.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{user.email}</span>
                      </span>
                    )}
                    {user.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{user.phoneNumber}</span>
                      </span>
                    )}
                    {(candidate.currentLocation || candidate.location) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{candidate.currentLocation || candidate.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recruiter Outreach Badges */}
              <div className="flex items-center flex-wrap gap-2">
                {candidate.socialLinks?.linkedin && (
                  <a
                    href={candidate.socialLinks.linkedin.startsWith('http') ? candidate.socialLinks.linkedin : `https://${candidate.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Candidate LinkedIn"
                  >
                    <span className="font-black text-xs">in</span>
                    <span>LinkedIn</span>
                  </a>
                )}
                {candidate.socialLinks?.github && (
                  <a
                    href={candidate.socialLinks.github.startsWith('http') ? candidate.socialLinks.github : `https://${candidate.socialLinks.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Candidate GitHub"
                  >
                    <span className="font-black text-xs">gh</span>
                    <span>GitHub</span>
                  </a>
                )}
                {candidate.socialLinks?.website && (
                  <a
                    href={candidate.socialLinks.website.startsWith('http') ? candidate.socialLinks.website : `https://${candidate.socialLinks.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Candidate Portfolio"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
                <a
                  href={`https://wa.me/${user.phoneNumber ? user.phoneNumber.replace(/[^0-9]/g, '') : ''}?text=Hello%20${user.firstName || 'Candidate'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* 4 Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t theme-border text-xs">
              <div className="p-2.5 rounded-xl theme-surface border theme-border">
                <span className="theme-muted text-[10px] font-bold block">Experience</span>
                <span className="font-black theme-text">{candidate.experienceYears || 0} Years</span>
              </div>

              <div className="p-2.5 rounded-xl theme-surface border theme-border">
                <span className="theme-muted text-[10px] font-bold block">Notice Period</span>
                <span className="font-black text-amber-600 dark:text-amber-400">
                  {candidate.noticePeriod || 'Immediate'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl theme-surface border theme-border">
                <span className="theme-muted text-[10px] font-bold block">Current CTC</span>
                <span className="font-black theme-text">{formatSalary(candidate.currentSalary)}</span>
              </div>

              <div className="p-2.5 rounded-xl theme-surface border theme-border">
                <span className="theme-muted text-[10px] font-bold block">Expected CTC</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatSalary(candidate.expectedSalary)}
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Tab Navigation */}
          <div className="border-b theme-border flex items-center space-x-6">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Full Profile Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cv')}
              className={`pb-3 text-xs font-black transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'cv'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent theme-muted hover:theme-text'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Parsed CV Document</span>
            </button>
          </div>

          {/* TAB 1: PROFILE DETAILS OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-xs">
              
              {/* Executive Summary */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Executive Career Summary
                </h4>
                <div className="p-4 rounded-xl theme-surface border theme-border leading-relaxed whitespace-pre-line theme-text">
                  {candidate.summary || 'No detailed summary provided.'}
                </div>
              </div>

              {/* Key Skills Matrix */}
              {skillsList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Key Technical Skills &amp; Competencies ({skillsList.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Work Experience &amp; Career History ({candidate.experience?.length || 0})
                </h4>
                {candidate.experience && candidate.experience.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl theme-surface border theme-border space-y-1.5 shadow-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-extrabold text-sm theme-text">{exp.designation || exp.title}</h5>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{exp.companyName || exp.company}</span>
                            {exp.location && <span className="text-slate-400 text-[11px] ml-2">({exp.location})</span>}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 theme-muted font-bold">
                            {exp.startDate || 'Start'} &ndash; {exp.isCurrentJob ? 'Present' : exp.endDate || 'End'}
                          </span>
                        </div>
                        {exp.rolesAndResponsibilities && (
                          <p className="theme-muted leading-relaxed whitespace-pre-line pt-1 text-[11px]">
                            {exp.rolesAndResponsibilities}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="theme-muted italic">No formal employment history recorded.</p>
                )}
              </div>

              {/* Education & Qualifications */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Education &amp; Qualifications ({candidate.education?.length || 0})
                </h4>
                {candidate.education && candidate.education.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidate.education.map((edu: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl theme-surface border theme-border space-y-1">
                        <h5 className="font-extrabold theme-text">{edu.degree}</h5>
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{edu.institution}</p>
                        <p className="theme-muted text-[10px]">
                          Year: {edu.endYear || edu.year || 'Completed'} {edu.grade || edu.result ? `• Grade: ${edu.grade || edu.result}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="theme-muted italic">No educational records provided.</p>
                )}
              </div>

              {/* Languages Known (with Proficiency & Fluency badges) */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Languages Known ({candidate.languages?.length || 0})
                </h4>
                {candidate.languages && candidate.languages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {candidate.languages.map((lang: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl theme-surface border theme-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold theme-text">{lang.name || lang.language}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {lang.proficiency || 'Fluent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          {lang.canSpeak && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Speak</span>}
                          {lang.canRead && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Read</span>}
                          {lang.canWrite && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Write</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="theme-muted italic">No language proficiencies recorded.</p>
                )}
              </div>

              {/* Projects Portfolio */}
              {candidate.projects && candidate.projects.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Projects Portfolio ({candidate.projects.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidate.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl theme-surface border theme-border space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h5 className="font-extrabold theme-text">{proj.title || proj.name}</h5>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="theme-muted text-[11px] leading-relaxed line-clamp-3">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies && (
                          <div className="text-[10px] text-indigo-600 font-semibold">
                            Tech: {proj.technologies}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {candidate.certifications && candidate.certifications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Certifications &amp; Licenses ({candidate.certifications.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {candidate.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl theme-surface border theme-border space-y-1">
                        <div className="font-bold theme-text">{cert.name || cert.title}</div>
                        <div className="text-[11px] text-indigo-600">{cert.issuer || cert.institution}</div>
                        {cert.year && <div className="text-[10px] theme-muted">Issued: {cert.year}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences & Personal Details */}
              <div className="p-4 rounded-xl theme-surface border theme-border space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Preferences &amp; Location Match
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="theme-muted text-[10px] block">Preferred Cities</span>
                    <span className="font-bold theme-text">
                      {candidate.preferredLocations && candidate.preferredLocations.length > 0
                        ? candidate.preferredLocations.join(', ')
                        : 'Any / Open to Relocate'}
                    </span>
                  </div>
                  <div>
                    <span className="theme-muted text-[10px] block">Notice Period</span>
                    <span className="font-bold theme-text">{candidate.noticePeriod || 'Immediate'}</span>
                  </div>
                  <div>
                    <span className="theme-muted text-[10px] block">Profile Visibility</span>
                    <span className="font-bold text-emerald-600">Active (Searchable by Recruiters)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTACHED CV DOCUMENT VIEW */}
          {activeTab === 'cv' && (
            <div className="p-6 rounded-2xl border theme-border theme-surface space-y-4 font-sans text-xs shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b theme-border">
                <div>
                  <h4 className="font-black text-sm theme-text">Parsed Resume Document</h4>
                  <p className="text-[10px] theme-muted">Recruiter preview generated from verified candidate profile</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCV}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>

              <div className="space-y-4 leading-relaxed theme-text">
                <div className="text-center pb-3 border-b theme-border space-y-1">
                  <h3 className="text-lg font-black theme-text">
                    {fullName}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{headline}</p>
                  <p className="text-[11px] theme-muted">
                    {user.email} &bull; {user.phoneNumber || '+91 98765 43210'}
                  </p>
                </div>

                <div className="space-y-1">
                  <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Executive Summary</h5>
                  <p className="theme-muted whitespace-pre-line">{candidate.summary || 'Senior professional with proven industry track record.'}</p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Core Competencies</h5>
                  <p className="theme-text font-medium">{skillsList.join(', ') || 'Software Engineering'}</p>
                </div>

                {candidate.experience && candidate.experience.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Work Experience</h5>
                    {candidate.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-0.5 border-b theme-border pb-2 last:border-0">
                        <div className="font-bold theme-text">{exp.designation || exp.title} &ndash; {exp.companyName || exp.company}</div>
                        <div className="text-[10px] theme-muted">{exp.startDate} to {exp.isCurrentJob ? 'Present' : exp.endDate}</div>
                        {exp.rolesAndResponsibilities && (
                          <p className="theme-muted text-[11px] pt-0.5 whitespace-pre-line">{exp.rolesAndResponsibilities}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {candidate.education && candidate.education.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600">Education</h5>
                    {candidate.education.map((edu: any, idx: number) => (
                      <div key={idx} className="text-[11px]">
                        <strong>{edu.degree}</strong> &ndash; {edu.institution} ({edu.endYear || edu.year || 'Completed'})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
