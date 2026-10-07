'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Building2, Users, ShieldCheck, Sparkles, Award, Globe, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> About Camzy Jobs Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight theme-text leading-tight">
          Empowering Companies & Top Talent with Enterprise Hiring Tech
        </h1>
        <p className="text-xs sm:text-sm theme-muted leading-relaxed">
          Camzy Jobs is the next-generation multi-tenant recruitment platform engineered to connect visionary enterprises with world-class tech talent.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { metric: '10,000+', label: 'Verified Companies', icon: Building2 },
          { metric: '2.5 Million+', label: 'Active Candidates', icon: Users },
          { metric: '99.9%', label: 'Platform Uptime SLA', icon: Zap },
          { metric: '1-Click', label: 'Candidate ATS Kanban', icon: ShieldCheck },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 rounded-2xl theme-surface border theme-border text-center space-y-2 shadow-sm">
              <Icon className="w-6 h-6 mx-auto text-indigo-500" />
              <p className="text-2xl sm:text-3xl font-black theme-text tracking-tight">{stat.metric}</p>
              <p className="text-xs theme-muted font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="p-6 rounded-2xl theme-surface border theme-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold theme-text">Multi-Tenant Corporate Workspaces</h3>
          <p className="text-xs theme-muted leading-relaxed">
            Every company operates inside an isolated tenant workspace complete with recruiter seat allocations, custom domain themes, and quota management.
          </p>
        </div>

        <div className="p-6 rounded-2xl theme-surface border theme-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold theme-text">Recruiter Screening & ATS Kanban</h3>
          <p className="text-xs theme-muted leading-relaxed">
            Custom screening questions allow recruiters to qualify applicants during 1-click submission and transition candidates across recruitment stages.
          </p>
        </div>

        <div className="p-6 rounded-2xl theme-surface border theme-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold theme-text">Super Admin Governance & Auditing</h3>
          <p className="text-xs theme-muted leading-relaxed">
            Centralized platform control for tenant provisioning, global theme engines, tax ID verification, and enterprise security compliance.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-indigo-600 text-white text-center space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">Ready to Scale Your Recruitment Pipeline?</h2>
        <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl mx-auto leading-relaxed">
          Join thousands of companies sourcing candidates and posting open positions on Camzy Jobs.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/auth/register/company"
            className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-all flex items-center"
          >
            <span>Register as Employer / Company</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-xl border border-white/30 text-white font-extrabold text-xs hover:bg-white/10 transition-all"
          >
            <span>Browse Active Openings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
