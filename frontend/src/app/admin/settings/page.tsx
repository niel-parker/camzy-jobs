'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import {
  Settings,
  Save,
  Check,
  Globe,
  Shield,
  DollarSign,
  Mail,
  Loader2,
  MapPin,
  Sparkles,
  Tag,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { LocationItem, SkillKeywordItem, ExperienceRangeItem, SkillSuggestionResponse } from '@job-portal/sdk';
import { LocationSearchDropdown } from '../../../components/LocationSearchDropdown';

type TabKey = 'general' | 'locations' | 'skills' | 'experience';

export default function SuperAdminSettingsPage() {
  const { sdk } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  // General Settings State
  const [appName, setAppName] = useState('Camzy Jobs');
  const [supportEmail, setSupportEmail] = useState('support@camzyjobs.com');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');
  const [enableConsultancies, setEnableConsultancies] = useState(false);
  const [enableFreeJobPosting, setEnableFreeJobPosting] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loadingGeneral, setLoadingGeneral] = useState(true);

  // Locations State
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    city: '',
    state: '',
    country: '',
    isPopular: false,
  });
  const [testSelectedLocation, setTestSelectedLocation] = useState('');

  // Skills State
  const [skills, setSkills] = useState<SkillKeywordItem[]>([]);
  const [skillsSearch, setSkillsSearch] = useState('');
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Backend & Enterprise',
    keywordsInput: '',
  });
  // Workday live test bench state
  const [testSkillQuery, setTestSkillQuery] = useState('java');
  const [testSkillResults, setTestSkillResults] = useState<SkillSuggestionResponse | null>(null);

  // Experience Ranges State
  const [expRanges, setExpRanges] = useState<ExperienceRangeItem[]>([]);
  const [expLoading, setExpLoading] = useState(false);
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [newExp, setNewExp] = useState({
    label: '',
    minYears: 0,
    maxYears: 5,
    sortOrder: 1,
  });

  // Load General Config
  useEffect(() => {
    async function loadConfig() {
      setLoadingGeneral(true);
      try {
        const config = await sdk.getAppConfig();
        if (config) {
          setAppName(config.siteName || 'Camzy Jobs');
          setSupportEmail(config.supportEmail || 'support@camzyjobs.com');
          setCurrency(config.defaultCurrency || 'USD');
          setEnableConsultancies(config.enableConsultancies ?? false);
          setEnableFreeJobPosting(config.enableFreeJobPosting ?? true);
        }
      } catch (err) {
        console.error('Error loading app config:', err);
      } finally {
        setLoadingGeneral(false);
      }
    }
    loadConfig();
  }, [sdk]);

  // Load Master Locations
  const loadLocations = async () => {
    setLocationLoading(true);
    try {
      const data = await sdk.getLocations();
      setLocations(data || []);
    } catch (err) {
      console.error('Error loading locations:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  // Load Master Skills
  const loadSkills = async () => {
    setSkillsLoading(true);
    try {
      const data = await sdk.getSkills();
      setSkills(data || []);
    } catch (err) {
      console.error('Error loading skills:', err);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Load Experience Ranges
  const loadExpRanges = async () => {
    setExpLoading(true);
    try {
      const data = await sdk.getExperienceRanges();
      setExpRanges(data || []);
    } catch (err) {
      console.error('Error loading experience ranges:', err);
    } finally {
      setExpLoading(false);
    }
  };

  // Tab change triggers data fetch
  useEffect(() => {
    if (activeTab === 'locations' && locations.length === 0) {
      loadLocations();
    } else if (activeTab === 'skills' && skills.length === 0) {
      loadSkills();
    } else if (activeTab === 'experience' && expRanges.length === 0) {
      loadExpRanges();
    }
  }, [activeTab]);

  // Workday Live Test Bench Effect
  useEffect(() => {
    if (activeTab === 'skills' && testSkillQuery.trim()) {
      let isSubscribed = true;
      sdk.suggestSkills(testSkillQuery).then((res) => {
        if (isSubscribed) setTestSkillResults(res);
      }).catch(console.error);

      return () => {
        isSubscribed = false;
      };
    }
  }, [testSkillQuery, activeTab, sdk]);

  // General Save
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sdk.updateAppConfig({
        siteName: appName,
        supportEmail,
        defaultCurrency: currency,
        enableConsultancies,
        enableFreeJobPosting,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving platform settings:', err);
    }
  };

  // Add Location
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.city || !newLocation.country) return;
    try {
      await sdk.createLocation(newLocation);
      setShowAddLocationModal(false);
      setNewLocation({ city: '', state: '', country: '', isPopular: false });
      loadLocations();
    } catch (err) {
      console.error('Error adding location:', err);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this master location?')) return;
    try {
      await sdk.deleteLocation(id);
      loadLocations();
    } catch (err) {
      console.error('Error deleting location:', err);
    }
  };

  // Add Skill Cluster
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name) return;
    try {
      const keywords = newSkill.keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      await sdk.createSkill({
        name: newSkill.name,
        category: newSkill.category,
        keywords: keywords.length > 0 ? keywords : [newSkill.name],
      });
      setShowAddSkillModal(false);
      setNewSkill({ name: '', category: 'Backend & Enterprise', keywordsInput: '' });
      loadSkills();
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill cluster?')) return;
    try {
      await sdk.deleteSkill(id);
      loadSkills();
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  // Add Experience Range
  const handleAddExpRange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sdk.createExperienceRange(newExp);
      setShowAddExpModal(false);
      setNewExp({ label: '', minYears: 0, maxYears: 5, sortOrder: expRanges.length + 1 });
      loadExpRanges();
    } catch (err) {
      console.error('Error adding experience range:', err);
    }
  };

  const handleDeleteExpRange = async (id: string) => {
    if (!confirm('Delete this experience bracket?')) return;
    try {
      await sdk.deleteExperienceRange(id);
      loadExpRanges();
    } catch (err) {
      console.error('Error deleting experience range:', err);
    }
  };

  // Filtered locations
  const filteredLocations = locations.filter((l) => {
    if (!locationSearch.trim()) return true;
    const q = locationSearch.toLowerCase();
    return (
      l.city.toLowerCase().includes(q) ||
      (l.state && l.state.toLowerCase().includes(q)) ||
      l.country.toLowerCase().includes(q)
    );
  });

  // Filtered skills
  const filteredSkills = skills.filter((s) => {
    if (!skillsSearch.trim()) return true;
    const q = skillsSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.keywords && s.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-500" /> Platform Governance & Master Data
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Configure platform parameters, global cities database, Workday-style skills taxonomy, and experience brackets.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> General
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'locations'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Locations Master
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'skills'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Skills & Workday Taxonomy
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'experience'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Experience Ranges
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center animate-in fade-in">
            <Check className="h-4 w-4 mr-2" /> Global platform settings saved and synchronized with MySQL backend!
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: GENERAL & PLATFORM                                 */}
        {/* ========================================================= */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {loadingGeneral ? (
              <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading platform configuration...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div className="p-6 rounded-2xl border theme-border theme-surface space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold theme-text border-b theme-border pb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" /> Branding & Metadata
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1">
                        Application Name
                      </label>
                      <input
                        type="text"
                        required
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1">
                        Support Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border theme-border theme-surface space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold theme-text border-b theme-border pb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Financial & Governance Rules
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1">
                        Default Billing Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      >
                        <option value="USD">USD ($) - United States Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="INR">INR (₹) - Indian Rupee</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold theme-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableFreeJobPosting}
                          onChange={(e) => setEnableFreeJobPosting(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Enable Free Tier Job Postings (Starter Quota)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold theme-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableConsultancies}
                          onChange={(e) => setEnableConsultancies(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Enable Recruitment Consultancies & Multi-Client Tenant Mode</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LOCATIONS MASTER (Cities, States, Countries)       */}
        {/* ========================================================= */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            {/* Top Interactive Sandbox */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Live Auto-Dropdown Preview
                </div>
                <h4 className="text-sm font-bold theme-text">
                  Test the Candidate / Recruiter Auto Dropdown with Search & Select
                </h4>
                <p className="text-xs theme-muted">
                  Type any city, state, or country below to experience the instant autocomplete dropdown:
                </p>
              </div>

              <div className="w-full md:w-80">
                <LocationSearchDropdown
                  value={testSelectedLocation}
                  onChange={(val) => setTestSelectedLocation(val)}
                  placeholder="Try searching Bengaluru, Austin, London..."
                />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Filter master cities, states, countries..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowAddLocationModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Master Location
                </button>
              </div>
            </div>

            {/* Locations Table */}
            <div className="rounded-2xl border theme-border theme-surface overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b theme-border text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">City</th>
                      <th className="px-5 py-3.5">State / Province</th>
                      <th className="px-5 py-3.5">Country</th>
                      <th className="px-5 py-3.5">Popular Destination</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border">
                    {locationLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center theme-muted">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                          Loading master locations database...
                        </td>
                      </tr>
                    ) : filteredLocations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center theme-muted">
                          No locations match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLocations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold theme-text flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span>{loc.city}</span>
                          </td>
                          <td className="px-5 py-3.5 theme-muted">{loc.state || '—'}</td>
                          <td className="px-5 py-3.5 font-medium theme-text">{loc.country}</td>
                          <td className="px-5 py-3.5">
                            {loc.isPopular ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Sparkles className="w-3 h-3" /> Popular Hub
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">Standard</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteLocation(loc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete location"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SKILLS & WORKDAY-STYLE TAXONOMY                     */}
        {/* ========================================================= */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Workday Live Test Bench Box */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                      Workday-Style Skill Suggestions Engine
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black bg-indigo-500 text-white">
                        Live Tester
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      As candidates and recruiters type a keyword, intelligent clusters automatically suggest synonyms &amp; related tech.
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={testSkillQuery}
                  onChange={(e) => setTestSkillQuery(e.target.value)}
                  placeholder="Type 'java', 'spring', 'python', 'cloud', 'react'..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              {/* Live Workday Suggestion Preview */}
              {testSkillResults && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Simulated suggestion dropdown for &quot;<span className="text-indigo-400 font-bold">{testSkillQuery}</span>&quot;:
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {testSkillResults.suggestions.length} suggestions returned
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {testSkillResults.suggestions.map((kw, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          kw.toLowerCase().includes(testSkillQuery.toLowerCase())
                            ? 'bg-indigo-600 text-white font-bold shadow-md'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Tag className="w-3 h-3 opacity-60" />
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>

                  {testSkillResults.clusters && testSkillResults.clusters.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
                      <span className="font-bold text-slate-300">Matched Clusters:</span>
                      {testSkillResults.clusters.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">
                          {c.name} ({c.category})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={skillsSearch}
                  onChange={(e) => setSkillsSearch(e.target.value)}
                  placeholder="Filter skill clusters or keywords..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs theme-text outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <button
                onClick={() => setShowAddSkillModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Skill Taxonomy Cluster
              </button>
            </div>

            {/* Skills Taxonomy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsLoading ? (
                <div className="col-span-2 py-16 text-center theme-muted text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                  Loading skill taxonomy clusters...
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="col-span-2 py-16 text-center theme-muted text-xs">
                  No skills match your filter.
                </div>
              ) : (
                filteredSkills.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="p-5 rounded-2xl border theme-border theme-surface shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {cluster.category}
                        </span>
                        <h4 className="text-sm font-extrabold theme-text mt-1.5 flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-indigo-500" /> {cluster.name}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(cluster.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete cluster"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cluster.keywords &&
                        cluster.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          >
                            {kw}
                          </span>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: EXPERIENCE RANGES                                  */}
        {/* ========================================================= */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold theme-text">Experience Brackets &amp; Matching Rules</h3>
                <p className="text-xs theme-muted">
                  Configured brackets appear in candidate filters and job posting selectors.
                </p>
              </div>

              <button
                onClick={() => setShowAddExpModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Experience Bracket
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expLoading ? (
                <div className="col-span-3 py-16 text-center theme-muted text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                  Loading experience brackets...
                </div>
              ) : expRanges.length === 0 ? (
                <div className="col-span-3 py-16 text-center theme-muted text-xs">
                  No experience ranges found.
                </div>
              ) : (
                expRanges.map((rng) => (
                  <div
                    key={rng.id}
                    className="p-5 rounded-2xl border theme-border theme-surface shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs">
                          {rng.sortOrder}
                        </div>
                        <div>
                          <h4 className="text-xs font-black theme-text">{rng.label}</h4>
                          <span className="text-[11px] text-slate-400">
                            {rng.minYears} - {rng.maxYears >= 20 ? '20+' : rng.maxYears} Years
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteExpRange(rng.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete bracket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-2 border-t theme-border flex items-center justify-between text-[11px] theme-muted">
                      <span>Status: <strong className="text-emerald-500 font-bold">Active</strong></span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                        Sort #{rng.sortOrder}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD MASTER LOCATION                                */}
        {/* ========================================================= */}
        {showAddLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-sm font-black theme-text flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" /> Add Master Location
                </h3>
                <button onClick={() => setShowAddLocationModal(false)} className="theme-muted hover:theme-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <label className="text-xs font-bold theme-text block mb-1">City Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Austin, London"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold theme-text block mb-1">State / Province</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka, Texas, Greater London"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold theme-text block mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India, United States, United Kingdom"
                    value={newLocation.country}
                    onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold theme-text cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newLocation.isPopular}
                    onChange={(e) => setNewLocation({ ...newLocation, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Popular Hub (Highlighted in Auto Dropdown)</span>
                </label>

                <div className="flex justify-end gap-2 pt-3 border-t theme-border">
                  <button
                    type="button"
                    onClick={() => setShowAddLocationModal(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                  >
                    Save Master Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD SKILL CLUSTER                                  */}
        {/* ========================================================= */}
        {showAddSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="max-w-lg w-full theme-surface border theme-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-sm font-black theme-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Add Skill &amp; Workday Taxonomy Cluster
                </h3>
                <button onClick={() => setShowAddSkillModal(false)} className="theme-muted hover:theme-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSkill} className="space-y-4">
                <div>
                  <label className="text-xs font-bold theme-text block mb-1">Primary Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java, Python, Golang, Salesforce"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold theme-text block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Backend & Enterprise, AI & Data Science"
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold theme-text block mb-1">
                    Related Keywords / Synonyms (Comma Separated) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Java, Spring, Spring Boot, Java Backend, Java Microservices, Hibernate, JPA"
                    value={newSkill.keywordsInput}
                    onChange={(e) => setNewSkill({ ...newSkill, keywordsInput: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] theme-muted mt-1">
                    When someone searches for any of these terms, the engine suggests the entire group Workday-style!
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t theme-border">
                  <button
                    type="button"
                    onClick={() => setShowAddSkillModal(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                  >
                    Save Skill Cluster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD EXPERIENCE RANGE                               */}
        {/* ========================================================= */}
        {showAddExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <h3 className="text-sm font-black theme-text flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" /> Add Experience Bracket
                </h3>
                <button onClick={() => setShowAddExpModal(false)} className="theme-muted hover:theme-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddExpRange} className="space-y-4">
                <div>
                  <label className="text-xs font-bold theme-text block mb-1">Bracket Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 - 5 Yrs (Mid-Level)"
                    value={newExp.label}
                    onChange={(e) => setNewExp({ ...newExp, label: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold theme-text block mb-1">Min Years</label>
                    <input
                      type="number"
                      min={0}
                      value={newExp.minYears}
                      onChange={(e) => setNewExp({ ...newExp, minYears: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold theme-text block mb-1">Max Years</label>
                    <input
                      type="number"
                      min={newExp.minYears}
                      value={newExp.maxYears}
                      onChange={(e) => setNewExp({ ...newExp, maxYears: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold theme-text block mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={newExp.sortOrder}
                    onChange={(e) => setNewExp({ ...newExp, sortOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border theme-border theme-input theme-text text-xs outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t theme-border">
                  <button
                    type="button"
                    onClick={() => setShowAddExpModal(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                  >
                    Save Bracket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
