'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { BroadcastRecipient, EmailBroadcastItem } from '@job-portal/sdk';
import { 
  Send, Users, Building2, Clock, CheckCircle2, 
  Loader2, RefreshCw, X, AlertCircle, Sparkles, Mail, Eye,
  ChevronDown, Filter, ChevronLeft, ChevronRight, Search, CheckSquare, Square
} from 'lucide-react';

interface SegmentMeta {
  key: string;
  title: string;
  actionButtonLabel: string;
  description: string;
  badgeColor: string;
}

const BROADCAST_SEGMENTS: SegmentMeta[] = [
  {
    key: 'INACTIVE_USERS',
    title: 'Inactive Users',
    actionButtonLabel: 'Send Inactive Email',
    description: 'Candidates with no login activity over the specified months.',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    key: 'SKILLS_JOB_EMAIL',
    title: 'Skills Job Email',
    actionButtonLabel: 'Send Skills Job Email',
    description: 'Target candidates by matching technical skillset keywords.',
    badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    key: 'USER_ADV_EMAIL',
    title: 'User Adv. Email',
    actionButtonLabel: 'Send User Adv. Email',
    description: 'Candidate users for career promotions and platform updates.',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    key: 'EMPLOYER_ADV_EMAIL',
    title: 'Emp. Adv. Email',
    actionButtonLabel: 'Send Emp. Adv. Email',
    description: 'Employer accounts, recruiter seats, and hiring managers.',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    key: 'EMPLOYER_ACTIVE_COMPANIES',
    title: 'Emp. Active Companies',
    actionButtonLabel: 'Send Active Companies Email',
    description: 'Companies with verified status and active hiring subscriptions.',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    key: 'EMPLOYER_EXPIRED_COMPANIES',
    title: 'Emp. Expired Companies',
    actionButtonLabel: 'Send Expired Companies Email',
    description: 'Companies with expired subscriptions or quota limits.',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
];

function BroadcastContent() {
  const { sdk } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active segment from URL query or default
  const segmentParam = searchParams.get('segment') || 'INACTIVE_USERS';
  const activeSegmentMeta = BROADCAST_SEGMENTS.find((s) => s.key === segmentParam) || BROADCAST_SEGMENTS[0];

  // Data states
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [totalRecipients, setTotalRecipients] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [broadcasts, setBroadcasts] = useState<EmailBroadcastItem[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Filter & Pagination controls
  const [monthsFilter, setMonthsFilter] = useState<number>(2);
  const [skillFilter, setSkillFilter] = useState<string>('Java');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Column search filters
  const [searchId, setSearchId] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action dropdown state per row
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);

  // Profile details modal
  const [viewingProfile, setViewingProfile] = useState<BroadcastRecipient | null>(null);

  // Compose Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [targetRecipientOverride, setTargetRecipientOverride] = useState<BroadcastRecipient | null>(null);

  const [form, setForm] = useState({
    campaignName: '',
    subject: '',
    htmlBody: '',
  });

  // Load recipients based on segment and filters
  const loadRecipients = async () => {
    setLoading(true);
    try {
      const resp = await sdk.getBroadcastRecipients({
        segment: activeSegmentMeta.key,
        months: monthsFilter,
        skill: skillFilter,
        searchId,
        searchName,
        searchEmail,
        page: currentPage,
        limit: pageSize,
      });

      setRecipients(resp.recipients || []);
      setTotalRecipients(resp.total || 0);
    } catch (err: any) {
      console.error('Failed to load broadcast recipients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load history & stats
  const loadHistoryAndStats = async () => {
    try {
      const [history, segmentStats] = await Promise.all([
        sdk.getBroadcasts(),
        sdk.getBroadcastStats(),
      ]);
      setBroadcasts(history);
      setStats(segmentStats);
    } catch (err: any) {
      console.error('Failed to load history or stats:', err);
    }
  };

  useEffect(() => {
    loadRecipients();
  }, [activeSegmentMeta.key, monthsFilter, skillFilter, currentPage, pageSize, sdk]);

  useEffect(() => {
    loadHistoryAndStats();
  }, [sdk]);

  // Handle column search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadRecipients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchId, searchName, searchEmail]);

  // Segment switch handler
  const handleSegmentChange = (newSegmentKey: string) => {
    setSelectedIds(new Set());
    setCurrentPage(1);
    setSearchId('');
    setSearchName('');
    setSearchEmail('');
    router.push(`/admin/broadcast?segment=${newSegmentKey}`);
  };

  // Selection handlers
  const isAllCurrentSelected = recipients.length > 0 && recipients.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const next = new Set(selectedIds);
      recipients.forEach((r) => next.delete(r.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      recipients.forEach((r) => next.add(r.id));
      setSelectedIds(next);
    }
  };

  const toggleRowSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Open Compose Modal
  const openComposeModal = (individualRecipient?: BroadcastRecipient) => {
    if (individualRecipient) {
      setTargetRecipientOverride(individualRecipient);
      setForm({
        campaignName: `Direct Notice - ${individualRecipient.name}`,
        subject: `Important Update regarding your Camzy Jobs Account`,
        htmlBody: `<h2>Hello ${individualRecipient.name},</h2>\n<p>We are reaching out regarding your profile and active job updates on Camzy Jobs.</p>\n<p><a href="https://camzyjobs.com" style="background:#2f70b8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">Access Your Account</a></p>\n<p>Warm regards,<br/>The Camzy Jobs Team</p>`,
      });
    } else {
      if (selectedIds.size === 0) {
        setErrorMsg('Please select one or more users from the table below, or click "Select All" to proceed with broadcasting.');
        setTimeout(() => setErrorMsg(null), 4000);
        return;
      }

      setTargetRecipientOverride(null);
      const segTitle = activeSegmentMeta.title;
      let defaultSubj = `Career Opportunities Update – Handpicked positions for you`;
      let defaultBody = `<h2>Hello {{firstName}},</h2>\n<p>We have curated fresh career opportunities matching your profile.</p>\n<p><a href="https://camzyjobs.com/jobs" style="background:#2f70b8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">Explore Matching Jobs</a></p>\n<p>Best regards,<br/>Camzy Jobs Talent Team</p>`;

      if (activeSegmentMeta.key === 'INACTIVE_USERS') {
        defaultSubj = `We miss you at Camzy Jobs – 150+ new high-paying jobs matching your skillset!`;
        defaultBody = `<h2>Hello {{firstName}},</h2>\n<p>We noticed you haven't visited Camzy Jobs in a while. Over 150+ top companies are actively hiring in your domain this week.</p>\n<p><a href="https://camzyjobs.com/jobs" style="background:#2f70b8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">Review Recommended Jobs</a></p>\n<p>Best regards,<br/>Camzy Jobs Re-engagement Team</p>`;
      } else if (activeSegmentMeta.key === 'EMPLOYER_EXPIRED_COMPANIES') {
        defaultSubj = `Renew your hiring subscription with an exclusive 25% retention discount`;
        defaultBody = `<h2>Hello {{firstName}},</h2>\n<p>Your hiring subscription on Camzy Jobs has expired. Reactivate your plan today to unlock unlimited candidate resume downloads and priority job postings.</p>\n<p><a href="https://camzyjobs.com/employer/billing" style="background:#2f70b8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">Reactivate Hiring Plan</a></p>\n<p>Regards,<br/>Camzy Jobs Corporate Team</p>`;
      }

      setForm({
        campaignName: `${segTitle} Broadcast - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        subject: defaultSubj,
        htmlBody: defaultBody,
      });
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  // Submit Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.campaignName || !form.subject || !form.htmlBody) {
      setErrorMsg('Please enter campaign name, subject, and email body.');
      return;
    }

    setSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let recipientIds: string[] = [];
      let recipientEmails: string[] = [];

      if (targetRecipientOverride) {
        recipientIds = [targetRecipientOverride.realId || targetRecipientOverride.id];
        recipientEmails = [targetRecipientOverride.email];
      } else {
        const selectedList = recipients.filter((r) => selectedIds.has(r.id));
        recipientIds = selectedList.map((r) => r.realId || r.id);
        recipientEmails = selectedList.map((r) => r.email);
      }

      const result = await sdk.sendBroadcast({
        campaignName: form.campaignName.trim(),
        targetSegment: activeSegmentMeta.key,
        subject: form.subject.trim(),
        htmlBody: form.htmlBody,
        recipientIds,
        recipientEmails,
      });

      setSuccessMsg(`Broadcast successfully dispatched to ${result.recipientCount} selected recipient(s)!`);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setSelectedIds(new Set());
        loadHistoryAndStats();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch email broadcast');
    } finally {
      setSending(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalRecipients / pageSize));

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {errorMsg && (
        <div className="fixed top-6 right-6 z-50 max-w-md p-4 rounded-xl bg-rose-600 text-white shadow-xl flex items-center space-x-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb & Main Title (Matching User Screenshot) */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span>Home</span>
          <span>•</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Email Broadcasting</span>
          <span>•</span>
          <span className="theme-text">{activeSegmentMeta.title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 pt-1">
          <div className="flex items-baseline space-x-3">
            <h1 className="text-2xl font-black theme-text tracking-tight">
              Manage Email Broadcasting
            </h1>
            <span className="text-sm font-medium text-slate-400">Email Broadcasting</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                loadRecipients();
                loadHistoryAndStats();
              }}
              className="p-2 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Segment Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {BROADCAST_SEGMENTS.map((seg) => {
          const isActive = seg.key === activeSegmentMeta.key;
          const count = stats[seg.key] ?? (seg.key === 'INACTIVE_USERS' ? 12 : 25);
          return (
            <button
              key={seg.key}
              onClick={() => handleSegmentChange(seg.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-[#2f70b8] text-white shadow-md'
                  : 'theme-surface border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{seg.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN CARD: EMAIL BROADCASTING (Exact match to screenshot) */}
      <div className="theme-surface border theme-border rounded-xl shadow-sm overflow-hidden">
        {/* Card Header Bar */}
        <div className="px-5 py-4 border-b theme-border flex items-center space-x-2 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-wider">
          <span className="text-slate-400">⚙</span>
          <span>EMAIL BROADCASTING</span>
          <span className="text-slate-400 font-normal ml-2">({activeSegmentMeta.title})</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Top Controls Row (Action Button on Left, Filters on Right) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Action Button */}
            <div>
              <button
                onClick={() => openComposeModal()}
                className="px-5 py-2.5 rounded-md bg-[#2f70b8] hover:bg-[#255b96] text-white font-bold text-xs shadow transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>
                  {activeSegmentMeta.actionButtonLabel}
                  {selectedIds.size > 0 ? ` (${selectedIds.size} Selected)` : ''}
                </span>
              </button>
            </div>

            {/* Filter controls on Right */}
            <div className="flex items-center space-x-3">
              {activeSegmentMeta.key === 'INACTIVE_USERS' ? (
                <>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Months</label>
                  <select
                    value={monthsFilter}
                    onChange={(e) => setMonthsFilter(parseInt(e.target.value, 10))}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 theme-surface theme-text text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                  </select>
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      loadRecipients();
                    }}
                    className="px-4 py-1.5 rounded bg-[#2f70b8] hover:bg-[#255b96] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Filter
                  </button>
                </>
              ) : activeSegmentMeta.key === 'SKILLS_JOB_EMAIL' ? (
                <>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Skill</label>
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 theme-surface theme-text text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All Skills</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="React">React</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Angular">Angular</option>
                    <option value="QA">QA Automation</option>
                  </select>
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      loadRecipients();
                    }}
                    className="px-4 py-1.5 rounded bg-[#2f70b8] hover:bg-[#255b96] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Filter
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    loadRecipients();
                  }}
                  className="px-4 py-1.5 rounded bg-[#2f70b8] hover:bg-[#255b96] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Refresh Segment
                </button>
              )}
            </div>
          </div>

          {/* Secondary Controls: Records per page & Select All */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 theme-surface theme-text text-xs focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-xs text-slate-500">records</span>
              </div>

              <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllCurrentSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>Select All</span>
              </label>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-[#2f70b8] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  {selectedIds.size} recipient(s) selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-medium cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          {/* DATA TABLE (With column search inputs and checkboxes) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                {/* Row 1: Search Inputs directly above columns */}
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                  <th className="py-2.5 px-3 w-40">
                    <input
                      type="text"
                      placeholder="Filter ID..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full py-1 px-2.5 rounded border border-slate-300 dark:border-slate-700 theme-surface theme-text text-xs focus:outline-none focus:border-blue-500"
                    />
                  </th>
                  <th className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="Filter Name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full py-1 px-2.5 rounded border border-slate-300 dark:border-slate-700 theme-surface theme-text text-xs focus:outline-none focus:border-blue-500"
                    />
                  </th>
                  <th className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="Filter Email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full py-1 px-2.5 rounded border border-slate-300 dark:border-slate-700 theme-surface theme-text text-xs focus:outline-none focus:border-blue-500"
                    />
                  </th>
                  <th className="py-2.5 px-3 w-28 text-center"></th>
                </tr>

                {/* Row 2: Column Headers */}
                <tr className="border-b border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/80 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center space-x-1 cursor-pointer select-none">
                      <span>Id</span>
                      <span className="text-slate-400 text-[10px]">⇅</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center space-x-1 cursor-pointer select-none">
                      <span>Name</span>
                      <span className="text-slate-400 text-[10px]">⇅</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center space-x-1 cursor-pointer select-none">
                      <span>Email</span>
                      <span className="text-slate-400 text-[10px]">⇅</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 className="w-7 h-7 animate-spin text-[#2f70b8] mx-auto" />
                      <p className="text-xs font-semibold text-slate-400 mt-2">Loading audience records...</p>
                    </td>
                  </tr>
                ) : recipients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold theme-text">No matching users found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search filters or month criteria</p>
                    </td>
                  </tr>
                ) : (
                  recipients.map((rec) => {
                    const isSelected = selectedIds.has(rec.id);
                    const isActionOpen = openActionRowId === rec.id;

                    return (
                      <tr
                        key={rec.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelect(rec.id)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Id */}
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 font-medium">
                          {rec.id}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3 font-medium theme-text">
                          <div className="flex items-center space-x-2">
                            <span>{rec.name}</span>
                            {rec.companyName && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({rec.companyName})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {rec.email}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setOpenActionRowId(isActionOpen ? null : rec.id)}
                              className="px-3 py-1 rounded bg-[#2f70b8] hover:bg-[#255b96] text-white font-semibold text-[11px] shadow-sm flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Action</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Dropdown Menu */}
                            {isActionOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setOpenActionRowId(null)}
                                />
                                <div className="absolute right-3 top-10 z-30 w-44 rounded-lg theme-surface border theme-border shadow-xl py-1 text-left animate-fade-in">
                                  <button
                                    onClick={() => {
                                      setOpenActionRowId(null);
                                      openComposeModal(rec);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-[#2f70b8]" />
                                    <span>Send Direct Email</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenActionRowId(null);
                                      setViewingProfile(rec);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>View Profile Details</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <div>
              Showing {recipients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalRecipients)} of {totalRecipients} records
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#2f70b8] text-white'
                        : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 theme-text'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BROADCAST DISPATCH LOGS & HISTORY TABLE */}
      <div className="theme-surface border theme-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b theme-border flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider theme-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2f70b8]" />
            Broadcast Dispatch Logs & History
          </h3>
          <span className="text-xs text-slate-400">Total Outbound Campaigns: <strong>{broadcasts.length}</strong></span>
        </div>

        <div className="overflow-x-auto">
          {broadcasts.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No previous broadcasts dispatched yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="py-3 px-4">Campaign Name & Subject</th>
                  <th className="py-3 px-4">Target Segment</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Dispatch Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <span className="font-bold theme-text block">{b.campaignName}</span>
                      <span className="text-[11px] text-slate-400">{b.subject}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 theme-text border theme-border">
                        {b.targetSegment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold theme-text">
                      {b.recipientCount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {b.sentAt ? new Date(b.sentAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* COMPOSE BROADCAST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="max-w-2xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-4 border-b theme-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black theme-text flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2f70b8]" />
                  <span>Compose Email Broadcast</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {targetRecipientOverride
                    ? `Direct message to ${targetRecipientOverride.name} (${targetRecipientOverride.email})`
                    : `Broadcasting to ${selectedIds.size} selected recipient(s) in ${activeSegmentMeta.title}`}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendBroadcast} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Selected Recipients Preview Banner */}
              {!targetRecipientOverride && selectedIds.size > 0 && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2f70b8] dark:text-blue-400">
                    <span>Target Audience: {selectedIds.size} Recipients</span>
                    <span className="text-[10px] text-slate-500">Segment: {activeSegmentMeta.key}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                    {recipients
                      .filter((r) => selectedIds.has(r.id))
                      .map((r) => (
                        <span
                          key={r.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono"
                        >
                          {r.name} ({r.id})
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                  Campaign Title / Internal Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.campaignName}
                  onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
                  placeholder="e.g. October 2026 Inactive Candidates Re-engagement"
                  className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subject Line */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                  Email Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. 150+ Fresh Opportunities Waiting for You at Camzy Jobs"
                  className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Email Message Content (HTML or Plain Text) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Tags: &#123;&#123;firstName&#125;&#125;, &#123;&#123;companyName&#125;&#125;
                  </span>
                </div>
                <textarea
                  rows={7}
                  required
                  value={form.htmlBody}
                  onChange={(e) => setForm({ ...form, htmlBody: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
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
                  disabled={sending}
                  className="px-5 py-2 rounded-xl bg-[#2f70b8] hover:bg-[#255b96] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    Send Broadcast ({targetRecipientOverride ? '1' : selectedIds.size} Recipients)
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <h3 className="text-sm font-black theme-text flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2f70b8]" />
                <span>Audience Member Details</span>
              </h3>
              <button
                onClick={() => setViewingProfile(null)}
                className="p-1 rounded-lg text-slate-400 hover:theme-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Display ID</span>
                <span className="font-mono font-bold theme-text">{viewingProfile.id}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                <span className="font-bold theme-text">{viewingProfile.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="font-mono theme-text">{viewingProfile.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Role</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 theme-text">
                  {viewingProfile.role}
                </span>
              </div>

              {viewingProfile.skills && viewingProfile.skills.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Registered Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {viewingProfile.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingProfile.companyName && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Company / Employer</span>
                  <span className="font-medium theme-text">{viewingProfile.companyName}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Activity / Inactive Period</span>
                <span className="font-medium theme-text">
                  {viewingProfile.inactiveMonths ? `${viewingProfile.inactiveMonths} Months Inactive` : 'Recently Active'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t theme-border flex items-center justify-end space-x-2">
              <button
                onClick={() => setViewingProfile(null)}
                className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = viewingProfile;
                  setViewingProfile(null);
                  openComposeModal(target);
                }}
                className="px-4 py-2 rounded-xl bg-[#2f70b8] hover:bg-[#255b96] text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Direct Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEmailBroadcastingPage() {
  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Suspense fallback={
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2f70b8] mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading Email Broadcasting Engine...</p>
        </div>
      }>
        <BroadcastContent />
      </Suspense>
    </DashboardLayout>
  );
}
