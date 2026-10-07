'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { User, FileText, Upload, Sparkles, Save, CheckCircle2, DollarSign, Briefcase } from 'lucide-react';

export default function CandidateProfilePage() {
  const { theme } = useTheme();

  const [profile, setProfile] = useState({
    headline: 'Senior Full Stack Engineer | Next.js & NestJS Expert',
    summary: 'Passionate developer with 6+ years building enterprise web applications, microservices, and dynamic design systems.',
    currentTitle: 'Senior Full Stack Developer',
    experienceYears: '6',
    expectedSalary: '160000',
    skills: 'TypeScript, Next.js, NestJS, React, Tailwind CSS, TypeORM, MySQL, Redis',
    visibility: 'PUBLIC',
    resumeFileName: 'john-doe-fullstack-resume.pdf',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Candidate Profile & Resume Builder</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your professional talent profile and upload your latest PDF resume</p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Candidate profile & resume updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-8 border-slate-200 dark:border-slate-800 space-y-6">
        {/* Resume PDF Upload Card */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Resume PDF</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{profile.resumeFileName}</p>
              </div>
            </div>

            <label className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-500" /> Replace Resume PDF
              <input type="file" accept=".pdf,.docx" className="hidden" />
            </label>
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Professional Headline *</label>
          <input
            type="text"
            required
            value={profile.headline}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Current Title & Experience Years */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Current Job Title *</label>
            <input
              type="text"
              required
              value={profile.currentTitle}
              onChange={(e) => setProfile({ ...profile, currentTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Total Experience (Years) *</label>
            <input
              type="number"
              required
              value={profile.experienceYears}
              onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Expected Salary & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Expected Annual Salary ($)</label>
            <input
              type="number"
              value={profile.expectedSalary}
              onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Key Skills (Comma Separated)</label>
            <input
              type="text"
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Professional Summary & Bio</label>
          <textarea
            rows={4}
            value={profile.summary}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg theme-transition hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <Save className="w-4 h-4" /> Save Candidate Profile
        </button>
      </form>
    </div>
  );
}
