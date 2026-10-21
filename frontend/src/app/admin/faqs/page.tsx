'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { FaqItemData } from '@job-portal/sdk';
import { 
  HelpCircle, Plus, Search, Edit3, Trash2, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, AlertCircle, Users, Building2 
} from 'lucide-react';

export default function AdminFaqManagementPage() {
  const { sdk } = useTheme();

  const [faqs, setFaqs] = useState<FaqItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItemData | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'General',
    targetAudience: 'ALL',
    orderIndex: 0,
    isActive: true,
  });

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await sdk.getFaqs(audienceFilter === 'ALL' ? undefined : audienceFilter);
      setFaqs(data);
    } catch (err: any) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, [audienceFilter, sdk]);

  const openAddModal = () => {
    setEditingFaq(null);
    setForm({
      question: '',
      answer: '',
      category: 'General',
      targetAudience: audienceFilter === 'ALL' ? 'ALL' : audienceFilter,
      orderIndex: faqs.length + 1,
      isActive: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqItemData) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      targetAudience: faq.targetAudience || 'ALL',
      orderIndex: faq.orderIndex || 0,
      isActive: faq.isActive,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      setErrorMsg('Question and Answer are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await sdk.saveFaq({
        id: editingFaq ? editingFaq.id : undefined,
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category,
        targetAudience: form.targetAudience,
        orderIndex: Number(form.orderIndex) || 0,
        isActive: form.isActive,
      });

      setIsModalOpen(false);
      loadFaqs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, q: string) => {
    if (!confirm(`Delete FAQ "${q}"?`)) return;
    try {
      await sdk.deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete FAQ');
    }
  };

  const filteredFaqs = faqs.filter((f) =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Help & Knowledge Center
              </span>
              <span className="text-xs font-semibold theme-muted">Self-Service Support</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-500" />
              Frequently Asked Questions (FAQs)
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Curate knowledge base articles and answers targeted to candidates, employer recruiters, and general visitors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadFaqs}
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
              <span>Add New FAQ</span>
            </button>
          </div>
        </div>

        {/* Audience Filter Pills */}
        <div className="border-b theme-border flex items-center space-x-6">
          <button
            onClick={() => setAudienceFilter('ALL')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              audienceFilter === 'ALL'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>All Audiences</span>
          </button>

          <button
            onClick={() => setAudienceFilter('CANDIDATES')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              audienceFilter === 'CANDIDATES'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidates Support</span>
          </button>

          <button
            onClick={() => setAudienceFilter('EMPLOYERS')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              audienceFilter === 'EMPLOYERS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Employers & Recruiters</span>
          </button>
        </div>

        {/* Search */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder="Search FAQs by question or answer..."
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
            Total FAQs: <span className="font-bold theme-text">{filteredFaqs.length}</span>
          </div>
        </div>

        {/* FAQs Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading FAQs...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No FAQs found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  No FAQs matching your filters. Click Add New FAQ above to create one.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Question & Answer Preview</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Audience</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredFaqs.map((faq, idx) => (
                    <tr
                      key={faq.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] theme-muted">
                        {faq.orderIndex || idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-extrabold theme-text block">{faq.question}</span>
                          <p className="text-[11px] theme-muted line-clamp-2 max-w-xl">{faq.answer}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 theme-text border theme-border">
                          {faq.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          {faq.targetAudience}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            faq.isActive
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {faq.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Hidden
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(faq)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                            title="Edit FAQ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id, faq.question)}
                            className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                            title="Delete FAQ"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="max-w-xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                  </h3>
                  <p className="text-[10px] theme-muted">Customer self-service answer entry</p>
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
                    Question <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How do I download candidate resumes in PDF format?"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Billing, Resumes, Jobs"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Target Audience
                    </label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All Audiences (Public)</option>
                      <option value="CANDIDATES">Candidates Only</option>
                      <option value="EMPLOYERS">Employers & Recruiters Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Detailed Answer <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide clear step-by-step guidance..."
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Display Order Index
                    </label>
                    <input
                      type="number"
                      value={form.orderIndex}
                      onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold theme-text">Show on Public FAQ</span>
                    </label>
                  </div>
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
                    <span>{editingFaq ? 'Save Changes' : 'Create FAQ'}</span>
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
