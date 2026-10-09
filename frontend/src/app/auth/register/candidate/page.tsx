'use client';

import React, { useState } from 'react';
import { User, CheckCircle2, Upload, FileText, ArrowRight, ArrowLeft, Mail, Lock, ShieldCheck, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { useTheme } from '../../../../context/ThemeContext';

const EXPERIENCE_LEVELS = [
  { value: 'Entry Level', label: 'Entry Level (0-2 Years)' },
  { value: 'Mid Level', label: 'Mid Level (3-5 Years)' },
  { value: 'Senior Level', label: 'Senior Level (6-10 Years)' },
  { value: 'Executive / Director', label: 'Executive / Director (10+ Years)' },
];

export default function CandidateRegistrationPage() {
  const { sdk } = useTheme();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Candidate State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior Level');
  const [expectedSalary, setExpectedSalary] = useState('$130,000');
  const [skills, setSkills] = useState('React, Next.js, TypeScript, NestJS, MySQL');
  const [resumeFileName, setResumeFileName] = useState('');

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        await sdk.request('/auth/register/candidate', {
          method: 'POST',
          body: JSON.stringify({
            fullName,
            email,
            password,
            headline,
            experienceLevel,
            expectedSalary,
            skills,
          }),
        });
        setIsSubmitted(true);
      } catch (err: any) {
        console.error('Error registering candidate:', err);
        setErrorMsg(err.message || 'Failed to register candidate. Please check details and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8 space-y-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <User className="h-3.5 w-3.5 mr-1.5" /> Candidate Talent Registration
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text">
          Create Your Verified Candidate Profile
        </h1>
        <p className="text-sm theme-muted max-w-lg mx-auto">
          Get discovered by direct hiring companies on <span className="font-bold text-indigo-500">Camzy Jobs</span> with automated resume parsing and identity verification.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-8 theme-surface border theme-border rounded-xl text-center space-y-4 shadow-xl">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 animate-bounce" />
          <h2 className="text-2xl font-extrabold theme-text">Candidate Profile Verified & Active!</h2>
          <p className="text-sm theme-muted max-w-md mx-auto">
            Welcome <span className="font-bold text-indigo-500">{fullName}</span>! Your candidate profile and resume have been indexed with a <span className="font-bold text-emerald-500">100% Profile Completeness Rating</span>.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <a
              href="/jobs"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center"
            >
              <span>Start Searching Company Jobs</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleNext} className="p-8 theme-surface border theme-border rounded-xl shadow-xl space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold theme-text border-b theme-border pb-3 flex items-center">
                <User className="h-5 w-5 text-indigo-500 mr-2" /> Step 1: Identity & Credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                    <input
                      type="email"
                      required
                      placeholder="alex.morgan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Create Account Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold theme-text border-b theme-border pb-3 flex items-center">
                <Briefcase className="h-5 w-5 text-purple-500 mr-2" /> Step 2: Professional Resume & Skills Profile
              </h3>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Professional Headline / Desired Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer (React, Node, Cloud)"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Years of Experience *
                  </label>
                  <SearchableSelect
                    options={EXPERIENCE_LEVELS}
                    value={experienceLevel}
                    onChange={setExperienceLevel}
                    placeholder="Select experience level..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Expected Salary (USD/Year)
                  </label>
                  <input
                    type="text"
                    placeholder="$140,000"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Core Technical Skills (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="React, Next.js, Node.js, TypeScript, PostgreSQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Upload Resume Box */}
              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Upload PDF / Word Resume *
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed theme-border rounded-xl cursor-pointer hover:border-indigo-500 transition-all bg-slate-50/50 dark:bg-slate-900/50">
                  <Upload className="h-8 w-8 text-indigo-500 mb-2" />
                  <span className="text-xs font-bold theme-text">
                    {resumeFileName ? `Uploaded: ${resumeFileName}` : 'Click to select PDF resume file (Max 10MB)'}
                  </span>
                  <span className="text-[10px] theme-muted mt-1">Automated text parser will extract skills JSON</span>
                  <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleResumeUpload} />
                </label>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t theme-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-lg border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous Step
              </button>
            ) : <div />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center"
            >
              <span>{step === 2 ? 'Complete Candidate Verification' : 'Continue to Resume Setup'}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
