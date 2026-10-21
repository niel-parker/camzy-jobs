'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { SeoConfigItem } from '@job-portal/sdk';
import { 
  Globe, Plus, Search, Edit3, CheckCircle2, 
  Loader2, RefreshCw, X, AlertCircle, Sparkles, ExternalLink 
} from 'lucide-react';

export default function AdminSeoManagementPage() {
  const { sdk } = useTheme();

  const [configs, setConfigs] = useState<SeoConfigItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingConfig, setEditingConfig] = useState<SeoConfigItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    pageKey: '',
    pageName: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogImageUrl: '',
  });

  const loadSeoConfigs = async () => {
    setLoading(true);
    try {
      const data = await sdk.getSeoConfigs();
      setConfigs(data);
    } catch (err: any) {
      console.error('Failed to load SEO configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeoConfigs();
  }, [sdk]);

  const openAddModal = () => {
    setEditingConfig(null);
    setForm({
      pageKey: '',
      pageName: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
      ogImageUrl: '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cfg: SeoConfigItem) => {
    setEditingConfig(cfg);
    setForm({
      pageKey: cfg.pageKey,
      pageName: cfg.pageName,
      metaTitle: cfg.metaTitle || '',
      metaDescription: cfg.metaDescription || '',
      metaKeywords: cfg.metaKeywords || '',
      canonicalUrl: cfg.canonicalUrl || '',
      ogImageUrl: cfg.ogImageUrl || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pageKey || !form.pageName) {
      setErrorMsg('Page Key and Page Name are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await sdk.saveSeoConfig({
        id: editingConfig ? editingConfig.id : undefined,
        pageKey: form.pageKey.trim().toLowerCase(),
        pageName: form.pageName.trim(),
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        metaKeywords: form.metaKeywords || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
        ogImageUrl: form.ogImageUrl || undefined,
      });

      setIsModalOpen(false);
      loadSeoConfigs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save SEO config');
    } finally {
      setSaving(false);
    }
  };

  const filteredConfigs = configs.filter((c) =>
    c.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.pageKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.metaTitle && c.metaTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Search Engine Optimization
              </span>
              <span className="text-xs font-semibold theme-muted">Meta Tags & OpenGraph</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-500" />
              SEO Page Configuration
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Optimize public search indexing, meta descriptions, Google title tags, and social media OpenGraph cards across all portal routes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSeoConfigs}
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
              <span>Configure New Page SEO</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder="Search SEO pages by key or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 theme-muted hover:theme-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs theme-muted font-medium">
            Configured Routes: <span className="font-bold theme-text">{configs.length}</span>
          </div>
        </div>

        {/* SEO Configs Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading SEO configurations...</p>
              </div>
            ) : filteredConfigs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No SEO configs found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  Configure title and meta tags for pages like Home, Jobs, Pricing, etc.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Page Identity</th>
                    <th className="py-3 px-4">Meta Title Tag</th>
                    <th className="py-3 px-4">Meta Description Snippet</th>
                    <th className="py-3 px-4">Keywords</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredConfigs.map((cfg) => (
                    <tr
                      key={cfg.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold theme-text block">{cfg.pageName}</span>
                          <span className="font-mono text-[11px] text-indigo-500 font-medium">route: {cfg.pageKey}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate font-medium theme-text">
                        {cfg.metaTitle || '—'}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm truncate text-[11px] theme-muted">
                        {cfg.metaDescription || '—'}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] theme-muted">
                        {cfg.metaKeywords || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Configured
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openEditModal(cfg)}
                          className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                          title="Edit SEO Tags"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Configure / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="max-w-xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingConfig ? `Update SEO: ${editingConfig.pageName}` : 'Configure Route SEO'}
                  </h3>
                  <p className="text-[10px] theme-muted">Google search snippet and metadata</p>
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
                      Page Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Job Search Engine"
                      value={form.pageName}
                      onChange={(e) => setForm({ ...form, pageName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Route Key Identifier <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. jobs, home, pricing"
                      value={form.pageKey}
                      onChange={(e) => setForm({ ...form, pageKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Page Title Tag (&lt;title&gt;)
                    </label>
                    <span className="text-[10px] theme-muted">{form.metaTitle.length}/60 chars (Recommended)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Browse 10,000+ Verified Tech Jobs | Camzy Jobs"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Meta Description
                    </label>
                    <span className="text-[10px] theme-muted">{form.metaDescription.length}/160 chars (Recommended)</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Concise overview snippet visible in Google search results..."
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Meta Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="jobs, hiring, remote work, developer careers, engineering"
                    value={form.metaKeywords}
                    onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://camzyjobs.com/jobs"
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      OpenGraph Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://camzyjobs.com/og-banner.jpg"
                      value={form.ogImageUrl}
                      onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Google Snippet Live Preview */}
                <div className="p-3.5 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    Google Search Preview
                  </span>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                    {form.metaTitle || form.pageName || 'Camzy Jobs Portal'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {form.canonicalUrl || `https://camzyjobs.com/${form.pageKey || ''}`}
                  </p>
                  <p className="text-[11px] theme-muted line-clamp-2">
                    {form.metaDescription || 'Explore career opportunities, post jobs, and connect with top talent on the leading enterprise recruitment portal.'}
                  </p>
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
                    <span>Save SEO Config</span>
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
