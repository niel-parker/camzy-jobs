'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Briefcase, Users, FileText, Bookmark, Settings, 
  ShieldCheck, Palette, Bell, Search, ChevronLeft, ChevronRight, 
  LogOut, User, Building2, Plus, Sparkles, UserCheck, Lock, LogIn 
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
  const { theme, user, logout } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

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
                <p className="text-xs font-bold theme-text truncate">{user?.firstName || 'User'}</p>
                <p className="text-[10px] theme-muted truncate">{user?.email || ''}</p>
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
          {/* Left Search / Title */}
          <div className="flex items-center space-x-4">
            <span className="text-xs font-extrabold theme-text uppercase tracking-wider">{roleTitle}</span>
          </div>

          {/* Right User Controls */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold theme-muted hidden sm:inline">
              Signed in as <strong className="theme-text">{user?.email}</strong> ({user?.role})
            </span>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border theme-border theme-text text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 transition-all"
            >
              Sign Out
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
