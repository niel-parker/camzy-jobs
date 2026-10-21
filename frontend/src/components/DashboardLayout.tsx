'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Briefcase, Users, FileText, Bookmark, Settings, 
  ShieldCheck, Palette, Bell, Search, ChevronLeft, ChevronRight, 
  LogOut, User, Building2, Plus, Sparkles, UserCheck, Lock, LogIn, ChevronDown, Eye, Download,
  Globe, BookOpen, HelpCircle, Send, CreditCard, Receipt, MapPin, Layers
} from 'lucide-react';
import { SuperAdminThemeCustomizer } from './SuperAdminThemeCustomizer';

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

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const pathname = usePathname();
  const { theme, user, logout } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ '/admin/broadcast': true });

  const roleTitle = role === 'EMPLOYER' ? 'Employer Workspace' : role === 'CANDIDATE' ? 'Candidate Portal' : 'Super Admin Control';

  // Strict Role Authorization Check
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

  // Navigation Items per Role
  let navItems: NavItem[] = [];

  if (role === 'EMPLOYER') {
    navItems = [
      { label: 'Recruiter Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
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
      { label: 'Recruiter View', href: '/candidate/profile?view=recruiter', icon: Eye, badge: 'Download' },
      { label: 'My Applications', href: '/candidate/applications', icon: FileText, badge: 'Live' },
      { label: 'Saved Jobs', href: '/candidate/saved', icon: Bookmark },
      { label: 'Explore All Jobs', href: '/jobs', icon: Search },
    ];
  } else {
    navItems = [
      { label: 'Control Center', href: '/admin/dashboard', icon: LayoutDashboard, section: 'Operations & Access' },
      { label: 'Admin Users', href: '/admin/users', icon: ShieldCheck, section: 'Operations & Access' },
      { label: 'Jobs (All Companies)', href: '/admin/jobs', icon: Briefcase, badge: 'Post/View', section: 'Operations & Access' },
      { label: 'Companies Directory', href: '/admin/tenants', icon: Building2, section: 'Operations & Access' },
      { label: 'User Profiles', href: '/admin/profiles', icon: Users, badge: 'Candidates/Employers', section: 'Operations & Access' },

      { label: 'CMS & Translations', href: '/admin/cms', icon: FileText, section: 'Content & Growth' },
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
      { label: 'Global Settings', href: '/admin/settings', icon: Settings, section: 'Master System Data' },
    ];
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 theme-transition">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen theme-surface border-r theme-border transition-all duration-300 flex flex-col justify-between ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
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
            const isActive = isRecruiterViewItem
              ? (typeof window !== 'undefined' && pathname === '/candidate/profile' && window.location.search.includes('view=recruiter'))
              : (pathname === item.href && (item.href !== '/candidate/profile' || typeof window === 'undefined' || !window.location.search.includes('view=recruiter')));

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
                      className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative cursor-pointer select-none ${
                        isActive
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
                              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                isSubActive
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
                    }}
                    className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative ${
                      isActive
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

          {/* Candidate Dedicated Recruiter View Card in Sidebar */}
          {role === 'CANDIDATE' && !isSidebarCollapsed && (
            <div className="mt-4 p-3.5 rounded-2xl border theme-border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black theme-text">Recruiter View</h4>
                  <p className="text-[10px] theme-muted font-medium">Downloadable Format</p>
                </div>
              </div>
              <p className="text-[11px] theme-muted leading-relaxed">
                Preview how recruiters view your profile, then download or print your PDF resume.
              </p>
              <Link
                href="/candidate/profile?view=recruiter"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-recruiter-view'));
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> View & Download
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t theme-border space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-extrabold flex items-center justify-center text-xs flex-shrink-0 border border-indigo-200 dark:border-indigo-800">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`}
                  alt={user?.firstName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
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
                        src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`}
                        alt={user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
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
                            src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`}
                            alt={user.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
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
