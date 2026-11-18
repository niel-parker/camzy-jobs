'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Briefcase, Users, FileText, Bookmark, Settings,
  ShieldCheck, Palette, Bell, Search, ChevronLeft, ChevronRight,
  LogOut, User, Building2, Plus, Sparkles, UserCheck, Lock, LogIn, ChevronDown, Eye, Download,
  Globe, BookOpen, HelpCircle, Send, CreditCard, Receipt, MapPin, Layers, ShieldAlert, Activity, Landmark,
  Mail, Phone, CheckCircle2, AlertCircle, Loader2, Headphones
} from 'lucide-react';
import { SuperAdminThemeCustomizer } from './SuperAdminThemeCustomizer';
import { resolveMediaUrl } from '../utils/media';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'EMPLOYER' | 'CANDIDATE' | 'SUPER_ADMIN';
}

interface SubNavItem {
  label: string;
  href: string;
  segmentKey?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  section?: string;
  subItems?: SubNavItem[];
}

const EmployerMandatoryVerificationBlock: React.FC<{
  user: any;
  setUser: (u: any) => void;
  sdk: any;
  logout: () => void;
}> = ({ user, setUser, sdk, logout }) => {
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneInput, setPhoneInput] = useState(user.phoneNumber || '');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [demoEmailOtp, setDemoEmailOtp] = useState<string | null>(null);
  const [demoPhoneOtp, setDemoPhoneOtp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    let t: any = null;
    if (emailTimer > 0 || phoneTimer > 0) {
      t = setInterval(() => {
        setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setPhoneTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [emailTimer, phoneTimer]);

  const handleSendEmailOtp = async () => {
    setEmailLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await sdk.requestOtp(user.email);
      setEmailSent(true);
      setEmailTimer(180);
      if (res.otpCode) setDemoEmailOtp(res.otpCode);
      setSuccessMsg(`Verification OTP sent to ${user.email}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch email verification OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) return;
    setEmailLoading(true);
    setErrorMsg(null);
    try {
      await sdk.verifyOtp(user.email, emailOtp.trim(), user.id);
      setUser({ ...user, isEmailVerified: true });
      setSuccessMsg('Company email successfully verified!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired Email OTP code.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneInput.trim()) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    setPhoneLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await sdk.requestOtp(phoneInput.trim());
      setPhoneSent(true);
      setPhoneTimer(180);
      if (res.otpCode) setDemoPhoneOtp(res.otpCode);
      setSuccessMsg(`Verification OTP sent to ${phoneInput.trim()}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch mobile verification OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp.trim()) return;
    setPhoneLoading(true);
    setErrorMsg(null);
    try {
      await sdk.verifyOtp(phoneInput.trim(), phoneOtp.trim(), user.id);
      setUser({ ...user, isPhoneVerified: true, phoneNumber: phoneInput.trim() });
      setSuccessMsg('Mobile number successfully verified!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired Mobile OTP code.');
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 text-slate-100">
      <div className="max-w-lg w-full bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600" />

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Account Verification Mandatory</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Employer Verification Required
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            In accordance with recruiter security standards, <strong>all employer actions are strictly blocked</strong> until both your official company work email and mobile phone number are verified.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Card 1: Email Verification */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Company Work Email</span>
              </div>
              {user.isEmailVerified ? (
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-mono">{user.email}</p>

            {!user.isEmailVerified && (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                {!emailSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={emailLoading}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Send Verification Email OTP</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit email OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 text-center font-mono font-bold tracking-widest px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={emailLoading || emailOtp.length < 6}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm cursor-pointer"
                      >
                        {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Verify</span>}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      {demoEmailOtp ? (
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                          Demo OTP: <strong>{demoEmailOtp}</strong>
                        </span>
                      ) : <span />}
                      {emailTimer > 0 ? (
                        <span className="text-slate-500 font-mono">Resend in {emailTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="text-purple-400 hover:underline font-bold"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Mobile Verification */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>Mobile Number</span>
              </div>
              {user.isPhoneVerified ? (
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>

            {!user.isPhoneVerified ? (
              <div className="space-y-2">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />

                {!phoneSent ? (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={phoneLoading || !phoneInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {phoneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                    <span>Send Verification Mobile OTP</span>
                  </button>
                ) : (
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit mobile OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 text-center font-mono font-bold tracking-widest px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={phoneLoading || phoneOtp.length < 6}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm cursor-pointer"
                      >
                        {phoneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Verify</span>}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      {demoPhoneOtp ? (
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                          Demo OTP: <strong>{demoPhoneOtp}</strong>
                        </span>
                      ) : <span />}
                      {phoneTimer > 0 ? (
                        <span className="text-slate-500 font-mono">Resend in {phoneTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          className="text-purple-400 hover:underline font-bold"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-300 font-mono">{user.phoneNumber || phoneInput}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={logout}
            className="text-rose-400 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <span className="text-slate-500 text-[11px]">
            Toll Free Support: 1800-419-6666
          </span>
        </div>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const pathname = usePathname();
  const { theme, user, logout, setUser, sdk, isLoadingUser } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ '/admin/broadcast': true });

  const roleTitle = role === 'EMPLOYER' ? 'Employer Workspace' : role === 'CANDIDATE' ? 'Candidate Portal' : 'Super Admin Control';

  // Strict Role Authorization Check - ALL HOOKS MUST REMAIN AT TOP LEVEL
  const isAuthorized = React.useMemo(() => {
    if (!user) return false;

    if (role === 'SUPER_ADMIN') {
      return user.role === 'SUPER_ADMIN';
    }

    if (role === 'EMPLOYER') {
      return (
        user.role === 'COMPANY_ADMIN' ||
        user.role === 'RECRUITER' ||
        user.role === 'CONSULTANCY_ADMIN' ||
        user.role === 'AGENCY_AGENT' ||
        user.role === 'SUPER_ADMIN'
      );
    }

    if (role === 'CANDIDATE') {
      return user.role === 'CANDIDATE' || user.role === 'SUPER_ADMIN';
    }

    return false;
  }, [user, role]);

  // Mandatory Employer Account Verification Check: Block all actions until verified
  const isEmployerUnverified = React.useMemo(() => {
    if (!user) return false;
    if (role === 'EMPLOYER' && user.role !== 'SUPER_ADMIN') {
      return !user.isEmailVerified || !user.isPhoneVerified;
    }
    return false;
  }, [user, role]);

  // Loading state while restoring session on refresh
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 theme-transition">
        <Loader2 className="w-9 h-9 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading workspace...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    const loginLink = role === 'SUPER_ADMIN' ? '/admin/login' : '/auth/login';

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 theme-transition">
        <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              403 Access Forbidden
            </span>
            <h2 className="text-xl font-black theme-text tracking-tight">
              {roleTitle} Access Restricted
            </h2>
            <p className="text-xs theme-muted leading-relaxed">
              You are not authorized to access this dashboard. Please sign in with an official <span className="font-bold theme-text">{roleTitle}</span> account.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t theme-border">
            <Link
              href={loginLink}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4 mr-1" />
              <span>Sign In with Authorized Account</span>
            </Link>

            <Link
              href="/"
              className="block text-xs font-semibold theme-muted hover:theme-text transition-colors pt-1"
            >
              ← Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isEmployerUnverified) {
    return (
      <EmployerMandatoryVerificationBlock user={user} setUser={setUser} sdk={sdk} logout={logout} />
    );
  }

  // Navigation Items per Role
  let navItems: NavItem[] = [];

  if (role === 'EMPLOYER') {
    navItems = [
      { label: 'Recruiter Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
      { label: 'Company Profile', href: '/employer/profile', icon: Building2 },
      { label: 'Candidate & Resume Search', href: '/employer/candidates/search', icon: Search, badge: 'Talent DB' },
      { label: 'Post New Job', href: '/employer/jobs/create', icon: Plus, badge: 'New' },
      { label: 'Manage Job Listings', href: '/employer/jobs', icon: Briefcase },
      { label: 'Applicant ATS Kanban', href: '/employer/candidates/kanban', icon: Users },
      { label: 'Recruiter Team Seats', href: '/employer/seats', icon: UserCheck },
      { label: 'Plan Billing & Quotas', href: '/employer/billing', icon: Sparkles },
    ];
  } else if (role === 'CANDIDATE') {
    navItems = [
      { label: 'Resume & Profile', href: '/candidate/profile', icon: User },
      { label: 'Recruiter View', href: '/candidate/profile?view=recruiter', icon: Eye, badge: 'Drawer' },
      { label: 'Resume (By Camzy)', href: '/candidate/profile?view=resume', icon: FileText, badge: 'PDF' },
      { label: 'My Applications', href: '/candidate/applications', icon: Briefcase, badge: 'Live' },
      { label: 'Saved Jobs', href: '/candidate/saved', icon: Bookmark },
      { label: 'Explore All Jobs', href: '/jobs', icon: Search },
    ];
  } else {
    navItems = [
      { label: 'Control Center', href: '/admin/dashboard', icon: LayoutDashboard, section: 'Operations & Access' },
      { label: 'Camzy Internal Team', href: '/admin/users', icon: ShieldCheck, badge: 'Staff Only', section: 'Operations & Access' },
      { label: 'Job Seekers & Employers', href: '/admin/profiles', icon: Users, badge: 'Candidates & Cos', section: 'Operations & Access' },
      { label: 'Demo Requests & Leads', href: '/admin/demo-requests', icon: Headphones, badge: 'Leads', section: 'Operations & Access' },
      { label: 'Login Activity', href: '/admin/login-activity', icon: Activity, badge: 'Audit Logs', section: 'Operations & Access' },
      { label: 'Jobs (All Companies)', href: '/admin/jobs', icon: Briefcase, badge: 'Post/View', section: 'Operations & Access' },
      { label: 'Companies Directory', href: '/admin/tenants', icon: Building2, section: 'Operations & Access' },

      { label: 'CMS & Translations', href: '/admin/cms', icon: FileText, section: 'Content & Growth' },
      { label: 'Govt. Jobs Portal', href: '/admin/govt-jobs', icon: Landmark, badge: 'Sarkari', section: 'Content & Growth' },
      { label: 'Manage Blogs', href: '/admin/blogs', icon: BookOpen, section: 'Content & Growth' },
      { label: 'SEO Meta Manager', href: '/admin/seo', icon: Globe, section: 'Content & Growth' },
      { label: 'FAQs Management', href: '/admin/faqs', icon: HelpCircle, section: 'Content & Growth' },
      {
        label: 'Email Broadcasting',
        href: '/admin/broadcast',
        icon: Send,
        badge: '6 Lists',
        section: 'Content & Growth',
        subItems: [
          { label: 'Inactive Users', href: '/admin/broadcast?segment=INACTIVE_USERS', segmentKey: 'INACTIVE_USERS' },
          { label: 'Skills Job Email', href: '/admin/broadcast?segment=SKILLS_JOB_EMAIL', segmentKey: 'SKILLS_JOB_EMAIL' },
          { label: 'User Adv. Email', href: '/admin/broadcast?segment=USER_ADV_EMAIL', segmentKey: 'USER_ADV_EMAIL' },
          { label: 'Emp. Adv. Email', href: '/admin/broadcast?segment=EMPLOYER_ADV_EMAIL', segmentKey: 'EMPLOYER_ADV_EMAIL' },
          { label: 'Emp. Active Companies', href: '/admin/broadcast?segment=EMPLOYER_ACTIVE_COMPANIES', segmentKey: 'EMPLOYER_ACTIVE_COMPANIES' },
          { label: 'Emp. Expired Companies', href: '/admin/broadcast?segment=EMPLOYER_EXPIRED_COMPANIES', segmentKey: 'EMPLOYER_EXPIRED_COMPANIES' },
        ],
      },

      { label: 'Subscription Packages', href: '/admin/packages', icon: CreditCard, section: 'Billing & Locations' },
      { label: 'Manage Locations', href: '/admin/locations', icon: MapPin, section: 'Billing & Locations' },
      { label: 'Payment & Invoices', href: '/admin/transactions', icon: Receipt, section: 'Billing & Locations' },

      { label: 'Master Taxonomies', href: '/admin/taxonomies', icon: Layers, badge: '16 Masters', section: 'Master System Data' },
      { label: 'Domain Restrictions', href: '/admin/settings?tab=restricted-domains', icon: ShieldAlert, badge: 'Blocklist', section: 'Master System Data' },
      { label: 'Global Settings', href: '/admin/settings', icon: Settings, section: 'Master System Data' },
    ];
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 theme-transition">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen theme-surface border-r theme-border transition-all duration-300 flex flex-col justify-between ${isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b theme-border flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black shadow-md"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Briefcase className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm theme-text tracking-tight truncate">Camzy Jobs</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{roleTitle}</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg theme-border border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden sm:flex"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const prevItem = index > 0 ? navItems[index - 1] : null;
            const showSection = item.section && (!prevItem || prevItem.section !== item.section);
            const isRecruiterViewItem = item.href.includes('view=recruiter');
            const isResumeItem = item.href.includes('view=resume');
            const isActive = isRecruiterViewItem
              ? (typeof window !== 'undefined' && pathname === '/candidate/profile' && window.location.search.includes('view=recruiter'))
              : isResumeItem
                ? (typeof window !== 'undefined' && pathname === '/candidate/profile' && window.location.search.includes('view=resume'))
                : (pathname === item.href && (item.href !== '/candidate/profile' || typeof window === 'undefined' || (!window.location.search.includes('view=recruiter') && !window.location.search.includes('view=resume'))));

            const isMenuExpanded = expandedMenus[item.href] ?? (pathname.startsWith(item.href));

            return (
              <React.Fragment key={item.href}>
                {showSection && (
                  <div className={`pt-3 pb-1 px-3 ${index === 0 ? 'pt-0' : ''}`}>
                    {!isSidebarCollapsed ? (
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {item.section}
                      </p>
                    ) : (
                      <div className="border-t theme-border my-1" />
                    )}
                  </div>
                )}
                {item.subItems ? (
                  <div>
                    <div
                      onClick={() => {
                        setExpandedMenus(prev => ({ ...prev, [item.href]: !isMenuExpanded }));
                      }}
                      className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative cursor-pointer select-none ${isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'theme-text hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      title={item.label}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {!isSidebarCollapsed && item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase mr-1">
                          {item.badge}
                        </span>
                      )}
                      {!isSidebarCollapsed && (
                        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isMenuExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </div>

                    {!isSidebarCollapsed && isMenuExpanded && (
                      <div className="pl-7 pr-1 py-1 space-y-0.5 mt-0.5 animate-fade-in">
                        {item.subItems.map((sub) => {
                          const isSubActive = typeof window !== 'undefined'
                            ? (window.location.search.includes(sub.segmentKey || '') || (sub.segmentKey === 'INACTIVE_USERS' && pathname === '/admin/broadcast' && !window.location.search.includes('segment=')))
                            : false;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${isSubActive
                                ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-sm'
                                : 'theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800/40'
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400/40'}`} />
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (item.href.includes('view=recruiter') && typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-recruiter-view'));
                      }
                      if (item.href.includes('view=resume') && typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-resume-view'));
                      }
                    }}
                    className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative ${isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'theme-text hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </React.Fragment>
            );
          })}

          {/* Candidate Dedicated Recruiter View & Resume Card in Sidebar */}
          {/* {role === 'CANDIDATE' && !isSidebarCollapsed && (
            <div className="mt-4 p-3.5 rounded-2xl border theme-border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black theme-text">Profile Perspectives</h4>
                  <p className="text-[10px] theme-muted font-medium">Recruiter View &amp; Resume</p>
                </div>
              </div>
              <p className="text-[11px] theme-muted leading-relaxed">
                Check how recruiters see you in candidate search or download your Camzy formatted resume.
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Link
                  href="/candidate/profile?view=recruiter"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-recruiter-view'));
                    }
                  }}
                  className="py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] text-center shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="See live slide-over profile drawer as seen by recruiters"
                >
                  <Eye className="w-3 h-3" />
                  <span>Recruiter View</span>
                </Link>

                <Link
                  href="/candidate/profile?view=resume"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-resume-view'));
                    }
                  }}
                  className="py-2 px-2 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-[10px] text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="View and download standardized Camzy CV"
                >
                  <FileText className="w-3 h-3 text-indigo-500" />
                  <span>Resume (Camzy)</span>
                </Link>
              </div>
            </div>
          )} */}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t theme-border space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-extrabold flex items-center justify-center text-xs flex-shrink-0 border border-indigo-200 dark:border-indigo-800">
              {user?.avatarUrl ? (
                <img
                  src={resolveMediaUrl(user.avatarUrl)}
                  alt={user?.firstName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : role === 'EMPLOYER' || user?.role === 'COMPANY_ADMIN' || user?.role === 'RECRUITER' || user?.tenantId ? (
                <Building2 className="w-4 h-4 text-indigo-500" />
              ) : (
                <User className="w-4 h-4 text-indigo-500" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold theme-text truncate">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}</p>
                <p className="text-[10px] theme-muted truncate">{user?.email || ''}</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t theme-border">
            {user?.role === 'SUPER_ADMIN' ? (
              <>
                <button
                  onClick={() => setIsThemePanelOpen(true)}
                  className="flex-1 py-2 px-2 rounded-lg border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-1"
                  title="UI Theme Customizer"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  {!isSidebarCollapsed && <span>Theme</span>}
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                className="w-full py-2 px-2 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center space-x-1.5"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                {!isSidebarCollapsed && <span className="text-xs font-bold">Sign Out</span>}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* HEADER NAVBAR BAR */}
        <header className="sticky top-0 z-30 h-16 theme-surface border-b theme-border px-6 flex items-center justify-between shadow-sm">
          {/* Left Title & Public Link */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-extrabold theme-text uppercase tracking-wider">{roleTitle}</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <Link
              href="/"
              className="text-xs font-bold theme-muted hover:text-indigo-600 transition-colors hidden sm:flex items-center gap-1"
            >
              <span>← Back to Public Site</span>
            </Link>
          </div>

          {/* Right User Controls */}
          <div className="flex items-center space-x-3">
            {/* Authenticated User Profile Card Pill & Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl border theme-border theme-surface hover:shadow-md transition-all group"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800">
                    {user.avatarUrl ? (
                      <img
                        src={resolveMediaUrl(user.avatarUrl)}
                        alt={user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : role === 'EMPLOYER' || user?.role === 'COMPANY_ADMIN' || user?.role === 'RECRUITER' || user?.tenantId ? (
                      <Building2 className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <User className="w-4 h-4 text-indigo-500" />
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>

                  <div className="text-left flex flex-col hidden sm:flex">
                    <span className="text-xs font-extrabold theme-text leading-tight group-hover:text-indigo-600 transition-colors">
                      {user.firstName} {user.lastName || ''}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                      {user.role === 'CANDIDATE' ? 'Candidate' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Employer'}
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 theme-muted transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl theme-surface border theme-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b theme-border flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-sm border theme-border">
                        {user.avatarUrl ? (
                          <img
                            src={resolveMediaUrl(user.avatarUrl)}
                            alt={user.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : role === 'EMPLOYER' || user?.role === 'COMPANY_ADMIN' || user?.role === 'RECRUITER' || user?.tenantId ? (
                          <Building2 className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <User className="w-5 h-5 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold theme-text truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] theme-muted truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-extrabold uppercase">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 text-xs font-semibold">
                      {role === 'CANDIDATE' ? (
                        <>
                          <Link
                            href="/candidate/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <User className="w-4 h-4 text-indigo-500" />
                            <span>My Resume & Profile</span>
                          </Link>
                          <Link
                            href="/candidate/saved"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Bookmark className="w-4 h-4 text-amber-500" />
                            <span>Saved Jobs</span>
                          </Link>
                          <Link
                            href="/candidate/applications"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>My Applications</span>
                          </Link>
                          <Link
                            href="/jobs"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Search className="w-4 h-4 text-purple-500" />
                            <span>Explore All Jobs</span>
                          </Link>
                        </>
                      ) : role === 'EMPLOYER' ? (
                        <>
                          <Link
                            href="/employer/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                            <span>Employer Dashboard</span>
                          </Link>
                          <Link
                            href="/employer/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Building2 className="w-4 h-4 text-purple-500" />
                            <span>Company Profile</span>
                          </Link>
                          <Link
                            href="/employer/candidates/search"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Users className="w-4 h-4 text-emerald-500" />
                            <span>Candidate & Resume Search</span>
                          </Link>
                          <Link
                            href="/employer/jobs/create"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            <span>Post New Job</span>
                          </Link>
                          <Link
                            href="/jobs"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Search className="w-4 h-4 text-purple-500" />
                            <span>Public Job Board</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                            <span>Control Center</span>
                          </Link>
                          <Link
                            href="/admin/tenants"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          >
                            <Building2 className="w-4 h-4 text-purple-500" />
                            <span>Tenant Directory</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t theme-border">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>

      {/* Theme Customizer Drawer */}
      <SuperAdminThemeCustomizer isOpen={isThemePanelOpen} onClose={() => setIsThemePanelOpen(false)} />
    </div>
  );
};
