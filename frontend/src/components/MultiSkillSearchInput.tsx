'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Tag, Sparkles, X, Plus, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SkillSuggestionResponse } from '@job-portal/sdk';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'Java',
  'TypeScript',
  'AWS',
  'SQL',
  'DevOps',
  'Docker',
  'Next.js',
  'Spring Boot',
  'UI/UX',
];

interface MultiSkillSearchInputProps {
  selectedSkills: string[];
  onChangeSkills: (skills: string[]) => void;
  inputValue?: string;
  onChangeInput?: (val: string) => void;
  placeholder?: string;
  className?: string;
  maxSkills?: number;
  onSearch?: () => void;
}

export const MultiSkillSearchInput: React.FC<MultiSkillSearchInputProps> = ({
  selectedSkills,
  onChangeSkills,
  inputValue = '',
  onChangeInput,
  placeholder = 'Select skills, job role, or keywords...',
  className = '',
  maxSkills = 10,
  onSearch,
}) => {
  const { sdk } = useTheme();
  const [internalInput, setInternalInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState<SkillSuggestionResponse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const currentInput = onChangeInput ? inputValue : internalInput;
  const setInput = (val: string) => {
    if (onChangeInput) {
      onChangeInput(val);
    } else {
      setInternalInput(val);
    }
  };

  // Debounced autocomplete search
  useEffect(() => {
    if (!currentInput.trim()) {
      setSuggestionsData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await sdk.suggestSkills(currentInput.trim());
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
  }, [currentInput, sdk]);

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
    if (selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setInput('');
      return;
    }
    if (selectedSkills.length >= maxSkills) return;

    onChangeSkills([...selectedSkills, trimmed]);
    setInput('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeSkill = (indexToRemove: number) => {
    onChangeSkills(selectedSkills.filter((_, idx) => idx !== indexToRemove));
    inputRef.current?.focus();
  };

  const clearAll = () => {
    onChangeSkills([]);
    setInput('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentInput.trim()) {
        addSkill(currentInput.trim());
      } else if (onSearch) {
        setIsOpen(false);
        onSearch();
      }
    } else if (e.key === 'Backspace' && !currentInput && selectedSkills.length > 0) {
      removeSkill(selectedSkills.length - 1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input Container with Badges */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full min-h-[42px] px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent flex flex-wrap items-center gap-1.5 cursor-text transition-all"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />

        {/* Selected Skill Tags */}
        {selectedSkills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs shrink-0 animate-in fade-in duration-100"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(idx);
              }}
              className="text-indigo-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
              title={`Remove ${skill}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => {
            setInput(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedSkills.length === 0
              ? placeholder
              : selectedSkills.length < maxSkills
              ? 'Add skill or role (Enter)...'
              : ''
          }
          disabled={selectedSkills.length >= maxSkills}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none font-medium py-1"
        />

        {/* Clear All or Status */}
        {(selectedSkills.length > 0 || currentInput.trim()) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 shrink-0"
            title="Clear all selected skills"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete / Suggested Skills Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[300px] max-w-lg z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {currentInput.trim()
                ? `Skill Suggestions for "${currentInput}"`
                : 'Popular Skills (Click to Select)'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body: Direct Matches / Suggestions */}
          {currentInput.trim() ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {suggestionsData.suggestions.map((sug, idx) => {
                    const isSelected = selectedSkills.some(
                      (s) => s.toLowerCase() === sug.toLowerCase()
                    );
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addSkill(sug)}
                        disabled={isSelected}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white cursor-pointer shadow-xs'
                        }`}
                      >
                        <Tag className="w-3 h-3 opacity-60" />
                        <span>{sug}</span>
                        {isSelected ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              ) : !loading ? (
                <div className="py-2 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>No predefined suggestions found for &quot;{currentInput}&quot;.</div>
                  <button
                    type="button"
                    onClick={() => addSkill(currentInput.trim())}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Add &quot;{currentInput.trim()}&quot; as Skill Tag
                  </button>
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">Loading suggestions...</div>
              )}

              {/* Show Clusters if any */}
              {suggestionsData?.clusters && suggestionsData.clusters.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Related Skill Clusters</div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestionsData.clusters.flatMap((c) => c.allKeywords).slice(0, 12).map((kw, kwIdx) => {
                      const isSelected = selectedSkills.some(
                        (s) => s.toLowerCase() === kw.toLowerCase()
                      );
                      return (
                        <button
                          key={kwIdx}
                          type="button"
                          onClick={() => addSkill(kw)}
                          disabled={isSelected}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-60'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer'
                          }`}
                        >
                          <span>{kw}</span>
                          {isSelected ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Plus className="w-2.5 h-2.5 opacity-60" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Default Popular Skills */
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {POPULAR_SKILLS.map((skill, idx) => {
                  const isSelected = selectedSkills.some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addSkill(skill)}
                      disabled={isSelected}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 cursor-pointer'
                      }`}
                    >
                      <Tag className="w-3 h-3 opacity-60" />
                      <span>{skill}</span>
                      {isSelected ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3 opacity-60" />}
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                Tip: Type any skill name and press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">,</kbd> to add multiple skills.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
