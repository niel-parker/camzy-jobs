'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { LoginActivityItem, LoginActivityStats } from '@job-portal/sdk';
import {
  Activity, ShieldCheck, ShieldAlert, KeyRound, Smartphone, Search,
  RefreshCw, Download, Trash2, CheckCircle2, XCircle, AlertTriangle,
  Monitor, Tablet, Phone, Globe, Info, Clock, ChevronLeft, ChevronRight,
  ExternalLink, Copy, Check, Filter, Database, ArrowUpRight, Lock, Eye, X, Users
} from 'lucide-react';

export default function AdminLoginActivityPage() {
  const { sdk, theme } = useTheme();

  // State
  const [activities, setActivities] = useState<LoginActivityItem[]>([]);
  const [stats, setStats] = useState<LoginActivityStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, SUCCESS, FAILED
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Detail Modal State
  const [selectedActivity, setSelectedActivity] = useState<LoginActivityItem | null>(null);

  // Load Data
  const fetchData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const [pagedData, statsData] = await Promise.all([
        sdk.getLoginActivities({
          page: currentPage,
          limit: pageSize,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          method: methodFilter !== 'ALL' ? methodFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        sdk.getLoginActivityStats(),
      ]);

      setActivities(pagedData.items || []);
      setTotalPages(pagedData.totalPages || 1);
      setTotalCount(pagedData.total || 0);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load login activity logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sdk, currentPage, pageSize, statusFilter, roleFilter, methodFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Copy IP to Clipboard
  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Seed Demo Data
  const handleSeedDemo = async () => {
    try {
      setRefreshing(true);
      await sdk.seedDemoLoginActivities();
      await fetchData(true);
    } catch (err) {
      console.error('Failed to seed demo activities:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Clear History
  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to prune older login activities? This will keep only the 50 most recent records.')) {
      return;
    }
    try {
      setRefreshing(true);
      await sdk.clearLoginActivities();
      await fetchData(true);
    } catch (err) {
      console.error('Failed to clear activities:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (activities.length === 0) {
      alert('No activities available to export.');
      return;
    }

    const headers = [
      'Timestamp',
      'Email',
      'User Name',
      'Role',
      'Status',
      'Failure Reason',
      'Method',
      'IP Address',
      'Location',
      'Device',
      'Browser',
      'OS',
      'User Agent',
    ];

    const rows = activities.map((a) => [
      `"${new Date(a.createdAt).toISOString()}"`,
      `"${a.email || ''}"`,
      `"${a.userName || ''}"`,
      `"${a.role || 'UNKNOWN'}"`,
      `"${a.status}"`,
      `"${a.failureReason || 'N/A'}"`,
      `"${a.loginMethod}"`,
      `"${a.ipAddress}"`,
      `"${a.location || ''}"`,
      `"${a.deviceType}"`,
      `"${a.browser || ''}"`,
      `"${a.os || ''}"`,
      `"${(a.userAgent || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `login-activities-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Device Icon Helper
  const getDeviceIcon = (deviceType: string) => {
    const d = (deviceType || '').toLowerCase();
    if (d.includes('mobile') || d.includes('phone')) return <Phone className="w-4 h-4 text-sky-500" />;
    if (d.includes('tablet') || d.includes('ipad')) return <Tablet className="w-4 h-4 text-purple-500" />;
    return <Monitor className="w-4 h-4 text-slate-500" />;
  };

  // Role Badge Helper
  const getRoleBadge = (role?: string | null) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Super Admin
          </span>
        );
      case 'COMPANY_ADMIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Employer Admin
          </span>
        );
      case 'RECRUITER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Recruiter
          </span>
        );
      case 'CANDIDATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Candidate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border theme-border">
            {role || 'Unknown'}
          </span>
        );
    }
  };

  // Method Badge Helper
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'OTP':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Smartphone className="w-3.5 h-3.5" /> OTP Code
          </span>
        );
      case 'GOOGLE':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <Globe className="w-3.5 h-3.5" /> Google OAuth
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <KeyRound className="w-3.5 h-3.5" /> Password
          </span>
        );
    }
  };

  // Relative Time Formatter
  const formatTimeAgo = (dateStr: string) => {
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-indigo-900/40">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Security & Governance Audit
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              Login Activity & Session Logs
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Inspect historical and real-time authentication events, client IP addresses, browser footprints, and monitor unauthorized access attempts across all roles.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 shadow-sm disabled:opacity-50"
              title="Refresh log activities"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 shadow-sm"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={handleSeedDemo}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
              title="Seed realistic demo activities"
            >
              <Database className="w-3.5 h-3.5" />
              Seed Demo
            </button>

            <button
              onClick={handleClearHistory}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-all"
              title="Prune historical logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Prune
            </button>
          </div>

          {/* Background Decorative Rings */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* METRICS KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Logins 24h */}
          <div className="theme-surface p-5 rounded-2xl border theme-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Attempts (24h)
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black theme-text">
                {stats ? stats.total24h : <span className="animate-pulse">--</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>All time:</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">{stats?.totalAllTime ?? 0} events</span>
              </div>
            </div>
          </div>

          {/* Card 2: Successful Logins */}
          <div className="theme-surface p-5 rounded-2xl border theme-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Successful (24h)
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats ? stats.success24h : <span className="animate-pulse">--</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {stats?.successRate ?? 100}% Rate
                </span>
                <span>authorized access</span>
              </div>
            </div>
          </div>

          {/* Card 3: Failed Attempts */}
          <div className="theme-surface p-5 rounded-2xl border theme-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Failed Attempts (24h)
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {stats ? stats.failed24h : <span className="animate-pulse">--</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {stats && stats.failed24h > 0 ? (
                  <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Requires review
                  </span>
                ) : (
                  <span className="text-emerald-500 font-medium">No recent threats</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Unique Users Active */}
          <div className="theme-surface p-5 rounded-2xl border theme-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Unique Users (24h)
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
                {stats ? stats.uniqueUsers24h : <span className="animate-pulse">--</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span>Devices:</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {stats?.deviceBreakdown?.desktop ?? 0} desk / {stats?.deviceBreakdown?.mobile ?? 0} mob
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS QUICK TABS & SEARCH / FILTER CONTROLS */}
        <div className="theme-surface p-4 rounded-2xl border theme-border shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Segmented Tabs */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border theme-border">
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Events ({stats?.totalAllTime ?? totalCount})
              </button>

              <button
                onClick={() => {
                  setStatusFilter('SUCCESS');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'SUCCESS'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Successful
              </button>

              <button
                onClick={() => {
                  setStatusFilter('FAILED');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'FAILED'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                Failed Attempts
              </button>
            </div>

            {/* Quick Links to Camzy Internal Team & Job Seekers & Employers */}
            <div className="flex items-center gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-500/20 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Camzy Internal Team
              </Link>
              <Link
                href="/admin/profiles"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-500/20 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                Job Seekers & Employers
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Search and Dropdowns Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t theme-border">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search email, name, IP address, browser, or reason..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="lg:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admins</option>
                <option value="COMPANY_ADMIN">Employer Admins</option>
                <option value="RECRUITER">Recruiters</option>
                <option value="CANDIDATE">Candidates</option>
              </select>
            </div>

            {/* Auth Method Filter */}
            <div className="lg:col-span-2">
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Methods</option>
                <option value="PASSWORD">Password</option>
                <option value="OTP">OTP Verification</option>
                <option value="GOOGLE">Google OAuth</option>
              </select>
            </div>

            {/* Page Size Filter */}
            <div className="lg:col-span-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="theme-surface rounded-2xl border theme-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase font-bold text-slate-500 dark:text-slate-400 border-b theme-border tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User / Account</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status & Reason</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Device & Browser</th>
                  <th className="py-3 px-4">IP Address & Location</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border font-medium">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="py-4 px-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                          <Activity className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-sm theme-text">No login activity records found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          No authentication attempts match your current filters. Try clearing your search or seed demo events.
                        </p>
                        <button
                          onClick={handleSeedDemo}
                          className="mt-4 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
                        >
                          Seed Demo Activities
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activities.map((item) => {
                    const isSuccess = item.status === 'SUCCESS';
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* User / Email Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold uppercase shrink-0 ${
                                isSuccess
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {(item.userName || item.email || '?').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold theme-text truncate max-w-[200px]" title={item.userName || item.email}>
                                {item.userName || item.email.split('@')[0]}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={item.email}>
                                {item.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getRoleBadge(item.role)}
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5 px-4">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              SUCCESS
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 w-max">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                FAILED
                              </span>
                              {item.failureReason && (
                                <span className="text-[10px] text-rose-500 font-medium truncate max-w-[170px]" title={item.failureReason}>
                                  {item.failureReason}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Method Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getMethodBadge(item.loginMethod)}
                        </td>

                        {/* Device & Browser Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(item.deviceType)}
                            <div>
                              <div className="font-semibold theme-text text-xs">
                                {item.browser || 'Browser'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.os || item.deviceType}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* IP Address & Location Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              <span>{item.ipAddress}</span>
                              <button
                                onClick={() => handleCopyIp(item.ipAddress)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Copy IP"
                              >
                                {copiedIp === item.ipAddress ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {item.location && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                {item.location}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Timestamp Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-xs font-semibold theme-text">
                            {formatTimeAgo(item.createdAt)}
                          </div>
                          <div className="text-[10px] text-slate-400" title={new Date(item.createdAt).toLocaleString()}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Inspect Details Button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedActivity(item)}
                            className="p-1.5 rounded-lg border theme-border hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-all text-slate-500"
                            title="Inspect full event audit details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{activities.length}</span> of{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">{totalCount}</span> authentication records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="p-1.5 rounded-lg border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold px-2 theme-text">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="p-1.5 rounded-lg border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* DETAIL INSPECT MODAL */}
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="theme-surface rounded-2xl border theme-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-5 border-b theme-border flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                      selectedActivity.status === 'SUCCESS' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {selectedActivity.status === 'SUCCESS' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold theme-text text-base">Authentication Event Payload</h3>
                    <p className="text-xs text-slate-400">ID: {selectedActivity.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Status banner */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    selectedActivity.status === 'SUCCESS'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedActivity.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    <span className="font-bold uppercase tracking-wider text-xs">
                      {selectedActivity.status} - {selectedActivity.loginMethod} Authentication
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold">{formatTimeAgo(selectedActivity.createdAt)}</span>
                </div>

                {selectedActivity.failureReason && (
                  <div className="p-3 bg-rose-100/60 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-semibold">
                    Failure Cause: {selectedActivity.failureReason}
                  </div>
                )}

                {/* Key Grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border theme-border">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                    <p className="font-bold theme-text mt-0.5">{selectedActivity.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Account Role</span>
                    <p className="mt-0.5">{getRoleBadge(selectedActivity.role)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Full Name</span>
                    <p className="font-semibold theme-text mt-0.5">{selectedActivity.userName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">User ID</span>
                    <p className="font-mono text-[11px] theme-text mt-0.5">{selectedActivity.userId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">IP Address</span>
                    <p className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {selectedActivity.ipAddress}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Location Signature</span>
                    <p className="font-semibold theme-text mt-0.5">{selectedActivity.location || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Browser & Device</span>
                    <p className="font-semibold theme-text mt-0.5">
                      {selectedActivity.browser} ({selectedActivity.os}) - {selectedActivity.deviceType}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Exact Timestamp</span>
                    <p className="font-semibold theme-text mt-0.5">
                      {new Date(selectedActivity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Raw User-Agent */}
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                    Raw User-Agent Signature
                  </span>
                  <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] break-all border border-slate-800">
                    {selectedActivity.userAgent || 'No user-agent transmitted'}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t theme-border flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold theme-surface border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 theme-text transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
