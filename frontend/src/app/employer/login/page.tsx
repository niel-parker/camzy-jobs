'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  Menu,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

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

function EmployerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { sdk, login, setUser } = useTheme();

  // Primary Tab: 'login' (Login / Sign up) or 'demo' (Request a Demo)
  const initialTab = searchParams.get('tab') === 'demo' ? 'demo' : 'login';
  const isRegisterRoute = pathname?.includes('register');
  const initialSubMode = searchParams.get('mode') === 'signup' || (isRegisterRoute && searchParams.get('mode') !== 'login') ? 'signup' : 'login';

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

  // Mandatory Dual Verification State for Registration
  const [signupStep, setSignupStep] = useState<'FORM' | 'VERIFY'>('FORM');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [demoEmailOtp, setDemoEmailOtp] = useState<string | null>(null);
  const [demoMobileOtp, setDemoMobileOtp] = useState<string | null>(null);
  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [isSendingOtps, setIsSendingOtps] = useState(false);
  const [otpVerifyError, setOtpVerifyError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [demoForgotOtp, setDemoForgotOtp] = useState<string | null>(null);

  // Countdown Timers
  useEffect(() => {
    let t: any = null;
    if (emailTimer > 0 || mobileTimer > 0) {
      t = setInterval(() => {
        setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setMobileTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [emailTimer, mobileTimer]);

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
    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter both your username and password.');
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

  // Step 1: Validate details & dispatch Email + Mobile OTPs
  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setOtpVerifyError(null);

    if (!companyName.trim()) {
      setSignupError('Company / Organization Name is required.');
      return;
    }
    if (!fullName.trim()) {
      setSignupError('Owner / Contact Person Full Name is required.');
      return;
    }
    if (!workEmail.trim()) {
      setSignupError('Official Work Email is required.');
      return;
    }
    if (!mobileNumber.trim()) {
      setSignupError('Mobile Number is required.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (!agreedTerms) {
      setSignupError('Please accept the Terms of Service to continue.');
      return;
    }

    // Verify corporate domain restriction
    const domainCheck = await sdk.checkEmailDomain(workEmail);
    if (domainCheck?.restricted) {
      const msg =
        domainCheck.message ||
        `Registration with email domain "@${domainCheck.domain}" is prohibited. Please use an official company work email.`;
      setEmailDomainWarning(msg);
      setSignupError(msg);
      return;
    }

    setIsSendingOtps(true);
    try {
      const emailPromise = sdk.requestOtp(workEmail.toLowerCase().trim());
      const phonePromise = sdk.requestOtp(mobileNumber.trim());
      const [emailRes, phoneRes] = await Promise.all([emailPromise, phonePromise]);

      if (emailRes.otpCode) setDemoEmailOtp(emailRes.otpCode);
      if (phoneRes.otpCode) setDemoMobileOtp(phoneRes.otpCode);

      setEmailTimer(180);
      setMobileTimer(180);
      setSignupStep('VERIFY');
    } catch (err: any) {
      setSignupError(err.message || 'Failed to dispatch verification OTP codes. Please check email and mobile.');
    } finally {
      setIsSendingOtps(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailTimer > 0) return;
    try {
      const res = await sdk.requestOtp(workEmail.toLowerCase().trim());
      setEmailTimer(180);
      if (res.otpCode) setDemoEmailOtp(res.otpCode);
    } catch (err: any) {
      setOtpVerifyError(err.message || 'Failed to resend Email OTP.');
    }
  };

  const handleResendMobileOtp = async () => {
    if (mobileTimer > 0) return;
    try {
      const res = await sdk.requestOtp(mobileNumber.trim());
      setMobileTimer(180);
      if (res.otpCode) setDemoMobileOtp(res.otpCode);
    } catch (err: any) {
      setOtpVerifyError(err.message || 'Failed to resend Mobile OTP.');
    }
  };

  // Step 2: Final Registration - Profile is ONLY created if both email & mobile OTPs are verified
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpVerifyError(null);

    if (!emailOtp.trim()) {
      setOtpVerifyError('Please enter the 6-digit verification code sent to your company email.');
      return;
    }
    if (!mobileOtp.trim()) {
      setOtpVerifyError('Please enter the 6-digit verification code sent to your mobile number.');
      return;
    }

    setIsSigningUp(true);
    try {
      const res = await sdk.request<{ accessToken?: string; user?: any; tenant?: any }>('/auth/register/company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: companyName.trim(),
          adminName: fullName.trim(),
          adminEmail: workEmail.toLowerCase().trim(),
          phoneNumber: mobileNumber.trim(),
          phone: mobileNumber.trim(),
          adminPassword: signupPassword,
          emailOtp: emailOtp.trim(),
          phoneOtp: mobileOtp.trim(),
          mobileOtp: mobileOtp.trim(),
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
      }, 2000);
    } catch (err: any) {
      setOtpVerifyError(err.message || 'Verification failed. Please verify that both OTP codes are correct.');
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
      setDemoError(err.message || 'Failed to submit demo request. Please try again.');
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  // Handle Forgot Password Request OTP
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMsg(null);
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await sdk.requestOtp(forgotEmail.toLowerCase().trim());
      if (res.otpCode) setDemoForgotOtp(res.otpCode);
      setForgotStep('VERIFY');
      setForgotMsg('Verification code sent to your registered email.');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send password reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Forgot Password Reset
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotOtp.trim() || !forgotNewPassword) {
      setForgotError('Please enter both the OTP and your new password.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    setForgotLoading(true);
    try {
      await sdk.verifyOtp(forgotEmail.toLowerCase().trim(), forgotOtp.trim());
      setForgotMsg('Password verified! You can now log in with your updated credentials.');
      setTimeout(() => {
        setIsForgotPasswordOpen(false);
        setForgotStep('REQUEST');
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPassword('');
      }, 1500);
    } catch (err: any) {
      setForgotError(err.message || 'Invalid reset OTP code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#5e17eb] selection:text-white">
      {/* ----------------- HERO SECTION (EMPLOYER / RECRUITER PORTAL) ----------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#faf7ff] via-[#fffbfd] to-[#f4f0ff] pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-purple-100/50">
        {/* Soft decorative background shape on the right */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-100/40 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Recruiter Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#5e17eb] tracking-tight leading-[1.15]">
                Unlock India&apos;s Largest <br />
                Talent Network
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-slate-900 font-bold max-w-xl leading-relaxed">
                Find the right talent with AI powered search.
              </p>

              {/* 'Talk to Us' Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsTalkToUsOpen(true)}
                  className="px-6 py-2.5 rounded-lg border border-[#5e17eb] text-[#5e17eb] bg-white font-bold text-sm sm:text-base hover:bg-[#5e17eb] hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  Talk to Us
                </button>
              </div>
            </div>

            {/* HERO RIGHT COLUMN: EMPLOYER LOGIN CARD */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-full max-w-md mx-auto lg:ml-auto">
                {/* Card Top Tabs: 'Login/Sign up' and 'Request a Demo' */}
                <div className="flex border-b border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3.5 text-center font-bold text-sm transition-all relative cursor-pointer ${
                      activeTab === 'login'
                        ? 'text-[#5e17eb] border-b-2 border-[#5e17eb]'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Login/Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('demo')}
                    className={`flex-1 py-3.5 text-center font-bold text-sm transition-all relative cursor-pointer ${
                      activeTab === 'demo'
                        ? 'text-[#5e17eb] border-b-2 border-[#5e17eb]'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Request a Demo
                  </button>
                </div>

                <div className="p-6 sm:p-7">
                  {/* ================= TAB 1: LOGIN / SIGN UP ================= */}
                  {activeTab === 'login' && (
                    <>
                      {/* Sub-mode: LOGIN (Matches Screenshot Exactly) */}
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
                            <label className="block text-xs font-semibold text-slate-800">
                              Username
                            </label>
                            <input
                              type="text"
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              placeholder="Enter Username"
                              required
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb] focus:ring-1 focus:ring-[#5e17eb] transition-all"
                            />
                          </div>

                          {/* Password Input */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-800">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb] focus:ring-1 focus:ring-[#5e17eb] transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                            <button
                              type="button"
                              onClick={() => setIsForgotPasswordOpen(true)}
                              className="text-xs font-semibold text-[#5e17eb] hover:underline cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>

                          {/* Login Button (Purple) */}
                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-3 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                          >
                            {isLoggingIn ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>Login</span>
                            )}
                          </button>

                          {/* Toggle to Sign Up */}
                          <div className="text-center pt-3 text-xs sm:text-sm text-slate-700">
                            New User?{' '}
                            <button
                              type="button"
                              onClick={() => setSubMode('signup')}
                              className="font-bold text-[#5e17eb] hover:underline cursor-pointer ml-0.5"
                            >
                              Sign Up
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Sub-mode: SIGN UP (Employer Registration with Mandatory Dual Verification) */}
                      {subMode === 'signup' && (
                        <div>
                          {signupSuccess ? (
                            <div className="text-center py-6 space-y-4">
                              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900">
                                Welcome to Camzy Recruiter!
                              </h3>
                              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                Company email and mobile verified. Redirecting you to your recruiter dashboard...
                              </p>
                              <div className="w-5 h-5 border-2 border-[#5e17eb]/30 border-t-[#5e17eb] rounded-full animate-spin mx-auto" />
                            </div>
                          ) : signupStep === 'FORM' ? (
                            <form onSubmit={handleProceedToVerification} className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                              <div className="pb-1 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-[#5e17eb] tracking-wide">
                                  Employer Registration
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">Step 1 of 2: Details</span>
                              </div>

                              {signupError && (
                                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>{signupError}</span>
                                </div>
                              )}

                              {/* Company Name */}
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                  Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={companyName}
                                  onChange={(e) => setCompanyName(e.target.value)}
                                  placeholder="e.g. Acme Technologies Pvt Ltd"
                                  required
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                                />
                              </div>

                              {/* Owner / Authorized Person Name */}
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                  Owner / Contact Person Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  placeholder="e.g. Rajesh Kumar"
                                  required
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                                />
                              </div>

                              {/* Official Work Email */}
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                  Company Work Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="email"
                                  value={workEmail}
                                  onChange={(e) => setWorkEmail(e.target.value)}
                                  onBlur={handleWorkEmailBlur}
                                  placeholder="name@company.com"
                                  required
                                  className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                                    emailDomainWarning
                                      ? 'border-amber-400 bg-amber-50/30'
                                      : 'border-slate-300 focus:border-[#5e17eb]'
                                  }`}
                                />
                                {emailDomainWarning && (
                                  <p className="text-[11px] text-amber-700 font-medium">{emailDomainWarning}</p>
                                )}
                              </div>

                              {/* Mobile Number */}
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                  Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex">
                                  <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-xs font-bold rounded-l-lg">
                                    +91
                                  </span>
                                  <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="9876543210"
                                    required
                                    className="w-full px-3 py-2 rounded-r-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                                  />
                                </div>
                              </div>

                              {/* Password */}
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                  Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type={showSignupPassword ? 'text' : 'password'}
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5e17eb]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                                  >
                                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
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
                                  I agree to CamzyJobs Employer Terms of Service and Privacy Policy.
                                </label>
                              </div>

                              {/* Proceed Button */}
                              <button
                                type="submit"
                                disabled={isSendingOtps}
                                className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                              >
                                {isSendingOtps ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <span>Proceed to Verification</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>

                              {/* Switch to Login */}
                              <div className="text-center pt-2 text-xs text-slate-600">
                                Already have an account?{' '}
                                <button
                                  type="button"
                                  onClick={() => setSubMode('login')}
                                  className="font-bold text-[#5e17eb] hover:underline cursor-pointer"
                                >
                                  Login
                                </button>
                              </div>
                            </form>
                          ) : (
                            /* Step 2: Mandatory Dual OTP Verification Screen */
                            <form onSubmit={handleFinalRegister} className="space-y-4">
                              <div className="pb-1 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-[#5e17eb] tracking-wide">
                                  Account Verification
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">Step 2 of 2: OTP</span>
                              </div>

                              <div className="p-3 bg-purple-50/70 rounded-lg text-xs text-purple-900 border border-purple-100 leading-relaxed">
                                Enter the 6-digit OTP codes sent to your email and mobile. Your account will only be activated after both are verified.
                              </div>

                              {otpVerifyError && (
                                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>{otpVerifyError}</span>
                                </div>
                              )}

                              {/* Email OTP Input */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-700">Email OTP ({workEmail})</span>
                                  {emailTimer > 0 ? (
                                    <span className="text-slate-400 font-mono text-[11px]">{emailTimer}s</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleResendEmailOtp}
                                      className="text-[#5e17eb] font-bold text-[11px] hover:underline"
                                    >
                                      Resend
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={emailOtp}
                                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                  placeholder="6-digit Email OTP"
                                  className="w-full px-3 py-2 text-center font-mono tracking-widest text-lg rounded-lg border border-slate-300 focus:outline-none focus:border-[#5e17eb]"
                                />
                                {demoEmailOtp && (
                                  <div className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                    Demo Code: <strong>{demoEmailOtp}</strong>
                                  </div>
                                )}
                              </div>

                              {/* Mobile OTP Input */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-700">Mobile OTP (+91 {mobileNumber})</span>
                                  {mobileTimer > 0 ? (
                                    <span className="text-slate-400 font-mono text-[11px]">{mobileTimer}s</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleResendMobileOtp}
                                      className="text-[#5e17eb] font-bold text-[11px] hover:underline"
                                    >
                                      Resend
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={mobileOtp}
                                  onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                                  placeholder="6-digit Mobile OTP"
                                  className="w-full px-3 py-2 text-center font-mono tracking-widest text-lg rounded-lg border border-slate-300 focus:outline-none focus:border-[#5e17eb]"
                                />
                                {demoMobileOtp && (
                                  <div className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                    Demo Code: <strong>{demoMobileOtp}</strong>
                                  </div>
                                )}
                              </div>

                              {/* Submit Button */}
                              <button
                                type="submit"
                                disabled={isSigningUp}
                                className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                              >
                                {isSigningUp ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <span>Verify &amp; Activate Account</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setSignupStep('FORM')}
                                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium"
                              >
                                &larr; Back to edit details
                              </button>
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
                        <div className="text-center py-6 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Demo Request Received</h4>
                          <p className="text-xs text-slate-600">
                            Our enterprise hiring specialist will connect with you within 2 business hours.
                          </p>
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
                        <form onSubmit={handleDemoSubmit} className="space-y-3">
                          {demoError && (
                            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                              {demoError}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                            <input
                              type="text"
                              value={demoName}
                              onChange={(e) => setDemoName(e.target.value)}
                              placeholder="e.g. Ananya Sen"
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#5e17eb]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">Official Work Email</label>
                            <input
                              type="email"
                              value={demoEmail}
                              onChange={(e) => setDemoEmail(e.target.value)}
                              placeholder="name@company.com"
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#5e17eb]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">Mobile Number</label>
                            <input
                              type="tel"
                              value={demoPhone}
                              onChange={(e) => setDemoPhone(e.target.value)}
                              placeholder="9876543210"
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#5e17eb]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">Company Name</label>
                            <input
                              type="text"
                              value={demoCompany}
                              onChange={(e) => setDemoCompany(e.target.value)}
                              placeholder="e.g. Infosys Ltd"
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#5e17eb]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">Hiring Volume / Month</label>
                            <select
                              value={demoHires}
                              onChange={(e) => setDemoHires(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#5e17eb] bg-white"
                            >
                              {HIRING_VOLUME_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingDemo}
                            className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                          >
                            {isSubmittingDemo ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>Schedule Demo</span>
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

      {/* ----------------- FORGOT PASSWORD MODAL ----------------- */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Reset Employer Password</h3>

            {forgotMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
                {forgotMsg}
              </div>
            )}
            {forgotError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {forgotError}
              </div>
            )}

            {forgotStep === 'REQUEST' ? (
              <form onSubmit={handleForgotRequestOtp} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your registered official email or mobile number to receive a verification OTP.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Work Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#5e17eb]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-3">
                {demoForgotOtp && (
                  <div className="text-xs bg-purple-50 text-purple-700 p-2 rounded">
                    Demo OTP: <strong>{demoForgotOtp}</strong>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-center font-mono tracking-widest rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#5e17eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#5e17eb]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm"
                >
                  {forgotLoading ? 'Updating Password...' : 'Verify & Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TALK TO US MODAL ----------------- */}
      {isTalkToUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsTalkToUsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-[#5e17eb]" />
              <h3 className="text-lg font-bold text-slate-900">Talk to Talent Specialist</h3>
            </div>

            {talkSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900">Callback Scheduled!</h4>
                <p className="text-xs text-slate-600">
                  Our corporate hiring consultant will call you at <strong>{talkPhone}</strong> shortly.
                </p>
                <button
                  onClick={() => setIsTalkToUsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTalkSubmitted(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={talkName}
                    onChange={(e) => setTalkName(e.target.value)}
                    placeholder="e.g. Vikram Seth"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#5e17eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={talkPhone}
                    onChange={(e) => setTalkPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#5e17eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={talkCompany}
                    onChange={(e) => setTalkCompany(e.target.value)}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#5e17eb]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#5e17eb] hover:bg-[#4d0ec5] text-white font-bold text-sm shadow-sm cursor-pointer"
                >
                  Request Instant Callback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ----------------- FEATURES SECTION ----------------- */}
      <section id="features" className="py-16 sm:py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Talent Acquisition Built for Speed &amp; Accuracy
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              CamzyJobs equips modern recruiters with AI intelligence, semantic candidate recall, and pre-screening workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#5e17eb] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">AI Semantic Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search beyond static keywords. Find matching candidates based on skill ontology, domain mastery, and project history.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#5e17eb] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instant Job Publishing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post high-impact job openings in under 60 seconds with pre-qualifying candidate screening questions.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#5e17eb] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">ATS Kanban Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag-and-drop candidates across sourcing, interview rounds, and offer letters with shared hiring manager feedback.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#5e17eb] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Skill Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated aptitude and tech assessments to score candidate proficiencies before dedicating recruiter interview bandwidth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS ----------------- */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Trusted by India&apos;s Leading Talent Leaders
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              See how modern recruiting teams accelerate their technical and executive hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;CamzyJobs&apos;s AI candidate matching reduced our time-to-hire for Senior Full-Stack Engineers from 38 days to just 11 days.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-xs">Priya Ramanathan</div>
                <div className="text-[11px] text-slate-500">Head of Talent Acquisition, Zeta Technologies</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;The pre-qualifying screening questions filter out unqualified applicants before our recruitment coordinators review a single resume.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-xs">Karan Oberoi</div>
                <div className="text-[11px] text-slate-500">VP HR &amp; People Ops, LogiNext India</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Corporate verification and domain validation guarantee that every applicant profile is legitimate and actively looking for roles.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-xs">Meenakshi Sundaram</div>
                <div className="text-[11px] text-slate-500">Director of Sourcing, FinServe Global</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- RECRUITER FAQ ----------------- */}
      <section id="faq" className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Employer FAQs</h2>
            <p className="text-xs text-slate-600 mt-1">Frequently asked questions about recruiter accounts and verification.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">How does employer account verification work?</h4>
              <p className="text-xs text-slate-600 mt-1">
                To prevent fraud and maintain the highest job authenticity, both your official company work email and mobile phone number are verified with 6-digit OTP codes. All actions on the employer dashboard are unlocked once verification is complete.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">Can I invite multiple hiring managers and recruiters?</h4>
              <p className="text-xs text-slate-600 mt-1">
                Yes! Your company workspace includes multi-seat allocation so you can invite recruiters, interviewers, and team leaders with custom permission levels.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#5e17eb]/30 border-t-[#5e17eb] rounded-full animate-spin" />
        </div>
      }
    >
      <EmployerLoginContent />
    </Suspense>
  );
}
