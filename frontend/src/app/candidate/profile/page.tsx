'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  User, FileText, Upload, Sparkles, Save, CheckCircle2, IndianRupee, Briefcase, 
  AlertCircle, Loader2, Check, Plus, Trash2, GraduationCap, Award, FolderGit2, Globe, Github, Linkedin, Languages, Pencil, X, ShieldCheck, Clock, MapPin, RefreshCw, Star, Download, ExternalLink, Camera, Phone, Mail, Eye, Search, Tag, ChevronDown
} from 'lucide-react';
import { ProfileResumeModal } from '../../../components/ProfileResumeModal';
import { CandidateRecruiterDrawer } from '../../../components/CandidateRecruiterDrawer';
import { resolveMediaUrl } from '../../../utils/media';

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

interface LanguageItem {
  id?: string;
  language: string;
  proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
  canRead?: boolean;
  canWrite?: boolean;
  canSpeak?: boolean;
}

const POPULAR_LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'Punjabi',
  'Assamese',
  'Sanskrit',
  'French',
  'German',
  'Spanish',
  'Mandarin Chinese',
  'Japanese',
  'Arabic',
  'Russian',
  'Portuguese',
  'Italian',
  'Korean',
];

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
  const [isRecruiterDrawerOpen, setIsRecruiterDrawerOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // User Identity & Personal Details State (Clean - No dummy or mock data)
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    avatarUrl: '',
  });

  // Main Candidate Profile State (Clean - populated from database)
  const [profile, setProfile] = useState({
    headline: '',
    summary: '',
    currentTitle: '',
    experienceYears: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    preferredLocations: [] as string[],
    skills: '',
    visibility: 'PUBLIC',
    resumeFileName: '',
  });

  // Multiple Resumes Array State (Empty until candidate uploads their own)
  const [resumesList, setResumesList] = useState<ResumeItem[]>([]);

  // Real Resume Upload State
  const [resumeUploadFile, setResumeUploadFile] = useState<File | null>(null);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Real Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  // Multi-Entry Section Arrays (Clean - populated from database)
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [certificationList, setCertificationList] = useState<CertificationItem[]>([]);
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);

  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    website: '',
  });

  const [languagesList, setLanguagesList] = useState<LanguageItem[]>([
    { id: 'lang-1', language: 'English', proficiency: 'FLUENT', canRead: true, canWrite: true, canSpeak: true },
    { id: 'lang-2', language: 'Hindi', proficiency: 'NATIVE', canRead: true, canWrite: true, canSpeak: true },
  ]);

  // Language Form Modal State
  const [langForm, setLangForm] = useState<LanguageItem>({
    language: '',
    proficiency: 'FLUENT',
    canRead: true,
    canWrite: true,
    canSpeak: true,
  });
  const [editingLangIndex, setEditingLangIndex] = useState<number | null>(null);

  // Verification Modal & Timer (3 Minutes = 180s)
  const [verifyModalTarget, setVerifyModalTarget] = useState<'EMAIL' | 'PHONE' | null>(null);
  const [verifyIdentifier, setVerifyIdentifier] = useState('');
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [verifyOtpSent, setVerifyOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  // Master Data & Autocomplete for Locations and Skills
  const [masterLocations, setMasterLocations] = useState<{ id: string; city: string; state?: string | null; country: string; isPopular?: boolean }[]>([]);
  const [masterSkills, setMasterSkills] = useState<string[]>([]);
  const [masterSkillClusters, setMasterSkillClusters] = useState<{ id: string; name: string; category: string; keywords: string[] }[]>([]);

  // City Search & Autocomplete
  const [citySearchInput, setCitySearchInput] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(0);

  // Skills List & Autocomplete
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [highlightedSkillIndex, setHighlightedSkillIndex] = useState(0);

  // Auto-Save Status Indicator
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMsg, setAutoSaveMsg] = useState('');

  // Modals for Adding Entries
  const [activeModal, setActiveModal] = useState<'EXP' | 'EDU' | 'CERT' | 'PROJ' | 'RESUME' | 'LANG' | null>(null);

  // Form State for Modals
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);
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

  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);
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

  // Helper to resolve resume URLs (prevents any redirect to example.com or dummy sample files)
  const resolveResumeUrl = (rawUrl?: string) => {
    if (!rawUrl || rawUrl.includes('example.com') || rawUrl.includes('sample-resume')) {
      return '';
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

  // Load master locations and master skills taxonomy from database
  useEffect(() => {
    async function loadTaxonomyData() {
      try {
        const [locs, skillsData] = await Promise.all([
          sdk.request<any[]>('/admin/locations').catch(() => []),
          sdk.request<any[]>('/admin/skills').catch(() => []),
        ]);

        if (Array.isArray(locs) && locs.length > 0) {
          setMasterLocations(locs);
        }

        if (Array.isArray(skillsData) && skillsData.length > 0) {
          setMasterSkillClusters(skillsData);
          const allKeywords = new Set<string>();
          skillsData.forEach((c) => {
            if (Array.isArray(c.keywords)) {
              c.keywords.forEach((kw: string) => {
                if (kw && typeof kw === 'string' && kw.trim()) {
                  allKeywords.add(kw.trim());
                }
              });
            }
          });
          setMasterSkills(Array.from(allKeywords));
        }
      } catch (err) {
        console.warn('Could not load master taxonomy data:', err);
      }
    }
    loadTaxonomyData();
  }, [sdk]);

  useEffect(() => {
    // Check if opened with ?view=recruiter or ?view=resume
    const checkViewParam = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'recruiter') {
          setIsRecruiterDrawerOpen(true);
          setIsResumeModalOpen(false);
        } else if (params.get('view') === 'resume') {
          setIsResumeModalOpen(true);
          setIsRecruiterDrawerOpen(false);
        }
      }
    };
    checkViewParam();

    const handleOpenRecruiterView = () => {
      setIsRecruiterDrawerOpen(true);
      setIsResumeModalOpen(false);
    };
    const handleOpenResumeView = () => {
      setIsResumeModalOpen(true);
      setIsRecruiterDrawerOpen(false);
    };

    window.addEventListener('open-recruiter-view', handleOpenRecruiterView);
    window.addEventListener('open-resume-view', handleOpenResumeView);
    window.addEventListener('popstate', checkViewParam);
    return () => {
      window.removeEventListener('open-recruiter-view', handleOpenRecruiterView);
      window.removeEventListener('open-resume-view', handleOpenResumeView);
      window.removeEventListener('popstate', checkViewParam);
    };
  }, []);

  useEffect(() => {
    async function fetchCandidateProfile() {
      if (!user) return;
      setIsLoading(true);
      try {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const targetCandidateId = urlParams?.get('id') || urlParams?.get('candidateId') || user.candidateId || user.id;
        const data = await sdk.request<any>(`/candidates/${targetCandidateId}`);
        if (data) {
          let resumeName = '';
          if (data.resumeUrl && !data.resumeUrl.includes('sample-resume') && !data.resumeUrl.includes('example.com')) {
            const parts = data.resumeUrl.split('/');
            resumeName = parts[parts.length - 1] || '';
          }

          const initialLocations = Array.isArray(data.preferredLocations) ? data.preferredLocations : [];
          const initialSkills: string[] = Array.isArray(data.skills)
            ? data.skills.map((s: any) => String(s).trim()).filter(Boolean)
            : (typeof data.skills === 'string' && data.skills.trim())
            ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

          setSkillsList(initialSkills);

          setProfile({
            headline: data.headline || '',
            summary: data.summary || '',
            currentTitle: data.currentTitle || '',
            experienceYears: data.experienceYears != null && data.experienceYears !== '' ? String(data.experienceYears) : '',
            currentSalary: data.currentSalary != null && data.currentSalary !== '' ? String(data.currentSalary) : '',
            expectedSalary: data.expectedSalary != null && data.expectedSalary !== '' ? String(data.expectedSalary) : '',
            noticePeriod: data.noticePeriod || '',
            preferredLocations: initialLocations,
            skills: initialSkills.join(', '),
            visibility: data.visibility || 'PUBLIC',
            resumeFileName: resumeName,
          });

          // Sync user identity details (filter out legacy dummy email prefixes like "name@... User")
          const rawFirst = data.user?.firstName || user.firstName || '';
          const rawLast = data.user?.lastName || user.lastName || '';
          const emailVal = data.user?.email || user.email || '';
          const emailPrefix = emailVal.includes('@') ? emailVal.split('@')[0].toLowerCase() : '';
          const isFakeName = (rawLast === 'User' || !rawLast) && emailPrefix && rawFirst.toLowerCase() === emailPrefix;

          setUserForm({
            firstName: isFakeName ? '' : rawFirst,
            lastName: isFakeName ? '' : rawLast,
            phoneNumber: data.user?.phoneNumber || user.phoneNumber || '',
            email: emailVal,
            avatarUrl: data.user?.avatarUrl || user.avatarUrl || '',
          });

          // Real uploaded resumes only (exclude non-existent sample files)
          if (data.resumes && Array.isArray(data.resumes) && data.resumes.length > 0) {
            const validResumes = data.resumes.filter((r: any) => {
              const u = r.resumeUrl || r.url || '';
              return u && !u.includes('sample-resume') && !u.includes('example.com');
            });
            setResumesList(validResumes.map((r: any, idx: number) => ({
              id: r.id || `res_${idx}`,
              title: r.title || (r.resumeUrl || r.url ? (r.resumeUrl || r.url).split('/').pop() : `Resume ${idx + 1}.pdf`),
              resumeUrl: r.resumeUrl || r.url || '',
              isDefault: Boolean(r.isDefault ?? (idx === 0)),
              uploadedAt: r.uploadedAt || new Date().toISOString(),
            })));
          } else if (data.resumeUrl && !data.resumeUrl.includes('sample-resume') && !data.resumeUrl.includes('example.com')) {
            const parts = data.resumeUrl.split('/');
            setResumesList([{
              id: 'res-default',
              title: parts[parts.length - 1] || 'Uploaded Resume.pdf',
              resumeUrl: data.resumeUrl,
              isDefault: true,
              uploadedAt: new Date().toISOString(),
            }]);
          } else {
            setResumesList([]);
          }

          if (data.experience && Array.isArray(data.experience)) {
            setExperienceList(data.experience.map((e: any, idx: number) => ({
              id: e.id || `exp_${idx}`,
              designation: e.designation || e.title || '',
              companyName: e.companyName || e.company || '',
              startDate: e.startDate || '',
              endDate: e.endDate || '',
              isCurrentJob: Boolean(e.isCurrentJob ?? e.isCurrent),
              location: e.location || '',
              noticePeriod: e.noticePeriod || '',
              jobSummary: e.jobSummary || '',
              rolesAndResponsibilities: e.rolesAndResponsibilities || e.description || '',
            })));
          } else {
            setExperienceList([]);
          }

          if (data.education && Array.isArray(data.education)) {
            setEducationList(data.education.map((ed: any, idx: number) => ({
              id: ed.id || `edu_${idx}`,
              degree: ed.degree || ed.degree_title || '',
              institution: ed.institution || '',
              fieldOfStudy: ed.fieldOfStudy || '',
              startYear: ed.startYear || '',
              endYear: ed.endYear || ed.year || '',
              grade: ed.grade || ed.result || '',
            })));
          } else {
            setEducationList([]);
          }

          if (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
            setCertificationList(data.certifications);
          } else {
            setCertificationList([]);
          }

          if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
            setProjectList(data.projects);
          } else {
            setProjectList([]);
          }
          if (data.socialLinks && typeof data.socialLinks === 'object') {
            setSocialLinks({
              github: data.socialLinks.github || '',
              linkedin: data.socialLinks.linkedin || '',
              website: data.socialLinks.website || '',
            });
          }
          if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
            setLanguagesList(
              data.languages.map((l: any, idx: number) => {
                if (typeof l === 'string') {
                  const match = l.match(/^([^(]+)(?:\(([^)]+)\))?$/);
                  const name = match ? match[1].trim() : l.trim();
                  const raw = match && match[2] ? match[2].trim().toUpperCase() : 'FLUENT';
                  let prof: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE' = 'FLUENT';
                  if (raw.includes('NATIVE') || raw.includes('MOTHER')) prof = 'NATIVE';
                  else if (raw.includes('BASIC') || raw.includes('BEGINNER')) prof = 'BASIC';
                  else if (raw.includes('CONVERSATIONAL') || raw.includes('INTERMEDIATE')) prof = 'CONVERSATIONAL';
                  return {
                    id: `lang_${idx}`,
                    language: name,
                    proficiency: prof,
                    canRead: true,
                    canWrite: true,
                    canSpeak: true,
                  };
                }
                return {
                  id: l.id || `lang_${idx}`,
                  language: l.language || l.name || 'English',
                  proficiency: (l.proficiency || 'FLUENT').toUpperCase() as any,
                  canRead: l.canRead !== false,
                  canWrite: l.canWrite !== false,
                  canSpeak: l.canSpeak !== false,
                };
              })
            );
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
    if (resumesList.length > 0) score += 20;
    if (profile.headline) score += 15;
    if (skillsList.length > 0 || profile.skills) score += 15;
    if (profile.noticePeriod) score += 10;
    if (profile.preferredLocations.length > 0) score += 10;
    if (experienceList.length > 0) score += 10;
    if (educationList.length > 0) score += 10;
    if (languagesList.length > 0) score += 5;
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
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const candidateId = urlParams?.get('id') || urlParams?.get('candidateId') || user.candidateId || user.id;
      const defaultRes = resumesList.find((r) => r.isDefault) || resumesList[0];
      const updatedResumeUrl = defaultRes 
        ? (defaultRes.resumeUrl || (defaultRes as any).url) 
        : (profile.resumeFileName ? `/uploads/resumes/${profile.resumeFileName}` : '');

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
          skills: skillsList.length > 0 ? skillsList : profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
          visibility: profile.visibility,
          resumeUrl: updatedResumeUrl,
          resumes: resumesList.map((r) => ({
            id: r.id,
            title: r.title,
            resumeUrl: r.resumeUrl || (r as any).url,
            url: r.resumeUrl || (r as any).url,
            isDefault: r.isDefault,
            uploadedAt: r.uploadedAt,
          })),
          experience: experienceList.map((exp) => ({
            ...exp,
            title: exp.designation,
            company: exp.companyName,
            description: exp.rolesAndResponsibilities || exp.jobSummary,
            isCurrent: exp.isCurrentJob,
          })),
          education: educationList.map((edu) => ({
            ...edu,
            degree_title: edu.degree,
            year: edu.endYear,
            result: edu.grade,
          })),
          certifications: certificationList,
          projects: projectList,
          socialLinks: socialLinks,
          languages: languagesList.map((l) => ({
            language: l.language,
            proficiency: l.proficiency,
            canRead: Boolean(l.canRead),
            canWrite: Boolean(l.canWrite),
            canSpeak: Boolean(l.canSpeak),
          })),
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
      const fullUrl = resolveMediaUrl(uploadRes.url || uploadRes.fullUrl);

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
      const fullUrl = resolveMediaUrl(res.url || res.fullUrl);
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

  // Auto-Save helper for instant persistent background save with smooth UI feedback
  const triggerAutoSave = async (partialUpdate: Record<string, any>, successMessage = 'Auto-saved ✓') => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const targetCandidateId = urlParams?.get('id') || urlParams?.get('candidateId') || user?.candidateId || user?.id;
    if (!targetCandidateId) return;

    setAutoSaveStatus('saving');
    try {
      await sdk.request(`/candidates/${targetCandidateId}`, {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
      });
      setAutoSaveStatus('saved');
      setAutoSaveMsg(successMessage);
      setTimeout(() => {
        setAutoSaveStatus((curr) => (curr === 'saved' ? 'idle' : curr));
      }, 2500);
    } catch (err: any) {
      console.error('Auto-save error:', err);
      setAutoSaveStatus('error');
      setAutoSaveMsg('Failed to auto-save');
      setTimeout(() => {
        setAutoSaveStatus((curr) => (curr === 'error' ? 'idle' : curr));
      }, 3500);
    }
  };

  // City Search & Auto-Save Handlers
  const handleAddCity = (cityToAdd?: string) => {
    const rawCity = (cityToAdd || citySearchInput).trim();
    if (!rawCity) return;

    if (profile.preferredLocations.length >= 3) {
      setAutoSaveStatus('error');
      setAutoSaveMsg('Maximum 3 preferred cities allowed');
      setTimeout(() => setAutoSaveStatus((curr) => (curr === 'error' ? 'idle' : curr)), 3000);
      return;
    }

    if (profile.preferredLocations.some((c) => c.toLowerCase() === rawCity.toLowerCase())) {
      setCitySearchInput('');
      setIsCityDropdownOpen(false);
      return;
    }

    // Match master locations canonical city name if exists
    const match = masterLocations.find((l) => l.city.toLowerCase() === rawCity.toLowerCase());
    const canonicalCity = match ? match.city : rawCity;

    const updated = [...profile.preferredLocations, canonicalCity];
    setProfile((prev) => ({ ...prev, preferredLocations: updated }));
    setCitySearchInput('');
    setIsCityDropdownOpen(false);
    setHighlightedCityIndex(0);

    triggerAutoSave({ preferredLocations: updated }, `Saved "${canonicalCity}" ✓`);
  };

  const handleRemoveCity = (cityToRemove: string) => {
    const updated = profile.preferredLocations.filter((c) => c !== cityToRemove);
    setProfile((prev) => ({ ...prev, preferredLocations: updated }));
    triggerAutoSave({ preferredLocations: updated }, `Removed "${cityToRemove}" ✓`);
  };

  // Filtered Cities for Autocomplete (from real master locations)
  const filteredCities = React.useMemo(() => {
    const q = citySearchInput.trim().toLowerCase();
    if (!q) {
      return masterLocations
        .filter((l) => l.isPopular && !profile.preferredLocations.some((c) => c.toLowerCase() === l.city.toLowerCase()))
        .slice(0, 8);
    }
    return masterLocations
      .filter((l) => {
        const matchCity = l.city.toLowerCase().includes(q);
        const matchState = l.state ? l.state.toLowerCase().includes(q) : false;
        const matchCountry = l.country.toLowerCase().includes(q);
        const notPicked = !profile.preferredLocations.some((c) => c.toLowerCase() === l.city.toLowerCase());
        return (matchCity || matchState || matchCountry) && notPicked;
      })
      .slice(0, 10);
  }, [citySearchInput, masterLocations, profile.preferredLocations]);

  // Skills Search & Auto-Save Handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const rawSkill = (skillToAdd || skillSearchInput).trim();
    if (!rawSkill) return;

    if (skillsList.some((s) => s.toLowerCase() === rawSkill.toLowerCase())) {
      setSkillSearchInput('');
      setIsSkillDropdownOpen(false);
      return;
    }

    // Match master skill canonical casing if exists
    const match = masterSkills.find((s) => s.toLowerCase() === rawSkill.toLowerCase());
    const canonicalSkill = match || rawSkill;

    const updated = [...skillsList, canonicalSkill];
    setSkillsList(updated);
    setProfile((prev) => ({ ...prev, skills: updated.join(', ') }));
    setSkillSearchInput('');
    setIsSkillDropdownOpen(false);
    setHighlightedSkillIndex(0);

    triggerAutoSave({ skills: updated }, `Saved "${canonicalSkill}" ✓`);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skillsList.filter((s) => s !== skillToRemove);
    setSkillsList(updated);
    setProfile((prev) => ({ ...prev, skills: updated.join(', ') }));
    triggerAutoSave({ skills: updated }, `Removed "${skillToRemove}" ✓`);
  };

  // Filtered Skills for Autocomplete (from real master skill taxonomy)
  const filteredSkills = React.useMemo(() => {
    const q = skillSearchInput.trim().toLowerCase();
    if (!q) {
      const topPicks = [
        'Java', 'Spring Boot', 'Microservices', 'TypeScript', 'React', 'Next.js',
        'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'MySQL', 'PostgreSQL',
        'Redis', 'Kafka', 'GraphQL', 'Tailwind CSS', 'FastAPI', 'MongoDB',
      ];
      return topPicks
        .filter((s) => !skillsList.some((item) => item.toLowerCase() === s.toLowerCase()))
        .slice(0, 8)
        .map((name) => ({ name, category: 'Recommended' }));
    }

    const results: { name: string; category?: string }[] = [];
    masterSkillClusters.forEach((cluster) => {
      cluster.keywords.forEach((kw) => {
        if (
          kw.toLowerCase().includes(q) &&
          !skillsList.some((s) => s.toLowerCase() === kw.toLowerCase()) &&
          !results.some((r) => r.name.toLowerCase() === kw.toLowerCase())
        ) {
          results.push({ name: kw, category: cluster.name });
        }
      });
    });

    masterSkills.forEach((kw) => {
      if (
        kw.toLowerCase().includes(q) &&
        !skillsList.some((s) => s.toLowerCase() === kw.toLowerCase()) &&
        !results.some((r) => r.name.toLowerCase() === kw.toLowerCase())
      ) {
        results.push({ name: kw, category: 'General' });
      }
    });

    return results.slice(0, 10);
  }, [skillSearchInput, masterSkillClusters, masterSkills, skillsList]);

  // Work Experience Handlers
  const handleOpenAddExperience = () => {
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
    setEditingExpIndex(null);
    setActiveModal('EXP');
  };

  const handleOpenEditExperience = (idx: number) => {
    const item = experienceList[idx];
    if (item) {
      setExpForm({
        id: item.id,
        designation: item.designation || (item as any).title || '',
        companyName: item.companyName || (item as any).company || '',
        isCurrentJob: Boolean(item.isCurrentJob ?? (item as any).isCurrent),
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        noticePeriod: item.noticePeriod || '30 Days',
        location: item.location || '',
        jobSummary: item.jobSummary || '',
        rolesAndResponsibilities: item.rolesAndResponsibilities || (item as any).description || '',
      });
      setEditingExpIndex(idx);
      setActiveModal('EXP');
    }
  };

  const handleSaveExperience = async () => {
    if (!expForm.designation.trim() || !expForm.companyName.trim()) return;

    let updatedList: ExperienceItem[];
    if (editingExpIndex !== null && editingExpIndex >= 0 && editingExpIndex < experienceList.length) {
      updatedList = [...experienceList];
      updatedList[editingExpIndex] = {
        ...expForm,
        id: expForm.id || experienceList[editingExpIndex].id || `exp_${Date.now()}`,
      };
    } else {
      updatedList = [
        ...experienceList,
        { ...expForm, id: `exp_${Date.now()}` },
      ];
    }

    setExperienceList(updatedList);
    setActiveModal(null);
    setEditingExpIndex(null);
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

    // Auto-save experience updates to profile
    const formatted = updatedList.map((exp) => ({
      ...exp,
      title: exp.designation,
      company: exp.companyName,
      description: exp.rolesAndResponsibilities || exp.jobSummary,
      isCurrent: exp.isCurrentJob,
    }));
    triggerAutoSave({ experience: formatted }, editingExpIndex !== null ? 'Updated work experience ✓' : 'Added work experience ✓');
  };

  const handleDeleteExperience = (idx: number) => {
    const updatedList = experienceList.filter((_, i) => i !== idx);
    setExperienceList(updatedList);
    const formatted = updatedList.map((exp) => ({
      ...exp,
      title: exp.designation,
      company: exp.companyName,
      description: exp.rolesAndResponsibilities || exp.jobSummary,
      isCurrent: exp.isCurrentJob,
    }));
    triggerAutoSave({ experience: formatted }, 'Removed experience entry ✓');
  };

  // Salary & Profile Field Auto-Save Handlers
  const handleAutoSaveSalary = (field: 'currentSalary' | 'expectedSalary', rawVal: string) => {
    const cleaned = rawVal.trim().replace(/[^0-9.]/g, '');
    const numVal = cleaned ? Number(cleaned) : null;
    const label = field === 'currentSalary' ? 'Current salary' : 'Expected salary';
    triggerAutoSave({ [field]: numVal }, `Saved ${label} (${numVal ? `₹${numVal.toLocaleString('en-IN')}` : 'Cleared'}) ✓`);
  };

  // Education Handlers with Auto-Save
  const handleOpenAddEducation = () => {
    setEduForm({
      degree: '',
      fieldOfStudy: '',
      institution: '',
      startYear: '',
      endYear: '',
      grade: '',
    });
    setEditingEduIndex(null);
    setActiveModal('EDU');
  };

  const handleOpenEditEducation = (idx: number) => {
    const item = educationList[idx];
    if (item) {
      setEduForm({
        id: item.id,
        degree: item.degree || (item as any).degree_title || '',
        fieldOfStudy: item.fieldOfStudy || '',
        institution: item.institution || '',
        startYear: item.startYear || '',
        endYear: item.endYear || (item as any).year || '',
        grade: item.grade || (item as any).result || '',
      });
      setEditingEduIndex(idx);
      setActiveModal('EDU');
    }
  };

  const handleSaveEducation = async () => {
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) return;

    let updatedList: EducationItem[];
    if (editingEduIndex !== null && editingEduIndex >= 0 && editingEduIndex < educationList.length) {
      updatedList = [...educationList];
      updatedList[editingEduIndex] = {
        ...eduForm,
        id: eduForm.id || educationList[editingEduIndex].id || `edu_${Date.now()}`,
      };
    } else {
      updatedList = [
        ...educationList,
        { ...eduForm, id: `edu_${Date.now()}` },
      ];
    }

    setEducationList(updatedList);
    setActiveModal(null);
    setEditingEduIndex(null);
    setEduForm({
      degree: '',
      fieldOfStudy: '',
      institution: '',
      startYear: '',
      endYear: '',
      grade: '',
    });

    const formatted = updatedList.map((edu) => ({
      ...edu,
      degree_title: edu.degree,
      year: edu.endYear,
      result: edu.grade,
    }));
    triggerAutoSave({ education: formatted }, editingEduIndex !== null ? 'Updated education ✓' : 'Added education ✓');
  };

  const handleDeleteEducation = (idx: number) => {
    const updatedList = educationList.filter((_, i) => i !== idx);
    setEducationList(updatedList);
    const formatted = updatedList.map((edu) => ({
      ...edu,
      degree_title: edu.degree,
      year: edu.endYear,
      result: edu.grade,
    }));
    triggerAutoSave({ education: formatted }, 'Removed education entry ✓');
  };

  const handleAddCertification = () => {
    if (!certForm.title || !certForm.issuingOrganization) return;
    const updated = [...certificationList, { ...certForm, id: `cert_${Date.now()}` }];
    setCertificationList(updated);
    setCertForm({ title: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialUrl: '' });
    setActiveModal(null);
    triggerAutoSave({ certifications: updated }, 'Added certification ✓');
  };

  const handleDeleteCertification = (idx: number) => {
    const updated = certificationList.filter((_, i) => i !== idx);
    setCertificationList(updated);
    triggerAutoSave({ certifications: updated }, 'Removed certification ✓');
  };

  const handleAddProject = () => {
    if (!projForm.projectTitle) return;
    const updated = [...projectList, { ...projForm, id: `proj_${Date.now()}` }];
    setProjectList(updated);
    setProjForm({ projectTitle: '', client: '', role: '', projectDescription: '', technologies: [], projectUrl: '' });
    setActiveModal(null);
    triggerAutoSave({ projects: updated }, 'Added project ✓');
  };

  const handleDeleteProject = (idx: number) => {
    const updated = projectList.filter((_, i) => i !== idx);
    setProjectList(updated);
    triggerAutoSave({ projects: updated }, 'Removed project ✓');
  };

  // Language Management Handlers
  const persistLanguages = async (updatedList: LanguageItem[]) => {
    if (!user) return;
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const candidateId = urlParams?.get('id') || urlParams?.get('candidateId') || user.candidateId || user.id;

      await sdk.request<any>(`/candidates/${candidateId}`, {
        method: 'PUT',
        body: JSON.stringify({
          languages: updatedList.map((l) => ({
            language: l.language,
            proficiency: l.proficiency,
            canRead: Boolean(l.canRead),
            canWrite: Boolean(l.canWrite),
            canSpeak: Boolean(l.canSpeak),
          })),
        }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to auto-save languages:', err);
    }
  };

  const handleOpenAddLanguage = () => {
    setLangForm({
      language: '',
      proficiency: 'FLUENT',
      canRead: true,
      canWrite: true,
      canSpeak: true,
    });
    setEditingLangIndex(null);
    setActiveModal('LANG');
  };

  const handleOpenEditLanguage = (index: number) => {
    if (languagesList[index]) {
      setLangForm({ ...languagesList[index] });
      setEditingLangIndex(index);
      setActiveModal('LANG');
    }
  };

  const handleSaveLanguage = async () => {
    if (!langForm.language.trim()) return;

    let updated: LanguageItem[];
    if (editingLangIndex !== null && editingLangIndex >= 0 && editingLangIndex < languagesList.length) {
      updated = [...languagesList];
      updated[editingLangIndex] = {
        ...langForm,
        language: langForm.language.trim(),
      };
    } else {
      const existingIdx = languagesList.findIndex(
        (l) => l.language.toLowerCase() === langForm.language.trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        updated = [...languagesList];
        updated[existingIdx] = {
          ...langForm,
          language: langForm.language.trim(),
        };
      } else {
        updated = [
          ...languagesList,
          {
            ...langForm,
            id: `lang_${Date.now()}`,
            language: langForm.language.trim(),
          },
        ];
      }
    }

    setLanguagesList(updated);
    setActiveModal(null);
    setEditingLangIndex(null);
    await persistLanguages(updated);
  };

  const handleDeleteLanguage = async (index: number) => {
    const updated = languagesList.filter((_, idx) => idx !== index);
    setLanguagesList(updated);
    await persistLanguages(updated);
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
      setVerifyMsg(res.message || 'OTP verification code dispatched successfully.');
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
            <p className="text-xs theme-muted">CamzyJobs candidate portal with multiple resume management & recruiter search badges</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${
              score >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              Profile Completeness: {score}%
            </span>

            {/* Recruiter View (Slide-over drawer) Button */}
            {/* <button
              type="button"
              onClick={() => setIsRecruiterDrawerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="See exactly how recruiters view your profile in candidate search (Slide Drawer)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Recruiter View</span>
            </button> */}

            <button
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
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

        {/* UNIFIED CANDIDATE PROFILE CARD */}
        <div className="theme-surface border theme-border rounded-3xl shadow-sm relative overflow-hidden">
          {/* Top gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500" />

          {/* Main content area */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Left: Avatar + Info */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  {userForm.avatarUrl || user?.avatarUrl ? (
                    <img
                      src={userForm.avatarUrl || user?.avatarUrl}
                      alt="Profile Avatar"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg ring-4 ring-indigo-500/10"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 border-2 border-indigo-500/30 shadow-lg ring-4 ring-indigo-500/10 flex items-center justify-center">
                      <User className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400" />
                    </div>
                  )}
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
                    className="absolute -bottom-1.5 -right-1.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                    title="Click to Upload Profile Photo"
                  >
                    {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  </label>
                </div>

                {/* Info */}
                <div className="space-y-2.5 min-w-0">
                  {/* Name + inline badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {(userForm.firstName || userForm.lastName) ? (
                      <h2 className="text-xl sm:text-2xl font-black theme-text tracking-tight">
                        {userForm.firstName} {userForm.lastName}
                      </h2>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2 cursor-pointer"
                        title="Click to add your full name"
                      >
                        <span>Add Your Name</span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Name Required
                        </span>
                      </button>
                    )}
                    {user?.isEmailVerified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20 flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" /> Email Verified
                      </span>
                    )}
                    {user?.isPhoneVerified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20 flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" /> Phone Verified
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  {profile.headline ? (
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {profile.headline}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add professional headline (e.g. Senior Software Engineer)
                    </button>
                  )}

                  {/* Professional meta chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {(profile.currentTitle || profile.experienceYears) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        <Briefcase className="w-3.5 h-3.5" /> {profile.currentTitle || 'Engineer'}{profile.experienceYears ? ` • ${profile.experienceYears} Yrs Exp` : ''}
                      </span>
                    ) : null}

                    {profile.noticePeriod ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-xs font-semibold theme-muted">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> Notice: <strong className="theme-text ml-0.5">{profile.noticePeriod}</strong>
                      </span>
                    ) : null}

                    {profile.expectedSalary && Number(profile.expectedSalary) > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <IndianRupee className="w-3.5 h-3.5" /> Exp: ₹{Number(profile.expectedSalary).toLocaleString('en-IN')}
                      </span>
                    ) : null}

                    {(!profile.currentTitle && !profile.experienceYears && !profile.noticePeriod && (!profile.expectedSalary || Number(profile.expectedSalary) === 0)) && (
                      <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" /> Add experience, notice period & expected CTC
                      </button>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs theme-muted pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {userForm.email || user?.email}
                    </span>
                    {userForm.phoneNumber && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {userForm.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Edit button */}
              <div className="flex items-start shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" /> Edit Profile Details
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar: Timestamps + Verification actions */}
          <div className="border-t theme-border bg-slate-50/50 dark:bg-slate-800/30 px-6 sm:px-8 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              {/* Timestamps */}
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Member Since: <strong className="theme-text">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Oct 2026'}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>Last Active: <strong className="text-emerald-500">Just Now</strong></span>
              </div>

              {/* Verification action badges */}
              <div className="flex items-center gap-2.5">
                {user?.isEmailVerified ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Email Verified ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartVerification('EMAIL')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Verify Email Now
                  </button>
                )}

                {user?.isPhoneVerified ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Phone Verified ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartVerification('PHONE')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Verify Mobile Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: PERSONAL, SALARY & PREFERENCES */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b theme-border">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Professional Overview & Preferences
              </h2>
              {autoSaveStatus !== 'idle' && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    autoSaveStatus === 'saving'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse'
                      : autoSaveStatus === 'saved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {autoSaveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                  {autoSaveStatus === 'saved' && <Check className="w-3 h-3 text-emerald-500" />}
                  {autoSaveStatus === 'error' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                  <span>
                    {autoSaveStatus === 'saving'
                      ? 'Auto-saving...'
                      : autoSaveMsg || (autoSaveStatus === 'saved' ? 'Auto-saved ✓' : 'Auto-save failed')}
                  </span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
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
                onBlur={() => {
                  if (userForm.firstName.trim() || userForm.lastName.trim() || userForm.phoneNumber.trim()) {
                    triggerAutoSave({
                      firstName: userForm.firstName.trim(),
                      lastName: userForm.lastName.trim(),
                      phoneNumber: userForm.phoneNumber.trim(),
                    }, 'Saved contact details ✓');
                  }
                }}
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
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    triggerAutoSave({ headline: e.target.value.trim() }, 'Saved headline ✓');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                    if ((e.target as HTMLInputElement).value.trim()) {
                      triggerAutoSave({ headline: (e.target as HTMLInputElement).value.trim() }, 'Saved headline ✓');
                    }
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold theme-text mb-1">Notice Period <span className="text-rose-500">*</span></label>
              <select
                value={profile.noticePeriod}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile({ ...profile, noticePeriod: val });
                  triggerAutoSave({ noticePeriod: val }, `Saved notice period "${val}" ✓`);
                }}
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
                placeholder="e.g. 5"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                onBlur={(e) => {
                  const expVal = Number(e.target.value) || 0;
                  triggerAutoSave({ experienceYears: expVal }, `Saved experience (${expVal} yrs) ✓`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                    const expVal = Number((e.target as HTMLInputElement).value) || 0;
                    triggerAutoSave({ experienceYears: expVal }, `Saved experience (${expVal} yrs) ✓`);
                  }
                }}
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
                onBlur={(e) => handleAutoSaveSalary('currentSalary', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                    handleAutoSaveSalary('currentSalary', (e.target as HTMLInputElement).value);
                  }
                }}
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
                onBlur={(e) => handleAutoSaveSalary('expectedSalary', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                    handleAutoSaveSalary('expectedSalary', (e.target as HTMLInputElement).value);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Preferred Cities Tag Manager with Autocomplete & Auto-Save */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold theme-text">
                  Preferred Location Cities <span className="text-[11px] theme-muted font-normal">(Up to 3 Cities from master database)</span>
                </label>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {profile.preferredLocations.length}/3 selected
                </span>
              </div>

              {/* City Autocomplete Input */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      disabled={profile.preferredLocations.length >= 3}
                      placeholder={
                        profile.preferredLocations.length >= 3
                          ? 'Maximum 3 preferred cities reached (remove one below to change)'
                          : 'Search city from master database (e.g. Bangalore, Pune, Mumbai, Remote)...'
                      }
                      value={citySearchInput}
                      onChange={(e) => {
                        setCitySearchInput(e.target.value);
                        setIsCityDropdownOpen(true);
                        setHighlightedCityIndex(0);
                      }}
                      onFocus={() => {
                        if (profile.preferredLocations.length < 3) {
                          setIsCityDropdownOpen(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setIsCityDropdownOpen(false), 250);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setHighlightedCityIndex((prev) => Math.min(prev + 1, filteredCities.length - 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedCityIndex((prev) => Math.max(prev - 1, 0));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredCities.length > 0 && highlightedCityIndex >= 0 && highlightedCityIndex < filteredCities.length) {
                            handleAddCity(filteredCities[highlightedCityIndex].city);
                          } else if (citySearchInput.trim()) {
                            handleAddCity(citySearchInput.trim());
                          }
                        } else if (e.key === 'Escape') {
                          setIsCityDropdownOpen(false);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!citySearchInput.trim() || profile.preferredLocations.length >= 3}
                    onClick={() => handleAddCity()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add City
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {isCityDropdownOpen && profile.preferredLocations.length < 3 && filteredCities.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border theme-border rounded-xl shadow-xl py-1 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-black tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                      <span>{citySearchInput ? 'Matching Master Locations' : 'Popular Location Hubs'}</span>
                      <span className="font-normal lowercase">Press Enter ↵ to add & auto-save</span>
                    </div>
                    {filteredCities.map((loc, idx) => (
                      <div
                        key={loc.id || `${loc.city}-${idx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleAddCity(loc.city);
                        }}
                        onMouseEnter={() => setHighlightedCityIndex(idx)}
                        className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                          highlightedCityIndex === idx
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold truncate">{loc.city}</span>
                          {(loc.state || loc.country) && (
                            <span className="text-[11px] theme-muted truncate">
                              {[loc.state, loc.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                        {loc.isPopular && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            Popular
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Preferred Cities Chips */}
              <div className="flex flex-wrap items-center gap-2 min-h-[32px] pt-0.5">
                {profile.preferredLocations.map((city, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5 shadow-2xs animate-in zoom-in-95"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{city}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(city)}
                      className="p-0.5 rounded-md hover:bg-rose-500/20 hover:text-rose-500 transition-colors cursor-pointer"
                      title={`Remove ${city}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {profile.preferredLocations.length === 0 && (
                  <span className="text-xs theme-muted italic py-1">
                    No preferred cities selected yet. Search above and press Enter, or click quick recommendations below.
                  </span>
                )}
              </div>

              {/* Quick-Pick Popular Cities (Auto-save on click) */}
              {profile.preferredLocations.length < 3 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] theme-muted font-bold mr-1">Popular Cities:</span>
                  {['Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Noida', 'Gurugram', 'Chennai', 'Remote']
                    .filter((c) => !profile.preferredLocations.some((item) => item.toLowerCase() === c.toLowerCase()))
                    .slice(0, 6)
                    .map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleAddCity(city)}
                        className="px-2.5 py-1 rounded-lg border theme-border bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-bold theme-text hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-indigo-500" /> {city}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Key Skills & Tech Stack with Autocomplete & Auto-Save */}
            <div className="sm:col-span-2 space-y-2 pt-3 border-t theme-border">
              <div className="flex items-center justify-between">
                <label className="block font-bold theme-text">
                  Key Skills & Tech Stack <span className="text-rose-500">*</span>{' '}
                  <span className="text-[11px] theme-muted font-normal">(Loaded from master skill taxonomy)</span>
                </label>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {skillsList.length} skills added
                </span>
              </div>

              {/* Skills Autocomplete Input */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type a skill from master data (e.g. React, Spring Boot, Python, AWS, Docker)..."
                      value={skillSearchInput}
                      onChange={(e) => {
                        setSkillSearchInput(e.target.value);
                        setIsSkillDropdownOpen(true);
                        setHighlightedSkillIndex(0);
                      }}
                      onFocus={() => setIsSkillDropdownOpen(true)}
                      onBlur={() => {
                        setTimeout(() => setIsSkillDropdownOpen(false), 250);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setHighlightedSkillIndex((prev) => Math.min(prev + 1, filteredSkills.length - 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedSkillIndex((prev) => Math.max(prev - 1, 0));
                        } else if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          if (filteredSkills.length > 0 && highlightedSkillIndex >= 0 && highlightedSkillIndex < filteredSkills.length) {
                            handleAddSkill(filteredSkills[highlightedSkillIndex].name);
                          } else if (skillSearchInput.trim()) {
                            handleAddSkill(skillSearchInput.trim());
                          }
                        } else if (e.key === 'Backspace' && !skillSearchInput && skillsList.length > 0) {
                          handleRemoveSkill(skillsList[skillsList.length - 1]);
                        } else if (e.key === 'Escape') {
                          setIsSkillDropdownOpen(false);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!skillSearchInput.trim()}
                    onClick={() => handleAddSkill()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Skill
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {isSkillDropdownOpen && filteredSkills.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border theme-border rounded-xl shadow-xl py-1 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-black tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                      <span>{skillSearchInput ? 'Matching Skills & Taxonomy' : 'Popular Tech Skills'}</span>
                      <span className="font-normal lowercase">Press Enter ↵ to add & auto-save</span>
                    </div>
                    {filteredSkills.map((sk, idx) => (
                      <div
                        key={`${sk.name}-${idx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleAddSkill(sk.name);
                        }}
                        onMouseEnter={() => setHighlightedSkillIndex(idx)}
                        className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                          highlightedSkillIndex === idx
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold truncate">{sk.name}</span>
                        </div>
                        {sk.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border theme-border shrink-0">
                            {sk.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Skills Interactive Chips */}
              <div className="flex flex-wrap items-center gap-2 min-h-[36px] pt-1">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5 shadow-2xs animate-in zoom-in-95 group"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 rounded-md hover:bg-rose-500/20 hover:text-rose-500 transition-colors cursor-pointer"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {skillsList.length === 0 && (
                  <span className="text-xs theme-muted italic py-1">
                    No skills added yet. Type above and press Enter, or click recommendations below.
                  </span>
                )}
              </div>

              {/* Quick-Pick Recommended Skills (Auto-save on click) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] theme-muted font-bold mr-1">Recommended:</span>
                {[
                  'Java', 'Spring Boot', 'Microservices', 'TypeScript', 'React', 'Next.js',
                  'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'MySQL', 'Redis'
                ]
                  .filter((s) => !skillsList.some((item) => item.toLowerCase() === s.toLowerCase()))
                  .slice(0, 8)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="px-2.5 py-1 rounded-lg border theme-border bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-bold theme-text hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-indigo-500" /> {skill}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CANDIDATE RESUMES */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b theme-border">
            <div>
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" /> Candidate Resumes ({resumesList.length})
              </h2>
              <p className="text-xs theme-muted mt-0.5">Manage your uploaded resumes and access your standardized Camzy Profile Resume</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Only 1 clean Resume by Camzy button in section header */}
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 font-extrabold text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="View formatted profile as a resume"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Resume (By Camzy)
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadError(null);
                  setResumeUploadFile(null);
                  setNewResumeTitle('');
                  setActiveModal('RESUME');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Upload New Resume
              </button>
            </div>
          </div>

          {resumesList.length === 0 ? (
            /* Clear, non-duplicated fallback when candidate has not uploaded a resume */
            <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black theme-text">No uploaded resume file yet</h4>
                    <p className="text-xs theme-muted mt-0.5 max-w-xl leading-relaxed">
                      You haven't uploaded an external resume file yet. You can upload a PDF or DOCX file, or view and download your standardized <strong>Resume (By Camzy)</strong> generated automatically from your profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      setResumeUploadFile(null);
                      setNewResumeTitle('');
                      setActiveModal('RESUME');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Upload Resume
                  </button>
                </div>
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
                      <h4 className="text-xs font-black theme-text">Standardized Profile Resume (By Camzy)</h4>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20">
                        Profile Sync
                      </span>
                    </div>
                    <p className="text-[11px] theme-muted mt-0.5">
                      Standardized executive format automatically synced with your profile details.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResumeModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500" /> View Camzy Resume
                  </button>
                </div>
              </div>
            {resumesList.map((res) => {
              const fileUrl = resolveResumeUrl(res.resumeUrl || (res as any).url);
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
                    {fileUrl ? (
                      <>
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
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsResumeModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Camzy Resume
                      </button>
                    )}
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
              onClick={handleOpenAddExperience}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Employment Entry
            </button>
          </div>

          <div className="space-y-3">
            {experienceList.map((exp, idx) => (
              <div key={exp.id || idx} className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5 relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-black theme-text">{exp.designation || (exp as any).title || 'Role'}</h3>
                    <p className="text-xs font-bold text-indigo-500">{exp.companyName || (exp as any).company || 'Company'} {exp.location && `• ${exp.location}`}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditExperience(idx)}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Edit Experience"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] theme-muted font-medium">
                  {exp.startDate || 'Started'} – {exp.isCurrentJob || (exp as any).isCurrent ? 'Present (Current Job)' : exp.endDate || 'Ended'} {exp.noticePeriod && `• Notice Period: ${exp.noticePeriod}`}
                </p>
                {exp.jobSummary && <p className="text-xs theme-text pt-1 leading-relaxed">{exp.jobSummary}</p>}
                {(exp.rolesAndResponsibilities || (exp as any).description) && (
                  <div className="mt-2 pt-2 border-t theme-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                      Roles & Responsibilities
                    </span>
                    <p className="text-xs theme-text/90 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-indigo-500/40">
                      {exp.rolesAndResponsibilities || (exp as any).description}
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
                onClick={handleOpenAddEducation}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>
            {educationList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed theme-border text-center text-xs theme-muted py-6">
                No education details added yet. Click &quot;Add Degree&quot; to add your qualification.
              </div>
            ) : (
              <div className="space-y-3">
                {educationList.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1 relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <h4 className="font-bold theme-text truncate">{edu.degree || (edu as any).degree_title}</h4>
                        {edu.fieldOfStudy && (
                          <p className="text-[11px] theme-muted font-medium">{edu.fieldOfStudy}</p>
                        )}
                        <p className="text-indigo-500 font-semibold">{edu.institution}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEducation(idx)}
                          className="px-2 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Edit Education"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                          title="Delete Degree"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="theme-muted text-[11px]">
                      {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear || (edu as any).year || 'Completed'} {(edu.grade || (edu as any).result) && `• Grade: ${edu.grade || (edu as any).result}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" /> Certifications ({certificationList.length})
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal('CERT')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>
            {certificationList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed theme-border text-center text-xs theme-muted py-6">
                No certifications added yet. Click &quot;Add Certification&quot; to showcase your credentials.
              </div>
            ) : (
              <div className="space-y-3">
                {certificationList.map((cert, idx) => (
                  <div key={cert.id || idx} className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold theme-text">{cert.title}</h4>
                        <p className="text-indigo-500 font-semibold">{cert.issuingOrganization}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertification(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete Certification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: LANGUAGES KNOWN */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-500" /> Languages Known ({languagesList.length})
              </h2>
              <p className="text-[11px] theme-muted mt-0.5">
                Highlight the languages you can speak, read, and write for better recruiter matching
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddLanguage}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Language</span>
            </button>
          </div>

          {languagesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {languagesList.map((lang, idx) => (
                <div
                  key={lang.id || idx}
                  className="p-4 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between gap-3 transition-all hover:border-indigo-500/50 hover:shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black theme-text text-sm">{lang.language}</h4>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lang.proficiency === 'NATIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : lang.proficiency === 'FLUENT'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : lang.proficiency === 'CONVERSATIONAL'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {lang.proficiency === 'NATIVE'
                          ? 'Native / Mother Tongue'
                          : lang.proficiency === 'FLUENT'
                          ? 'Fluent / Professional'
                          : lang.proficiency === 'CONVERSATIONAL'
                          ? 'Conversational'
                          : 'Basic / Beginner'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditLanguage(idx)}
                        className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit language"
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLanguage(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete language"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t theme-border/60 text-[11px] font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                        lang.canRead !== false
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
                          : 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800'
                      }`}
                    >
                      {lang.canRead !== false ? '✓' : '✕'} Read
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                        lang.canWrite !== false
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
                          : 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800'
                      }`}
                    >
                      {lang.canWrite !== false ? '✓' : '✕'} Write
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                        lang.canSpeak !== false
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
                          : 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800'
                      }`}
                    >
                      {lang.canSpeak !== false ? '✓' : '✕'} Speak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed theme-border rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
              <Languages className="w-7 h-7 text-indigo-400 mx-auto opacity-70" />
              <p className="text-xs theme-muted">
                No languages added yet. Add languages you can speak, read, or write to stand out to hiring recruiters.
              </p>
              <button
                type="button"
                onClick={handleOpenAddLanguage}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Language</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 6: SOCIAL & PROFESSIONAL PROFILES */}
        <div className="theme-surface border theme-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Social & Professional Profiles
            </h2>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Links</span>
            </button>
          </div>

          {socialLinks.linkedin || socialLinks.github || socialLinks.website ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {socialLinks.linkedin ? (
                <a
                  href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border theme-border hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 text-xs transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                    in
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold theme-text block text-[11px]">LinkedIn</span>
                    <span className="text-[10px] theme-muted truncate block group-hover:text-indigo-500">
                      {socialLinks.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '@')}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 theme-muted group-hover:text-indigo-500 flex-shrink-0" />
                </a>
              ) : null}

              {socialLinks.github ? (
                <a
                  href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://${socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border theme-border hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 text-xs transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0 font-black text-xs">
                    gh
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold theme-text block text-[11px]">GitHub</span>
                    <span className="text-[10px] theme-muted truncate block group-hover:text-indigo-500">
                      {socialLinks.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '@')}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 theme-muted group-hover:text-indigo-500 flex-shrink-0" />
                </a>
              ) : null}

              {socialLinks.website ? (
                <a
                  href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border theme-border hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 text-xs transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold theme-text block text-[11px]">Portfolio / Website</span>
                    <span className="text-[10px] theme-muted truncate block group-hover:text-indigo-500">
                      {socialLinks.website.replace(/^https?:\/\//i, '')}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 theme-muted group-hover:text-indigo-500 flex-shrink-0" />
                </a>
              ) : null}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed theme-border rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
              <Globe className="w-7 h-7 text-indigo-400 mx-auto opacity-70" />
              <p className="text-xs theme-muted">No social profiles added yet. Add your LinkedIn, GitHub, or personal portfolio to stand out to employers.</p>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Social Profiles</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED EDIT PROFILE MODAL */}
        {/* ========================================================================= */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-2xl max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-start justify-between gap-3 bg-inherit">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 flex-shrink-0">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black theme-text truncate">Edit Candidate Profile & Identity</h3>
                    <p className="text-xs theme-muted truncate">Update your full name, contact information, headline, and compensation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-shrink-0 p-1.5 theme-muted hover:theme-text rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
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
                    {userForm.avatarUrl ? (
                      <img
                        src={userForm.avatarUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 border-2 border-indigo-500/40 shadow-sm flex items-center justify-center">
                        <User className="w-8 h-8 text-indigo-500" />
                      </div>
                    )}
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
                    onBlur={(e) => {
                      const expVal = Number(e.target.value) || 0;
                      triggerAutoSave({ experienceYears: expVal }, `Saved experience (${expVal} yrs) ✓`);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Current Salary (INR)</label>
                  <input
                    type="number"
                    placeholder="1800000"
                    value={profile.currentSalary}
                    onChange={(e) => setProfile({ ...profile, currentSalary: e.target.value })}
                    onBlur={(e) => handleAutoSaveSalary('currentSalary', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAutoSaveSalary('currentSalary', (e.target as HTMLInputElement).value);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold theme-text mb-1">Expected Salary (INR)</label>
                  <input
                    type="number"
                    placeholder="2400000"
                    value={profile.expectedSalary}
                    onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                    onBlur={(e) => handleAutoSaveSalary('expectedSalary', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAutoSaveSalary('expectedSalary', (e.target as HTMLInputElement).value);
                      }
                    }}
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

                {/* Social & Professional Links */}
                <div className="sm:col-span-2 pt-3 border-t theme-border space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider theme-text flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-500" /> Social & Professional Profiles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold theme-text mb-1 text-[11px]">LinkedIn URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={socialLinks.linkedin || ''}
                        onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold theme-text mb-1 text-[11px]">GitHub URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={socialLinks.github || ''}
                        onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold theme-text mb-1 text-[11px]">Portfolio / Personal Website</label>
                      <input
                        type="url"
                        placeholder="https://myportfolio.dev"
                        value={socialLinks.website || ''}
                        onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Languages Known Shortcut */}
                <div className="sm:col-span-2 pt-3 border-t theme-border space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider theme-text flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-indigo-500" /> Languages Known ({languagesList.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditProfileOpen(false);
                        handleOpenAddLanguage();
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Language
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {languagesList.map((lang, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold"
                      >
                        <span>{lang.language}</span>
                        <span className="text-[10px] opacity-75 font-normal">({lang.proficiency})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditProfileOpen(false);
                            handleOpenEditLanguage(idx);
                          }}
                          className="hover:text-indigo-900 dark:hover:text-white p-0.5"
                          title="Edit"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION MODAL WITH 3-MINUTE OTP */}
        {verifyModalTarget && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <h3 className="text-base font-black theme-text flex items-center gap-2 min-w-0 flex-1 truncate">
                  <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="truncate">Verify {verifyModalTarget === 'EMAIL' ? 'Email Address' : 'Mobile Number'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setVerifyModalTarget(null)}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {verifyMsg && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {verifyMsg}
                  </div>
                )}

                {!verifyOtpSent ? (
                  <div className="space-y-4 text-xs">
                    <p className="theme-muted">
                      We will send a 6-digit verification code to <strong>{verifyIdentifier}</strong>. Valid for <strong>3 minutes</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={handleSendVerificationOtp}
                      disabled={verifyLoading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirm Verification
                    </button>

                    <div className="text-center pt-1">
                      {resendTimer > 0 ? (
                        <span className="theme-muted font-mono">Resend available in {formatTimer(resendTimer)}</span>
                      ) : (
                        <button type="button" onClick={handleSendVerificationOtp} className="text-indigo-500 font-bold hover:underline cursor-pointer">
                          Resend OTP Code Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING NEW RESUME PDF (REAL SERVER UPLOAD) */}
        {activeModal === 'RESUME' && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <div className="min-w-0 flex-1 truncate">
                  <h3 className="text-base font-extrabold theme-text truncate">Upload Resume Document</h3>
                  <p className="text-[11px] theme-muted truncate">Stored directly on backend server (S3-ready architecture)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-3">
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
                    <label className="block font-bold theme-text mb-1">Select File (PDF, DOC, DOCX, or Image up to 5MB)</label>
                    <div className="p-4 border-2 border-dashed theme-border rounded-2xl text-center space-y-2 hover:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-900/50">
                      <Upload className="w-6 h-6 text-indigo-500 mx-auto" />
                      <input
                        type="file"
                        id="resume-file-picker"
                        accept=".pdf,.doc,.docx,.rtf,.odt,.png,.jpg,.jpeg,image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.size > 5 * 1024 * 1024) {
                              setUploadError('Resume file size exceeds the 5MB maximum limit. Please upload a smaller file.');
                              setResumeUploadFile(null);
                              return;
                            }
                            setUploadError(null);
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
                        <p className="text-[11px] theme-muted">Supported formats: PDF, DOC, DOCX, Images (Max 5MB)</p>
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
          </div>
        )}

        {/* MODAL FOR ADDING EXPERIENCE */}
        {activeModal === 'EXP' && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-lg max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <div className="min-w-0 flex-1 truncate">
                  <h3 className="text-base font-extrabold theme-text truncate">
                    {editingExpIndex !== null ? 'Edit Employment History' : 'Add Employment History'}
                  </h3>
                  <p className="text-[11px] theme-muted truncate">
                    {editingExpIndex !== null
                      ? 'Update your past or current job role with key responsibilities'
                      : 'Add your past or current job role with key responsibilities'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
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
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                {editingExpIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteExperience(editingExpIndex);
                      setActiveModal(null);
                      setEditingExpIndex(null);
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entry</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingExpIndex(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExperience}
                    disabled={!expForm.designation.trim() || !expForm.companyName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" /> {editingExpIndex !== null ? 'Update Experience' : 'Save Experience'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING / EDITING EDUCATION */}
        {activeModal === 'EDU' && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <h3 className="text-base font-extrabold theme-text truncate">
                  {editingEduIndex !== null ? 'Edit Education Degree' : 'Add Education Degree'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setEditingEduIndex(null);
                  }}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 text-xs">
                <div>
                  <label className="block font-bold theme-text mb-1">Degree / Course *</label>
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
                  <label className="block font-bold theme-text mb-1">Field of Study / Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science and Engineering"
                    value={eduForm.fieldOfStudy || ''}
                    onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
                <div>
                  <label className="block font-bold theme-text mb-1">Institution / University *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT Bombay / University of Delhi"
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
                      value={eduForm.startYear || ''}
                      onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold theme-text mb-1">End / Passing Year</label>
                    <input
                      type="text"
                      placeholder="2020"
                      value={eduForm.endYear || ''}
                      onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold theme-text mb-1">Grade / CGPA / Percentage</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 CGPA or First Class"
                    value={eduForm.grade || ''}
                    onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text"
                  />
                </div>
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                {editingEduIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteEducation(editingEduIndex);
                      setActiveModal(null);
                      setEditingEduIndex(null);
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Degree</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingEduIndex(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEducation}
                    disabled={!eduForm.degree.trim() || !eduForm.institution.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" /> {editingEduIndex !== null ? 'Update Degree' : 'Save Degree'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING CERTIFICATION */}
        {activeModal === 'CERT' && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <h3 className="text-base font-extrabold theme-text truncate">Add Professional Certification</h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 text-xs">
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
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCertification}
                  disabled={!certForm.title || !certForm.issuingOrganization}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Certification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR ADDING / EDITING LANGUAGE */}
        {activeModal === 'LANG' && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md max-h-[90vh] my-auto flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 flex-shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-extrabold theme-text truncate">
                      {editingLangIndex !== null ? 'Edit Language' : 'Add Language Known'}
                    </h3>
                    <p className="text-xs theme-muted truncate">Specify your proficiency and communication skills</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setEditingLangIndex(null);
                  }}
                  className="flex-shrink-0 p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                {/* Language Selection */}
                <div>
                  <label className="block font-bold theme-text mb-1">
                    Language Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="popular-languages-list"
                    required
                    placeholder="e.g. English, Hindi, French, Spanish..."
                    value={langForm.language}
                    onChange={(e) => setLangForm({ ...langForm, language: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border theme-border theme-surface theme-text focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <datalist id="popular-languages-list">
                    {POPULAR_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} />
                    ))}
                  </datalist>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] theme-muted mr-1 font-semibold self-center">Quick pick:</span>
                    {['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'French', 'German'].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setLangForm({ ...langForm, language: q })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                          langForm.language.toLowerCase() === q.toLowerCase()
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proficiency Level */}
                <div>
                  <label className="block font-bold theme-text mb-1.5">
                    Proficiency Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'NATIVE', label: 'Native / Mother Tongue', desc: 'First language or native level' },
                      { val: 'FLUENT', label: 'Fluent / Professional', desc: 'Full workplace proficiency' },
                      { val: 'CONVERSATIONAL', label: 'Conversational', desc: 'Can hold casual discussions' },
                      { val: 'BASIC', label: 'Basic / Beginner', desc: 'Elementary understanding' },
                    ].map((p) => (
                      <label
                        key={p.val}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          langForm.proficiency === p.val
                            ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500'
                            : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800/50 theme-text'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{p.label}</span>
                          <input
                            type="radio"
                            name="proficiency"
                            value={p.val}
                            checked={langForm.proficiency === p.val}
                            onChange={() => setLangForm({ ...langForm, proficiency: p.val as any })}
                            className="sr-only"
                          />
                          {langForm.proficiency === p.val && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </div>
                        <span className="text-[10px] theme-muted font-normal mt-0.5">{p.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Communication Capabilities */}
                <div>
                  <label className="block font-bold theme-text mb-1.5">Communication Skills</label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={langForm.canRead !== false}
                        onChange={(e) => setLangForm({ ...langForm, canRead: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold theme-text">Can Read</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={langForm.canWrite !== false}
                        onChange={(e) => setLangForm({ ...langForm, canWrite: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold theme-text">Can Write</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={langForm.canSpeak !== false}
                        onChange={(e) => setLangForm({ ...langForm, canSpeak: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold theme-text">Can Speak</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                {editingLangIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteLanguage(editingLangIndex);
                      setActiveModal(null);
                      setEditingLangIndex(null);
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Language</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingLangIndex(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLanguage}
                    disabled={!langForm.language.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {editingLangIndex !== null ? 'Update Language' : 'Save Language'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Perspective Slide-over Drawer (How Recruiters See Profile) */}
        <CandidateRecruiterDrawer
          isOpen={isRecruiterDrawerOpen}
          onClose={() => {
            setIsRecruiterDrawerOpen(false);
            if (typeof window !== 'undefined' && window.location.search.includes('view=recruiter')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onOpenResumePreview={() => {
            setIsRecruiterDrawerOpen(false);
            setIsResumeModalOpen(true);
          }}
          candidate={{
            ...profile,
            skills: skillsList.length > 0 ? skillsList : profile.skills,
            user: userForm,
            experience: experienceList,
            education: educationList,
            certifications: certificationList,
            projects: projectList,
            socialLinks,
            languages: languagesList,
            resumes: resumesList,
          } as any}
        />

        {/* Profile Formatted Resume (By Camzy) Print & Download Modal */}
        <ProfileResumeModal
          isOpen={isResumeModalOpen}
          onClose={() => {
            setIsResumeModalOpen(false);
            if (typeof window !== 'undefined' && window.location.search.includes('view=resume')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          candidate={{
            ...profile,
            skills: skillsList.length > 0 ? skillsList : profile.skills,
            user: userForm,
            experience: experienceList,
            education: educationList,
            certifications: certificationList,
            projects: projectList,
            socialLinks,
            languages: languagesList,
            resumes: resumesList,
          } as any}
        />
      </div>
    </DashboardLayout>
  );
}
