'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tag, Search, Sparkles, X, Plus, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SkillSuggestionResponse } from '@job-portal/sdk';

interface SkillKeywordAutocompleteProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  maxSkills?: number;
}

export const SkillKeywordAutocomplete: React.FC<SkillKeywordAutocompleteProps> = ({
  selectedSkills,
  onChange,
  placeholder = 'Type a skill (e.g. java, python, react, devops)...',
  className = '',
  label,
  maxSkills = 15,
}) => {
  const { sdk } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState<SkillSuggestionResponse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced search on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestionsData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await sdk.suggestSkills(inputValue.trim());
        setSuggestionsData(res);
        setIsOpen(true);
      } catch (err) {
        console.warn('Error fetching skill suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputValue, sdk]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    if (selectedSkills.length >= maxSkills) return;

    onChange([...selectedSkills, trimmed]);
    setInputValue('');
    setIsOpen(false);
  };

  const removeSkill = (indexToRemove: number) => {
    onChange(selectedSkills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills.length - 1);
    }
  };

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> {label}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            {selectedSkills.length}/{maxSkills} selected
          </span>
        </label>
      )}

      {/* Selected Skill Pills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedSkills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(idx)}
                className="hover:text-rose-500 rounded p-0.5 transition-colors"
                title={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white flex items-center gap-2 focus-within:border-indigo-500 shadow-sm transition-colors">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!isOpen && e.target.value.trim()) setIsOpen(true);
            }}
            onFocus={() => {
              if (inputValue.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={selectedSkills.length === 0 ? placeholder : 'Add more skills (press enter)...'}
            className="w-full bg-transparent outline-none text-xs placeholder-slate-400"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addSkill(inputValue.trim())}
              className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 flex items-center gap-1 flex-shrink-0"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          )}
        </div>

        {/* Workday-Style Autocomplete Popover */}
        {isOpen && suggestionsData && (
          <div className="absolute left-0 top-full mt-1.5 w-full min-w-[320px] max-w-lg z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Workday-Style Skill Suggestions
              </span>
              <span className="text-[10px] text-slate-400">
                Click any chip to add
              </span>
            </div>

            <div className="p-3 max-h-72 overflow-y-auto space-y-3">
              {/* Clusters matching */}
              {suggestionsData.clusters && suggestionsData.clusters.length > 0 ? (
                suggestionsData.clusters.map((cluster, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-indigo-500" /> {cluster.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {cluster.category}
                      </span>
                    </div>

                    {/* Chips from this cluster */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {cluster.allKeywords.map((kw, kwIdx) => {
                        const isAlreadySelected = selectedSkills.some(
                          (s) => s.toLowerCase() === kw.toLowerCase()
                        );
                        const isDirectMatch = kw.toLowerCase().includes(inputValue.toLowerCase());

                        return (
                          <button
                            key={kwIdx}
                            type="button"
                            onClick={() => addSkill(kw)}
                            disabled={isAlreadySelected}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                              isAlreadySelected
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                                : isDirectMatch
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300'
                            }`}
                          >
                            <span>{kw}</span>
                            {isAlreadySelected ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Plus className="w-3 h-3 opacity-60" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">
                  No predefined skill clusters for &quot;{inputValue}&quot;. Press Enter to add as custom skill tag.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
