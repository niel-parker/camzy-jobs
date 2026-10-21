'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { SystemTaxonomyItem } from '@job-portal/sdk';
import { 
  Layers, Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, 
  Sparkles, Loader2, RefreshCw, X, ArrowUpDown, Filter, ChevronRight, Check
} from 'lucide-react';

const TAXONOMY_CATEGORIES = [
  { key: 'language-level', label: 'Language Levels', desc: 'Proficiency ranks like Basic, Conversational, Fluent, Native' },
  { key: 'career-level', label: 'Career Levels', desc: 'Entry, Mid-Level, Senior, Director, Executive VP' },
  { key: 'functional-area', label: 'Functional Areas', desc: 'Engineering, Marketing, Sales, HR, Finance, Operations' },
  { key: 'gender', label: 'Genders', desc: 'Candidate gender preferences and profiles' },
  { key: 'industry', label: 'Industries', desc: 'Information Tech, FinTech, Healthcare, Logistics, etc.' },
  { key: 'job-experience', label: 'Job Experiences', desc: 'Experience brackets for jobs and candidates' },
  { key: 'job-skill', label: 'Job Skills', desc: 'Master technical & soft skills catalog' },
  { key: 'job-type', label: 'Job Types', desc: 'Full-time, Part-time, Contract, Internship, Freelance' },
  { key: 'job-shift', label: 'Job Shifts', desc: 'Morning, Evening, Night, Flexible, Rotational' },
  { key: 'degree-level', label: 'Degree Levels', desc: 'High School, Associate, Bachelor, Master, Doctorate' },
  { key: 'degree-type', label: 'Degree Types', desc: 'B.S., B.A., B.Tech, M.S., MBA, M.Tech, Ph.D.' },
  { key: 'major-subject', label: 'Major Subjects', desc: 'Computer Science, Electrical Eng, Business Admin, etc.' },
  { key: 'result-type', label: 'Result Types', desc: 'GPA (4.0), Percentage (%), CGPA (10.0), Grade / Division' },
  { key: 'marital-status', label: 'Marital Statuses', desc: 'Single, Married, Divorced, Other' },
  { key: 'ownership-type', label: 'Ownership Types', desc: 'Private, Public Ltd, Government, Non-Profit, Sole Trader' },
  { key: 'salary-period', label: 'Salary Periods', desc: 'Per Hour, Per Month, Per Annum (Annual CTC)' },
];

function MasterTaxonomiesContent() {
  const { sdk } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTypeParam = searchParams.get('type') || 'language-level';
  const [selectedType, setSelectedType] = useState<string>(currentTypeParam);
  const [items, setItems] = useState<SystemTaxonomyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<SystemTaxonomyItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    orderIndex: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Sync state if query param changes
  useEffect(() => {
    if (currentTypeParam && currentTypeParam !== selectedType) {
      setSelectedType(currentTypeParam);
    }
  }, [currentTypeParam]);

  const loadTaxonomies = async (typeToLoad: string) => {
    setLoading(true);
    try {
      const dbType = typeToLoad.toUpperCase().replace(/-/g, '_');
      const data = await sdk.getTaxonomies(dbType);
      setItems(data);
    } catch (err: any) {
      console.error('Failed to load taxonomies:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomies(selectedType);
  }, [selectedType, sdk]);

  const handleSelectType = (key: string) => {
    setSelectedType(key);
    router.push(`/admin/taxonomies?type=${key}`);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      orderIndex: items.length + 1,
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SystemTaxonomyItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug || item.code || '',
      description: item.description || '',
      orderIndex: item.orderIndex || 0,
      isActive: item.isActive,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Item name is required');
      return;
    }

    setSaving(true);
    setModalError(null);

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const dbType = selectedType.toUpperCase().replace(/-/g, '_');

    try {
      if (editingItem) {
        await sdk.updateTaxonomy(editingItem.id, {
          type: dbType,
          name: formData.name.trim(),
          slug,
          code: slug,
          description: formData.description.trim() || undefined,
          orderIndex: Number(formData.orderIndex) || 0,
          isActive: formData.isActive,
        });
      } else {
        await sdk.saveTaxonomy({
          type: dbType,
          name: formData.name.trim(),
          slug,
          code: slug,
          description: formData.description.trim() || undefined,
          orderIndex: Number(formData.orderIndex) || 0,
          isActive: formData.isActive,
        });
      }
      setIsModalOpen(false);
      await loadTaxonomies(selectedType);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save taxonomy item');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: SystemTaxonomyItem) => {
    try {
      await sdk.updateTaxonomy(item.id, {
        isActive: !item.isActive,
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: !item.isActive } : i))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (item: SystemTaxonomyItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}"?`)) return;
    try {
      await sdk.deleteTaxonomy(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete taxonomy item');
    }
  };

  const filteredItems = items.filter((item) => {
    const slugStr = item.slug || item.code || '';
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slugStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const activeCategory = TAXONOMY_CATEGORIES.find((c) => c.key === selectedType) || TAXONOMY_CATEGORIES[0];
  const activeCount = items.filter((i) => i.isActive).length;
  const inactiveCount = items.length - activeCount;

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                16 Master Taxonomies
              </span>
              <span className="text-xs font-semibold theme-muted">Configurable Master Data</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-500" />
              Master System Taxonomies
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Manage all standard system lists: language proficiencies, career levels, industries, degrees, shifts, and salary periods used across candidate profiles and job postings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTaxonomies(selectedType)}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Items"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add {activeCategory.label.slice(0, -1)}</span>
            </button>
          </div>
        </div>

        {/* 16 Category Navigation Chips */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider theme-text flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              Select Master Category ({TAXONOMY_CATEGORIES.length})
            </span>
            <span className="text-[11px] theme-muted font-medium">Click to switch catalog</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {TAXONOMY_CATEGORIES.map((cat) => {
              const isSelected = cat.key === selectedType;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleSelectType(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-900 theme-text hover:border-indigo-500/50 border theme-border'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Info & Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 theme-surface border theme-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Active Category</span>
              <h3 className="text-base font-extrabold theme-text">{activeCategory.label}</h3>
              <p className="text-xs theme-muted">{activeCategory.desc}</p>
            </div>
            <div className="mt-3 pt-3 border-t theme-border flex items-center justify-between text-[11px] theme-muted">
              <span>System Identifier: <code className="font-mono text-indigo-500 font-bold">{activeCategory.key}</code></span>
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Total Entries</p>
              <h3 className="text-2xl font-black theme-text mt-0.5">{items.length}</h3>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">Configured in Master DB</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Active / Inactive</p>
              <h3 className="text-2xl font-black theme-text mt-0.5">
                <span className="text-emerald-500">{activeCount}</span>
                <span className="text-xs theme-muted mx-1">/</span>
                <span className="text-rose-500 text-lg">{inactiveCount}</span>
              </h3>
              <p className="text-[10px] theme-muted mt-1">Status Distribution</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Master Catalog Table Container */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          {/* Table Search Toolbar */}
          <div className="p-4 border-b theme-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
              <input
                type="text"
                placeholder={`Search in ${activeCategory.label}...`}
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
              Showing <span className="font-bold theme-text">{filteredItems.length}</span> of {items.length} records
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading {activeCategory.label} taxonomy...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No records found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  {searchQuery
                    ? `No ${activeCategory.label} match your query "${searchQuery}".`
                    : `No items configured yet for ${activeCategory.label}. Click Add above to create one.`}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-indigo-500 font-bold hover:underline"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={openAddModal}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Add First Item
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Name & Display Label</th>
                    <th className="py-3 px-4">Unique Slug</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Display Order</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] theme-muted">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold theme-text block">{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-500 font-medium">
                        {item.slug || item.code}
                      </td>
                      <td className="py-3.5 px-4 theme-muted max-w-xs truncate text-[11px]">
                        {item.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] theme-text font-bold">
                        {item.orderIndex}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            item.isActive
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          {item.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Disabled
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                            title="Delete Item"
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

        {/* Add / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingItem ? `Edit ${activeCategory.label.slice(0, -1)}` : `Add New ${activeCategory.label.slice(0, -1)}`}
                  </h3>
                  <p className="text-[10px] theme-muted">{activeCategory.label} Master Catalog</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-4 space-y-4">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Name / Display Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master of Science (M.S.)"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        // auto fill slug if adding
                        slug: editingItem ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Slug / Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. master-of-science"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] theme-muted">Unique machine key; generated automatically if empty.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description or helper note..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Active Status
                    </label>
                    <div className="pt-1.5 flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-2 text-xs font-bold theme-text">
                          {formData.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t theme-border flex items-center justify-end space-x-2">
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
                    <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
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

export default function MasterTaxonomiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs theme-muted">Loading taxonomies...</div>}>
      <MasterTaxonomiesContent />
    </Suspense>
  );
}
