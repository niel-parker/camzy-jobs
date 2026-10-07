'use client';

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Check, Sparkles, Zap, Building2, Download, Users, Shield } from 'lucide-react';

export const PricingTable: React.FC = () => {
  const { theme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Company',
      target: 'Small Hiring Teams',
      priceMonthly: 0,
      priceYearly: 0,
      jobLimit: '2 Active Jobs',
      resumeDownloads: '0 Resume Downloads',
      seats: '1 Recruiter Seat',
      features: [
        'Standard Company Job Listing',
        'Basic Applicant Pipeline',
        '15-Day Job Expiry',
        'Email Support',
      ],
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth Employer',
      target: 'Growing Tech & Business Teams',
      priceMonthly: 99,
      priceYearly: 79,
      jobLimit: '5 Active Jobs',
      resumeDownloads: '50 Downloads / Mo',
      seats: '3 Recruiter Seats',
      features: [
        '1 Featured Job Boost',
        'Candidate Sourcing Database',
        'Applicant Screening Questions',
        'Standard Email Notifications',
        'Standard Support',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professional Employer',
      target: 'Established Companies',
      priceMonthly: 199,
      priceYearly: 159,
      jobLimit: '15 Active Jobs',
      resumeDownloads: '150 Downloads / Mo',
      seats: '5 Recruiter Seats',
      features: [
        '3 Featured Job Boosts',
        'Kanban ATS Pipeline & Scoring',
        'Direct Candidate Messaging',
        'Advanced Resume Filtering',
        'Priority Recruiter Support',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      target: 'Large Companies & Enterprises',
      priceMonthly: 499,
      priceYearly: 399,
      jobLimit: '50 Active Jobs',
      resumeDownloads: '500 Downloads / Mo',
      seats: '15 Recruiter Seats',
      features: [
        '10 Featured Job Boosts',
        'Custom Screening Questionnaires',
        'API & Webhook Access',
        'Dedicated Account Manager',
        'SLA 99.9% Uptime Guarantee',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" /> Company Hiring Plans & Quota Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Employer Subscription Packages
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Tailored subscription tiers designed exclusively for direct companies to post openings, source candidates, and manage hiring pipelines.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mt-4 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Annual Billing <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            return (
              <div
                key={plan.id}
                className={`glass-card rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md flex items-center gap-1"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono mb-1">{plan.target}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{plan.name}</h3>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${price}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
                  </div>

                  {/* Quota Metric Pills */}
                  <div className="space-y-2 mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Active Jobs
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{plan.jobLimit}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Download className="w-3.5 h-3.5 text-emerald-500" /> Resumes DB
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{plan.resumeDownloads}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5 text-amber-500" /> Recruiter Seats
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{plan.seats}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: plan.popular ? theme.primaryColor : '#1e293b' }}
                >
                  Choose {plan.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
