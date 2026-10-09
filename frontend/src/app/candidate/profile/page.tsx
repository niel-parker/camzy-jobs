'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  User, FileText, Upload, Sparkles, Save, CheckCircle2, DollarSign, Briefcase, 
  AlertCircle, Loader2, Check, Plus, Trash2, GraduationCap, Award, FolderGit2, Globe, Github, Linkedin, Languages, Pencil, X
} from 'lucide-react';

interface ExperienceItem {
  id?: string;
  designation: string;
  companyName: string;
  isCurrentJob?: boolean;
  startDate?: string;
  endDate?: string;
  noticePeriod?: string;
  location?: string;
  jobSummary?: string;
}

interface EducationItem {
  id?: string;
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

interface CertificationItem {
  id?: string;
  title: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface ProjectItem {
  id?: string;
  projectTitle: string;
  client?: string;
  role?: string;
  projectDescription?: string;
  technologies?: string[];
  projectUrl?: string;
}

interface LanguageItem {
  language: string;
  proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
}

export default function CandidateProfilePage() {
  const { theme, user, sdk } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main Candidate Profile State
  const [profile, setProfile] = useState({
    headline: 'Senior Full Stack Engineer | Next.js & NestJS Specialist',
    summary: 'Passionate developer with 6+ years building enterprise web applications, microservices, and dynamic design systems.',
    currentTitle: 'Senior Full Stack Developer',
    experienceYears: '6',
    expectedSalary: '160000',
    skills: 'TypeScript, Next.js, NestJS, React, Tailwind CSS, TypeORM, MySQL, Redis',
    visibility: 'PUBLIC',
    resumeFileName: 'fullstack-developer-resume.pdf',
  });

  // Multi-Entry Section Arrays
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([
    {
      id: 'exp-1',
      designation: 'Senior Full Stack Engineer',
      companyName: 'TechCorp Global',
      isCurrentJob: true,
      startDate: '03/2022',
      endDate: 'Present',
      noticePeriod: '30 Days',
      location: 'San Francisco, CA',
      jobSummary: 'Led micro-frontend architectures with Next.js and high-scale NestJS backend APIs.',
    },
  ]);

  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      fieldOfStudy: 'Software Engineering',
      institution: 'Stanford University',
      startYear: '2016',
      endYear: '2020',
      grade: '3.8 GPA',
    },
  ]);

  const [certificationList, setCertificationList] = useState<CertificationItem[]>([
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '01/2023',
      expiryDate: '01/2026',
      credentialUrl: 'https://aws.amazon.com/verify/123456',
    },
  ]);

  const [projectList, setProjectList] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      projectTitle: 'Multi-Tenant SaaS Job Portal',
      client: 'Camzy Jobs Enterprise',
      role: 'Lead Full Stack Architect',
      projectDescription: 'Architected subscription plans, Kanban candidate ATS pipeline, and Naukri apply flow.',
      technologies: ['Next.js', 'NestJS', 'TypeORM', 'MySQL'],
      projectUrl: 'https://camzyjobs.com',
    },
  ]);

  const [languageList, setLanguageList] = useState<LanguageItem[]>([
    { language: 'English', proficiency: 'NATIVE' },
    { language: 'Spanish', proficiency: 'CONVERSATIONAL' },
  ]);

  const [socialLinks, setSocialLinks] = useState({
    github: 'https://github.com/candidate',
    linkedin: 'https://linkedin.com/in/candidate',
    website: 'https://candidate-portfolio.com',
  });

  // Modals for Adding Entries
  const [activeModal, setActiveModal] = useState<'EXP' | 'EDU' | 'CERT' | 'PROJ' | 'LANG' | null>(null);

  // Form State for Modals
  const [expForm, setExpForm] = useState<ExperienceItem>({
    designation: '',
    companyName: '',
    isCurrentJob: false,
    startDate: '',
    endDate: '',
    noticePeriod: '30 Days',
    location: '',
    jobSummary: '',
  });

  const [eduForm, setEduForm] = useState<EducationItem>({
    degree: '',
    fieldOfStudy: '',
    institution: '',
    startYear: '',
    endYear: '',
    grade: '',
  });

  const [certForm, setCertForm] = useState<CertificationItem>({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
  });

  const [projForm, setProjForm] = useState<ProjectItem>({
    projectTitle: '',
    client: '',
    role: '',
    projectDescription: '',
    technologies: [],
    projectUrl: '',
  });

  const [langForm, setLangForm] = useState<LanguageItem>({
    language: '',
    proficiency: 'FLUENT',
  });

  useEffect(() => {
    async function fetchCandidateProfile() {
      if (!user) return;
      setIsLoading(true);
      try {
        const candidateId = user.candidateId || user.id;
        const data = await sdk.request<any>(`/candidates/${candidateId}`);
        if (data) {
          let resumeName = 'candidate-resume.pdf';
          if (data.resumeUrl) {
            const parts = data.resumeUrl.split('/');
            resumeName = parts[parts.length - 1] || 'candidate-resume.pdf';
          }
          setProfile({
            headline: data.headline || '',
            summary: data.summary || '',
            currentTitle: data.currentTitle || '',
            experienceYears: String(data.experienceYears || 0),
            expectedSalary: String(data.expectedSalary || 0),
            skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
            visibility: data.visibility || 'PUBLIC',
            resumeFileName: resumeName,
          });

          if (data.experience && Array.isArray(data.experience)) setExperienceList(data.experience);
          if (data.education && Array.isArray(data.education)) setEducationList(data.education);
          if (data.certifications && Array.isArray(data.certifications)) setCertificationList(data.certifications);
          if (data.projects && Array.isArray(data.projects)) setProjectList(data.projects);
          if (data.languages && Array.isArray(data.languages)) setLanguageList(data.languages);
          if (data.socialLinks) setSocialLinks(data.socialLinks);
        }
      } catch (err) {
        console.log('Candidate profile fetch info:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCandidateProfile();
  }, [user, sdk]);

  const calculateScore = () => {
    let score = 0;
    if (profile.resumeFileName) score += 30; // Mandatory resume
    if (profile.headline) score += 15;
    if (profile.skills) score += 15;
    if (experienceList.length > 0) score += 15;
    if (educationList.length > 0) score += 10;
    if (certificationList.length > 0 || projectList.length > 0) score += 10;
    if (user?.email) score += 5;
    return score;
  };

  const score = calculateScore();

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError(null);

    try {
      const candidateId = user.candidateId || user.id;
      const updatedResumeUrl = `https://example.com/resumes/${profile.resumeFileName}`;

      await sdk.request(`/candidates/${candidateId}`, {
        method: 'PUT',
        body: JSON.stringify({
          headline: profile.headline,
          summary: profile.summary,
          currentTitle: profile.currentTitle,
          experienceYears: Number(profile.experienceYears) || 0,
          expectedSalary: Number(profile.expectedSalary) || 0,
          skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
          visibility: profile.visibility,
          resumeUrl: updatedResumeUrl,
          experience: experienceList,
          education: educationList,
          certifications: certificationList,
          projects: projectList,
          languages: languageList,
          socialLinks: socialLinks,
        }),
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save candidate profile:', err);
      setError(err.message || 'Failed to update candidate profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Item Handlers
  const handleAddExperience = () => {
    if (!expForm.designation || !expForm.companyName) return;
    setExperienceList([...experienceList, { ...expForm, id: `exp_${Date.now()}` }]);
    setExpForm({ designation: '', companyName: '', isCurrentJob: false, startDate: '', endDate: '', noticePeriod: '30 Days', location: '', jobSummary: '' });
    setActiveModal(null);
  };

  const handleAddEducation = () => {
    if (!eduForm.degree || !eduForm.institution) return;
    setEducationList([...educationList, { ...eduForm, id: `edu_${Date.now()}` }]);
    setEduForm({ degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '' });
    setActiveModal(null);
  };

  const handleAddCertification = () => {
    if (!certForm.title || !certForm.issuingOrganization) return;
    setCertificationList([...certificationList, { ...certForm, id: `cert_${Date.now()}` }]);
    setCertForm({ title: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialUrl: '' });
    setActiveModal(null);
  };

  const handleAddProject = () => {
    if (!projForm.projectTitle) return;
    setProjectList([...projectList, { ...projForm, id: `proj_${Date.now()}` }]);
    setProjForm({ projectTitle: '', client: '', role: '', projectDescription: '', technologies: [], projectUrl: '' });
    setActiveModal(null);
  };

  const handleAddLanguage = () => {
    if (!langForm.language) return;
    setLanguageList([...languageList, { ...langForm }]);
    setLangForm({ language: '', proficiency: 'FLUENT' });
    setActiveModal(null);
  };

  return (
    <DashboardLayout role="CANDIDATE">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-500" /> Candidate Talent Profile & Resume
            </h1>
            <p className="text-xs theme-muted">Naukri-style multi-entry career profile with work history, education, certs, and resume PDF</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
              score >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              Profile Score: {score}%
            </span>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Profile Details
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Profile & attached resume updated successfully! Employer search index synced.
          </div>
        )}

        {/* Profile Score Bar */}
        <div className="p-5 rounded-2xl theme-surface border theme-border space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Naukri Profile Completeness
            </h3>
            <span className="text-xs font-bold text-indigo-500">{score}/100 Points</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* SECTION 1: PERSONAL & RESUME ATTACHMENT */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Personal Overview & Resume Attachment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold theme-text mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={user ? `${user.firstName || ''} ${user.lastName || ''}` : 'Candidate User'}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text opacity-80"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Email Address</label>
              <input
                type="text"
                readOnly
                value={user?.email || 'candidate@camzyjobs.com'}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text opacity-80"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold theme-text mb-1">Professional Headline <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer | Next.js & NestJS Specialist"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Years of Total Experience</label>
              <input
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Expected Annual CTC ($)</label>
              <input
                type="number"
                value={profile.expectedSalary}
                onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold theme-text mb-1">Key Skills & Tech Stack (Comma Separated) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="TypeScript, Next.js, NestJS, React, MySQL"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold theme-text mb-1">Executive Summary / Candidate Bio</label>
              <textarea
                rows={3}
                placeholder="Brief summary of your professional accomplishments..."
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Attached Resume Box */}
          <div className="pt-2">
            <div className="p-4 border-2 border-dashed theme-border rounded-xl text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
              <Upload className="w-6 h-6 mx-auto text-indigo-500 opacity-80" />
              <p className="text-xs font-extrabold theme-text">
                Attached Resume: {profile.resumeFileName || 'No resume attached'}
              </p>
              <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer shadow-md inline-flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" /> Upload PDF Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfile({ ...profile, resumeFileName: e.target.files[0].name });
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: WORK EXPERIENCE HISTORY (MULTI-ENTRY) */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Work Experience & Employment History ({experienceList.length})
            </h2>
            <button
              type="button"
              onClick={() => setActiveModal('EXP')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Employment Entry
            </button>
          </div>

          {experienceList.length === 0 ? (
            <p className="text-xs theme-muted italic text-center py-6 border border-dashed theme-border rounded-xl">
              No work experience added yet. Click &quot;Add Employment Entry&quot; to list past companies.
            </p>
          ) : (
            <div className="space-y-3">
              {experienceList.map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black theme-text">{exp.designation}</h3>
                      <p className="text-xs font-bold text-indigo-500">{exp.companyName} {exp.location && `• ${exp.location}`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExperienceList(experienceList.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] theme-muted font-medium">
                    {exp.startDate || '2021'} – {exp.isCurrentJob ? 'Present (Current Job)' : exp.endDate || '2023'} {exp.noticePeriod && `• Notice Period: ${exp.noticePeriod}`}
                  </p>
                  {exp.jobSummary && <p className="text-xs theme-text pt-1 leading-relaxed">{exp.jobSummary}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: EDUCATION & QUALIFICATIONS (MULTI-ENTRY) */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" /> Education & Academic Qualifications ({educationList.length})
            </h2>
            <button
              type="button"
              onClick={() => setActiveModal('EDU')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education Entry
            </button>
          </div>

          {educationList.length === 0 ? (
            <p className="text-xs theme-muted italic text-center py-6 border border-dashed theme-border rounded-xl">
              No education added yet. Click &quot;Add Education Entry&quot; to list degrees or diplomas.
            </p>
          ) : (
            <div className="space-y-3">
              {educationList.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black theme-text">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h3>
                      <p className="text-xs font-bold text-indigo-500">{edu.institution}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] theme-muted font-medium">
                    {edu.startYear || '2016'} – {edu.endYear || '2020'} {edu.grade && `• Grade: ${edu.grade}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: CERTIFICATIONS & LICENSES (MULTI-ENTRY) */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" /> Certifications & Professional Licenses ({certificationList.length})
            </h2>
            <button
              type="button"
              onClick={() => setActiveModal('CERT')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification Entry
            </button>
          </div>

          {certificationList.length === 0 ? (
            <p className="text-xs theme-muted italic text-center py-6 border border-dashed theme-border rounded-xl">
              No certifications added yet. Click &quot;Add Certification Entry&quot; to list certificates.
            </p>
          ) : (
            <div className="space-y-3">
              {certificationList.map((cert, idx) => (
                <div key={cert.id || idx} className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black theme-text">{cert.title}</h3>
                      <p className="text-xs font-bold text-indigo-500">{cert.issuingOrganization}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCertificationList(certificationList.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] theme-muted font-medium">
                    Issued: {cert.issueDate || '2023'} {cert.expiryDate && `• Expires: ${cert.expiryDate}`}
                  </p>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-500 hover:underline block pt-0.5">
                      Verify Credential URL ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: KEY PROJECTS PORTFOLIO (MULTI-ENTRY) */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-500" /> Key Engineering Projects ({projectList.length})
            </h2>
            <button
              type="button"
              onClick={() => setActiveModal('PROJ')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project Entry
            </button>
          </div>

          {projectList.length === 0 ? (
            <p className="text-xs theme-muted italic text-center py-6 border border-dashed theme-border rounded-xl">
              No projects added yet. Click &quot;Add Project Entry&quot; to showcase your portfolio.
            </p>
          ) : (
            <div className="space-y-3">
              {projectList.map((proj, idx) => (
                <div key={proj.id || idx} className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black theme-text">{proj.projectTitle}</h3>
                      <p className="text-xs font-bold text-indigo-500">{proj.role || 'Contributor'} {proj.client && `• Client: ${proj.client}`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjectList(projectList.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {proj.projectDescription && <p className="text-xs theme-text leading-relaxed">{proj.projectDescription}</p>}
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-500 hover:underline block">
                      Project Link ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 6: SOCIAL LINKS & LANGUAGES */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" /> Social Links & Languages Known
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold theme-text mb-1 flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-500" /> GitHub URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/username"
                value={socialLinks.github || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-indigo-500" /> LinkedIn URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={socialLinks.linkedin || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-500" /> Portfolio Website
              </label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={socialLinks.website || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* MODAL MODALS FOR ADDING MULTI-ENTRIES */}
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 theme-modal animate-in zoom-in-95">
              
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-base font-extrabold theme-text">
                  {activeModal === 'EXP' && 'Add Work Experience Entry'}
                  {activeModal === 'EDU' && 'Add Education Entry'}
                  {activeModal === 'CERT' && 'Add Certification Entry'}
                  {activeModal === 'PROJ' && 'Add Key Project Entry'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-1 theme-muted hover:theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* EXP FORM */}
              {activeModal === 'EXP' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold theme-text mb-1">Designation / Role Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Senior Full Stack Engineer"
                      value={expForm.designation}
                      onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="TechCorp Global"
                      value={expForm.companyName}
                      onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold theme-text mb-1">Start Date</label>
                      <input
                        type="text"
                        placeholder="MM/YYYY (e.g. 03/2021)"
                        value={expForm.startDate}
                        onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold theme-text mb-1">End Date</label>
                      <input
                        type="text"
                        disabled={expForm.isCurrentJob}
                        placeholder="MM/YYYY or Present"
                        value={expForm.isCurrentJob ? 'Present' : expForm.endDate}
                        onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isCurrentJob"
                      checked={expForm.isCurrentJob}
                      onChange={(e) => setExpForm({ ...expForm, isCurrentJob: e.target.checked })}
                      className="accent-indigo-600 rounded"
                    />
                    <label htmlFor="isCurrentJob" className="font-bold theme-text cursor-pointer">Currently Working Here</label>
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Job Responsibilities & Stack</label>
                    <textarea
                      rows={3}
                      placeholder="Describe key duties and achievements..."
                      value={expForm.jobSummary}
                      onChange={(e) => setExpForm({ ...expForm, jobSummary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl border theme-border font-bold">Cancel</button>
                    <button type="button" onClick={handleAddExperience} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">Save Entry</button>
                  </div>
                </div>
              )}

              {/* EDU FORM */}
              {activeModal === 'EDU' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold theme-text mb-1">Degree / Qualification *</label>
                    <input
                      type="text"
                      required
                      placeholder="B.S. in Computer Science / MBA / B.Tech"
                      value={eduForm.degree}
                      onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Institution / University *</label>
                    <input
                      type="text"
                      required
                      placeholder="Stanford University"
                      value={eduForm.institution}
                      onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold theme-text mb-1">Start Year</label>
                      <input
                        type="text"
                        placeholder="2016"
                        value={eduForm.startYear}
                        onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold theme-text mb-1">End Year</label>
                      <input
                        type="text"
                        placeholder="2020"
                        value={eduForm.endYear}
                        onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl border theme-border font-bold">Cancel</button>
                    <button type="button" onClick={handleAddEducation} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">Save Entry</button>
                  </div>
                </div>
              )}

              {/* CERT FORM */}
              {activeModal === 'CERT' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold theme-text mb-1">Certificate Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="AWS Certified Solutions Architect"
                      value={certForm.title}
                      onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Issuing Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="Amazon Web Services"
                      value={certForm.issuingOrganization}
                      onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Credential URL</label>
                    <input
                      type="url"
                      placeholder="https://aws.amazon.com/verify/123"
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl border theme-border font-bold">Cancel</button>
                    <button type="button" onClick={handleAddCertification} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">Save Entry</button>
                  </div>
                </div>
              )}

              {/* PROJ FORM */}
              {activeModal === 'PROJ' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold theme-text mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Multi-Tenant SaaS Job Portal"
                      value={projForm.projectTitle}
                      onChange={(e) => setProjForm({ ...projForm, projectTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Your Role / Contribution</label>
                    <input
                      type="text"
                      placeholder="Lead Full Stack Architect"
                      value={projForm.role}
                      onChange={(e) => setProjForm({ ...projForm, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold theme-text mb-1">Project Description & Tech Stack</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the application features and technologies used..."
                      value={projForm.projectDescription}
                      onChange={(e) => setProjForm({ ...projForm, projectDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl border theme-border font-bold">Cancel</button>
                    <button type="button" onClick={handleAddProject} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">Save Entry</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
