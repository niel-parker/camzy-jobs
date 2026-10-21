'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { SubscriptionPackageItem } from '@job-portal/sdk';
import { 
  CreditCard, Plus, Search, Edit3, Trash2, Check, 
  Sparkles, Loader2, RefreshCw, X, AlertCircle, Zap, Shield 
} from 'lucide-react';

export default function AdminSubscriptionPackagesPage() {
  const { sdk } = useTheme();

  const [packages, setPackages] = useState<SubscriptionPackageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPkg, setEditingPkg] = useState<SubscriptionPackageItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    priceMonthly: 0,
    priceYearly: 0,
    maxActiveJobs: 5,
    maxResumeDownloads: 50,
    maxTeamSeats: 2,
    features: 'Standard ATS Kanban, Email Support, Basic Analytics',
  });

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await sdk.getPackages();
      setPackages(data);
    } catch (err: any) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [sdk]);

  const openAddModal = () => {
    setEditingPkg(null);
    setForm({
      name: '',
      code: '',
      priceMonthly: 49,
      priceYearly: 490,
      maxActiveJobs: 5,
      maxResumeDownloads: 50,
      maxTeamSeats: 2,
      features: 'Active Job Postings, Resume Database Access, Team Seats, Email Support',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: SubscriptionPackageItem) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      code: pkg.code,
      priceMonthly: pkg.priceMonthly || 0,
      priceYearly: pkg.priceYearly || 0,
      maxActiveJobs: pkg.maxActiveJobs || 0,
      maxResumeDownloads: pkg.maxResumeDownloads || 0,
      maxTeamSeats: pkg.maxTeamSeats || 1,
      features: pkg.features?.join(', ') || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      setErrorMsg('Plan name and code are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const featuresArray = form.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      await sdk.savePackage({
        id: editingPkg ? editingPkg.id : undefined,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        maxActiveJobs: Number(form.maxActiveJobs),
        maxResumeDownloads: Number(form.maxResumeDownloads),
        maxTeamSeats: Number(form.maxTeamSeats),
        features: featuresArray,
      });

      setIsModalOpen(false);
      loadPackages();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete package "${name}"?`)) return;
    try {
      await sdk.deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Monetization & Plans
              </span>
              <span className="text-xs font-semibold theme-muted">Employer Pricing Tiers</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-500" />
              Subscription Package Management
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Configure pricing, active job posting quotas, resume candidate downloads, and recruiter seat limits for employer plans.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadPackages}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Package</span>
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold theme-muted">Loading subscription packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="theme-surface border theme-border rounded-2xl p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold theme-text">No packages configured</h4>
            <p className="text-xs theme-muted max-w-sm mx-auto">
              Click Create New Package above to configure your subscription tiers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="theme-surface border theme-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {pkg.code}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg border theme-border theme-text hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-500 transition-colors"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id, pkg.name)}
                        className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black theme-text">{pkg.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-black theme-text">${pkg.priceMonthly}</span>
                      <span className="text-xs theme-muted ml-1">/ month</span>
                    </div>
                    <p className="text-[11px] theme-muted mt-0.5">${pkg.priceYearly} billed annually</p>
                  </div>

                  {/* Quotas Box */}
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border theme-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="theme-muted font-medium">Active Jobs:</span>
                      <span className="font-extrabold theme-text font-mono">{pkg.maxActiveJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="theme-muted font-medium">Resume Downloads:</span>
                      <span className="font-extrabold theme-text font-mono">{pkg.maxResumeDownloads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="theme-muted font-medium">Recruiter Seats:</span>
                      <span className="font-extrabold theme-text font-mono">{pkg.maxTeamSeats}</span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Included Features
                    </span>
                    <ul className="space-y-1 text-[11px]">
                      {pkg.features && pkg.features.length > 0 ? (
                        pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 theme-muted">
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs theme-muted italic">Standard recruitment platform access</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t theme-border mt-4">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="w-full py-2 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                  >
                    Adjust Pricing & Quotas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingPkg ? `Edit Package: ${editingPkg.name}` : 'Create Subscription Package'}
                  </h3>
                  <p className="text-[10px] theme-muted">Set monthly fees and system quota limits</p>
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Plan Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Professional Growth"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Plan Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PRO, GROWTH"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      value={form.priceMonthly}
                      onChange={(e) => setForm({ ...form, priceMonthly: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Yearly Price ($)
                    </label>
                    <input
                      type="number"
                      value={form.priceYearly}
                      onChange={(e) => setForm({ ...form, priceYearly: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider theme-text">
                      Max Active Jobs
                    </label>
                    <input
                      type="number"
                      value={form.maxActiveJobs}
                      onChange={(e) => setForm({ ...form, maxActiveJobs: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider theme-text">
                      Resume Downloads
                    </label>
                    <input
                      type="number"
                      value={form.maxResumeDownloads}
                      onChange={(e) => setForm({ ...form, maxResumeDownloads: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider theme-text">
                      Team Seats
                    </label>
                    <input
                      type="number"
                      value={form.maxTeamSeats}
                      onChange={(e) => setForm({ ...form, maxTeamSeats: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Feature Bullets (Comma separated)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Kanban ATS, Direct Messaging, Dedicated Account Manager"
                    value={form.features}
                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingPkg ? 'Save Package' : 'Create Package'}</span>
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
