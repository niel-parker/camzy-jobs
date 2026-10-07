'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, appConfig } = useTheme();

  if (!mounted || !pathname) {
    return null;
  }

  const isAuthOrDashboard = pathname.startsWith('/employer') || pathname.startsWith('/candidate') || pathname.startsWith('/admin') || pathname.startsWith('/auth');

  if (isAuthOrDashboard) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {appConfig.siteName || 'Camzy Jobs'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Enterprise Multi-Tenant Job Portal Platform for Companies, Employers & Candidates.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">Explore Portal</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home Page</Link></li>
              <li><Link href="/jobs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Search Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-slate-900 dark:hover:text-white transition-colors">Employer Directory</Link></li>
              <li><Link href="/blogs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Career Journal & Blogs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">Company & Contact</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Support & Sales</Link></li>
              <li><Link href="/auth/register/company" className="hover:text-slate-900 dark:hover:text-white transition-colors">Register as Employer</Link></li>
              <li><Link href="/auth/register/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">Register as Candidate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">Account Access</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="hover:text-slate-900 dark:hover:text-white font-semibold text-indigo-500 transition-colors">Sign In to Account</Link></li>
              <li><Link href="/auth/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Employer Workspace Sign In</Link></li>
              <li><Link href="/auth/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Super Admin Governance Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© 2026 {appConfig.siteName || 'Camzy Jobs'} Enterprise Platform. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Engineered with Next.js, Tailwind CSS & NestJS
          </span>
        </div>
      </div>
    </footer>
  );
};
