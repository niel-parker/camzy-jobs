'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ExperienceRangeItem } from '@job-portal/sdk';

interface ExperienceRangeSelectorProps {
  minYears: number;
  maxYears: number;
  experienceLevel?: string;
  onChange: (min: number, max: number, levelLabel?: string) => void;
  className?: string;
}

export const ExperienceRangeSelector: React.FC<ExperienceRangeSelectorProps> = ({
  minYears,
  maxYears,
  experienceLevel,
  onChange,
  className = '',
}) => {
  const { sdk } = useTheme();
  const [presetRanges, setPresetRanges] = useState<ExperienceRangeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadRanges() {
      try {
        setLoading(true);
        const data = await sdk.getExperienceRanges();
        if (isMounted && data && Array.isArray(data)) {
          setPresetRanges(data);
        }
      } catch (err) {
        console.warn('Error loading experience ranges:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRanges();
    return () => {
      isMounted = false;
    };
  }, [sdk]);

  const handleSelectPreset = (range: ExperienceRangeItem) => {
    let level = 'Mid';
    if (range.minYears === 0) level = 'Entry';
    else if (range.minYears <= 2) level = 'Mid';
    else if (range.minYears <= 5) level = 'Senior';
    else if (range.minYears <= 8) level = 'Lead';
    else level = 'Executive';

    onChange(range.minYears, range.maxYears, level);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-500" /> Experience Requirement Range *
        </label>
        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          {minYears} - {maxYears > 20 ? '20+' : maxYears} Years
        </span>
      </div>

      {/* Quick Preset Brackets */}
      {presetRanges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presetRanges.map((rng) => {
            const isSelected = minYears === rng.minYears && maxYears === rng.maxYears;
            return (
              <button
                key={rng.id}
                type="button"
                onClick={() => handleSelectPreset(rng)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                }`}
              >
                {rng.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Number Stepper Inputs */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Minimum Experience (Years)
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={minYears}
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
              onChange(val, Math.max(val, maxYears));
            }}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Maximum Experience (Years)
          </label>
          <input
            type="number"
            min={minYears}
            max={40}
            value={maxYears}
            onChange={(e) => {
              const val = Math.max(minYears, parseInt(e.target.value, 10) || minYears);
              onChange(minYears, val);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
          />
        </div>
      </div>
    </div>
  );
};
