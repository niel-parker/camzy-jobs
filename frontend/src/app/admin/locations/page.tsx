'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { LocationItem } from '@job-portal/sdk';
import { 
  MapPin, Plus, Search, Edit3, Trash2, Star, 
  CheckCircle2, Loader2, RefreshCw, X, AlertCircle, Globe 
} from 'lucide-react';

export default function AdminManageLocationsPage() {
  const { sdk } = useTheme();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [popularFilter, setPopularFilter] = useState<'all' | 'popular'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    city: '',
    state: '',
    country: 'India',
    countryCode: 'IN',
    isPopular: false,
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLocations();
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setForm({
      city: '',
      state: '',
      country: 'India',
      countryCode: 'IN',
      isPopular: false,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setForm({
      city: loc.city,
      state: loc.state || '',
      country: loc.country || 'India',
      countryCode: loc.countryCode || 'IN',
      isPopular: !!loc.isPopular,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city || !form.state || !form.country) {
      setErrorMsg('City, State, and Country are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingLocation) {
        await sdk.updateLocation(editingLocation.id, {
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          countryCode: form.countryCode.trim().toUpperCase(),
          isPopular: form.isPopular,
        });
      } else {
        await sdk.createLocation({
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          countryCode: form.countryCode.trim().toUpperCase(),
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
              <span className="text-xs font-semibold theme-muted">City / State / Country Dropdowns</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-500" />
              Manage Locations
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Power auto-suggest location inputs for homepage search, candidate profiles, and employer job posting workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLocations}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
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

        {/* Locations Table */}
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
                        {loc.state}
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
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            title="Edit Location"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id, loc.city)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
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

        {/* Add / Edit Location Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingLocation ? 'Edit Master Location' : 'Add Master Location'}
                  </h3>
                  <p className="text-[10px] theme-muted">City, State, and Country entry</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    City Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore, Hyderabad, Pune, Mumbai"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka, Maharashtra, California"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India, United States"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      ISO Country Code
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      placeholder="e.g. IN, US, GB"
                      value={form.countryCode}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold theme-text">Mark as Featured / Popular Metro Area</span>
                  </label>
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingLocation ? 'Save Location' : 'Add Location'}</span>
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
