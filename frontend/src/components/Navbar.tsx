'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { Briefcase, Building2, Palette, ShieldCheck, User, LogOut, Menu, X, ChevronDown, Sparkles, LayoutDashboard, Bookmark, FileText, Settings, Users, LogIn } from 'lucide-react';
import { SuperAdminThemeCustomizer } from './SuperAdminThemeCustomizer';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, user, appConfig, loginAsSuperAdmin, logout } = useTheme();
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (!mounted || !pathname) {
    return null;
  }

  const isAuthOrDashboard = pathname.startsWith('/employer') || pathname.startsWith('/candidate') || pathname.startsWith('/admin') || pathname.startsWith('/auth');

  if (isAuthOrDashboard) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header transition-colors duration-300 border-b theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md theme-transition"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Briefcase className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight theme-text flex items-center gap-1.5">
                  {appConfig.siteName || 'Camzy Jobs'}{' '}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold uppercase">
                    Enterprise
                  </span>
                </span>
                <span className="text-[11px] theme-muted font-medium">Hiring Platform for Companies</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className={`text-xs font-bold transition-colors ${pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'theme-text hover:text-indigo-500'}`}>
                Home
              </Link>
              <Link href="/jobs" className={`text-xs font-bold transition-colors ${pathname.startsWith('/jobs') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'theme-text hover:text-indigo-500'}`}>
                Jobs
              </Link>
              <Link href="/companies" className={`text-xs font-bold transition-colors ${pathname.startsWith('/companies') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'theme-text hover:text-indigo-500'}`}>
                Companies
              </Link>
              <Link href="/blogs" className={`text-xs font-bold transition-colors ${pathname.startsWith('/blogs') ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'theme-text hover:text-indigo-500'}`}>
                Blogs
              </Link>
              <Link href="/about" className={`text-xs font-bold transition-colors ${pathname === '/about' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'theme-text hover:text-indigo-500'}`}>
                About
              </Link>
              <Link href="/contact" className={`text-xs font-bold transition-colors ${pathname === '/contact' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'theme-text hover:text-indigo-500'}`}>
                Contacts
              </Link>
            </nav>

            {/* Right Action Controls */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Customizer Trigger Button */}
              <button
                onClick={() => setIsThemePanelOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold theme-surface theme-text border theme-border shadow-sm hover:scale-105 transition-all"
                title="Open Theme Engine Drawer"
              >
                <Palette className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Theme Engine</span>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              </button>

              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-lg border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                <span>Sign In</span>
              </Link>

              {/* Register Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('register')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1">
                  <span>Register</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {activeDropdown === 'register' && (
                  <div className="absolute right-0 w-60 py-2 theme-surface border theme-border rounded-xl shadow-xl z-50 text-xs font-medium space-y-1">
                    <Link href="/auth/register/candidate" className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text">
                      <User className="w-4 h-4 mr-2 text-purple-500" /> Register as Candidate
                    </Link>
                    <Link href="/auth/register/company" className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text">
                      <Building2 className="w-4 h-4 mr-2 text-indigo-500" /> Register as Employer / Company
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsThemePanelOpen(true)}
                className="p-2 rounded-lg theme-surface text-amber-500 border theme-border"
              >
                <Palette className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 theme-text"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t theme-border p-4 theme-surface space-y-3 text-xs font-bold">
            <Link href="/" className="block py-1.5 theme-text hover:text-indigo-500">Home</Link>
            <Link href="/jobs" className="block py-1.5 theme-text hover:text-indigo-500">Jobs</Link>
            <Link href="/companies" className="block py-1.5 theme-text hover:text-indigo-500">Companies</Link>
            <Link href="/blogs" className="block py-1.5 theme-text hover:text-indigo-500">Blogs</Link>
            <Link href="/about" className="block py-1.5 theme-text hover:text-indigo-500">About</Link>
            <Link href="/contact" className="block py-1.5 theme-text hover:text-indigo-500">Contacts</Link>
            <div className="border-t theme-border pt-3 space-y-2">
              <Link href="/auth/login" className="block py-2 rounded-lg text-center border theme-border theme-text">Sign In</Link>
              <Link href="/auth/register/candidate" className="block py-2 rounded-lg text-center bg-indigo-600 text-white">Register</Link>
            </div>
          </div>
        )}
      </header>

      {/* Theme Drawer Panel */}
      <SuperAdminThemeCustomizer isOpen={isThemePanelOpen} onClose={() => setIsThemePanelOpen(false)} />
    </>
  );
};
