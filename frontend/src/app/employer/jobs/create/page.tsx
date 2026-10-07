'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../../context/ThemeContext';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { ArrowLeft, Sparkles, AlertCircle, Plus, Trash2, HelpCircle } from 'lucide-react';

interface ScreeningQItem {
  id: string;
  questionText: string;
  questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
  options: string;
  isRequired: boolean;
}

export default function CreateJobPage() {
  const { theme, sdk } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering',
    employmentType: 'Full-time' as const,
    experienceLevel: 'Senior' as const,
    location: '',
    isRemote: true,
    salaryMin: '120000',
    salaryMax: '160000',
    currency: 'USD',
    isSalaryVisible: true,
    description: '',
    isFeatured: false,
  });

  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const categories = [
    { value: 'Engineering', label: 'Engineering & Software' },
    { value: 'DevOps & Architecture', label: 'DevOps & Cloud Architecture' },
    { value: 'Design & Creative', label: 'Design & UI/UX' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence & Data' },
  ];

  const employmentTypes = [
    { value: 'Full-time', label: 'Full-time Permanent' },
    { value: 'Part-time', label: 'Part-time Contract' },
    { value: 'Contract', label: 'Independent Contract' },
    { value: 'Internship', label: 'Graduate Internship' },
  ];

  const experienceLevels = [
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
      await sdk.createJob({
        ...formData,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        companyName: user?.tenantName || 'Company Tenant',
        isConsultancy: false,
      });

      router.push('/employer/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating job posting. Quota limit reached.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold theme-muted hover:text-indigo-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employer Dashboard
        </Link>

        <div className="p-6 rounded-xl border theme-border theme-surface space-y-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold theme-text tracking-tight">Post a New Job Opening</h1>
            <p className="text-xs theme-muted">Fill out company posting details to start receiving candidate applications</p>
        </div>

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
              placeholder="e.g. Senior Software Engineer"
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
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Employment Type *</label>
              <SearchableSelect
                options={employmentTypes}
                value={formData.employmentType}
                onChange={(val) => setFormData({ ...formData, employmentType: val as any })}
              />
            </div>
          </div>

          {/* Location & Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Experience Level *</label>
              <SearchableSelect
                options={experienceLevels}
                value={formData.experienceLevel}
                onChange={(val) => setFormData({ ...formData, experienceLevel: val as any })}
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Minimum Annual Salary ($)</label>
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Maximum Annual Salary ($)</label>
              <input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Full Job Description & Responsibilities *</label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe core duties, qualifications, and requirements..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Custom Candidate Screening Questions (Optional) */}
          <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold theme-text flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>Recruiter Custom Screening Questions (Optional)</span>
                </h3>
                <p className="text-[11px] theme-muted mt-0.5">
                  Candidates will answer these questions when submitting their application.
                </p>
              </div>

              <button
                type="button"
                onClick={addScreeningQuestion}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {screeningQuestions.length === 0 ? (
              <p className="text-xs theme-muted italic text-center py-2">
                No custom screening questions added. (Optional feature)
              </p>
            ) : (
              <div className="space-y-3">
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

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <label className="flex items-center space-x-1 theme-muted">
                            <span>Response Type:</span>
                            <select
                              value={q.questionType}
                              onChange={(e) => updateScreeningQuestion(q.id, 'questionType', e.target.value)}
                              className="px-2 py-1 rounded border theme-border theme-input theme-text text-xs font-bold"
                            >
                              <option value="TEXT">Short Text Input</option>
                              <option value="YES_NO">Yes / No Radio</option>
                              <option value="CHOICE">Multiple Choice Dropdown</option>
                            </select>
                          </label>

                          {q.questionType === 'CHOICE' && (
                            <input
                              type="text"
                              placeholder="Options (comma separated, e.g. 1-2 Yrs, 3-5 Yrs, 5+ Yrs)"
                              value={q.options}
                              onChange={(e) => updateScreeningQuestion(q.id, 'options', e.target.value)}
                              className="flex-1 px-3 py-1 rounded border theme-border theme-input theme-text text-xs"
                            />
                          )}

                          <label className="flex items-center space-x-1.5 cursor-pointer theme-text font-semibold">
                            <input
                              type="checkbox"
                              checked={q.isRequired}
                              onChange={(e) => updateScreeningQuestion(q.id, 'isRequired', e.target.checked)}
                              className="accent-indigo-600 rounded"
                            />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeScreeningQuestion(q.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <Sparkles className="w-4 h-4 text-amber-500" /> Burn 1 Featured Job Boost Credit (Promote to top of search)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg theme-transition hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {isSubmitting ? 'Publishing Job Posting...' : 'Publish Job Posting'}
          </button>
        </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
