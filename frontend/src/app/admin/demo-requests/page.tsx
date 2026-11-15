'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import {
  Headphones,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  MessageSquare,
  TrendingUp,
  X,
  FileText,
  Send,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { DemoRequestItem, DemoRequestStatus, DemoRequestStats } from '@job-portal/sdk';

const STATUS_CONFIG: Record<
  DemoRequestStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PENDING: {
    label: 'Pending Action',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800/50',
    dot: 'bg-sky-500',
  },
  SCHEDULED: {
    label: 'Demo Scheduled',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800/50',
    dot: 'bg-indigo-500',
  },
  COMPLETED: {
    label: 'Converted / Won',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  DISQUALIFIED: {
    label: 'Disqualified',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

export default function AdminDemoRequestsPage() {
  const { sdk, theme } = useTheme();

  const [requests, setRequests] = useState<DemoRequestItem[]>([]);
  const [stats, setStats] = useState<DemoRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState<'ALL' | DemoRequestStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail & Action Drawer/Modal
  const [selectedLead, setSelectedLead] = useState<DemoRequestItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<DemoRequestStatus>('PENDING');
  const [leadNotes, setLeadNotes] = useState('');
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeads = async (page = 1, showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const [leadsRes, statsRes] = await Promise.all([
        sdk.getDemoRequests({
          page,
          limit: 25,
          status: activeTab === 'ALL' ? undefined : activeTab,
          search: searchQuery.trim() || undefined,
        }),
        sdk.getDemoRequestStats().catch(() => null),
      ]);

      if (leadsRes && Array.isArray(leadsRes.data)) {
        setRequests(leadsRes.data);
        setTotalRecords(leadsRes.total);
        setTotalPages(leadsRes.totalPages || 1);
        setCurrentPage(leadsRes.page || page);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Failed to load demo requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleOpenLead = (lead: DemoRequestItem) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setLeadNotes(lead.notes || '');
    setUpdateMsg(null);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    setIsUpdatingStatus(true);
    setUpdateMsg(null);
    try {
      const updated = await sdk.updateDemoRequestStatus(selectedLead.id, {
        status: newStatus,
        notes: leadNotes.trim(),
      });
      setSelectedLead(updated);
      setUpdateMsg('Lead status and notes successfully updated!');
      // Update item in local list
      setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      // Refresh stats
      sdk.getDemoRequestStats().then(setStats).catch(() => {});
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(err.message || 'Failed to update lead');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    setIsDeleting(true);
    try {
      await sdk.deleteDemoRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      setDeleteId(null);
      sdk.getDemoRequestStats().then(setStats).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Failed to delete demo request');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDemoData = async () => {
    setRefreshing(true);
    try {
      await sdk.seedDemoRequests();
      await fetchLeads(1, true);
    } catch (err: any) {
      alert(err.message || 'Failed to seed sample leads');
      setRefreshing(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Employer Demo Requests & Leads
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-[#5e17eb] dark:bg-purple-950 dark:text-purple-300">
                    Inbound Pipeline
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Review and follow up on demo inquiries, consultation requests, and hiring leads submitted by employers
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchLeads(currentPage, true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleSeedDemoData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 cursor-pointer"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Seed Sample Leads
            </button>
          </div>
        </div>

        {/* 4 TOP KPI STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Inquiries */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Inbound Leads
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-[#5e17eb] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.total ?? requests.length}
              </span>
              <span className="text-xs text-slate-500">all sources</span>
            </div>
          </div>

          {/* Pending Follow-up */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Pending Action
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats?.pending ?? requests.filter((r) => r.status === 'PENDING').length}
              </span>
              <span className="text-xs text-amber-600/80">needs 2h SLA</span>
            </div>
          </div>

          {/* Demos Scheduled */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Demos Scheduled
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {stats?.scheduled ?? requests.filter((r) => r.status === 'SCHEDULED').length}
              </span>
              <span className="text-xs text-indigo-500">pipeline active</span>
            </div>
          </div>

          {/* Converted / Won */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Converted / Won
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats?.completed ?? requests.filter((r) => r.status === 'COMPLETED').length}
              </span>
              <span className="text-xs text-emerald-600/80">paid clients</span>
            </div>
          </div>
        </div>

        {/* SEARCH & STATUS TABS FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'All Leads', count: stats?.total },
              { key: 'PENDING', label: 'Pending', count: stats?.pending },
              { key: 'CONTACTED', label: 'Contacted', count: stats?.contacted },
              { key: 'SCHEDULED', label: 'Scheduled', count: stats?.scheduled },
              { key: 'COMPLETED', label: 'Converted', count: stats?.completed },
              { key: 'DISQUALIFIED', label: 'Disqualified', count: stats?.disqualified },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, recruiter, city..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </form>
        </div>

        {/* DEMO REQUESTS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">Loading employer demo requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#5e17eb] flex items-center justify-center mx-auto">
                <Headphones className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Demo Requests Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No leads matched your search query "${searchQuery}".`
                    : 'No inbound employer demo requests have been recorded yet.'}
                </p>
              </div>
              <button
                onClick={handleSeedDemoData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Sparkles className="w-4 h-4" />
                Populate Demo Requests Data
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Contact / Recruiter</th>
                    <th className="py-3 px-4">Company & Location</th>
                    <th className="py-3 px-4">Hiring Need</th>
                    <th className="py-3 px-4">Contact Channels</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map((req) => {
                    const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Contact / Recruiter Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs flex-shrink-0">
                              {req.name ? req.name.slice(0, 2) : 'EM'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">
                                {req.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                ID: {req.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Company & Location */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{req.companyName}</span>
                            </span>
                            {req.city && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {req.city}
                              </span>
                            )}
                            <span className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {req.source === 'TALK_TO_US' ? 'Instant Callback' : 'Request Demo Tab'}
                            </span>
                          </div>
                        </td>

                        {/* Hiring Need */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {req.hiresCount || '1 - 5 hires / mo'}
                          </span>
                        </td>

                        {/* Contact Channels (Work Email & Phone) */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {req.email && (
                              <a
                                href={`mailto:${req.email}`}
                                className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
                                title="Click to email"
                              >
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[170px]">{req.email}</span>
                              </a>
                            )}
                            {req.phone && (
                              <a
                                href={`tel:${req.phone}`}
                                className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1 text-[11px] font-mono"
                                title="Click to call"
                              >
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <span>{req.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {formatDate(req.createdAt)}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenLead(req)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 transition-all cursor-pointer flex items-center gap-1"
                            >
                              Manage
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(req.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              title="Delete request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: LEAD DETAIL & STATUS UPDATE DRAWER */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Top Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5e17eb] text-white flex items-center justify-center shadow-md">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Lead Details & Follow-up
                    </h3>
                    <p className="text-xs text-slate-500">
                      ID: {selectedLead.id} • Submitted {formatDate(selectedLead.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Status Message Banner */}
                {updateMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {updateMsg}
                  </div>
                )}

                {/* Company & Contact Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recruiter / Contact Person
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <User className="w-4 h-4 text-purple-600" />
                      {selectedLead.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Company Name
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      {selectedLead.companyName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Official Work Email
                    </span>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {selectedLead.email}
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phone Number
                    </span>
                    {selectedLead.phone ? (
                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 mt-0.5 font-mono"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {selectedLead.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Monthly Hiring Need
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                      {selectedLead.hiresCount || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      City / Location
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                      {selectedLead.city || 'Pan-India / Remote'}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex gap-2.5">
                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}?subject=Camzy%20Jobs%20Platform%20Demo%20for%20${encodeURIComponent(
                        selectedLead.companyName
                      )}&body=Hi%20${encodeURIComponent(selectedLead.name)},%0A%0AThank%20you%20for%20requesting%20a%20demo%20of%20Camzy%20Jobs.%20We%20would%20love%20to%20walk%20you%20through%20our%20AI-powered%20talent%20search%20and%20recruiter%20tools.`}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-purple-100 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Email Recruiter
                    </a>
                  )}
                  {selectedLead.phone && (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call {selectedLead.phone}
                    </a>
                  )}
                </div>

                {/* Pipeline Status Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pipeline Stage / Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(STATUS_CONFIG) as DemoRequestStatus[]).map((st) => {
                      const isSel = newStatus === st;
                      const conf = STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewStatus(st)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSel
                              ? `${conf.bg} ${conf.text} ${conf.border} ring-2 ring-purple-500/20`
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                            {conf.label}
                          </span>
                          {isSel && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Internal Follow-up Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    Internal Sales & Demo Notes
                  </label>
                  <textarea
                    rows={4}
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    placeholder="Log recruiter conversation notes, demo schedule link, quotation details, or special requirements..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Visible only to Super Admins and Enterprise Growth managers.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveLead}
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Lead Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM DELETE MODAL */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white">Delete Demo Request?</h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone. Are you sure you want to remove this lead record?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLead(deleteId)}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
