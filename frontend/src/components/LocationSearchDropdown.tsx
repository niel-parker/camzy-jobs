'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, Check, Globe, Sparkles, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LocationItem } from '@job-portal/sdk';

interface LocationSearchDropdownProps {
  value: string;
  onChange: (value: string, details?: { city: string; state?: string; country: string }) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
  required?: boolean;
}

export const LocationSearchDropdown: React.FC<LocationSearchDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Select city, state, or country...',
  className = '',
  allowCustom = true,
  required = false,
}) => {
  const { sdk } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load locations on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMasterLocations() {
      try {
        setLoading(true);
        const data = await sdk.getLocations();
        if (isMounted && data && Array.isArray(data)) {
          setLocations(data);
        }
      } catch (err) {
        console.warn('Could not load locations from master API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMasterLocations();
    return () => {
      isMounted = false;
    };
  }, [sdk]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLocation = (loc: LocationItem) => {
    if (loc.state && loc.state !== loc.city) {
      return `${loc.city}, ${loc.state}, ${loc.country}`;
    }
    return `${loc.city}, ${loc.country}`;
  };

  // Filter locations
  const filtered = locations.filter((loc) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      loc.city.toLowerCase().includes(q) ||
      (loc.state && loc.state.toLowerCase().includes(q)) ||
      loc.country.toLowerCase().includes(q)
    );
  });

  const popularLocations = locations.filter((l) => l.isPopular);

  const handleSelect = (loc: LocationItem) => {
    const formatted = formatLocation(loc);
    onChange(formatted, {
      city: loc.city,
      state: loc.state,
      country: loc.country,
    });
    setIsOpen(false);
    setQuery('');
  };

  const handleCustomSelect = () => {
    if (query.trim()) {
      onChange(query.trim(), {
        city: query.trim(),
        country: 'Worldwide',
      });
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className={`truncate ${!value ? 'text-slate-400' : 'font-semibold'}`}>
            {value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[280px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950/50">
            <Search className="w-4 h-4 text-slate-400 ml-1.5 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, state, or country..."
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder-slate-400 py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filtered.length > 0) {
                    handleSelect(filtered[0]);
                  } else if (allowCustom) {
                    handleCustomSelect();
                  }
                }
              }}
            />
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {/* Custom search option if no exact match */}
            {allowCustom && query.trim().length > 0 && (
              <button
                type="button"
                onClick={handleCustomSelect}
                className="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use &quot;{query.trim()}&quot; as custom location</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10">
                  Custom
                </span>
              </button>
            )}

            {/* Empty Popular Highlights if query is blank */}
            {!query.trim() && popularLocations.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Popular Cities & Hubs
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {popularLocations.slice(0, 8).map((loc) => {
                    const formatted = formatLocation(loc);
                    const isSelected = value === formatted;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{loc.city}</span>
                        {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List all filtered locations */}
            <div className="p-1 space-y-0.5">
              {!query.trim() && (
                <div className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 px-2 py-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-500" /> All Global Master Locations ({filtered.length})
                </div>
              )}

              {filtered.length === 0 && !query.trim() ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No master locations loaded yet.
                </div>
              ) : filtered.length === 0 && query.trim() ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching master cities found. Press enter to use &quot;{query}&quot;.
                </div>
              ) : (
                filtered.map((loc) => {
                  const formatted = formatLocation(loc);
                  const isSelected = value === formatted;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full px-3 py-2 text-left rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            loc.isPopular ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {loc.city}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            {loc.state ? `${loc.state}, ` : ''}{loc.country}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {loc.isPopular && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Popular
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
