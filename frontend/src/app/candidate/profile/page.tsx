'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  User, FileText, Upload, Sparkles, Save, CheckCircle2, DollarSign, Briefcase, 
  AlertCircle, Loader2, Check, Plus, Trash2, GraduationCap, Award, FolderGit2, Globe, Github, Linkedin, Languages, Pencil, X, ShieldCheck, Clock, MapPin, RefreshCw, Star, Download, ExternalLink, Camera, Phone, Mail, Eye
} from 'lucide-react';
import { ProfileResumeModal } from '../../../components/ProfileResumeModal';

interface ResumeItem {
  id: string;
  title: string;
  resumeUrl: string;
  isDefault?: boolean;
  uploadedAt?: string;
}

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
  rolesAndResponsibilities?: string;
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

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
];

export default function CandidateProfilePage() {
  const { theme, user, setUser, sdk } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Profile Modal Open State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);

  // User Identity & Personal Details State
  const [userForm, setUserForm] = useState({
    firstName: 'Alex',
    lastName: 'Candidate',
    phoneNumber: '+91 98765 43210',
    email: 'candidate@camzyjobs.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  });

  // Main Candidate Profile State
  const [profile, setProfile] = useState({
    headline: 'Senior Full Stack Engineer | Next.js & NestJS Specialist',
    summary: 'Passionate developer with 6+ years building enterprise web applications, microservices, and dynamic design systems.',
    currentTitle: 'Senior Full Stack Developer',
    experienceYears: '6',
    currentSalary: '1800000',
    expectedSalary: '2400000',
    noticePeriod: '30 Days',
    preferredLocations: ['Bangalore', 'Mumbai', 'Remote'],
    skills: 'TypeScript, Next.js, NestJS, React, Tailwind CSS, TypeORM, MySQL, Redis',
    visibility: 'PUBLIC',
    resumeFileName: 'candidate-resume.pdf',
  });

  // Multiple Resumes Array State
  const [resumesList, setResumesList] = useState<ResumeItem[]>([
    {
      id: 'res-default-1',
      title: 'Primary Technical Resume (Full-Stack).pdf',
      resumeUrl: 'http://localhost:4000/uploads/resumes/sample-resume.pdf',
      isDefault: true,
      uploadedAt: new Date().toISOString(),
    },
  ]);

  // Real Resume Upload State
  const [resumeUploadFile, setResumeUploadFile] = useState<File | null>(null);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Real Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

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
      location: 'Bengaluru, India',
      jobSummary: 'Led micro-frontend architectures with Next.js and high-scale NestJS backend APIs.',
      rolesAndResponsibilities: '• Led sprint planning, architectural design, and deployment pipelines.\n• Engineered core microservices and optimized query response by 45%.\n• Mentored junior developers and performed automated code reviews.',
    },
  ]);

  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science',
      fieldOfStudy: 'Software Engineering',
      institution: 'Indian Institute of Technology (IIT)',
      startYear: '2016',
      endYear: '2020',
      grade: '8.8 CGPA',
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
      projectTitle: 'Enterprise Recruitment & ATS Engine',
      client: 'Camzy Jobs Enterprise',
      role: 'Lead Full Stack Architect',
      projectDescription: 'Architected subscription plans, Kanban candidate ATS pipeline, and Naukri-grade application workflows.',
      technologies: ['Next.js', 'NestJS', 'TypeORM', 'MySQL'],
      projectUrl: 'https://jobs.camzytech.com',
    },
  ]);

  const [socialLinks, setSocialLinks] = useState({
    github: 'https://github.com/candidate',
    linkedin: 'https://linkedin.com/in/candidate',
    website: 'https://candidate-portfolio.com',
  });

  const [languagesList, setLanguagesList] = useState<string[]>([
    'English (Professional / Fluent)',
    'Hindi (Native)',
  ]);

  // Verification Modal & Timer (3 Minutes = 180s)
  const [verifyModalTarget, setVerifyModalTarget] = useState<'EMAIL' | 'PHONE' | null>(null);
  const [verifyIdentifier, setVerifyIdentifier] = useState('');
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [verifyOtpSent, setVerifyOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  // New Location Input Tag
  const [newCityInput, setNewCityInput] = useState('');

  // Modals for Adding Entries
  const [activeModal, setActiveModal] = useState<'EXP' | 'EDU' | 'CERT' | 'PROJ' | 'RESUME' | null>(null);

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
    rolesAndResponsibilities: '',
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

  // Helper to resolve resume URLs (prevents any redirect to example.com and routes to backend server)
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

  useEffect(() => {
    let timerInterval: any = null;
    if (resendTimer > 0) {
      timerInterval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [resendTimer]);

  useEffect(() => {
    // Check if opened with ?view=recruiter
    const checkViewParam = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'recruiter') {
          setIsResumePreviewOpen(true);
        }
      }
    };
    checkViewParam();

    const handleOpenRecruiterView = () => setIsResumePreviewOpen(true);
    window.addEventListener('open-recruiter-view', handleOpenRecruiterView);
    window.addEventListener('popstate', checkViewParam);
    return () => {
      window.removeEventListener('open-recruiter-view', handleOpenRecruiterView);
      window.removeEventListener('popstate', checkViewParam);
    };
  }, []);

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
            currentSalary: String(data.currentSalary || 1800000),
            expectedSalary: String(data.expectedSalary || 2400000),
            noticePeriod: data.noticePeriod || '30 Days',
            preferredLocations: Array.isArray(data.preferredLocations) ? data.preferredLocations : ['Bangalore', 'Mumbai', 'Remote'],
            skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
            visibility: data.visibility || 'PUBLIC',
            resumeFileName: resumeName,
          });

          // Sync user identity details
          if (data.user) {
            setUserForm({
              firstName: data.user.firstName || user.firstName || '',
              lastName: data.user.lastName || user.lastName || '',
              phoneNumber: data.user.phoneNumber || user.phoneNumber || '',
              email: data.user.email || user.email || '',
              avatarUrl: data.user.avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            });
          } else {
            setUserForm({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              phoneNumber: user.phoneNumber || '',
              email: user.email || '',
              avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            });
          }

          if (data.resumes && Array.isArray(data.resumes) && data.resumes.length > 0) {
            setResumesList(data.resumes);
          }
          if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
            setExperienceList(data.experience);
          }
          if (data.education && Array.isArray(data.education) && data.education.length > 0) {
            setEducationList(data.education);
          }
          if (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
            setCertificationList(data.certifications);
          }
          if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
            setProjectList(data.projects);
          }
          if (data.socialLinks && typeof data.socialLinks === 'object' && Object.keys(data.socialLinks).length > 0) {
            setSocialLinks(data.socialLinks);
          }
          if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
            setLanguagesList(data.languages);
          }
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
    if (resumesList.length > 0) score += 25;
    if (profile.headline) score += 15;
    if (profile.skills) score += 15;
    if (profile.noticePeriod) score += 10;
    if (profile.preferredLocations.length > 0) score += 10;
    if (experienceList.length > 0) score += 10;
    if (educationList.length > 0) score += 10;
    if (user?.isEmailVerified) score += 5;
    return Math.min(100, score);
  };

  const score = calculateScore();

  // Unified Save Profile Handler (Updates both Candidate & User details)
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError(null);

    try {
      const candidateId = user.candidateId || user.id;
      const defaultRes = resumesList.find((r) => r.isDefault) || resumesList[0];
      const updatedResumeUrl = defaultRes ? defaultRes.resumeUrl : 'http://localhost:4000/uploads/resumes/sample-resume.pdf';

      const resData = await sdk.request<any>(`/candidates/${candidateId}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phoneNumber: userForm.phoneNumber,
          avatarUrl: userForm.avatarUrl,
          headline: profile.headline,
          summary: profile.summary,
          currentTitle: profile.currentTitle,
          experienceYears: Number(profile.experienceYears) || 0,
          currentSalary: Number(profile.currentSalary) || 0,
          expectedSalary: Number(profile.expectedSalary) || 0,
          noticePeriod: profile.noticePeriod,
          preferredLocations: profile.preferredLocations,
          skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
          visibility: profile.visibility,
          resumeUrl: updatedResumeUrl,
          resumes: resumesList,
          experience: experienceList,
          education: educationList,
          certifications: certificationList,
          projects: projectList,
          socialLinks: socialLinks,
        }),
      });

      // Update global user context immediately
      if (setUser) {
        setUser({
          ...user,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phoneNumber: userForm.phoneNumber,
          avatarUrl: userForm.avatarUrl,
        });
      }

      setIsSaved(true);
      setIsEditProfileOpen(false);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err: any) {
      console.error('Failed to save candidate profile:', err);
      setError(err.message || 'Failed to update candidate profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Real Resume Upload Handler
  const handleAddResume = async () => {
    if (!resumeUploadFile) {
      setUploadError('Please select a PDF or DOC resume file to upload.');
      return;
    }
    setIsUploadingResume(true);
    setUploadError(null);

    try {
      const uploadRes = await sdk.uploadResume(resumeUploadFile);
      const fullUrl = uploadRes.fullUrl || `http://localhost:4000${uploadRes.url}`;

      const newRes: ResumeItem = {
        id: `res_${Date.now()}`,
        title: newResumeTitle.trim() || resumeUploadFile.name,
        resumeUrl: fullUrl,
        isDefault: resumesList.length === 0,
        uploadedAt: new Date().toISOString(),
      };

      const updatedList = [...resumesList, newRes];
      setResumesList(updatedList);
      setNewResumeTitle('');
      setResumeUploadFile(null);
      setActiveModal(null);

      // Persist resume update immediately
      const candidateId = user?.candidateId || user?.id;
      if (candidateId) {
        await sdk.request(`/candidates/${candidateId}`, {
          method: 'PUT',
          body: JSON.stringify({
            resumes: updatedList,
            resumeUrl: newRes.isDefault ? fullUrl : (resumesList.find((r) => r.isDefault)?.resumeUrl || fullUrl),
          }),
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload resume to server.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSetDefaultResume = (id: string) => {
    setResumesList(resumesList.map((r) => ({ ...r, isDefault: r.id === id })));
  };

  const handleDeleteResume = (id: string) => {
    const updated = resumesList.filter((r) => r.id !== id);
    if (updated.length > 0 && !updated.some((r) => r.isDefault)) {
      updated[0].isDefault = true;
    }
    setResumesList(updated);
  };

  // Real Avatar Picture Upload Handler
  const handleAvatarFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingAvatar(true);
    setAvatarUploadError(null);
    try {
      const res = await sdk.uploadAvatar(file);
      const fullUrl = res.fullUrl || `http://localhost:4000${res.url}`;
      setUserForm((prev) => ({ ...prev, avatarUrl: fullUrl }));
      if (setUser && user) {
        setUser({ ...user, avatarUrl: fullUrl });
      }
      // Immediately persist avatarUrl to candidate profile in database
      const candidateId = user?.candidateId || user?.id;
      if (candidateId) {
        await sdk.request(`/candidates/${candidateId}`, {
          method: 'PUT',
          body: JSON.stringify({ avatarUrl: fullUrl }),
        });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      setAvatarUploadError(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Add City Tag
  const handleAddCity = () => {
    if (!newCityInput.trim()) return;
    if (profile.preferredLocations.length >= 3) {
      setError('You can select up to 3 preferred cities.');
      return;
    }
    setProfile({ ...profile, preferredLocations: [...profile.preferredLocations, newCityInput.trim()] });
    setNewCityInput('');
  };

  // Add Item Handlers
  const handleAddExperience = () => {
    if (!expForm.designation || !expForm.companyName) return;
    setExperienceList([...experienceList, { ...expForm, id: `exp_${Date.now()}` }]);
    setExpForm({
      designation: '',
      companyName: '',
      isCurrentJob: false,
      startDate: '',
      endDate: '',
      noticePeriod: '30 Days',
      location: '',
      jobSummary: '',
      rolesAndResponsibilities: '',
    });
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

  // OTP Verification Handlers
  const handleStartVerification = async (target: 'EMAIL' | 'PHONE') => {
    const val = target === 'EMAIL' ? user?.email : userForm.phoneNumber || user?.phoneNumber || '+91 98765 43210';
    setVerifyModalTarget(target);
    setVerifyIdentifier(val || '');
    setVerifyOtpInput('');
    setVerifyOtpSent(false);
    setVerifyMsg(null);
  };

  const handleSendVerificationOtp = async () => {
    if (!verifyIdentifier) return;
    setVerifyLoading(true);
    setVerifyMsg(null);
    try {
      const res = await sdk.requestOtp(verifyIdentifier);
      setVerifyOtpSent(true);
      setResendTimer(180); // 3-Minute Resend Timer
      setVerifyMsg(res.message || 'OTP verification code dispatched via Mailgun SMTP.');
    } catch (err: any) {
      setVerifyMsg(err.message || 'Failed to send OTP code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleConfirmVerificationOtp = async () => {
    if (!verifyOtpInput) return;
    setVerifyLoading(true);
    try {
      const res = await sdk.verifyOtp(verifyIdentifier, verifyOtpInput);
      if (setUser && res.user) {
        setUser(res.user);
      }
      setVerifyModalTarget(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setVerifyMsg(err.message || 'Verification failed. Please check OTP code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <DashboardLayout role="CANDIDATE">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-500" /> Candidate Talent Profile & Resumes
            </h1>
            <p className="text-xs theme-muted">Naukri-standard candidate portal with multiple resume management & recruiter search badges</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${
              score >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              Profile Completeness: {score}%
            </span>

            <button
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Changes
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
            <CheckCircle2 className="w-4 h-4" /> Candidate profile & active resumes updated! Talent search index refreshed.
          </div>
        )}

        {/* CANDIDATE HERO / PROFILE CARD WITH PROMINENT EDIT PROFILE BUTTON */}
        <div className="theme-surface border theme-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative group">
              <img
                src={userForm.avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                alt="Profile Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <input
                type="file"
                id="hero-avatar-file-upload"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="hero-avatar-file-upload"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                title="Click to Upload Profile Photo"
              >
                {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black theme-text tracking-tight">
                  {userForm.firstName || user?.firstName || 'Candidate'} {userForm.lastName || user?.lastName || ''}
                </h2>
                {user?.isEmailVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Email Verified
                  </span>
                )}
                {user?.isPhoneVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Phone Verified
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {profile.headline || 'Add your professional headline'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs theme-muted pt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> {profile.currentTitle || 'Professional'} • {profile.experienceYears} Yrs Exp
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Notice: <strong className="theme-text">{profile.noticePeriod}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Exp: {Number(profile.expectedSalary).toLocaleString()} INR
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs theme-muted pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" /> {userForm.email || user?.email}
                </span>
                {userForm.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {userForm.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Prominent Edit Profile Details Action Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Pencil className="w-4 h-4" /> Edit Profile Details
            </button>
          </div>
        </div>

        {/* TIME STAMP INDICATORS & VERIFICATION BAR */}
        <div className="theme-surface border theme-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Member Since: <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Oct 2026'}</strong>
              </span>
              <span>•</span>
              <span>Last Active: <strong className="text-emerald-500">Just Now</strong></span>
            </div>

            {/* Email & Phone Verification Badges */}
            <div className="flex items-center gap-3">
              {/* Email Badge */}
              {user?.isEmailVerified ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Email Verified ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartVerification('EMAIL')}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Verify Email Now
                </button>
              )}

              {/* Phone Badge */}
              {user?.isPhoneVerified ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Phone Verified ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartVerification('PHONE')}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Verify Mobile Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: PERSONAL, SALARY & PREFERENCES */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Professional Overview & Preferences
            </h2>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" /> Quick Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold theme-text mb-1">First Name</label>
              <input
                type="text"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Last Name</label>
              <input
                type="text"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                value={userForm.email}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text opacity-80"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Mobile Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={userForm.phoneNumber}
                onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Notice Period <span className="text-rose-500">*</span></label>
              <select
                value={profile.noticePeriod}
                onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
              >
                <option value="Immediate">Immediate / Serving Notice</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
              </select>
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Years of Total Experience</label>
              <input
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Current Annual Salary (INR)</label>
              <input
                type="number"
                placeholder="1800000"
                value={profile.currentSalary}
                onChange={(e) => setProfile({ ...profile, currentSalary: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Expected Annual Salary (INR)</label>
              <input
                type="number"
                placeholder="2400000"
                value={profile.expectedSalary}
                onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Preferred Cities Tag Manager */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block font-bold theme-text mb-1">Preferred Location Cities (Up to 3 Cities)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add preferred city (e.g. Bangalore, Pune, Remote)"
                  value={newCityInput}
                  onChange={(e) => setNewCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                  className="flex-1 px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCity}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Add City
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {profile.preferredLocations.map((city, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    {city}
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, preferredLocations: profile.preferredLocations.filter((_, i) => i !== idx) })}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold theme-text mb-1">Key Skills & Tech Stack (Comma Separated) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="TypeScript, Next.js, NestJS, React, MySQL"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: MULTIPLE RESUMES MANAGEMENT */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b theme-border">
            <div>
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" /> Candidate Multiple Resumes ({resumesList.length})
              </h2>
              <p className="text-xs theme-muted mt-0.5">Uploaded directly to backend server storage (Ready for S3)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResumePreviewOpen(true)}
                className="px-3.5 py-2 rounded-xl border theme-border font-extrabold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                title="View formatted profile as a resume"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> View Profile Resume
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadError(null);
                  setResumeUploadFile(null);
                  setNewResumeTitle('');
                  setActiveModal('RESUME');
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Upload New Resume
              </button>
            </div>
          </div>

          {resumesList.length === 0 ? (
            /* Prominent fallback when candidate doesn't have an uploaded resume */
            <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black theme-text">Don't have an uploaded resume file?</h4>
                    <p className="text-xs theme-muted mt-0.5 max-w-xl leading-relaxed">
                      You can instantly view and download your complete candidate profile formatted as a professional executive resume.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsResumePreviewOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Eye className="w-4 h-4" /> View Profile Resume & Download
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Profile-generated resume option */}
              <div className="p-4 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black theme-text">System Generated Profile Resume</h4>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20">
                        Profile Sync
                      </span>
                    </div>
                    <p className="text-[11px] theme-muted mt-0.5">
                      Standardized format synced with your experience, education, skills, and projects.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsResumePreviewOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" /> View & Download
                </button>
              </div>
            {resumesList.map((res) => {
              const fileUrl = resolveResumeUrl(res.resumeUrl);
              return (
                <div key={res.id} className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black theme-text">{res.title}</h4>
                        {res.isDefault && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-500" /> Default for Apply
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] theme-muted mt-0.5">
                        Uploaded: {res.uploadedAt ? new Date(res.uploadedAt).toLocaleDateString() : 'Today'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!res.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultResume(res.id)}
                        className="px-2.5 py-1.5 rounded-lg border theme-border hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                      >
                        Set as Default
                      </button>
                    )}
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View PDF
                    </a>
                    <a
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {resumesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteResume(res.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                        title="Delete Resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {/* SECTION 3: WORK EXPERIENCE HISTORY */}
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
                {exp.rolesAndResponsibilities && (
                  <div className="mt-2 pt-2 border-t theme-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                      Roles & Responsibilities
                    </span>
                    <p className="text-xs theme-text/90 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-indigo-500/40">
                      {exp.rolesAndResponsibilities}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: EDUCATION & CERTIFICATIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Education ({educationList.length})
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal('EDU')}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {educationList.map((edu, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                  <h4 className="font-bold theme-text">{edu.degree}</h4>
                  <p className="text-indigo-500 font-semibold">{edu.institution}</p>
                  <p className="theme-muted text-[11px]">{edu.startYear} – {edu.endYear}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" /> Certifications ({certificationList.length})
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal('CERT')}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {certificationList.map((cert, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                  <h4 className="font-bold theme-text">{cert.title}</h4>
                  <p className="text-indigo-500 font-semibold">{cert.issuingOrganization}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED EDIT PROFILE MODAL */}
        {/* ========================================================================= */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 theme-modal animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between border-b theme-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black theme-text">Edit Candidate Profile & Identity</h3>
                    <p className="text-xs theme-muted">Update your full name, contact information, headline, and compensation</p>
                  </div>
                </div>
                <button onClick={() => setIsEditProfileOpen(false)} className="p-1.5 theme-muted hover:theme-text rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-2 p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold theme-text">Profile Picture / Headshot</label>
                  {isUploadingAvatar && (
                    <span className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to server...
                    </span>
                  )}
                </div>

                {avatarUploadError && (
                  <p className="text-xs text-rose-500 font-bold">{avatarUploadError}</p>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                  <div className="relative">
                    <img
                      src={userForm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        id="modal-avatar-file-input"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAvatarFileUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="modal-avatar-file-input"
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo from Device</span>
                      </label>
                      <span className="text-[11px] theme-muted font-medium">PNG, JPG, WEBP (Max 5MB)</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t theme-border">
                      <span className="text-[11px] theme-muted font-medium">Or choose quick preset:</span>
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setUserForm({ ...userForm, avatarUrl: url })}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 hover:scale-110 transition-all ${
                            userForm.avatarUrl === url ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold theme-text mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={userForm.phoneNumber}
                    onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Current Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={profile.currentTitle}
                    onChange={(e) => setProfile({ ...profile, currentTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold theme-text mb-1">Professional Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Cloud Architect | AWS, Kubernetes, Next.js"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Notice Period *</label>
                  <select
                    value={profile.noticePeriod}
                    onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="Immediate">Immediate / Serving Notice</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Total Experience (Years)</label>
                  <input
                    type="number"
                    value={profile.experienceYears}
                    onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Current Salary (INR)</label>
                  <input
                    type="number"
                    value={profile.currentSalary}
                    onChange={(e) => setProfile({ ...profile, currentSalary: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Expected Salary (INR)</label>
                  <input
                    type="number"
                    value={profile.expectedSalary}
                    onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold theme-text mb-1">Professional Summary / Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your background, technical achievements, and career goals..."
                    value={profile.summary}
                    onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION MODAL WITH 3-MINUTE MAILGUN OTP */}
        {verifyModalTarget && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 theme-modal animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-base font-black theme-text flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" /> Verify {verifyModalTarget === 'EMAIL' ? 'Email Address' : 'Mobile Number'}
                </h3>
                <button onClick={() => setVerifyModalTarget(null)} className="p-1 theme-muted hover:theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {verifyMsg && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {verifyMsg}
                </div>
              )}

              {!verifyOtpSent ? (
                <div className="space-y-4 text-xs">
                  <p className="theme-muted">
                    We will send a 6-digit verification code to <strong>{verifyIdentifier}</strong> via Mailgun SMTP. Valid for <strong>3 minutes</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleSendVerificationOtp}
                    disabled={verifyLoading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Send Verification Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold theme-text mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={verifyOtpInput}
                      onChange={(e) => setVerifyOtpInput(e.target.value)}
                      className="w-full text-center tracking-[0.5em] font-mono text-lg font-bold py-2.5 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmVerificationOtp}
                    disabled={verifyLoading || verifyOtpInput.length < 6}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirm Verification
                  </button>

                  <div className="text-center pt-1">
                    {resendTimer > 0 ? (
                      <span className="theme-muted font-mono">Resend available in {formatTimer(resendTimer)}</span>
                    ) : (
                      <button type="button" onClick={handleSendVerificationOtp} className="text-indigo-500 font-bold hover:underline">
                        Resend OTP Code Now
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING NEW RESUME PDF (REAL SERVER UPLOAD) */}
        {activeModal === 'RESUME' && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 theme-modal animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <div>
                  <h3 className="text-base font-extrabold theme-text">Upload Resume Document</h3>
                  <p className="text-[11px] theme-muted">Stored directly on backend server (S3-ready architecture)</p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 theme-muted hover:theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {uploadError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold theme-text mb-1">Resume Title / Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Architect Resume 2026.pdf"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Select File (PDF, DOC, DOCX up to 15MB)</label>
                  <div className="p-4 border-2 border-dashed theme-border rounded-2xl text-center space-y-2 hover:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-900/50">
                    <Upload className="w-6 h-6 text-indigo-500 mx-auto" />
                    <input
                      type="file"
                      id="resume-file-picker"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setResumeUploadFile(file);
                          if (!newResumeTitle) {
                            setNewResumeTitle(file.name);
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-file-picker"
                      className="inline-block px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-700 shadow-sm"
                    >
                      Browse File
                    </label>
                    {resumeUploadFile ? (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Selected: {resumeUploadFile.name} ({(resumeUploadFile.size / 1024).toFixed(1)} KB)
                      </p>
                    ) : (
                      <p className="text-[11px] theme-muted">Supported formats: PDF, DOC, DOCX</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddResume}
                  disabled={isUploadingResume || !resumeUploadFile}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploadingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Backend Server...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Upload & Add to Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING EXPERIENCE */}
        {activeModal === 'EXP' && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 theme-modal animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <div>
                  <h3 className="text-base font-extrabold theme-text">Add Employment History</h3>
                  <p className="text-[11px] theme-muted">Add your past or current job role with key responsibilities</p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 theme-muted hover:theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold theme-text mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Software Engineer"
                    value={expForm.designation}
                    onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold theme-text mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechCorp Global"
                      value={expForm.companyName}
                      onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold theme-text mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India or Remote"
                      value={expForm.location || ''}
                      onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isCurrentJobCheckbox"
                    checked={expForm.isCurrentJob || false}
                    onChange={(e) => setExpForm({ ...expForm, isCurrentJob: e.target.checked, endDate: e.target.checked ? 'Present' : '' })}
                    className="w-4 h-4 text-indigo-600 rounded theme-border"
                  />
                  <label htmlFor="isCurrentJobCheckbox" className="font-bold theme-text cursor-pointer">
                    I currently work in this role
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold theme-text mb-1">Start Date</label>
                    <input
                      type="text"
                      placeholder="MM/YYYY (e.g. 05/2021)"
                      value={expForm.startDate || ''}
                      onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold theme-text mb-1">End Date</label>
                    <input
                      type="text"
                      disabled={expForm.isCurrentJob}
                      placeholder={expForm.isCurrentJob ? 'Present' : 'MM/YYYY (or Present)'}
                      value={expForm.isCurrentJob ? 'Present' : expForm.endDate || ''}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Notice Period (if applicable)</label>
                  <select
                    value={expForm.noticePeriod || '30 Days'}
                    onChange={(e) => setExpForm({ ...expForm, noticePeriod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  >
                    <option value="Immediate">Immediate (Serving notice)</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Role / Job Summary</label>
                  <input
                    type="text"
                    placeholder="Brief high-level summary of your role"
                    value={expForm.jobSummary || ''}
                    onChange={(e) => setExpForm({ ...expForm, jobSummary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold theme-text">Roles & Responsibilities</label>
                    <span className="text-[10px] theme-muted font-medium">Use bullet points or new lines</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="• Spearheaded development of scalable features&#10;• Collaborated with product and design teams&#10;• Mentored junior engineers and conducted code reviews"
                    value={expForm.rolesAndResponsibilities || ''}
                    onChange={(e) => setExpForm({ ...expForm, rolesAndResponsibilities: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text leading-relaxed font-sans"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddExperience}
                  disabled={!expForm.designation || !expForm.companyName}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" /> Save Experience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING EDUCATION */}
        {activeModal === 'EDU' && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 theme-modal animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-base font-extrabold theme-text">Add Education Degree</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 theme-muted hover:theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold theme-text mb-1">Degree / Certification *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech in Computer Science"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
                <div>
                  <label className="block font-bold theme-text mb-1">Institution / University *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT Bombay"
                    value={eduForm.institution}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold theme-text mb-1">Start Year</label>
                    <input
                      type="text"
                      placeholder="2016"
                      value={eduForm.startYear}
                      onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold theme-text mb-1">End Year</label>
                    <input
                      type="text"
                      placeholder="2020"
                      value={eduForm.endYear}
                      onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  disabled={!eduForm.degree || !eduForm.institution}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md transition-all"
                >
                  Save Education
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING CERTIFICATION */}
        {activeModal === 'CERT' && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 theme-modal animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-base font-extrabold theme-text">Add Professional Certification</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 theme-muted hover:theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold theme-text mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Certified Solutions Architect"
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
                <div>
                  <label className="block font-bold theme-text mb-1">Issuing Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services"
                    value={certForm.issuingOrganization}
                    onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCertification}
                  disabled={!certForm.title || !certForm.issuingOrganization}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md transition-all"
                >
                  Save Certification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Formatted Resume Preview & Download Modal */}
        <ProfileResumeModal
          isOpen={isResumePreviewOpen}
          onClose={() => {
            setIsResumePreviewOpen(false);
            if (typeof window !== 'undefined' && window.location.search.includes('view=recruiter')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          candidate={{
            ...profile,
            user: userForm,
            experience: experienceList,
            education: educationList,
            certifications: certificationList,
            projects: projectList,
            socialLinks,
            languages: languagesList,
          } as any}
        />
      </div>
    </DashboardLayout>
  );
}
