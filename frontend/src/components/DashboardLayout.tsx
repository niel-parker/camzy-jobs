'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Briefcase, Users, FileText, Bookmark, Settings, 
  ShieldCheck, Palette, Bell, Search, ChevronLeft, ChevronRight, 
  LogOut, User, Building2, Plus, Sparkles, UserCheck, HelpCircle, Lock, LogIn 
} from 'lucide-react';
import { SuperAdminThemeCustomizer } from './SuperAdminThemeCustomizer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'EMPLOYER' | 'CANDIDATE' | 'SUPER_ADMIN';
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const pathname = usePathname();
  const { theme, user, logout, loginAsCandidate, loginAsEmployer, loginAsSuperAdmin } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

  const roleTitle = role === 'EMPLOYER' ? 'Employer Workspace' : role === 'CANDIDATE' ? 'Candidate Portal' : 'Super Admin Control';

  const isAuthorized = React.useMemo(() => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (role === 'CANDIDATE' && user.role === 'CANDIDATE') return true;
    if (role === 'EMPLOYER' && (user.role === 'RECRUITER' || user.role === 'COMPANY_ADMIN' || user.role === 'CONSULTANCY_ADMIN' || user.role === 'AGENCY_AGENT')) return true;
    return false;
  }, [user, role]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 theme-transition">
        <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Authentication & Role Guard
            </span>
            <h2 className="text-xl font-black theme-text tracking-tight">
              {roleTitle} Access Restricted
            </h2>
            <p className="text-xs theme-muted leading-relaxed">
              This dashboard path is protected. Please sign in with an authorized <span className="font-bold theme-text">{roleTitle}</span> account to access applicant records and management tools.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t theme-border">
            <button
              onClick={() => {
                if (role === 'CANDIDATE') loginAsCandidate();
                else if (role === 'EMPLOYER') loginAsEmployer();
                else loginAsSuperAdmin();
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1-Click Authenticate as {roleTitle}</span>
            </button>

            <Link
              href="/auth/login"
              className="w-full py-2.5 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-1"
            >
              <LogIn className="w-3.5 h-3.5 mr-1" />
              <span>Go to Sign In Page</span>
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

  // Define Navigation Items based on Role
  let navItems: NavItem[] = [];

  if (role === 'EMPLOYER') {
    navItems = [
      { label: 'Recruiter Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
      { label: 'Post New Job', href: '/employer/jobs/create', icon: Plus, badge: 'New' },
      { label: 'Manage Job Listings', href: '/employer/jobs', icon: Briefcase },
      { label: 'Applicant ATS Kanban', href: '/employer/candidates/kanban', icon: Users },
      { label: 'Recruiter Team Seats', href: '/employer/seats', icon: UserCheck },
      { label: 'Plan Billing & Quotas', href: '/employer/billing', icon: Sparkles },
    ];
  } else if (role === 'CANDIDATE') {
    navItems = [
      { label: 'Resume & Profile', href: '/candidate/profile', icon: User },
      { label: 'My Applications', href: '/candidate/applications', icon: FileText, badge: 'Live' },
      { label: 'Saved Jobs', href: '/candidate/saved', icon: Bookmark },
      { label: 'Explore All Jobs', href: '/jobs', icon: Search },
    ];
  } else {
    navItems = [
      { label: 'Control Center', href: '/admin/dashboard', icon: ShieldCheck },
      { label: 'Tenant Directory', href: '/admin/tenants', icon: Building2 },
      { label: 'Global Settings', href: '/admin/settings', icon: Settings },
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
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
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t theme-border space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
              {user?.firstName ? user.firstName[0] : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold theme-text truncate">{user?.firstName || 'Logged User'}</p>
                <p className="text-[10px] theme-muted truncate">{user?.email || 'user@camzyjobs.com'}</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t theme-border">
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
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* HEADER NAVBAR BAR */}
        <header className="sticky top-0 z-30 h-16 theme-surface border-b theme-border px-6 flex items-center justify-between shadow-sm">
          {/* Left Search / Breadcrumb */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 theme-muted" />
              <input
                type="text"
                placeholder="Search candidates, jobs, or settings..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Quick Switch Portal Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border theme-border theme-surface theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{roleTitle}</span>
                <span className="text-[10px] text-slate-400 font-mono">▼</span>
              </button>
              <div className="absolute right-0 w-52 py-2 theme-surface border theme-border rounded-xl shadow-xl z-50 text-xs font-medium space-y-1 hidden group-hover:block">
                <div className="px-3 py-1 text-[10px] font-bold theme-muted uppercase tracking-wider">Direct Portal Switch</div>
                <Link href="/candidate/applications" className="flex items-center px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text">
                  <User className="w-3.5 h-3.5 mr-2 text-indigo-500" /> Candidate Portal
                </Link>
                <Link href="/employer/dashboard" className="flex items-center px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text">
                  <Building2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Employer Workspace
                </Link>
                <Link href="/admin/dashboard" className="flex items-center px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-amber-500" /> Super Admin Control
                </Link>
                <div className="border-t theme-border pt-1">
                  <Link href="/" className="flex items-center px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text">
                    <Briefcase className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Public Website
                  </Link>
                </div>
              </div>
            </div>

            <button className="relative p-2 rounded-lg theme-border border theme-text hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>
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
