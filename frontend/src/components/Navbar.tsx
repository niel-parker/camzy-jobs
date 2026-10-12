'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { Briefcase, Building2, ShieldCheck, User, LogOut, Menu, X, ChevronDown, Sparkles, LayoutDashboard, Bookmark, FileText, Settings, Users, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, user, appConfig, logout } = useTheme();
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
              {user ? (
                /* Authenticated User Profile Pill & Dropdown */
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
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

                    <div className="text-left flex flex-col">
                      <span className="text-xs font-extrabold theme-text leading-tight group-hover:text-indigo-600 transition-colors">
                        {user.firstName} {user.lastName || ''}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                        {user.role === 'CANDIDATE' ? 'Candidate' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Employer'}
                      </span>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 theme-muted transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === 'user' && (
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
                        {user.role === 'CANDIDATE' ? (
                          <>
                            <Link
                              href="/candidate/profile"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <User className="w-4 h-4 text-indigo-500" />
                              <span>My Resume & Profile</span>
                            </Link>
                            <Link
                              href="/candidate/saved"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <Bookmark className="w-4 h-4 text-amber-500" />
                              <span>Saved Jobs</span>
                            </Link>
                            <Link
                              href="/candidate/applications"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span>My Applications</span>
                            </Link>
                          </>
                        ) : user.role === 'SUPER_ADMIN' ? (
                          <>
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-indigo-500" />
                              <span>Control Center</span>
                            </Link>
                            <Link
                              href="/admin/tenants"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <Building2 className="w-4 h-4 text-purple-500" />
                              <span>Tenant Directory</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/employer/dashboard"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                              <span>Employer Dashboard</span>
                            </Link>
                            <Link
                              href="/employer/candidates/search"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <Users className="w-4 h-4 text-emerald-500" />
                              <span>Search Talent & Resumes</span>
                            </Link>
                            <Link
                              href="/employer/jobs/create"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            >
                              <Briefcase className="w-4 h-4 text-blue-500" />
                              <span>Post New Job</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-2 border-t theme-border">
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
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
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Register</span>
                  </Link>

                  <Link
                    href="/auth/register/company"
                    className="px-3 py-1.5 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center space-x-1"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>For Employers</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
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
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 theme-text hover:text-indigo-500">Home</Link>
            <Link href="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 theme-text hover:text-indigo-500">Jobs</Link>
            <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 theme-text hover:text-indigo-500">Companies</Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 theme-text hover:text-indigo-500">Blogs</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 theme-text hover:text-indigo-500">About</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 theme-text hover:text-indigo-500">Contacts</Link>
            
            <div className="border-t theme-border pt-3 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border theme-border">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 font-bold text-xs">
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
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold theme-text truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] theme-muted truncate">{user.email}</p>
                    </div>
                  </div>

                  {user.role === 'CANDIDATE' ? (
                    <>
                      <Link href="/candidate/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-indigo-600 text-white font-extrabold text-center">My Resume & Profile</Link>
                      <Link href="/candidate/saved" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg border theme-border theme-text font-bold text-center">Saved Jobs</Link>
                      <Link href="/candidate/applications" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg border theme-border theme-text font-bold text-center">My Applications</Link>
                    </>
                  ) : user.role === 'SUPER_ADMIN' ? (
                    <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-indigo-600 text-white font-extrabold text-center">Super Admin Center</Link>
                  ) : (
                    <>
                      <Link href="/employer/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-indigo-600 text-white font-extrabold text-center">Employer Dashboard</Link>
                      <Link href="/employer/candidates/search" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg border theme-border theme-text font-bold text-center">Search Talent DB</Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 rounded-lg text-center font-bold text-rose-600 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 rounded-lg text-center bg-indigo-600 text-white font-extrabold">Sign In / Register</Link>
                  <Link href="/auth/register/company" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 rounded-lg text-center border theme-border theme-text font-bold">For Employers</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
