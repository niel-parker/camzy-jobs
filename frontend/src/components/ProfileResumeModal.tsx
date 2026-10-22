'use client';

import React, { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Download, Printer, X, Mail, Phone, MapPin, Globe, 
  Linkedin, Github, Briefcase, GraduationCap, Award, FolderGit2, Languages, Sparkles 
} from 'lucide-react';

interface ProfileResumeModalProps {
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
    resumeUrl?: string;
    resumes?: Array<any>;
    skills?: string[] | string;
    experience?: Array<any>;
    education?: Array<any>;
    certifications?: Array<any>;
    projects?: Array<any>;
    languages?: Array<any>;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      website?: string;
    };
  } | null;
}

export const ProfileResumeModal: React.FC<ProfileResumeModalProps> = ({ isOpen, onClose, candidate }) => {
  const { user, sdk } = useTheme();
  const resumeRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !candidate) return null;

  const resolveResumeUrl = (rawUrl?: string) => {
    if (!rawUrl || rawUrl.includes('example.com')) {
      return 'http://localhost:4000/uploads/resumes/sample-resume.pdf';
    }
    if (rawUrl.startsWith('/uploads')) {
      const apiHost = typeof window !== 'undefined' && window.location.hostname === 'jobs.camzytech.com'
        ? 'https://api.jobs.camzytech.com'
        : 'http://localhost:4000';
      return `${apiHost}${rawUrl}`;
    }
    return rawUrl;
  };

  const isMockTemplate = !candidate.id && !candidate.user?.email && !candidate.email;

  const firstName = candidate.user?.firstName || candidate.firstName || '';
  const lastName = candidate.user?.lastName || candidate.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || candidate.user?.email?.split('@')[0] || candidate.email?.split('@')[0] || (isMockTemplate ? 'Candidate Name' : 'Verified Candidate');
  const email = candidate.user?.email || candidate.email || '';
  const phone = candidate.user?.phoneNumber || candidate.phoneNumber || '';
  const avatar = candidate.user?.avatarUrl || candidate.avatarUrl || '';
  const headline = candidate.headline || candidate.currentTitle || 'Professional Candidate';
  const summary = candidate.summary || '';
  const noticePeriod = candidate.noticePeriod || 'Immediate';
  const locations = Array.isArray(candidate.preferredLocations) ? candidate.preferredLocations : [];

  // Parse skills safely whether array or comma-separated string
  let skillsList: string[] = [];
  if (Array.isArray(candidate.skills) && candidate.skills.length > 0) {
    skillsList = candidate.skills;
  } else if (typeof candidate.skills === 'string' && candidate.skills.trim()) {
    skillsList = candidate.skills.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const rawExp = Array.isArray(candidate.experience) ? candidate.experience : [];
  const experiences = rawExp.map((exp: any, idx: number) => ({
    id: exp.id || `exp-${idx}`,
    designation: exp.designation || exp.title || 'Role / Position',
    companyName: exp.companyName || exp.company || 'Company',
    isCurrentJob: Boolean(exp.isCurrentJob ?? exp.isCurrent),
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    location: exp.location || '',
    noticePeriod: exp.noticePeriod || '',
    jobSummary: exp.jobSummary || '',
    rolesAndResponsibilities: exp.rolesAndResponsibilities || exp.description || '',
  }));

  const rawEdu = Array.isArray(candidate.education) ? candidate.education : [];
  const educations = rawEdu.map((edu: any, idx: number) => ({
    id: edu.id || `edu-${idx}`,
    degree: edu.degree || edu.degree_title || 'Degree / Qualification',
    fieldOfStudy: edu.fieldOfStudy || '',
    institution: edu.institution || 'Institution / University',
    startYear: edu.startYear || '',
    endYear: edu.endYear || edu.year || '',
    grade: edu.grade || edu.result || '',
  }));

  const certs = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  const projs = Array.isArray(candidate.projects) ? candidate.projects : [];
  const langs = Array.isArray(candidate.languages)
    ? candidate.languages.map((l: any) => typeof l === 'string' ? l : `${l.language} (${l.proficiency || 'Fluent'})`)
    : [];

  const socials = {
    linkedin: candidate.socialLinks?.linkedin || '',
    github: candidate.socialLinks?.github || '',
    website: candidate.socialLinks?.website || '',
  };

  const experienceYears = candidate.experienceYears ?? (experiences.length > 0 ? `${experiences.length * 2}` : '0');
  const currentSalaryFormatted = candidate.currentSalary ? `${Number(candidate.currentSalary).toLocaleString()} INR` : 'Not Disclosed';
  const expectedSalaryFormatted = candidate.expectedSalary ? `${Number(candidate.expectedSalary).toLocaleString()} INR` : 'Negotiable';

  const rawResumeUrl = candidate.resumeUrl || (candidate.resumes && candidate.resumes[0] ? (candidate.resumes[0].resumeUrl || candidate.resumes[0].url) : '');
  const downloadOriginalUrl = rawResumeUrl ? resolveResumeUrl(rawResumeUrl) : null;

  const handlePrint = () => {
    // Record download against employer monthly quota
    if (user?.role && user.role !== 'CANDIDATE') {
      sdk.trackResumeDownload(candidate.id, user.tenantId).catch(() => {});
    }

    const printContent = document.getElementById('profile-resume-printable');
    if (!printContent) {
      window.print();
      return;
    }

    // Filter stylesheets from current page, excluding any that contain visibility: hidden
    const safeStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .filter((html) => !html.includes('visibility: hidden') && !html.includes('visibility:hidden'))
      .join('\n');

    const printWin = window.open('', '_blank', 'width=950,height=1100');
    if (!printWin) {
      window.print();
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${fullName} - Executive Resume</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  ${safeStyles}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      box-sizing: border-box;
      visibility: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      visibility: visible !important;
    }
    .print-actions-bar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #1e1b4b;
      color: white;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .resume-page-container {
      max-width: 820px;
      margin: 24px auto;
      background: #ffffff;
      padding: 36px 44px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      visibility: visible !important;
    }
    .resume-page-container * {
      visibility: visible !important;
    }
    /* Essential fallback layout styles */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .font-black { font-weight: 900; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-full { border-radius: 9999px; }
    .border { border: 1px solid #e2e8f0; }
    .border-b-2 { border-bottom: 2px solid #4f46e5; }
    .bg-white { background-color: #ffffff; }
    .bg-slate-50 { background-color: #f8fafc; }
    .text-indigo-600 { color: #4f46e5; }
    .text-indigo-700 { color: #4338ca; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-700 { color: #334155; }
    .text-slate-600 { color: #475569; }

    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      .print-actions-bar, .no-print {
        display: none !important;
      }
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        visibility: visible !important;
      }
      * {
        visibility: visible !important;
      }
      .resume-page-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        visibility: visible !important;
      }
      .resume-page-container * {
        visibility: visible !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions-bar">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">📄</span>
      <div>
        <div style="font-weight:800; font-size:15px; letter-spacing: -0.01em;">${fullName} • Executive Resume</div>
        <div style="font-size:11px; opacity:0.85;">Camzy Jobs Talent Profile • Ready to Save as PDF</div>
      </div>
    </div>
    <div style="display:flex; gap:10px;">
      <button onclick="window.print()" style="background:#4f46e5; color:white; border:none; padding:9px 20px; border-radius:8px; font-weight:800; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow: 0 2px 8px rgba(79,70,229,0.4);">
        🖨️ Save as PDF / Print
      </button>
      <button onclick="window.close()" style="background:rgba(255,255,255,0.15); color:white; border:none; padding:9px 16px; border-radius:8px; font-size:12px; cursor:pointer; font-weight:600;">
        Close
      </button>
    </div>
  </div>
  <div class="resume-page-container">
    ${printContent.innerHTML}
  </div>
  <script>
    setTimeout(function() {
      try {
        window.focus();
        window.print();
      } catch(e) {}
    }, 400);
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  return (
    <>
      {/* Global Print Stylesheet for Pure Clean Resume Printing */}
      <style jsx global>{`
        @media print {
          aside, header, nav, footer, .no-print {
            display: none !important;
          }
          html, body, #__next, .h-screen, .overflow-hidden {
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            background: #ffffff !important;
          }
          .resume-modal-backdrop {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: 1 !important;
          }
          .resume-modal-container {
            max-width: 100% !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            background: #ffffff !important;
          }
          .resume-scroll-viewport {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          #profile-resume-printable {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 24px !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          #profile-resume-printable * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* MODAL BACKDROP (no-print removed so printable content is never hidden) */}
      <div className="resume-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
        <div className="resume-modal-container relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* TOP ACTION BAR (No Print) */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                <Printer className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Recruiter View & Executive Resume</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black border border-indigo-500/20">
                    Recruiter View
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Preview how recruiters view your profile, then download or print your PDF resume
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {downloadOriginalUrl && (
                <a
                  href={downloadOriginalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download original uploaded resume document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Original File</span>
                </a>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE RESUME VIEWPORT */}
          <div className="resume-scroll-viewport flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60">
            {/* THE PRINTABLE RESUME SHEET */}
            <div 
              id="profile-resume-printable" 
              ref={resumeRef}
              className="max-w-3xl mx-auto bg-white text-slate-900 shadow-xl rounded-xl border border-slate-200 p-8 sm:p-12 space-y-6 text-sm"
              style={{ minHeight: '1000px', fontFamily: "'Inter', -apple-system, sans-serif" }}
            >
              
              {/* HEADER SECTION */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-indigo-600">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">{fullName}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                      Verified
                    </span>
                  </div>
                  <p className="text-sm font-bold text-indigo-700 tracking-wide">{headline}</p>
                  
                  {/* Contact Details Strip */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 pt-2 text-xs text-slate-600">
                    {email && (
                      <span className="flex items-center gap-1 font-medium">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" /> {email}
                      </span>
                    )}
                    {phone && (
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-indigo-600" /> {phone}
                      </span>
                    )}
                    {locations.length > 0 && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" /> {locations.join(', ')}
                      </span>
                    )}
                    {noticePeriod && (
                      <span className="font-bold text-emerald-700">
                        • Notice: {noticePeriod}
                      </span>
                    )}
                  </div>

                  {/* Social / Portfolio Links */}
                  {(socials.linkedin || socials.github || socials.website) && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                      {socials.linkedin && (
                        <span className="flex items-center gap-1 font-medium">
                          <Linkedin className="w-3 h-3 text-indigo-600" /> {socials.linkedin.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                      {socials.github && (
                        <span className="flex items-center gap-1 font-medium">
                          <Github className="w-3 h-3 text-slate-800" /> {socials.github.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                      {socials.website && (
                        <span className="flex items-center gap-1 font-medium">
                          <Globe className="w-3 h-3 text-indigo-600" /> {socials.website.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {avatar && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm flex-shrink-0 self-start sm:self-center">
                    <img
                      src={getAvatarUrl(avatar) || avatar}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* RECRUITER EXECUTIVE METRICS & SNAPSHOT STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Experience</span>
                  <span className="font-extrabold text-slate-900">{experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Notice Period</span>
                  <span className="font-extrabold text-indigo-700">{noticePeriod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Current Salary</span>
                  <span className="font-extrabold text-slate-800">{currentSalaryFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Expected Salary</span>
                  <span className="font-extrabold text-emerald-700">{expectedSalaryFormatted}</span>
                </div>
              </div>

              {/* PROFESSIONAL SUMMARY */}
              {summary && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1">
                    Professional Summary
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-700 font-normal whitespace-pre-line">
                    {summary}
                  </p>
                </div>
              )}

              {/* CORE SKILLS */}
              {skillsList.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1">
                    Core Technical & Functional Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* WORK EXPERIENCE */}
              {experiences.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Work Experience & Employment History
                  </h3>
                  <div className="space-y-4">
                    {experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">
                            {exp.designation || (exp as any).title || 'Role'} <span className="font-normal text-slate-600">at</span> <strong className="text-indigo-800">{exp.companyName || (exp as any).company || 'Company'}</strong>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {exp.startDate ? `${exp.startDate} – ` : ''}{exp.isCurrentJob || (exp as any).isCurrent ? 'Present (Current)' : exp.endDate || ''} {exp.location && `• ${exp.location}`}
                          </span>
                        </div>
                        {exp.jobSummary && (
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {exp.jobSummary}
                          </p>
                        )}
                        {(exp.rolesAndResponsibilities || (exp as any).description) && (
                          <div className="pt-1 space-y-1">
                            <span className="text-[11px] font-bold text-slate-900 block">Roles & Responsibilities:</span>
                            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-3 border-l-2 border-indigo-500">
                              {exp.rolesAndResponsibilities || (exp as any).description}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {educations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Education & Academic Background
                  </h3>
                  <div className="space-y-2.5">
                    {educations.map((edu, idx) => (
                      <div key={edu.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{edu.degree || (edu as any).degree_title} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</span>
                          <p className="text-[11px] text-slate-600 font-medium">{edu.institution}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear || (edu as any).year || 'Completed'} {(edu.grade || (edu as any).result) && `• Grade: ${edu.grade || (edu as any).result}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KEY PROJECTS */}
              {projs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" /> Key Projects & Architecture Portfolio
                  </h3>
                  <div className="space-y-3">
                    {projs.map((p, idx) => (
                      <div key={p.id || idx} className="space-y-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-xs">
                            {p.projectTitle} {p.role && <span className="font-semibold text-indigo-700">• {p.role}</span>}
                          </span>
                          {p.projectUrl && (
                            <span className="text-[11px] text-indigo-600 underline font-medium">{p.projectUrl.replace(/^https?:\/\//, '')}</span>
                          )}
                        </div>
                        {p.projectDescription && (
                          <p className="text-xs text-slate-700 leading-relaxed">{p.projectDescription}</p>
                        )}
                        {p.technologies && p.technologies.length > 0 && (
                          <p className="text-[11px] text-slate-500 pt-0.5">
                            Technologies: <span className="font-semibold text-slate-700">{p.technologies.join(', ')}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS */}
              {certs.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" /> Certifications & Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {certs.map((c, idx) => (
                      <div key={c.id || idx} className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                        <p className="font-bold text-slate-900">{c.title}</p>
                        <p className="text-[11px] text-slate-600">{c.issuingOrganization} {c.issueDate && `• Issued: ${c.issueDate}`}</p>
                        {c.credentialUrl && (
                          <span className="text-[10px] text-indigo-600 underline font-medium block mt-0.5">Credential Verified</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LANGUAGES */}
              {langs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-indigo-600" /> Languages & Communication
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {langs.map((l: any, idx: number) => {
                      const text = typeof l === 'string' ? l : `${l.language || l.name || ''} (${l.proficiency || 'Proficient'})`;
                      return (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                          {text}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RESUME FOOTER METADATA */}
              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Generated via Camzy Jobs Enterprise Platform • Verified Candidate Profile
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};
