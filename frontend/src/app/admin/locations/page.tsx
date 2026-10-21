'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { LocationItem } from '@job-portal/sdk';
import { 
  MapPin, Plus, Search, Edit3, Trash2, Star, 
  CheckCircle2, Loader2, RefreshCw, X, AlertCircle, Globe, Building2 
} from 'lucide-react';

const DEFAULT_STATES_BY_COUNTRY: Record<string, string[]> = {
  'India': [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
    'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 
    'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ],
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  'United Kingdom': [
    'Cambridgeshire', 'Greater London', 'Greater Manchester', 'West Midlands', 
    'West Yorkshire', 'Scotland', 'Wales', 'Northern Ireland', 'Hampshire', 
    'Merseyside', 'South Yorkshire', 'Tyne and Wear', 'Bristol'
  ],
  'Canada': [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 
    'Prince Edward Island', 'Quebec', 'Saskatchewan'
  ],
  'Australia': [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 
    'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
  ],
  'United Arab Emirates': [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al-Quwain', 'Ras Al-Khaimah', 'Fujairah'
  ],
  'Germany': [
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 
    'Hamburg', 'Hesse', 'Lower Saxony', 'North Rhine-Westphalia', 'Saxony'
  ],
  'Singapore': [
    'Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'
  ],
  'Netherlands': [
    'North Holland', 'South Holland', 'Utrecht', 'North Brabant', 'Gelderland'
  ],
  'Ireland': [
    'Leinster', 'Munster', 'Connacht', 'Ulster'
  ],
  'Japan': [
    'Kanto', 'Kansai', 'Chubu', 'Kyushu', 'Hokkaido'
  ],
  'Remote': [
    'Worldwide'
  ]
};

const DEFAULT_COUNTRY_CODES: Record<string, string> = {
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'United Arab Emirates': 'AE',
  'Germany': 'DE',
  'Singapore': 'SG',
  'Netherlands': 'NL',
  'Ireland': 'IE',
  'Japan': 'JP',
  'Remote': 'WW',
};

export default function AdminManageLocationsPage() {
  const { sdk } = useTheme();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [popularFilter, setPopularFilter] = useState<'all' | 'popular'>('all');

  // Add / Edit City Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Country/State input mode flags in Add City modal
  const [isCustomCountryMode, setIsCustomCountryMode] = useState<boolean>(false);
  const [isCustomStateMode, setIsCustomStateMode] = useState<boolean>(false);

  const [form, setForm] = useState({
    city: '',
    state: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    isPopular: false,
  });

  // Dedicated Quick Add Country Modal
  const [isAddCountryModalOpen, setIsAddCountryModalOpen] = useState<boolean>(false);
  const [newCountryForm, setNewCountryForm] = useState({
    countryName: '',
    countryCode: '',
    capitalCity: '',
    stateName: '',
  });

  // Dedicated Quick Add State Modal
  const [isAddStateModalOpen, setIsAddStateModalOpen] = useState<boolean>(false);
  const [newStateForm, setNewStateForm] = useState({
    country: 'India',
    stateName: '',
    primaryCity: '',
  });

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await sdk.getLocations({
        q: searchQuery || undefined,
        popular: popularFilter === 'popular' ? true : undefined,
      });
      setLocations(data);
    } catch (err: any) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [popularFilter, sdk]);

  // Dynamically compute unique countries list
  const availableCountries = useMemo(() => {
    const countrySet = new Set<string>(Object.keys(DEFAULT_STATES_BY_COUNTRY));
    locations.forEach((loc) => {
      if (loc.country && loc.country.trim()) countrySet.add(loc.country.trim());
    });
    return Array.from(countrySet).sort((a, b) => {
      if (a === 'India') return -1;
      if (b === 'India') return 1;
      if (a === 'United States') return -1;
      if (b === 'United States') return 1;
      return a.localeCompare(b);
    });
  }, [locations]);

  // Dynamically compute unique states for the selected country
  const availableStatesForCountry = useMemo(() => {
    const statesSet = new Set<string>(DEFAULT_STATES_BY_COUNTRY[form.country] || []);
    locations
      .filter((loc) => loc.country?.toLowerCase() === form.country?.toLowerCase())
      .forEach((loc) => {
        if (loc.state && loc.state.trim()) statesSet.add(loc.state.trim());
      });
    return Array.from(statesSet).sort();
  }, [locations, form.country]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLocations();
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setIsCustomCountryMode(false);
    setIsCustomStateMode(false);
    setForm({
      city: '',
      state: DEFAULT_STATES_BY_COUNTRY['India']?.[0] || 'Karnataka',
      country: 'India',
      countryCode: 'IN',
      isPopular: false,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setIsCustomCountryMode(false);
    setIsCustomStateMode(false);
    setForm({
      city: loc.city,
      state: loc.state || '',
      country: loc.country || 'India',
      countryCode: loc.countryCode || DEFAULT_COUNTRY_CODES[loc.country || 'India'] || 'IN',
      isPopular: !!loc.isPopular,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleCountryDropdownChange = (countryName: string) => {
    if (countryName === '__ADD_NEW__') {
      setIsCustomCountryMode(true);
      setForm((prev) => ({
        ...prev,
        country: '',
        countryCode: '',
        state: '',
      }));
      return;
    }

    setIsCustomCountryMode(false);
    setIsCustomStateMode(false);
    const countryStates = DEFAULT_STATES_BY_COUNTRY[countryName] || [];
    const firstState = countryStates.length > 0 ? countryStates[0] : '';
    const code = DEFAULT_COUNTRY_CODES[countryName] || '';

    setForm((prev) => ({
      ...prev,
      country: countryName,
      countryCode: code,
      state: firstState,
    }));
  };

  const handleStateDropdownChange = (stateName: string) => {
    if (stateName === '__ADD_NEW__') {
      setIsCustomStateMode(true);
      setForm((prev) => ({ ...prev, state: '' }));
      return;
    }
    setIsCustomStateMode(false);
    setForm((prev) => ({ ...prev, state: stateName }));
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city.trim() || !form.country.trim()) {
      setErrorMsg('City and Country are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingLocation) {
        await sdk.updateLocation(editingLocation.id, {
          city: form.city.trim(),
          state: form.state.trim() || undefined,
          country: form.country.trim(),
          countryCode: form.countryCode.trim().toUpperCase() || undefined,
          isPopular: form.isPopular,
        });
      } else {
        await sdk.createLocation({
          city: form.city.trim(),
          state: form.state.trim() || undefined,
          country: form.country.trim(),
          countryCode: form.countryCode.trim().toUpperCase() || undefined,
          isPopular: form.isPopular,
        });
      }

      setIsModalOpen(false);
      loadLocations();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  // Save Dedicated Country
  const handleSaveCountryOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryForm.countryName.trim()) {
      setErrorMsg('Country name is required.');
      return;
    }

    setSaving(true);
    try {
      const countryName = newCountryForm.countryName.trim();
      const code = newCountryForm.countryCode.trim().toUpperCase();
      const city = newCountryForm.capitalCity.trim() || 'Central City';
      const state = newCountryForm.stateName.trim() || 'General';

      await sdk.createLocation({
        city,
        state,
        country: countryName,
        countryCode: code,
        isPopular: false,
      });

      setIsAddCountryModalOpen(false);
      setNewCountryForm({ countryName: '', countryCode: '', capitalCity: '', stateName: '' });
      loadLocations();
    } catch (err: any) {
      alert(err.message || 'Failed to add country');
    } finally {
      setSaving(false);
    }
  };

  // Save Dedicated State
  const handleSaveStateOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateForm.stateName.trim() || !newStateForm.country.trim()) {
      alert('State name and Country are required.');
      return;
    }

    setSaving(true);
    try {
      const countryName = newStateForm.country.trim();
      const stateName = newStateForm.stateName.trim();
      const city = newStateForm.primaryCity.trim() || `${stateName} Hub`;
      const code = DEFAULT_COUNTRY_CODES[countryName] || '';

      await sdk.createLocation({
        city,
        state: stateName,
        country: countryName,
        countryCode: code,
        isPopular: false,
      });

      setIsAddStateModalOpen(false);
      setNewStateForm({ country: 'India', stateName: '', primaryCity: '' });
      loadLocations();
    } catch (err: any) {
      alert(err.message || 'Failed to add state');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePopular = async (loc: LocationItem) => {
    try {
      await sdk.updateLocation(loc.id, {
        isPopular: !loc.isPopular,
      });
      setLocations((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, isPopular: !loc.isPopular } : l))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle popular flag');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    try {
      await sdk.deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete location');
    }
  };

  const filteredLocations = locations.filter((l) =>
    (l.city && l.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.state && l.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.country && l.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Geography Master Data
              </span>
              <span className="text-xs font-semibold theme-muted">Dropdown-Powered Cities & Regions</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-500" />
              Manage Locations
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Select country and state directly from dropdowns when adding cities, with one-click options to register new countries and states.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadLocations}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Quick Add Country Button */}
            <button
              onClick={() => setIsAddCountryModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Add a new Country"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add Country</span>
            </button>

            {/* Quick Add State Button */}
            <button
              onClick={() => setIsAddStateModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Add a new State to any Country"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add State</span>
            </button>

            {/* Add City Button */}
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add City</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="border-b theme-border flex items-center space-x-6">
          <button
            onClick={() => setPopularFilter('all')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              popularFilter === 'all'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>All Locations ({locations.length})</span>
          </button>

          <button
            onClick={() => setPopularFilter('popular')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              popularFilter === 'popular'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Featured & Popular Metros</span>
          </button>
        </div>

        {/* Search */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
              <input
                type="text"
                placeholder="Search by city, state, or country name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 theme-muted hover:theme-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Locations Table (Exact match to current view) */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading locations...</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No locations found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  Add major cities and tech hubs to enable auto-suggestions on homepage search.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">City / Municipality</th>
                    <th className="py-3 px-4">State / Province</th>
                    <th className="py-3 px-4">Country & Code</th>
                    <th className="py-3 px-4 text-center">Popular Metro</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredLocations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="font-extrabold theme-text">{loc.city}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium theme-text">
                        {loc.state || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="theme-text font-bold">{loc.country}</span>
                        {loc.countryCode && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 theme-muted">
                            {loc.countryCode}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePopular(loc)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            loc.isPopular
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
                          }`}
                          title="Click to toggle popular status"
                        >
                          <Star className={`w-3 h-3 ${loc.isPopular ? 'fill-amber-500' : ''}`} />
                          <span>{loc.isPopular ? 'Popular' : 'Standard'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(loc)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit Location"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id, loc.city)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Location"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ADD / EDIT CITY MODAL (With Country & State Dropdowns) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingLocation ? 'Edit Master Location' : 'Add City to Master Registry'}
                  </h3>
                  <p className="text-[10px] theme-muted">Select Country & State from dropdowns, or add new ones</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLocation} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Country Dropdown / Custom Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCountryMode(!isCustomCountryMode)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      {isCustomCountryMode ? '← Choose from Dropdown' : '+ Add New Country'}
                    </button>
                  </div>

                  {isCustomCountryMode ? (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Enter Country Name"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="col-span-2 px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="ISO Code"
                        value={form.countryCode}
                        onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                        className="px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <select
                        value={form.country}
                        onChange={(e) => handleCountryDropdownChange(e.target.value)}
                        className="col-span-3 px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availableCountries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__ADD_NEW__">+ Add New Country...</option>
                      </select>

                      <input
                        type="text"
                        maxLength={3}
                        placeholder="Code"
                        value={form.countryCode}
                        onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                        className="px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono text-center focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* State Dropdown / Custom Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      State / Province <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomStateMode(!isCustomStateMode)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      {isCustomStateMode ? '← Choose from Dropdown' : '+ Add New State'}
                    </button>
                  </div>

                  {isCustomStateMode ? (
                    <input
                      type="text"
                      required
                      placeholder="Enter State or Province Name"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <select
                      value={form.state}
                      onChange={(e) => handleStateDropdownChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableStatesForCountry.length === 0 ? (
                        <option value="">No states found — click Add New State</option>
                      ) : (
                        availableStatesForCountry.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      )}
                      <option value="__ADD_NEW__">+ Add New State...</option>
                    </select>
                  )}
                </div>

                {/* City Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    City Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune, Bangalore, Austin, Munich"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Featured Metro Checkbox */}
                <div className="pt-2 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold theme-text">Mark as Featured / Popular Metro Area</span>
                  </label>
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingLocation ? 'Save Location' : 'Save City'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DEDICATED QUICK ADD COUNTRY MODAL */}
        {isAddCountryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span>Register New Country</span>
                  </h3>
                  <p className="text-[10px] theme-muted">Adds country to the master dropdown registry</p>
                </div>
                <button
                  onClick={() => setIsAddCountryModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCountryOnly} className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Country Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Switzerland, Sweden, France"
                      value={newCountryForm.countryName}
                      onChange={(e) => setNewCountryForm({ ...newCountryForm, countryName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      ISO Code
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      placeholder="e.g. CH"
                      value={newCountryForm.countryCode}
                      onChange={(e) => setNewCountryForm({ ...newCountryForm, countryCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono text-center focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Primary Hub or Capital City (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zurich, Stockholm, Paris"
                    value={newCountryForm.capitalCity}
                    onChange={(e) => setNewCountryForm({ ...newCountryForm, capitalCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Initial State or Region (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zurich Canton, Stockholm County"
                    value={newCountryForm.stateName}
                    onChange={(e) => setNewCountryForm({ ...newCountryForm, stateName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCountryModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Country</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DEDICATED QUICK ADD STATE MODAL */}
        {isAddStateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <span>Register New State / Province</span>
                  </h3>
                  <p className="text-[10px] theme-muted">Adds state under any country to the master dropdowns</p>
                </div>
                <button
                  onClick={() => setIsAddStateModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStateOnly} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStateForm.country}
                    onChange={(e) => setNewStateForm({ ...newStateForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    State / Province Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goa, Nevada, Bavaria, Queensland"
                    value={newStateForm.stateName}
                    onChange={(e) => setNewStateForm({ ...newStateForm, stateName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Primary / Capital City (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Panaji, Las Vegas, Munich, Brisbane"
                    value={newStateForm.primaryCity}
                    onChange={(e) => setNewStateForm({ ...newStateForm, primaryCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save State</span>
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
