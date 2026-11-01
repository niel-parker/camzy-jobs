'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options?: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  pageSize?: number;
  clearable?: boolean;
  loadOptions?: (query: string, page: number) => Promise<{ options: SelectOption[]; total: number }>;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  icon,
  className = '',
  disabled = false,
  pageSize = 15,
  clearable = false,
  loadOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [asyncTotal, setAsyncTotal] = useState(0);
  const [isLoadingAsync, setIsLoadingAsync] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options array to SelectOption objects
  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
  }, [options]);

  // Handle async fetching if loadOptions is provided
  useEffect(() => {
    if (!loadOptions || !isOpen) return;

    let isMounted = true;
    setIsLoadingAsync(true);

    const timer = setTimeout(async () => {
      try {
        const res = await loadOptions(searchTerm, page);
        if (isMounted) {
          setAsyncOptions(res.options);
          setAsyncTotal(res.total);
        }
      } catch (err) {
        console.warn('Error loading async options in SearchableSelect:', err);
      } finally {
        if (isMounted) setIsLoadingAsync(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [loadOptions, searchTerm, page, isOpen]);

  // Client-side filtering when not using loadOptions
  const filteredOptions = useMemo(() => {
    if (loadOptions) return asyncOptions;
    if (!searchTerm.trim()) return normalizedOptions;

    const term = searchTerm.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        opt.value.toLowerCase().includes(term) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(term))
    );
  }, [normalizedOptions, searchTerm, loadOptions, asyncOptions]);

  // Total count & pages
  const totalItems = loadOptions ? asyncTotal : filteredOptions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Client-side pagination slicing
  const visibleOptions = useMemo(() => {
    if (loadOptions) return asyncOptions;
    const startIndex = (page - 1) * pageSize;
    return filteredOptions.slice(startIndex, startIndex + pageSize);
  }, [loadOptions, asyncOptions, filteredOptions, page, pageSize]);

  // Find selected option label
  const selectedOption = useMemo(() => {
    const fromList = normalizedOptions.find((opt) => opt.value === value);
    if (fromList) return fromList;
    if (asyncOptions.length > 0) {
      return asyncOptions.find((opt) => opt.value === value);
    }
    return undefined;
  }, [normalizedOptions, asyncOptions, value]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Auto-focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && visibleOptions.length > 0) {
      e.preventDefault();
      handleSelect(visibleOptions[0].value);
    }
  };

  const startRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalItems);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-400 flex-shrink-0">{icon}</span>}
          <span className={`truncate ${selectedOption ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Searchable Dropdown Overlay Menu */}
      {isOpen && (
        <div 
          onKeyDown={handleKeyDown}
          className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 min-w-[220px]"
        >
          {/* Inner Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950/60">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            />
            {isLoadingAsync ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 flex-shrink-0" />
            ) : searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>

          {/* Options List - Render ONLY the current page slice for 60fps performance */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {isLoadingAsync ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Searching records...</span>
              </div>
            ) : visibleOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">
                No matching options found
              </div>
            ) : (
              visibleOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[10px] text-slate-400 font-normal truncate">{opt.sublabel}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-1" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Paginated Footer */}
          {totalItems > pageSize && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] text-slate-500 dark:text-slate-400 select-none">
              <span className="font-medium">
                {startRecord}&ndash;{endRecord} of {totalItems}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold px-1 text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
