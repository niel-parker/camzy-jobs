'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../../context/ThemeContext';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { LocationSearchDropdown } from '../../../../components/LocationSearchDropdown';
import { SkillKeywordAutocomplete } from '../../../../components/SkillKeywordAutocomplete';
import { ExperienceRangeSelector } from '../../../../components/ExperienceRangeSelector';
import { ArrowLeft, Sparkles, AlertCircle, Plus, Trash2, HelpCircle, ExternalLink, FileText, EyeOff, Eye, Gift, Calendar, UserCheck, Lock, Clock, RotateCcw } from 'lucide-react';

interface ScreeningQItem {
  id: string;
  questionText: string;
  questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
  options: string;
  isRequired: boolean;
}

export default function CreateJobPage() {
  const { theme, sdk, user } = useTheme();
  const router = useRouter();

  const [repostFromId, setRepostFromId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering',
    employmentType: 'Full-time' as const,
    experienceLevel: 'Senior' as const,
    location: '',
    isRemote: true,
    salaryMin: '500000',
    salaryMax: '1500000',
    currency: 'INR',
    isSalaryVisible: true,
    skillsInput: 'TypeScript, Next.js, NestJS',
    genderPreference: 'ANY' as 'ANY' | 'MALE' | 'FEMALE',
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    description: '',
    isFeatured: false,
    applyType: 'INTERNAL' as 'INTERNAL' | 'EXTERNAL',
    applyUrl: '',
  });

  const [minExperience, setMinExperience] = useState<number>(3);
  const [maxExperience, setMaxExperience] = useState<number>(5);
  const [locationDetails, setLocationDetails] = useState<{ city: string; state?: string; country: string }>({
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'TypeScript',
    'Next.js',
    'NestJS',
    'React',
  ]);

  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    'Health Insurance',
    'Work From Home / Remote',
    'Performance Bonus',
  ]);

  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if opened in repost mode (?repostFrom=<jobId>)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rf = params.get('repostFrom');
      if (rf) {
        setRepostFromId(rf);
        sdk.getJobById(rf).then((orig: any) => {
          if (orig) {
            setFormData((prev) => ({
              ...prev,
              title: orig.title || prev.title,
              category: orig.category || prev.category,
              employmentType: orig.employmentType || prev.employmentType,
              experienceLevel: orig.experienceLevel || prev.experienceLevel,
              location: orig.location || prev.location,
              isRemote: orig.isRemote ?? prev.isRemote,
              salaryMin: orig.salaryMin ? String(orig.salaryMin) : prev.salaryMin,
              salaryMax: orig.salaryMax ? String(orig.salaryMax) : prev.salaryMax,
              currency: orig.currency || prev.currency,
              description: orig.description || prev.description,
              applyType: orig.applyType || prev.applyType,
              applyUrl: orig.applyUrl || prev.applyUrl,
            }));
            if (orig.minExperience !== undefined) setMinExperience(orig.minExperience);
            if (orig.maxExperience !== undefined) setMaxExperience(orig.maxExperience);
            if (orig.skills?.length) setSelectedSkills(orig.skills);
            if (orig.screeningQuestions?.length) {
              setScreeningQuestions(
                orig.screeningQuestions.map((q: any) => ({
                  id: q.id,
                  questionText: q.questionText,
                  questionType: q.questionType,
                  options: Array.isArray(q.options) ? q.options.join(', ') : '',
                  isRequired: q.isRequired ?? true,
                }))
              );
            }
          }
        }).catch((err: any) => console.error('Failed to load job for reposting:', err));
      }
    }
  }, [sdk]);

  const availableBenefits = [
    'Health Insurance',
    'Work From Home / Remote',
    'Performance Bonus',
    'Paid Time Off & Holidays',
    'Flexible Working Hours',
    'Stock Options & Equity',
    'Learning & Education Allowance',
    'Gym & Wellness Stipend',
  ];

  const toggleBenefit = (b: string) => {
    if (selectedBenefits.includes(b)) {
      setSelectedBenefits(selectedBenefits.filter((x) => x !== b));
    } else {
      setSelectedBenefits([...selectedBenefits, b]);
    }
  };

  const addScreeningQuestion = () => {
    setScreeningQuestions([
      ...screeningQuestions,
      {
        id: `q_${Date.now()}`,
        questionText: '',
        questionType: 'TEXT',
        options: '',
        isRequired: true,
      },
    ]);
  };

  const removeScreeningQuestion = (id: string) => {
    setScreeningQuestions(screeningQuestions.filter((q) => q.id !== id));
  };

  const updateScreeningQuestion = (id: string, key: keyof ScreeningQItem, val: any) => {
    setScreeningQuestions(
      screeningQuestions.map((q) => (q.id === id ? { ...q, [key]: val } : q))
    );
  };

  const [jobTypeTaxonomies, setJobTypeTaxonomies] = useState<any[]>([]);
  const [careerLevelTaxonomies, setCareerLevelTaxonomies] = useState<any[]>([]);
  const [functionalAreaTaxonomies, setFunctionalAreaTaxonomies] = useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      sdk.getTaxonomies('job-type').catch(() => []),
      sdk.getTaxonomies('career-level').catch(() => []),
      sdk.getTaxonomies('functional-area').catch(() => []),
    ]).then(([types, levels, areas]) => {
      if (types?.length) setJobTypeTaxonomies(types);
      if (levels?.length) setCareerLevelTaxonomies(levels);
      if (areas?.length) setFunctionalAreaTaxonomies(areas);
    });
  }, [sdk]);

  const categories = functionalAreaTaxonomies.length > 0
    ? functionalAreaTaxonomies.map((t) => ({ value: t.name, label: t.name }))
    : [
        { value: 'Engineering', label: 'Engineering & Software' },
        { value: 'DevOps & Architecture', label: 'DevOps & Cloud Architecture' },
        { value: 'Design & Creative', label: 'Design & UI/UX' },
        { value: 'Artificial Intelligence', label: 'Artificial Intelligence & Data' },
      ];

  const employmentTypes = jobTypeTaxonomies.length > 0
    ? jobTypeTaxonomies.map((t) => ({ value: t.name, label: t.name }))
    : [
        { value: 'Full-time', label: 'Full-time Permanent' },
        { value: 'Part-time', label: 'Part-time Contract' },
        { value: 'Contract', label: 'Independent Contract' },
        { value: 'Internship', label: 'Graduate Internship' },
      ];

  const experienceLevels = careerLevelTaxonomies.length > 0
    ? careerLevelTaxonomies.map((t) => ({ value: t.name, label: t.name }))
    : [
        { value: 'Entry', label: 'Entry Level (0-2 Yrs)' },
        { value: 'Mid', label: 'Mid Level (2-5 Yrs)' },
        { value: 'Senior', label: 'Senior Level (5-8 Yrs)' },
        { value: 'Lead', label: 'Lead / Principal (8+ Yrs)' },
        { value: 'Executive', label: 'Executive Director' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formattedQuestions = screeningQuestions
        .filter((q) => q.questionText.trim().length > 0)
        .map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.questionType === 'CHOICE' ? q.options.split(',').map((s) => s.trim()).filter(Boolean) : [],
          isRequired: q.isRequired,
        }));

      const jobPayload: any = {
        title: formData.title,
        category: formData.category,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        minExperience: minExperience,
        maxExperience: maxExperience,
        location: formData.location || 'Remote',
        locationCity: locationDetails.city || formData.location || 'Remote',
        locationState: locationDetails.state,
        locationCountry: locationDetails.country || 'United States',
        isRemote: formData.isRemote,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        currency: formData.currency,
        isSalaryVisible: formData.isSalaryVisible,
        description: formData.description,
        isFeatured: formData.isFeatured,
        applyType: formData.applyType,
        applyUrl: formData.applyUrl,
        skills: selectedSkills.length > 0 ? selectedSkills : ['TypeScript', 'Node.js'],
        benefits: selectedBenefits,
        genderPreference: formData.genderPreference,
        companyName: user?.tenantName || 'Company Tenant',
        isConsultancy: false,
        screeningQuestions: formattedQuestions,
      };

      if (repostFromId) {
        // 2. Repost job: consumes -1 quota, applies fresh 30 days
        await sdk.repostJob(repostFromId, jobPayload);
      } else {
        await sdk.createJob(jobPayload);
      }

      router.push('/employer/jobs');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing job posting. Quota limit reached.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-xs font-semibold theme-muted hover:text-indigo-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Company Jobs
        </Link>

        <div className="p-6 rounded-xl border theme-border theme-surface space-y-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold theme-text tracking-tight">
              {repostFromId ? '🔄 Repost Job Position' : 'Post a New Job Opening'}
            </h1>
            <p className="text-xs theme-muted">
              {repostFromId
                ? 'Review and edit job requirements before reposting. Consumes 1 active job from your quota.'
                : 'Configure job requirements, salary visibility, skill badges, perks, and screening questions'}
            </p>
          </div>

          {repostFromId && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>Repost Mode Active</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Submitting will <strong>consume 1 active job</strong> from your plan quota and publish a fresh <strong>30-day listing</strong>. You can modify any requirements below.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Job Posting Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category & Employment Type Comboboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Category *</label>
                <SearchableSelect
                  options={categories}
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  placeholder="Select Category..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Employment Type *</label>
                <SearchableSelect
                  options={employmentTypes}
                  value={formData.employmentType}
                  onChange={(val) => setFormData({ ...formData, employmentType: val as any })}
                  placeholder="Select Type..."
                />
              </div>
            </div>

            {/* Location & Experience Range Feature */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Job Location (Cities, States, Countries Auto-Dropdown) *
                </label>
                <LocationSearchDropdown
                  value={formData.location}
                  onChange={(val, details) => {
                    setFormData({ ...formData, location: val });
                    if (details) setLocationDetails(details);
                  }}
                  placeholder="Search and select city, state, or country..."
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <ExperienceRangeSelector
                  minYears={minExperience}
                  maxYears={maxExperience}
                  experienceLevel={formData.experienceLevel}
                  onChange={(min, max, lvl) => {
                    setMinExperience(min);
                    setMaxExperience(max);
                    if (lvl) {
                      setFormData((prev) => ({ ...prev, experienceLevel: lvl as any }));
                    }
                  }}
                />
              </div>
            </div>

            {/* Gender Preference & Job Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Gender Preference
                </label>
                <select
                  value={formData.genderPreference}
                  onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="ANY">Any Gender (No Preference)</option>
                  <option value="MALE">Male Preference</option>
                  <option value="FEMALE">Female Preference</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Job Expiry Timeline
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked Policy
                  </span>
                </label>
                <div className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    30 Days ({new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Standard 30 Days
                  </span>
                </div>
                <p className="text-[10px] theme-muted mt-1">
                  * Auto-expires after 30 days. Only Super Admin can change expiry date.
                </p>
              </div>
            </div>

            {/* Required Skills Input with Workday-style Autocomplete */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <SkillKeywordAutocomplete
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
                label="Required Skills & Tech Keywords (Workday-Style Suggestions)"
                placeholder="Type 'java', 'spring', 'python', 'react' to get Workday suggestions..."
              />
            </div>

            {/* Perks & Benefits Selector */}
            <div className="space-y-2 p-4 rounded-xl border theme-border theme-surface">
              <label className="text-xs font-bold theme-text block flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-500" /> Key Company Benefits & Job Perks
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {availableBenefits.map((benefit) => (
                  <label key={benefit} className="flex items-center space-x-2 cursor-pointer theme-text font-medium">
                    <input
                      type="checkbox"
                      checked={selectedBenefits.includes(benefit)}
                      onChange={() => toggleBenefit(benefit)}
                      className="accent-indigo-600 rounded"
                    />
                    <span>{benefit}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Application Mode Selection */}
            <div className="p-4 rounded-xl border theme-border theme-surface space-y-3">
              <label className="text-xs font-bold theme-text block">Application Apply Mode *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  formData.applyType === 'INTERNAL' ? 'border-indigo-600 bg-indigo-500/10' : 'theme-border'
                }`}>
                  <input
                    type="radio"
                    name="applyType"
                    checked={formData.applyType === 'INTERNAL'}
                    onChange={() => setFormData({ ...formData, applyType: 'INTERNAL' })}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold theme-text flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-500" /> Apply on Camzy Jobs
                    </span>
                    <p className="text-[11px] theme-muted mt-0.5">Candidates submit profiles, resumes, and screening answers on portal.</p>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  formData.applyType === 'EXTERNAL' ? 'border-indigo-600 bg-indigo-500/10' : 'theme-border'
                }`}>
                  <input
                    type="radio"
                    name="applyType"
                    checked={formData.applyType === 'EXTERNAL'}
                    onChange={() => setFormData({ ...formData, applyType: 'EXTERNAL' })}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold theme-text flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-indigo-500" /> Apply on Company Career Site
                    </span>
                    <p className="text-[11px] theme-muted mt-0.5">Redirect candidates to your external corporate ATS career URL.</p>
                  </div>
                </label>
              </div>

              {formData.applyType === 'EXTERNAL' && (
                <div className="pt-2">
                  <label className="text-xs font-bold theme-text block mb-1">External Career Apply URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://careers.yourcompany.com/jobs/apply/123"
                    value={formData.applyUrl}
                    onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text focus:border-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Salary Range & Hide Salary Toggle */}
            <div className="p-4 rounded-xl border theme-border theme-surface space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold theme-text block">Annual Salary Range (₹ / INR)</label>
                <label className="flex items-center space-x-2 text-xs font-bold theme-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.isSalaryVisible}
                    onChange={(e) => setFormData({ ...formData, isSalaryVisible: !e.target.checked })}
                    className="accent-indigo-600 rounded"
                  />
                  <span className="flex items-center gap-1">
                    {formData.isSalaryVisible ? <Eye className="w-3.5 h-3.5 text-indigo-500" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                    {formData.isSalaryVisible ? 'Salary Disclosed' : 'Hide Salary (Show Negotiable)'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold theme-muted block mb-1">Min Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold theme-muted block mb-1">Max Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Full Job Description & Requirements *</label>
              <textarea
                rows={6}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe role responsibilities, required technical skills, qualifications..."
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Recruiter Custom Screening Questions Section */}
            {formData.applyType === 'INTERNAL' && (
              <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/20 border theme-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold theme-text flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Recruiter Screening Questions
                    </h3>
                    <p className="text-[11px] theme-muted">Questions asked to candidates during application submission</p>
                  </div>
                  <button
                    type="button"
                    onClick={addScreeningQuestion}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {screeningQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-xl theme-surface border theme-border space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-indigo-500 font-mono">Q{idx + 1}.</span>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. How many years of Next.js experience do you have?"
                          value={q.questionText}
                          onChange={(e) => updateScreeningQuestion(q.id, 'questionText', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScreeningQuestion(q.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Featured Boost Checkbox */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer">
                <Sparkles className="w-4 h-4 text-amber-500" /> Promote Job as Featured Listing
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg theme-transition hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {isSubmitting ? (
                repostFromId ? 'Reposting Job...' : 'Publishing Job Posting...'
              ) : (
                repostFromId ? 'Confirm & Repost Job (-1 Quota)' : 'Publish Job Posting'
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
