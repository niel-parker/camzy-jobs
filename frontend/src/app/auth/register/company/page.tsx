'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Globe, MapPin, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { useTheme } from '../../../../context/ThemeContext';

const INDUSTRY_OPTIONS = [
  { value: 'Software & SaaS', label: 'Software & SaaS' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence & ML' },
  { value: 'FinTech & Banking', label: 'FinTech & Banking' },
  { value: 'Healthcare Tech', label: 'Healthcare & HealthTech' },
  { value: 'E-Commerce & Retail', label: 'E-Commerce & Retail' },
  { value: 'Data & Analytics', label: 'Data & Analytics' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 Employees (Seed / Startup)' },
  { value: '11-50', label: '11-50 Employees (Growth)' },
  { value: '51-200', label: '51-200 Employees (Scale-Up)' },
  { value: '201-1000', label: '201-1000 Employees (Enterprise)' },
  { value: '1000+', label: '1000+ Employees (Global Enterprise)' },
];

export default function CompanyOnboardingPage() {
  const { sdk } = useTheme();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Software & SaaS');
  const [companySize, setCompanySize] = useState('11-50');
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        await sdk.request('/auth/register/company', {
          method: 'POST',
          body: JSON.stringify({
            companyName,
            industry,
            companySize,
            website,
            taxId,
            headquarters,
            adminName,
            adminEmail,
            adminPassword,
            logoUrl,
            description,
            selectedPlan,
          }),
        });
        setIsSubmitted(true);
      } catch (err: any) {
        console.error('Error registering company:', err);
        setErrorMsg(err.message || 'Failed to onboard company. Please check details and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="text-center mb-8 space-y-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Building2 className="h-3.5 w-3.5 mr-1.5" /> Employer Onboarding
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text">
          Onboard Your Hiring Company
        </h1>
        <p className="text-sm theme-muted max-w-xl mx-auto">
          Register your company on <span className="font-bold text-indigo-500">Camzy Jobs</span>, submit tax registration for instant verification, and unlock hiring quota packages.
        </p>
      </div>

      {/* Wizard Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Company Profile' },
            { num: 2, label: 'Business Verification' },
            { num: 3, label: 'Select Hiring Plan' },
          ].map((s) => (
            <div key={s.num} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-500/20'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 theme-text'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className={`text-xs font-semibold ${step === s.num ? 'theme-text font-bold' : 'theme-muted'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isSubmitted ? (
        <div className="p-8 theme-surface border theme-border rounded-xl text-center space-y-4 shadow-xl">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 animate-bounce" />
          <h2 className="text-2xl font-extrabold theme-text">Company Onboarding Submitted!</h2>
          <p className="text-sm theme-muted max-w-md mx-auto">
            <span className="font-bold text-indigo-500">{companyName}</span> has been submitted to the Super Admin Verification Queue. Tax ID <span className="font-mono text-xs theme-text">{taxId || 'TAX-998811'}</span> is currently pending automated document check.
          </p>
          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs theme-text max-w-md mx-auto space-y-1 text-left">
            <div className="font-bold text-indigo-600 dark:text-indigo-400">Next Steps:</div>
            <div>• Super Admin approval usually completes within 1 hour.</div>
            <div>• Recruiter seat credentials sent to: <span className="font-semibold">{adminEmail}</span></div>
          </div>
          <div className="pt-4 flex justify-center space-x-4">
            <a
              href="/employer/dashboard"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center"
            >
              <span>Go to Recruiter Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleNext} className="p-8 theme-surface border theme-border rounded-xl shadow-xl space-y-6">
          {/* STEP 1: Company Profile Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold theme-text border-b theme-border pb-3 flex items-center">
                <Building2 className="h-5 w-5 text-indigo-500 mr-2" /> Step 1: Corporate Profile Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Official Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Technologies Inc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Company Website Domain *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                    <input
                      type="url"
                      required
                      placeholder="https://apexglobal.tech"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Industry Category *
                  </label>
                  <SearchableSelect
                    options={INDUSTRY_OPTIONS}
                    value={industry}
                    onChange={setIndustry}
                    placeholder="Select industry..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Company Employee Count *
                  </label>
                  <SearchableSelect
                    options={COMPANY_SIZE_OPTIONS}
                    value={companySize}
                    onChange={setCompanySize}
                    placeholder="Select size..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Headquarters Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. San Francisco, CA"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Company Overview & Mission
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what your company builds and your workplace culture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Business Verification & Admin Credentials */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold theme-text border-b theme-border pb-3 flex items-center">
                <ShieldCheck className="h-5 w-5 text-emerald-500 mr-2" /> Step 2: Verification & Primary Recruiter Admin
              </h3>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs theme-text space-y-1">
                <div className="font-bold text-amber-600 dark:text-amber-400">Enterprise Verification Policy:</div>
                <div>Submitting a valid Tax ID / Business Registration number speeds up account verification to grant instant verified employer badges.</div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Tax Registration ID / EIN *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. US-889911223"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Primary Recruiter Admin Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Work Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                    <input
                      type="email"
                      required
                      placeholder="sarah.jenkins@company.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                  Create Admin Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 theme-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold theme-text border-b theme-border pb-3 flex items-center">
                <Sparkles className="h-5 w-5 text-indigo-500 mr-2" /> Step 3: Select Employer Subscription Package
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 'STARTER', title: 'Starter Company', price: '$99/mo', jobs: '3 Active Jobs', seats: '2 Seats' },
                  { id: 'PROFESSIONAL', title: 'Professional Growth', price: '$199/mo', jobs: '10 Active Jobs', seats: '5 Seats', popular: true },
                  { id: 'ENTERPRISE', title: 'Enterprise Scale', price: '$499/mo', jobs: 'Unlimited Jobs', seats: '20 Seats' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id as any)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
                      selectedPlan === p.id
                        ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/30'
                        : 'theme-border theme-surface hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-sm">
                        Most Popular
                      </span>
                    )}
                    <h4 className="font-bold text-sm theme-text">{p.title}</h4>
                    <div className="text-2xl font-black text-indigo-500 my-2">{p.price}</div>
                    <ul className="text-xs theme-muted space-y-1">
                      <li>✓ {p.jobs}</li>
                      <li>✓ {p.seats}</li>
                      <li>✓ Verified Badge Included</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Controls */}
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
              <span>{step === 3 ? 'Complete Company Onboarding' : 'Continue to Next Step'}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
