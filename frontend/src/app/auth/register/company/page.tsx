'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Headphones,
  ShieldCheck,
  Search,
  Zap,
  Users,
  BarChart3,
  Globe,
  Award,
  Check,
  X,
  FileText,
  HelpCircle,
  Briefcase,
  Star,
  Quote,
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

const INDUSTRY_OPTIONS = [
  'Software & Technology',
  'IT Services & Consulting',
  'Banking, Financial Services & Insurance (BFSI)',
  'FinTech & Payments',
  'E-Commerce & Internet',
  'Healthcare & Pharmaceuticals',
  'Manufacturing & Production',
  'Telecommunications',
  'Automotive & EV',
  'Education & EdTech',
  'Media, Entertainment & Advertising',
  'Retail & Consumer Goods',
  'Logistics & Supply Chain',
  'Real Estate & Construction',
  'Other / Emerging Sector',
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1 - 10 Employees (Startup / Seed)' },
  { value: '11-50', label: '11 - 50 Employees (Early Stage)' },
  { value: '51-200', label: '51 - 200 Employees (Growth / Scale-up)' },
  { value: '201-1000', label: '201 - 1000 Employees (Mid-Enterprise)' },
  { value: '1000+', label: '1000+ Employees (Global Enterprise)' },
];

const HIRING_VOLUME_OPTIONS = [
  '1 - 5 hires / month',
  '6 - 20 hires / month',
  '21 - 50 hires / month',
  '50+ hires / month (Enterprise & Bulk)',
];

function RecruiterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sdk, login, setUser } = useTheme();

  // Primary Tab: 'login' (Login / Sign up) or 'demo' (Request a Demo)
  const initialTab = searchParams.get('tab') === 'demo' ? 'demo' : 'login';
  const initialSubMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'demo'>(initialTab);
  const [subMode, setSubMode] = useState<'login' | 'signup'>(initialSubMode);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [companySize, setCompanySize] = useState('11-50');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [emailDomainWarning, setEmailDomainWarning] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Request Demo Form State
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoCompany, setDemoCompany] = useState('');
  const [demoHires, setDemoHires] = useState(HIRING_VOLUME_OPTIONS[1]);
  const [demoCity, setDemoCity] = useState('');
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  // Talk To Us Modal State
  const [isTalkToUsOpen, setIsTalkToUsOpen] = useState(false);
  const [talkName, setTalkName] = useState('');
  const [talkPhone, setTalkPhone] = useState('');
  const [talkCompany, setTalkCompany] = useState('');
  const [talkSubmitted, setTalkSubmitted] = useState(false);

  // Header Dropdown States
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);

  // Real-time Work Email Restriction Verification
  const handleWorkEmailBlur = async () => {
    if (!workEmail || !workEmail.includes('@')) {
      setEmailDomainWarning(null);
      return;
    }
    setIsValidatingEmail(true);
    try {
      const res = await sdk.checkEmailDomain(workEmail);
      if (res && res.restricted) {
        setEmailDomainWarning(
          res.message ||
            `Registration with email domain "@${res.domain}" is restricted for employers. Please use your corporate or company work email.`
        );
      } else {
        setEmailDomainWarning(null);
      }
    } catch {
      setEmailDomainWarning(null);
    } finally {
      setIsValidatingEmail(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier || !loginPassword) {
      setLoginError('Please enter both your username/email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const user = await login(loginIdentifier.trim(), loginPassword);
      if (user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'COMPANY_ADMIN' || user.role === 'RECRUITER') {
        router.push('/employer/dashboard');
      } else {
        router.push('/candidate/profile');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password. Please verify your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Employer Registration Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!fullName || !workEmail || !mobileNumber || !companyName || !signupPassword) {
      setSignupError('Please fill out all required fields.');
      return;
    }

    if (!agreedTerms) {
      setSignupError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // Verify corporate domain
    const domainCheck = await sdk.checkEmailDomain(workEmail);
    if (domainCheck?.restricted) {
      const msg =
        domainCheck.message ||
        `Registration with email domain "@${domainCheck.domain}" is prohibited. Please use an official company work email.`;
      setEmailDomainWarning(msg);
      setSignupError(msg);
      return;
    }

    setIsSigningUp(true);
    try {
      const res = await sdk.request<{ accessToken?: string; user?: any; tenant?: any }>('/auth/register/company', {
        method: 'POST',
        body: JSON.stringify({
          adminName: fullName.trim(),
          adminEmail: workEmail.toLowerCase().trim(),
          adminPassword: signupPassword,
          phoneNumber: mobileNumber.trim(),
          phone: mobileNumber.trim(),
          companyName: companyName.trim(),
          industry,
          companySize,
          selectedPlan: 'PROFESSIONAL',
        }),
      });

      if (res?.accessToken) {
        sdk.setToken(res.accessToken);
        if (res.user) setUser(res.user);
      }

      setSignupSuccess(true);
      setTimeout(() => {
        router.push('/employer/dashboard');
      }, 2500);
    } catch (err: any) {
      setSignupError(err.message || 'Failed to complete recruiter registration. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle Request a Demo Submit
  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoError(null);

    if (!demoName || !demoEmail || !demoCompany) {
      setDemoError('Please provide your name, official work email, and company name.');
      return;
    }

    setIsSubmittingDemo(true);
    try {
      await sdk.requestDemo({
        name: demoName.trim(),
        email: demoEmail.toLowerCase().trim(),
        phone: demoPhone.trim(),
        companyName: demoCompany.trim(),
        hiresCount: demoHires,
        city: demoCity.trim(),
      });
      setDemoSuccess(true);
    } catch (err: any) {
      setDemoError(err.message || 'Unable to schedule demo at this time. Please call our toll-free number.');
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  // Handle Quick Talk To Us Submission
  const handleTalkToUsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talkName || !talkPhone) return;
    try {
      await sdk.requestDemo({
        name: talkName,
        phone: talkPhone,
        companyName: talkCompany || 'Inquiry via Talk to Us',
        email: 'sales-callback@camzyjobs.com',
      });
    } catch {
      // ignore
    }
    setTalkSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#5e17eb]/20 selection:text-[#5e17eb]">
      {/* ----------------- FOUNDIT RECRUITER TOP NAVIGATION BAR ----------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:opacity-90 transition-opacity">
                  <span className="text-[#5e17eb]">camzy</span>jobs
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#5e17eb]/10 text-[#5e17eb] border border-[#5e17eb]/20">
                  Recruiter
                </span>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-slate-600">
                {/* Product Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setProductDropdownOpen(true)}
                  onMouseLeave={() => setProductDropdownOpen(false)}
                >
                  <button className="flex items-center space-x-1 hover:text-[#5e17eb] py-2 transition-colors">
                    <span>Product</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {productDropdownOpen && (
                    <div className="absolute left-0 top-full w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-3 px-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <a href="#features" className="flex items-start p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <Search className="w-5 h-5 text-[#5e17eb] mr-3 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">AI Smart Talent Search</div>
                          <div className="text-xs text-slate-500">Semantic resume search across 10M+ candidates</div>
                        </div>
                      </a>
                      <a href="#features" className="flex items-start p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <Zap className="w-5 h-5 text-[#5e17eb] mr-3 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Instant Job Posting</div>
                          <div className="text-xs text-slate-500">Publish in 60s with pre-qualifying screening</div>
                        </div>
                      </a>
                      <a href="#features" className="flex items-start p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <Users className="w-5 h-5 text-[#5e17eb] mr-3 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Recruiter ATS & Kanban</div>
                          <div className="text-xs text-slate-500">Collaborate with hiring managers seamlessly</div>
                        </div>
                      </a>
                      <a href="#features" className="flex items-start p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <Award className="w-5 h-5 text-[#5e17eb] mr-3 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Automated Skill Assessment</div>
                          <div className="text-xs text-slate-500">Standardized tech and aptitude scorecards</div>
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {/* Resource Center Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setResourcesDropdownOpen(true)}
                  onMouseLeave={() => setResourcesDropdownOpen(false)}
                >
                  <button className="flex items-center space-x-1 hover:text-[#5e17eb] py-2 transition-colors">
                    <span>Resource Center</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {resourcesDropdownOpen && (
                    <div className="absolute left-0 top-full w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-3 px-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <Link href="/blogs" className="block p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <div className="font-bold text-slate-900 text-sm">India Salary Guide 2026</div>
                        <div className="text-xs text-slate-500">Compensation benchmarks by role & city</div>
                      </Link>
                      <Link href="/blogs" className="block p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <div className="font-bold text-slate-900 text-sm">Hiring Trends Report</div>
                        <div className="text-xs text-slate-500">Tech and AI hiring outlook for enterprises</div>
                      </Link>
                      <a href="#faq" className="block p-2 rounded-lg hover:bg-purple-50/60 transition-colors">
                        <div className="font-bold text-slate-900 text-sm">Employer Knowledgebase</div>
                        <div className="text-xs text-slate-500">Guides for job posting & screening</div>
                      </a>
                    </div>
                  )}
                </div>

                <button onClick={() => setIsTalkToUsOpen(true)} className="hover:text-[#5e17eb] transition-colors">
                  Help
                </button>
                <a href="#testimonials" className="hover:text-[#5e17eb] transition-colors">
                  Testimonials
                </a>
                <a href="#assessment" className="hover:text-[#5e17eb] transition-colors">
                  Skill Assessment
                </a>
              </nav>
            </div>

            {/* Right Navigation & Toll Free */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Job Seeker Login Link */}
              <Link
                href="/auth/login"
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-[#5e17eb] flex items-center space-x-1 transition-colors"
              >
                <span>Job Seeker Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Toll Free Badge */}
              <a
                href="tel:18004196666"
                className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-slate-800 hover:text-[#5e17eb] bg-slate-50 hover:bg-purple-50/50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#5e17eb]" />
                <span>Toll Free: 1800-419-6666</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- HERO SECTION (FOUNDIT SPLIT HERO) ----------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#faf7ff] via-[#fffbfd] to-[#f4f0ff] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-purple-100/50">
        {/* Subtle decorative purple glow background circles */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-[#5e17eb] font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>India&apos;s #1 AI-Driven Hiring Platform</span>
              </div>

              {/* Foundit Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#5e17eb] tracking-tight leading-[1.12]">
                Unlock India&apos;s Largest <br />
                <span className="text-slate-900">Talent Network</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-slate-700 font-medium max-w-xl leading-relaxed">
                Find the right talent with AI powered search.
              </p>

              {/* Foundit 'Talk to Us' Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsTalkToUsOpen(true)}
                  className="px-8 py-3 rounded-xl border-2 border-[#5e17eb] text-[#5e17eb] bg-white font-extrabold text-base hover:bg-[#5e17eb] hover:text-white transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Talk to Us
                </button>
              </div>

              {/* Trust badges row */}
              <div className="pt-6 border-t border-purple-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-slate-900">10M+</div>
                  <div className="text-xs font-semibold text-slate-500">Active Jobseekers</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-[#5e17eb]">50,000+</div>
                  <div className="text-xs font-semibold text-slate-500">Hiring Companies</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-slate-900">98%</div>
                  <div className="text-xs font-semibold text-slate-500">AI Semantic Match</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-[#5e17eb]">4x</div>
                  <div className="text-xs font-semibold text-slate-500">Faster Time-to-Hire</div>
                </div>
              </div>
            </div>

            {/* HERO RIGHT COLUMN: FOUNDIT FLOATING CARD */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl border border-purple-100/70 overflow-hidden transition-all duration-300 hover:shadow-purple-500/10">
                {/* Card Top Tabs: 'Login/Sign up' and 'Request a Demo' */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition-all relative ${
                      activeTab === 'login'
                        ? 'text-[#5e17eb] bg-white border-b-2 border-[#5e17eb]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    Login/Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('demo')}
                    className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition-all relative ${
                      activeTab === 'demo'
                        ? 'text-[#5e17eb] bg-white border-b-2 border-[#5e17eb]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    Request a Demo
                  </button>
                </div>

                <div className="p-6 sm:p-8">
                  {/* ================= TAB 1: LOGIN / SIGN UP ================= */}
                  {activeTab === 'login' && (
                    <>
                      {/* Sub-mode: LOGIN (Matches Screenshot) */}
                      {subMode === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                          {loginError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{loginError}</span>
                            </div>
                          )}

                          {/* Username Input */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Username
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                placeholder="Enter Username or official email"
                                required
                                className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                              />
                            </div>
                          </div>

                          {/* Password Input */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full px-3.5 py-3 pr-10 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                              >
                                {showLoginPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Forgot Password Link */}
                          <div className="flex justify-end">
                            <Link
                              href="/auth/login"
                              className="text-xs font-semibold text-[#5e17eb] hover:underline"
                            >
                              Forgot Password?
                            </Link>
                          </div>

                          {/* Login Button */}
                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-3.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 active:scale-98 cursor-pointer"
                          >
                            {isLoggingIn ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>Login</span>
                            )}
                          </button>

                          {/* Toggle to Sign Up */}
                          <div className="text-center pt-3 text-xs sm:text-sm text-slate-600">
                            New User?{' '}
                            <button
                              type="button"
                              onClick={() => setSubMode('signup')}
                              className="font-extrabold text-[#5e17eb] hover:underline cursor-pointer"
                            >
                              Sign Up
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Sub-mode: SIGN UP (Employer Registration) */}
                      {subMode === 'signup' && (
                        <div>
                          {signupSuccess ? (
                            <div className="text-center py-8 space-y-4">
                              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                              </div>
                              <h3 className="text-xl font-black text-slate-900">
                                Welcome to CamzyJobs Recruiter!
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                                Your employer profile has been created successfully. Redirecting you to your recruiter workspace...
                              </p>
                              <div className="w-6 h-6 border-2 border-[#5e17eb]/30 border-t-[#5e17eb] rounded-full animate-spin mx-auto" />
                            </div>
                          ) : (
                            <form onSubmit={handleSignupSubmit} className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                              <div className="pb-1 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-[#5e17eb] tracking-wide">
                                  Employer Registration
                                </span>
                                <span className="text-[11px] text-slate-400">Step 1 of 1</span>
                              </div>

                              {signupError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>{signupError}</span>
                                </div>
                              )}

                              {/* Recruiter Full Name */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                  Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Priya Sharma"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                                  />
                                </div>
                              </div>

                              {/* Official Work Email */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="block text-xs font-bold text-slate-700">
                                    Official Work Email <span className="text-red-500">*</span>
                                  </label>
                                  <span className="text-[10px] text-slate-500">Corporate domain only</span>
                                </div>
                                <div className="relative">
                                  <input
                                    type="email"
                                    value={workEmail}
                                    onChange={(e) => {
                                      setWorkEmail(e.target.value);
                                      if (emailDomainWarning) setEmailDomainWarning(null);
                                    }}
                                    onBlur={handleWorkEmailBlur}
                                    placeholder="name@company.com"
                                    required
                                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                      emailDomainWarning
                                        ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200 bg-amber-50/20'
                                        : 'border-slate-200 focus:border-[#5e17eb] focus:ring-[#5e17eb]/20'
                                    }`}
                                  />
                                  {isValidatingEmail && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      <div className="w-4 h-4 border-2 border-[#5e17eb]/30 border-t-[#5e17eb] rounded-full animate-spin" />
                                    </div>
                                  )}
                                </div>
                                {emailDomainWarning && (
                                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start space-x-1.5 leading-snug">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span>{emailDomainWarning}</span>
                                  </div>
                                )}
                              </div>

                              {/* Mobile Number (+91) */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                  Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#5e17eb]/20 focus-within:border-[#5e17eb]">
                                  <span className="inline-flex items-center px-3 bg-slate-50 text-slate-600 font-bold text-xs border-r border-slate-200">
                                    🇮🇳 +91
                                  </span>
                                  <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="98765 43210"
                                    required
                                    className="flex-1 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Company Name */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                  Company / Organization Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={companyName}
                                  onChange={(e) => setCompanyName(e.target.value)}
                                  placeholder="e.g. Acme Technologies Pvt Ltd"
                                  required
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                                />
                              </div>

                              {/* Password */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                  Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type={showSignupPassword ? 'text' : 'password'}
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    placeholder="Min 8 chars with numbers"
                                    required
                                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                  >
                                    {showSignupPassword ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Industry & Company Size Grid */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="block text-xs font-bold text-slate-700">Industry</label>
                                  <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#5e17eb] bg-white"
                                  >
                                    {INDUSTRY_OPTIONS.map((ind) => (
                                      <option key={ind} value={ind}>
                                        {ind}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-xs font-bold text-slate-700">Company Size</label>
                                  <select
                                    value={companySize}
                                    onChange={(e) => setCompanySize(e.target.value)}
                                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#5e17eb] bg-white"
                                  >
                                    {COMPANY_SIZE_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Terms Agreement */}
                              <div className="flex items-start space-x-2 pt-1">
                                <input
                                  type="checkbox"
                                  id="termsCheckbox"
                                  checked={agreedTerms}
                                  onChange={(e) => setAgreedTerms(e.target.checked)}
                                  className="mt-0.5 rounded text-[#5e17eb] focus:ring-[#5e17eb]"
                                />
                                <label htmlFor="termsCheckbox" className="text-[11px] text-slate-600 leading-tight">
                                  I agree to the{' '}
                                  <Link href="/about" className="text-[#5e17eb] font-semibold hover:underline">
                                    Terms of Use
                                  </Link>{' '}
                                  and confirm I am hiring on behalf of this company.
                                </label>
                              </div>

                              {/* Submit Button */}
                              <button
                                type="submit"
                                disabled={isSigningUp}
                                className="w-full py-3 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-extrabold text-sm shadow-md hover:shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                              >
                                {isSigningUp ? (
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <span>Create Employer Account</span>
                                )}
                              </button>

                              {/* Switch to Login */}
                              <div className="text-center pt-2 text-xs text-slate-600">
                                Already registered?{' '}
                                <button
                                  type="button"
                                  onClick={() => setSubMode('login')}
                                  className="font-extrabold text-[#5e17eb] hover:underline cursor-pointer"
                                >
                                  Login
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* ================= TAB 2: REQUEST A DEMO ================= */}
                  {activeTab === 'demo' && (
                    <div>
                      {demoSuccess ? (
                        <div className="text-center py-8 space-y-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10" />
                          </div>
                          <h3 className="text-xl font-black text-slate-900">Demo Scheduled!</h3>
                          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                            Thank you for reaching out. An Enterprise Hiring Specialist will connect with you within 2 business hours.
                          </p>
                          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium">
                            Need immediate assistance? Call our toll-free sales desk at <span className="font-bold">1800-419-6666</span>.
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDemoSuccess(false);
                              setActiveTab('login');
                            }}
                            className="text-xs font-bold text-[#5e17eb] hover:underline"
                          >
                            Return to Login
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                          <div className="pb-1 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-700">
                              Schedule a live personalized walkthrough for your hiring team
                            </p>
                          </div>

                          {demoError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{demoError}</span>
                            </div>
                          )}

                          {/* Demo Contact Name */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Your Full Name</label>
                            <input
                              type="text"
                              value={demoName}
                              onChange={(e) => setDemoName(e.target.value)}
                              placeholder="e.g. Rahul Verma"
                              required
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                            />
                          </div>

                          {/* Work Email */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Official Work Email</label>
                            <input
                              type="email"
                              value={demoEmail}
                              onChange={(e) => setDemoEmail(e.target.value)}
                              placeholder="name@company.com"
                              required
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]/20 focus:border-[#5e17eb] transition-all"
                            />
                          </div>

                          {/* Mobile & Company Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                              <input
                                type="tel"
                                value={demoPhone}
                                onChange={(e) => setDemoPhone(e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700">Company Name</label>
                              <input
                                type="text"
                                value={demoCompany}
                                onChange={(e) => setDemoCompany(e.target.value)}
                                placeholder="e.g. Infosys / Startup"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                              />
                            </div>
                          </div>

                          {/* Monthly Hires Needed & City */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700">Hiring Volume</label>
                              <select
                                value={demoHires}
                                onChange={(e) => setDemoHires(e.target.value)}
                                className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#5e17eb] bg-white"
                              >
                                {HIRING_VOLUME_OPTIONS.map((vol) => (
                                  <option key={vol} value={vol}>
                                    {vol}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700">City / Location</label>
                              <input
                                type="text"
                                value={demoCity}
                                onChange={(e) => setDemoCity(e.target.value)}
                                placeholder="e.g. Bengaluru"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                              />
                            </div>
                          </div>

                          {/* Submit Demo Button */}
                          <button
                            type="submit"
                            disabled={isSubmittingDemo}
                            className="w-full py-3.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-extrabold text-sm shadow-md hover:shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                          >
                            {isSubmittingDemo ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>Schedule a Live Demo</span>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- CLIENT LOGOS STRIP ----------------- */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Trusted by 50,000+ Enterprises & Fast-Growing Startups Across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            {[
              'Tata Consultancy Services',
              'Infosys Technologies',
              'Wipro Digital',
              'HDFC Bank',
              'Reliance Retail',
              'Zomato & Blinkit',
              'Swiggy',
              'Razorpay',
            ].map((brand) => (
              <span key={brand} className="text-base sm:text-lg font-black tracking-tight text-slate-700 hover:text-[#5e17eb] transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- CORE PRODUCT PILLARS ----------------- */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#5e17eb] bg-purple-100/70 px-3 py-1 rounded-full">
              Why Leading Recruiters Choose CamzyJobs
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything You Need to Hire Top Indian Talent
            </h2>
            <p className="text-base text-slate-600">
              Cut sourcing time from weeks to minutes with deep semantic AI candidate discovery and collaborative ATS workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-[#5e17eb] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Semantic Talent Discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search resumes using natural conversation. Match by contextual skills, proven project experience, notice periods, and compensation expectations.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Deep contextual resume parsing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Filtered by active notice period & CTC</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-[#5e17eb] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">High-Velocity Job Posting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Publish openings in 60 seconds. Broadcast to 10M+ job seekers with automated pre-screening questions that eliminate unqualified applicants.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Instant multi-channel distribution</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Custom knockout questions & scoring</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-[#5e17eb] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Recruiter Collaboration & ATS</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visual Kanban pipelines to move candidates from Applied to Screened, Interview, Offered, and Hired. Share notes and evaluate with hiring managers.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Drag-and-drop recruitment stages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Interview scheduling & feedback sync</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- STATS STRIP ----------------- */}
      <section className="py-14 bg-[#5e17eb] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="pt-4 lg:pt-0">
              <div className="text-4xl sm:text-5xl font-black">10M+</div>
              <div className="mt-1 text-sm text-purple-200 font-medium">Verified Active Jobseekers</div>
            </div>
            <div className="pt-4 lg:pt-0">
              <div className="text-4xl sm:text-5xl font-black">50,000+</div>
              <div className="mt-1 text-sm text-purple-200 font-medium">Verified Companies Hiring</div>
            </div>
            <div className="pt-4 lg:pt-0">
              <div className="text-4xl sm:text-5xl font-black">85%</div>
              <div className="mt-1 text-sm text-purple-200 font-medium">Applications within 24 Hours</div>
            </div>
            <div className="pt-4 lg:pt-0">
              <div className="text-4xl sm:text-5xl font-black">99.8%</div>
              <div className="mt-1 text-sm text-purple-200 font-medium">Recruiter Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS SECTION ----------------- */}
      <section id="testimonials" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#5e17eb]">
              Recruiter Stories
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Loved by Talent Acquisition Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
              <div className="flex text-amber-400 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;We closed 18 critical full-stack engineering roles in just 3 weeks. The AI semantic match cut out 90% of resume noise.&rdquo;
              </p>
              <div className="pt-2 border-t border-purple-100">
                <div className="font-bold text-slate-900 text-sm">Sunil Mehta</div>
                <div className="text-xs text-slate-500">VP Talent Acquisition, CloudScale Technologies</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
              <div className="flex text-amber-400 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;Foundit-style simplicity combined with cutting-edge AI filters. Easily the most reliable candidate sourcing engine in India.&rdquo;
              </p>
              <div className="pt-2 border-t border-purple-100">
                <div className="font-bold text-slate-900 text-sm">Ananya Sen</div>
                <div className="text-xs text-slate-500">Head of HR, FinPay Global</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
              <div className="flex text-amber-400 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;Direct toll-free concierge support and instant candidate verification make our campus and lateral recruitment completely painless.&rdquo;
              </p>
              <div className="pt-2 border-t border-purple-100">
                <div className="font-bold text-slate-900 text-sm">Karthik Narayanan</div>
                <div className="text-xs text-slate-500">Staffing Director, Apex Mobility</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- RECRUITER FAQ ----------------- */}
      <section id="faq" className="py-16 sm:py-20 bg-slate-50/80 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions by Employers
            </h2>
            <p className="text-sm text-slate-600">
              Have questions about signing up or enterprise plans?
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Why do I need an official work email to register as an employer?',
                a: 'To maintain the highest quality of hiring for job seekers and prevent spam, we require employers to verify registration using their corporate domain (e.g. name@company.com). Free email providers like Gmail or Yahoo are restricted for employer registration.',
              },
              {
                q: 'How fast can I start posting jobs after registering?',
                a: 'Immediately! Once you complete your registration, you gain instant access to the recruiter dashboard where you can post your first job opening within 60 seconds.',
              },
              {
                q: 'What is included in the Free Employer Trial?',
                a: 'Your trial includes active job listings, access to candidate applicants, AI semantic keyword searches, and collaborative recruiter ATS Kanban boards.',
              },
              {
                q: 'How can I schedule a personalized live demo?',
                a: 'Simply switch to the "Request a Demo" tab on the form above or call our toll-free enterprise hotline at 1800-419-6666 to speak with a solutions expert.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between">
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- TALK TO US MODAL ----------------- */}
      {isTalkToUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            <button
              onClick={() => {
                setIsTalkToUsOpen(false);
                setTalkSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5e17eb] text-xs font-bold">
                  <Headphones className="w-3.5 h-3.5 mr-1" /> Enterprise Sales Desk
                </div>
                <h3 className="text-xl font-black text-slate-900">Talk to a Hiring Specialist</h3>
                <p className="text-xs text-slate-600">
                  Connect instantly with our dedicated corporate account managers.
                </p>
              </div>

              {talkSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900">Callback Requested!</h4>
                  <p className="text-xs text-slate-600">
                    Our team will call you back within 15 minutes during business hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsTalkToUsOpen(false);
                      setTalkSubmitted(false);
                    }}
                    className="mt-2 text-xs font-bold text-[#5e17eb] hover:underline"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  {/* Direct Contact Options */}
                  <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                      <Phone className="w-4 h-4 text-[#5e17eb]" />
                      <span>Toll Free Sales Helpline:</span>
                      <a href="tel:18004196666" className="text-[#5e17eb] hover:underline">
                        1800-419-6666
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                      <Mail className="w-4 h-4 text-[#5e17eb]" />
                      <span>Corporate Email:</span>
                      <a href="mailto:sales@camzyjobs.com" className="text-[#5e17eb] hover:underline">
                        sales@camzyjobs.com
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Operating Hours: Monday – Saturday, 9:00 AM – 8:00 PM IST
                    </div>
                  </div>

                  {/* Callback Request Form */}
                  <form onSubmit={handleTalkToUsSubmit} className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-700">Or Request an Instant Callback:</div>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={talkName}
                      onChange={(e) => setTalkName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#5e17eb]"
                    />
                    <input
                      type="tel"
                      placeholder="Your Mobile Number (+91)"
                      value={talkPhone}
                      onChange={(e) => setTalkPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#5e17eb]"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={talkCompany}
                      onChange={(e) => setTalkCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#5e17eb]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Request Callback
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- RECRUITER FOOTER ----------------- */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-white">
                <span className="text-[#a78bfa]">camzy</span>jobs
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Recruiter Portal
              </span>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <a href="tel:18004196666" className="text-white hover:text-purple-300 font-bold flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>1800-419-6666 (Toll Free)</span>
              </a>
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Candidate Login
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                Privacy & Terms
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              &copy; {new Date().getFullYear()} CamzyJobs Inc. All rights reserved. Enterprise talent solutions platform.
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISO 27001 Certified & SOC-2 Compliant</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RecruiterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-[#5e17eb] rounded-full animate-spin" />
        </div>
      }
    >
      <RecruiterContent />
    </Suspense>
  );
}
