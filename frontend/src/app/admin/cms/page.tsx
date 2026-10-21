'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { CmsPageItem } from '@job-portal/sdk';
import { 
  FileText, Globe, Plus, Search, Edit3, Trash2, Eye, 
  CheckCircle2, XCircle, Loader2, RefreshCw, X, AlertCircle, Languages 
} from 'lucide-react';

export default function AdminCmsPagesManagement() {
  const { sdk } = useTheme();

  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pages' | 'translations'>('pages');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<CmsPageItem | null>(null);
  const [isTranslateMode, setIsTranslateMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    language: 'en',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
  });

  const loadCmsPages = async () => {
    setLoading(true);
    try {
      const data = await sdk.getCmsPages();
      setPages(data);
    } catch (err: any) {
      console.error('Failed to load CMS pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsPages();
  }, [sdk]);

  const openAddModal = (isTranslation = false) => {
    setEditingPage(null);
    setIsTranslateMode(isTranslation);
    setFormData({
      title: '',
      slug: '',
      language: isTranslation ? 'hi' : 'en',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (page: CmsPageItem) => {
    const lang = page.locale || page.language || 'en';
    setEditingPage(page);
    setIsTranslateMode(lang !== 'en');
    setFormData({
      title: page.title,
      slug: page.slug,
      language: lang,
      content: page.contentHtml || page.content || '',
      metaTitle: page.seoTitle || page.metaTitle || '',
      metaDescription: page.seoDescription || page.metaDescription || '',
      isPublished: page.isPublished,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      setErrorMsg('Title and Slug are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await sdk.saveCmsPage({
        id: editingPage ? editingPage.id : undefined,
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-/]+/g, '-'),
        locale: formData.language,
        language: formData.language,
        contentHtml: formData.content,
        content: formData.content,
        seoTitle: formData.metaTitle || undefined,
        metaTitle: formData.metaTitle || undefined,
        seoDescription: formData.metaDescription || undefined,
        metaDescription: formData.metaDescription || undefined,
        isPublished: formData.isPublished,
      });

      setIsModalOpen(false);
      loadCmsPages();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete page "${title}"?`)) return;
    try {
      await sdk.deleteCmsPage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete page');
    }
  };

  const masterPages = pages.filter((p) => (p.locale ? p.locale === 'en' : !p.language || p.language === 'en'));
  const translatedPages = pages.filter((p) => (p.locale ? p.locale !== 'en' : p.language && p.language !== 'en'));

  const displayedList = (activeTab === 'pages' ? masterPages : translatedPages).filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                CMS Content Engine
              </span>
              <span className="text-xs font-semibold theme-muted">Static & Legal Pages</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-500" />
              Content Management System (CMS)
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Publish rich content pages (About Us, Terms of Service, Privacy Policy, Career Guide) with multilingual translation support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadCmsPages}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => openAddModal(activeTab === 'translations')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'pages' ? 'Add New CMS Page' : 'Add New Translate Page'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="border-b theme-border flex items-center space-x-6">
          <button
            onClick={() => setActiveTab('pages')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'pages'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>List of CMS Pages ({masterPages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('translations')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'translations'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>List of Translated Pages ({translatedPages.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'pages' ? 'CMS pages' : 'translations'} by title or slug...`}
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
            Showing <span className="font-bold theme-text">{displayedList.length}</span> records
          </div>
        </div>

        {/* Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading CMS records...</p>
              </div>
            ) : displayedList.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No pages found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  {searchQuery
                    ? `No pages match "${searchQuery}".`
                    : activeTab === 'pages'
                    ? 'No CMS pages created yet.'
                    : 'No translated pages yet. Click Add New Translate Page above.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Page Title & Slug</th>
                    <th className="py-3 px-4 text-center">Language</th>
                    <th className="py-3 px-4">SEO Meta Title</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {displayedList.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold theme-text block">{p.title}</span>
                          <span className="font-mono text-[11px] text-indigo-500 font-medium">/{p.slug}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 theme-text border theme-border">
                          {p.locale || p.language || 'en'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 theme-muted max-w-xs truncate text-[11px]">
                        {p.seoTitle || p.metaTitle || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.isPublished
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {p.isPublished ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Draft
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            title="Edit Page"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                            title="Delete Page"
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

        {/* Add / Edit Page Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="max-w-2xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingPage ? 'Edit Page' : isTranslateMode ? 'Add Translated Page' : 'Add New CMS Page'}
                  </h3>
                  <p className="text-[10px] theme-muted">Configure content and metadata</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Page Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Terms of Service"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title,
                          slug: editingPage ? prev.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Language Code
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (hi)</option>
                      <option value="es">Spanish (es)</option>
                      <option value="fr">French (fr)</option>
                      <option value="de">German (de)</option>
                      <option value="ar">Arabic (ar)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    URL Slug Path <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. terms-of-service"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Page Content (HTML / Markdown)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="<h2>Page Heading</h2><p>Your page content here...</p>"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      placeholder="Title for search engines"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      SEO Meta Description
                    </label>
                    <input
                      type="text"
                      placeholder="Description for search engines"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold theme-text">Publish page immediately</span>
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
                    <span>{editingPage ? 'Save Changes' : 'Create Page'}</span>
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
