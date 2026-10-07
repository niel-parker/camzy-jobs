'use client';

import React from 'react';
import { JobListing } from '@job-portal/sdk';
import { Building2, MapPin, DollarSign, Calendar, Sparkles, Award, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface JobCardProps {
  job: JobListing;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { theme } = useTheme();

  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 group relative overflow-hidden">
      {/* Featured Badge Glow */}
      {job.isFeatured && (
        <div className="absolute top-0 right-0">
          <div
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl text-white flex items-center gap-1 shadow-sm"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Sparkles className="w-3 h-3" /> Featured
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Company / Agency Logo */}
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
          {job.companyLogoUrl ? (
            <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-7 h-7 text-indigo-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{job.companyName}</span>
            
            {/* Consultancy Indicator */}
            {job.isConsultancy && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-500" /> Placement Agency
              </span>
            )}

            {job.clientCompanyName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono">
                For: {job.clientCompanyName}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
            {job.title}
          </h3>

          {/* Key Details Tags */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} {job.isRemote && '(Remote)'}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {job.isSalaryVisible && job.salaryMin
                ? `${job.currency} $${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`
                : 'Competitive Salary'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              {job.employmentType}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {job.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" /> Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
            <button
              className="text-xs font-bold flex items-center gap-1 transition-transform group-hover:translate-x-1"
              style={{ color: theme.primaryColor }}
            >
              Apply Now <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
