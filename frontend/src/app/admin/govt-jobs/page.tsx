'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  GovtJobItem, 
  GovtJobCategoryType, 
  GovtExamCalendarItemType, 
  GovtCommissionPortalType 
} from '@job-portal/sdk';
import { 
  Landmark, Building2, Plus, Search, Edit3, Trash2, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, AlertCircle, ExternalLink, Calendar, 
  MapPin, ShieldCheck, Award, Eye, Globe, FileText, Sparkles, Image as ImageIcon,
  Palette, Copy, Download, Layers, ArrowUpRight, Check, Send
} from 'lucide-react';
import { GovtJobsCanvasAnalytics } from './GovtJobsCanvasAnalytics';
import { GovtJobPosterCanvasModal } from './GovtJobPosterCanvasModal';

const INDIAN_STATES = [
  'All States',
  'Uttar Pradesh',
  'Maharashtra',
  'Bihar',
  'Rajasthan',
  'Delhi',
  'Madhya Pradesh',
  'Gujarat',
  'Haryana',
  'Punjab',
  'West Bengal',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Assam',
];

const SECTOR_OPTIONS = [
  'UPSC / Civil Services',
  'SSC / Staff Selection',
  'Railways / RRB',
  'Banking / IBPS',
  'Police / Law Enforcement',
  'Defence / Armed Forces',
  'Teaching / Education',
  'State PSC / Civil Services',
  'PSU / Engineering',
  'Healthcare / Medical',
  'General Administration',
];

export default function AdminGovtJobsManagementPage() {
  const { sdk } = useTheme();

  // Primary Active Tab: 'jobs' | 'calendar' | 'portals' | 'studio'
  const [activeTab, setActiveTab] = useState<'jobs' | 'calendar' | 'portals' | 'studio'>('jobs');

  // 1. Govt Jobs Data & States
  const [jobs, setJobs] = useState<GovtJobItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [tabFilter, setTabFilter] = useState<'ALL' | 'CENTRAL' | 'STATE'>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('All States');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Examination Calendar Data & States
  const [calendarItems, setCalendarItems] = useState<GovtExamCalendarItemType[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(false);
  const [calendarSearch, setCalendarSearch] = useState<string>('');

  // 3. Commission Portals Directory Data & States
  const [portals, setPortals] = useState<GovtCommissionPortalType[]>([]);
  const [loadingPortals, setLoadingPortals] = useState<boolean>(false);

  // Global Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States: Job Posting
  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<GovtJobItem | null>(null);
  const [savingJob, setSavingJob] = useState<boolean>(false);
  const [deletingJob, setDeletingJob] = useState<GovtJobItem | null>(null);
  const [isDeletingJob, setIsDeletingJob] = useState<boolean>(false);
  const [posterJob, setPosterJob] = useState<GovtJobItem | null>(null);

  // Modal States: Examination Calendar Event
  const [isCalModalOpen, setIsCalModalOpen] = useState<boolean>(false);
  const [editingCalItem, setEditingCalItem] = useState<GovtExamCalendarItemType | null>(null);
  const [savingCal, setSavingCal] = useState<boolean>(false);
  const [deletingCalItem, setDeletingCalItem] = useState<GovtExamCalendarItemType | null>(null);
  const [isDeletingCal, setIsDeletingCal] = useState<boolean>(false);

  // Modal States: Commission Portal
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);
  const [editingPortal, setEditingPortal] = useState<GovtCommissionPortalType | null>(null);
  const [savingPortal, setSavingPortal] = useState<boolean>(false);
  const [deletingPortal, setDeletingPortal] = useState<GovtCommissionPortalType | null>(null);
  const [isDeletingPortal, setIsDeletingPortal] = useState<boolean>(false);

  // Job Form State
  const [jobForm, setJobForm] = useState<{
    category: GovtJobCategoryType;
    state: string;
    sector: string;
    titleEn: string;
    titleHi: string;
    departmentEn: string;
    departmentHi: string;
    totalVacancies: string;
    qualificationEn: string;
    qualificationHi: string;
    ageLimit: string;
    salaryScale: string;
    startDate: string;
    lastDate: string;
    applyUrl: string;
    notificationUrl: string;
    officialWebsiteUrl: string;
    descriptionEn: string;
    descriptionHi: string;
    isActive: boolean;
    isFeatured: boolean;
    orderIndex: number;
  }>({
    category: 'CENTRAL',
    state: 'Uttar Pradesh',
    sector: 'UPSC / Civil Services',
    titleEn: '',
    titleHi: '',
    departmentEn: '',
    departmentHi: '',
    totalVacancies: '',
    qualificationEn: '',
    qualificationHi: '',
    ageLimit: '',
    salaryScale: '',
    startDate: '',
    lastDate: '',
    applyUrl: '',
    notificationUrl: '',
    officialWebsiteUrl: '',
    descriptionEn: '',
    descriptionHi: '',
    isActive: true,
    isFeatured: false,
    orderIndex: 0,
  });

  // Calendar Event Form State
  const [calForm, setCalForm] = useState<{
    day: string;
    month: string;
    year: string;
    titleEn: string;
    titleHi: string;
    board: string;
    stage: string;
    link: string;
    orderIndex: number;
    isActive: boolean;
  }>({
    day: '14',
    month: 'MAR',
    year: '2026',
    titleEn: '',
    titleHi: '',
    board: 'SSC Portal',
    stage: 'Computer Based Exam',
    link: 'https://ssc.gov.in',
    orderIndex: 0,
    isActive: true,
  });

  // Commission Portal Form State
  const [portalForm, setPortalForm] = useState<{
    name: string;
    nameHi: string;
    url: string;
    desc: string;
    descHi: string;
    badgeText: string;
    orderIndex: number;
    isActive: boolean;
  }>({
    name: '',
    nameHi: '',
    url: '',
    desc: '',
    descHi: '',
    badgeText: '.gov.in / .nic.in',
    orderIndex: 0,
    isActive: true,
  });

  // 4. Interactive HTML5 Canvas Notice & Poster Studio State
  const studioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [studioTheme, setStudioTheme] = useState<'tricolor' | 'navy' | 'crimson' | 'emerald'>('tricolor');
  const [studioTitleEn, setStudioTitleEn] = useState<string>('Combined Graduate Level (CGL) 2026 Examination');
  const [studioTitleHi, setStudioTitleHi] = useState<string>('संयुक्त स्नातक स्तरीय (सीजीएल) भर्ती परीक्षा 2026');
  const [studioDept, setStudioDept] = useState<string>('Staff Selection Commission (SSC), Ministry of Personnel');
  const [studioCategory, setStudioCategory] = useState<'CENTRAL' | 'STATE'>('CENTRAL');
  const [studioState, setStudioState] = useState<string>('All India');
  const [studioSector, setStudioSector] = useState<string>('SSC / Staff Selection');
  const [studioVacancies, setStudioVacancies] = useState<string>('17,727 Posts');
  const [studioSalary, setStudioSalary] = useState<string>('Level 4 - 8 (₹25,500 - ₹1,51,100)');
  const [studioAge, setStudioAge] = useState<string>('18 - 32 Yrs');
  const [studioLastDate, setStudioLastDate] = useState<string>('28 Nov 2026');
  const [studioStartDate, setStudioStartDate] = useState<string>('01 Nov 2026');
  const [studioApplyUrl, setStudioApplyUrl] = useState<string>('https://ssc.gov.in');
  const [studioBadge, setStudioBadge] = useState<string>('OFFICIAL GAZETTE NOTIFICATION');
  const [isPublishingFromStudio, setIsPublishingFromStudio] = useState<boolean>(false);
  const [studioCopied, setStudioCopied] = useState<boolean>(false);

  // Load All Data
  const loadGovtJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await sdk.getGovtJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Failed to load govt jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadExamCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const data = await sdk.getGovtExamCalendar();
      setCalendarItems(data);
    } catch (err: any) {
      console.error('Failed to load exam calendar:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const loadCommissionPortals = async () => {
    setLoadingPortals(true);
    try {
      const data = await sdk.getGovtCommissionPortals();
      setPortals(data);
    } catch (err: any) {
      console.error('Failed to load commission portals:', err);
    } finally {
      setLoadingPortals(false);
    }
  };

  useEffect(() => {
    loadGovtJobs();
    loadExamCalendar();
    loadCommissionPortals();
  }, [sdk]);

  // Redraw Studio HTML5 Canvas on changes
  useEffect(() => {
    if (activeTab !== 'studio') return;
    const canvas = studioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Theme backgrounds
    if (studioTheme === 'navy') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(1, '#020c1b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (studioTheme === 'crimson') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#500724');
      grad.addColorStop(1, '#2e0214');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (studioTheme === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // Tricolor official clean style
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fffdf9');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, '#f8fafc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    const isDark = studioTheme !== 'tricolor';
    const textColorPrimary = isDark ? '#ffffff' : '#0f172a';
    const textColorSecondary = isDark ? '#94a3b8' : '#475569';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1';

    // 1. Top Tricolor Ribbon
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 14, W, 14);
    ctx.fillStyle = '#138808';
    ctx.fillRect(0, 28, W, 14);

    // 2. Top Header Badge
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(40, 70, W - 80, 72);
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 70, W - 80, 72);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`CAMZY JOBS • ${studioBadge.toUpperCase()}`, 65, 114);

    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    const catLabel = studioCategory === 'CENTRAL' ? 'CENTRAL GOVT / केंद्र सरकार' : `STATE GOVT (${studioState})`;
    ctx.fillText(catLabel, W - 65, 114);

    // 3. Department / Ministry Title
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(studioDept.toUpperCase(), W / 2, 200);

    // Sector badge
    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`[ ${studioSector} ]`, W / 2, 240);

    // 4. Primary Hero Notice Card
    const heroY = 275;
    const heroH = 175;
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(40, heroY, W - 80, heroH, 20);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = textColorPrimary;
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';

    if (studioTitleEn.length > 42) {
      const half = Math.floor(studioTitleEn.length / 2);
      const splitIdx = studioTitleEn.lastIndexOf(' ', half) !== -1 ? studioTitleEn.lastIndexOf(' ', half) : half;
      ctx.fillText(studioTitleEn.substring(0, splitIdx), W / 2, heroY + 68);
      ctx.fillText(studioTitleEn.substring(splitIdx).trim(), W / 2, heroY + 120);
    } else {
      ctx.fillText(studioTitleEn, W / 2, heroY + (studioTitleHi ? 68 : 100));
      if (studioTitleHi) {
        ctx.fillStyle = textColorSecondary;
        ctx.font = '600 30px system-ui, -apple-system, sans-serif';
        ctx.fillText(studioTitleHi, W / 2, heroY + 124);
      }
    }

    // 5. Four Metrics Badges
    const gridY = 480;
    const cardW = (W - 80 - 45) / 4;
    const cardH = 160;

    const metrics = [
      { label: 'TOTAL VACANCIES', value: studioVacancies, color: '#10b981' },
      { label: 'PAY SCALE', value: studioSalary.slice(0, 20), color: '#6366f1' },
      { label: 'AGE LIMIT', value: studioAge, color: '#f59e0b' },
      { label: 'CATEGORY', value: studioCategory === 'CENTRAL' ? 'All India' : studioState, color: '#ec4899' },
    ];

    metrics.forEach((m, i) => {
      const cx = 40 + i * (cardW + 15);
      ctx.fillStyle = cardBg;
      ctx.beginPath();
      ctx.roundRect(cx, gridY, cardW, cardH, 16);
      ctx.fill();
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.roundRect(cx + cardW / 2 - 25, gridY + 12, 50, 6, 3);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = textColorSecondary;
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.label, cx + cardW / 2, gridY + 48);

      ctx.fillStyle = textColorPrimary;
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.value, cx + cardW / 2, gridY + 105);
    });

    // 6. Dates Banner
    const dateY = 670;
    const dateH = 150;
    ctx.fillStyle = isDark ? '#0c4a6e' : '#f0f9ff';
    ctx.beginPath();
    ctx.roundRect(40, dateY, W - 80, dateH, 20);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = textColorSecondary;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('ONLINE APPLICATION COMMENCES', 75, dateY + 50);
    ctx.fillStyle = textColorPrimary;
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(studioStartDate || 'Open Now', 75, dateY + 95);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('DEADLINE / अंतिम तिथि', W - 75, dateY + 50);
    ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
    ctx.fillText(studioLastDate || 'Check Notification', W - 75, dateY + 98);

    // 7. Watermark & Link Strip
    const footerY = 850;
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(40, footerY, W - 80, 150, 20);
    ctx.fill();
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('✓ VERIFIED OFFICIAL GOVT NOTIFICATION', 75, footerY + 50);

    ctx.fillStyle = textColorSecondary;
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('APPLY ONLINE AT OFFICIAL DOMAIN:', 75, footerY + 86);

    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(studioApplyUrl, 75, footerY + 120);

    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('CamzyJobs Government Desk', W - 75, footerY + 70);
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText('jobs.camzytech.com/govt-jobs', W - 75, footerY + 105);

    // Bottom Accent
    ctx.fillStyle = '#138808';
    ctx.fillRect(0, H - 12, W, 12);
  }, [
    activeTab, studioTheme, studioTitleEn, studioTitleHi, studioDept,
    studioCategory, studioState, studioSector, studioVacancies,
    studioSalary, studioAge, studioLastDate, studioStartDate,
    studioApplyUrl, studioBadge
  ]);

  // Handle Download from Studio
  const handleDownloadStudioPNG = () => {
    const canvas = studioCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Govt-Notice-${studioTitleEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}-canvas.png`;
    a.click();
  };

  const handleCopyStudioImage = async () => {
    const canvas = studioCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setStudioCopied(true);
        setTimeout(() => setStudioCopied(false), 2000);
      });
    } catch {
      alert('Could not copy image to clipboard in this browser. Please use Download PNG.');
    }
  };

  // Publish Directly as Govt Job from Studio
  const handlePublishFromStudio = async () => {
    if (!studioTitleEn.trim() || !studioDept.trim() || !studioLastDate.trim() || !studioApplyUrl.trim()) {
      alert('Please fill Title, Department, Last Date, and Apply URL.');
      return;
    }
    setIsPublishingFromStudio(true);
    try {
      await sdk.saveGovtJob({
        category: studioCategory,
        state: studioCategory === 'STATE' ? studioState : undefined,
        sector: studioSector,
        titleEn: studioTitleEn.trim(),
        titleHi: studioTitleHi.trim() || studioTitleEn.trim(),
        departmentEn: studioDept.trim(),
        departmentHi: studioDept.trim(),
        totalVacancies: studioVacancies.trim() || 'Multiple',
        qualificationEn: 'Graduate / Diploma / 10+2 from recognized University / Board',
        qualificationHi: 'मान्यता प्राप्त विश्वविद्यालय / बोर्ड से स्नातक / डिप्लोमा',
        ageLimit: studioAge,
        salaryScale: studioSalary,
        startDate: studioStartDate,
        lastDate: studioLastDate,
        applyUrl: studioApplyUrl,
        isActive: true,
        isFeatured: true,
      });
      setSuccessMsg('Government job notice published successfully directly from Canvas Studio!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setActiveTab('jobs');
      loadGovtJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to publish notice from Canvas studio.');
    } finally {
      setIsPublishingFromStudio(false);
    }
  };

  // Load a job into Canvas Studio
  const handleOpenInStudio = (job: GovtJobItem) => {
    setStudioTitleEn(job.titleEn);
    setStudioTitleHi(job.titleHi || job.titleEn);
    setStudioDept(job.departmentEn);
    setStudioCategory(job.category);
    setStudioState(job.state || 'All India');
    setStudioSector(job.sector);
    setStudioVacancies(job.totalVacancies);
    setStudioSalary(job.salaryScale || '7th CPC Scale');
    setStudioAge(job.ageLimit || '18 - 32 Yrs');
    setStudioStartDate(job.startDate || 'Open Now');
    setStudioLastDate(job.lastDate);
    setStudioApplyUrl(job.applyUrl);
    setActiveTab('studio');
  };

  // Job Posting Handlers
  const openAddJobModal = () => {
    setEditingJob(null);
    setJobForm({
      category: 'CENTRAL',
      state: 'Uttar Pradesh',
      sector: 'UPSC / Civil Services',
      titleEn: '',
      titleHi: '',
      departmentEn: '',
      departmentHi: '',
      totalVacancies: '',
      qualificationEn: '',
      qualificationHi: '',
      ageLimit: '18 - 32 Yrs',
      salaryScale: '7th CPC Matrix Level 7',
      startDate: new Date().toISOString().split('T')[0],
      lastDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      applyUrl: 'https://',
      notificationUrl: '',
      officialWebsiteUrl: '',
      descriptionEn: '',
      descriptionHi: '',
      isActive: true,
      isFeatured: false,
      orderIndex: jobs.length + 1,
    });
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: GovtJobItem) => {
    setEditingJob(job);
    setJobForm({
      category: job.category,
      state: job.state || 'Uttar Pradesh',
      sector: job.sector,
      titleEn: job.titleEn,
      titleHi: job.titleHi || '',
      departmentEn: job.departmentEn,
      departmentHi: job.departmentHi || '',
      totalVacancies: job.totalVacancies,
      qualificationEn: job.qualificationEn || '',
      qualificationHi: job.qualificationHi || '',
      ageLimit: job.ageLimit || '',
      salaryScale: job.salaryScale || '',
      startDate: job.startDate || '',
      lastDate: job.lastDate,
      applyUrl: job.applyUrl,
      notificationUrl: job.notificationUrl || '',
      officialWebsiteUrl: job.officialWebsiteUrl || '',
      descriptionEn: job.descriptionEn || '',
      descriptionHi: job.descriptionHi || '',
      isActive: Boolean(job.isActive),
      isFeatured: Boolean(job.isFeatured),
      orderIndex: job.orderIndex || 0,
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.titleEn.trim() || !jobForm.departmentEn.trim() || !jobForm.lastDate.trim() || !jobForm.applyUrl.trim()) {
      setErrorMsg('Title, Department, Last Date, and Apply URL are required.');
      return;
    }
    setSavingJob(true);
    setErrorMsg(null);
    try {
      await sdk.saveGovtJob({
        id: editingJob ? editingJob.id : undefined,
        category: jobForm.category,
        state: jobForm.category === 'STATE' ? jobForm.state : undefined,
        sector: jobForm.sector,
        titleEn: jobForm.titleEn.trim(),
        titleHi: jobForm.titleHi.trim() || jobForm.titleEn.trim(),
        departmentEn: jobForm.departmentEn.trim(),
        departmentHi: jobForm.departmentHi.trim() || jobForm.departmentEn.trim(),
        totalVacancies: jobForm.totalVacancies.trim() || 'Multiple',
        qualificationEn: jobForm.qualificationEn.trim(),
        qualificationHi: jobForm.qualificationHi.trim(),
        ageLimit: jobForm.ageLimit.trim(),
        salaryScale: jobForm.salaryScale.trim(),
        startDate: jobForm.startDate.trim(),
        lastDate: jobForm.lastDate.trim(),
        applyUrl: jobForm.applyUrl.trim(),
        notificationUrl: jobForm.notificationUrl.trim(),
        officialWebsiteUrl: jobForm.officialWebsiteUrl.trim(),
        descriptionEn: jobForm.descriptionEn.trim(),
        descriptionHi: jobForm.descriptionHi.trim(),
        isActive: jobForm.isActive,
        isFeatured: jobForm.isFeatured,
        orderIndex: Number(jobForm.orderIndex) || 0,
      });
      setIsJobModalOpen(false);
      setSuccessMsg(`Government job notice ${editingJob ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadGovtJobs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save job notice.');
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!deletingJob) return;
    setIsDeletingJob(true);
    try {
      await sdk.deleteGovtJob(deletingJob.id);
      setDeletingJob(null);
      setSuccessMsg('Government job notice deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadGovtJobs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete notice.');
    } finally {
      setIsDeletingJob(false);
    }
  };

  const handleToggleJobStatus = async (job: GovtJobItem) => {
    try {
      await sdk.saveGovtJob({ id: job.id, isActive: !job.isActive });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  // Calendar Event Handlers
  const openAddCalModal = () => {
    setEditingCalItem(null);
    setCalForm({
      day: '15',
      month: 'DEC',
      year: '2026',
      titleEn: '',
      titleHi: '',
      board: 'SSC Portal',
      stage: 'Computer Based Exam',
      link: 'https://ssc.gov.in',
      orderIndex: calendarItems.length + 1,
      isActive: true,
    });
    setIsCalModalOpen(true);
  };

  const openEditCalModal = (item: GovtExamCalendarItemType) => {
    setEditingCalItem(item);
    setCalForm({
      day: item.day,
      month: item.month,
      year: item.year || '2026',
      titleEn: item.titleEn,
      titleHi: item.titleHi || '',
      board: item.board,
      stage: item.stage,
      link: item.link,
      orderIndex: item.orderIndex,
      isActive: item.isActive,
    });
    setIsCalModalOpen(true);
  };

  const handleSaveCalItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calForm.day || !calForm.month || !calForm.titleEn.trim() || !calForm.board.trim()) {
      alert('Day, Month, Exam Title, and Board name are required.');
      return;
    }
    setSavingCal(true);
    try {
      await sdk.saveGovtExamCalendarItem({
        id: editingCalItem ? editingCalItem.id : undefined,
        day: calForm.day.trim(),
        month: calForm.month.trim().toUpperCase(),
        year: calForm.year.trim(),
        titleEn: calForm.titleEn.trim(),
        titleHi: calForm.titleHi.trim() || calForm.titleEn.trim(),
        board: calForm.board.trim(),
        stage: calForm.stage.trim(),
        link: calForm.link.trim() || 'https://ssc.gov.in',
        orderIndex: Number(calForm.orderIndex) || 0,
        isActive: calForm.isActive,
      });
      setIsCalModalOpen(false);
      setSuccessMsg(`Exam event ${editingCalItem ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadExamCalendar();
    } catch (err: any) {
      alert(err.message || 'Failed to save exam calendar event');
    } finally {
      setSavingCal(false);
    }
  };

  const handleDeleteCalItem = async () => {
    if (!deletingCalItem) return;
    setIsDeletingCal(true);
    try {
      await sdk.deleteGovtExamCalendarItem(deletingCalItem.id);
      setDeletingCalItem(null);
      setSuccessMsg('Exam calendar event removed successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadExamCalendar();
    } catch (err: any) {
      alert(err.message || 'Failed to delete calendar event');
    } finally {
      setIsDeletingCal(false);
    }
  };

  const handleReseedCalDefaults = async () => {
    if (!confirm('Reseed default Examination Calendar events?')) return;
    try {
      await sdk.seedGovtExamCalendarDefaults();
      setSuccessMsg('Examination calendar reseeded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadExamCalendar();
    } catch (err: any) {
      alert(err.message || 'Failed to reseed calendar');
    }
  };

  // Commission Portal Handlers
  const openAddPortalModal = () => {
    setEditingPortal(null);
    setPortalForm({
      name: '',
      nameHi: '',
      url: 'https://',
      desc: '',
      descHi: '',
      badgeText: '.gov.in / .nic.in',
      orderIndex: portals.length + 1,
      isActive: true,
    });
    setIsPortalModalOpen(true);
  };

  const openEditPortalModal = (p: GovtCommissionPortalType) => {
    setEditingPortal(p);
    setPortalForm({
      name: p.name,
      nameHi: p.nameHi || '',
      url: p.url,
      desc: p.desc,
      descHi: p.descHi || '',
      badgeText: p.badgeText || '.gov.in / .nic.in',
      orderIndex: p.orderIndex,
      isActive: p.isActive,
    });
    setIsPortalModalOpen(true);
  };

  const handleSavePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalForm.name.trim() || !portalForm.url.trim() || !portalForm.desc.trim()) {
      alert('Portal name, URL, and description are required.');
      return;
    }
    setSavingPortal(true);
    try {
      await sdk.saveGovtCommissionPortal({
        id: editingPortal ? editingPortal.id : undefined,
        name: portalForm.name.trim(),
        nameHi: portalForm.nameHi.trim() || portalForm.name.trim(),
        url: portalForm.url.trim(),
        desc: portalForm.desc.trim(),
        descHi: portalForm.descHi.trim() || portalForm.desc.trim(),
        badgeText: portalForm.badgeText.trim() || '.gov.in / .nic.in',
        orderIndex: Number(portalForm.orderIndex) || 0,
        isActive: portalForm.isActive,
      });
      setIsPortalModalOpen(false);
      setSuccessMsg(`Commission portal ${editingPortal ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadCommissionPortals();
    } catch (err: any) {
      alert(err.message || 'Failed to save commission portal');
    } finally {
      setSavingPortal(false);
    }
  };

  const handleDeletePortal = async () => {
    if (!deletingPortal) return;
    setIsDeletingPortal(true);
    try {
      await sdk.deleteGovtCommissionPortal(deletingPortal.id);
      setDeletingPortal(null);
      setSuccessMsg('Commission portal removed successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadCommissionPortals();
    } catch (err: any) {
      alert(err.message || 'Failed to delete commission portal');
    } finally {
      setIsDeletingPortal(false);
    }
  };

  const handleReseedPortalDefaults = async () => {
    if (!confirm('Reseed official Commission Portals directory?')) return;
    try {
      await sdk.seedGovtCommissionPortalDefaults();
      setSuccessMsg('Commission portals reseeded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadCommissionPortals();
    } catch (err: any) {
      alert(err.message || 'Failed to reseed portals');
    }
  };

  // Filtered Jobs for Table
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (tabFilter !== 'ALL' && job.category !== tabFilter) return false;
      if (tabFilter === 'STATE' && stateFilter !== 'All States') {
        if (!job.state || !job.state.toLowerCase().includes(stateFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = job.titleEn?.toLowerCase().includes(q) || job.titleHi?.toLowerCase().includes(q);
        const matchDept = job.departmentEn?.toLowerCase().includes(q) || job.departmentHi?.toLowerCase().includes(q);
        const matchSector = job.sector?.toLowerCase().includes(q);
        if (!matchTitle && !matchDept && !matchSector) return false;
      }
      return true;
    });
  }, [jobs, tabFilter, stateFilter, searchQuery]);

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Super Admin Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8B2626]/10 text-[#8B2626] dark:text-rose-400 border border-[#8B2626]/20">
                Sarkari Portal Engine
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight theme-text mt-1 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-[#8B2626]" /> Government Jobs Master Management
            </h1>
            <p className="text-xs theme-muted">
              Full control over Job Notices, Examination Calendar, Commission Portals, and HTML5 Canvas Graphics Studio.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/govt-jobs"
              target="_blank"
              className="px-3.5 py-2 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Preview Live Portal</span>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>Canvas Notice Studio</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN SECTION TABS NAVIGATION */}
        <div className="border-b theme-border flex items-center gap-2 sm:gap-6 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'jobs'
                ? 'border-[#8B2626] text-[#8B2626] dark:text-rose-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Job Notifications & Notices</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {jobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-[#8B2626] text-[#8B2626] dark:text-rose-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Examination Calendar Timeline</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {calendarItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portals')}
            className={`pb-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'portals'
                ? 'border-[#8B2626] text-[#8B2626] dark:text-rose-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Commission Portals & Links</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {portals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`pb-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <span>HTML5 Canvas Banner Studio</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-600">
              Designer
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: JOB NOTIFICATIONS & VACANCIES                                      */}
        {/* ========================================================================= */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-fade-in">
            {/* HTML5 Canvas Visualizer */}
            <GovtJobsCanvasAnalytics jobs={jobs} />

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">Total Postings</span>
                <span className="text-2xl font-black theme-text mt-1 block">{jobs.length}</span>
                <span className="text-[10px] text-indigo-500 font-bold">Central & State Combined</span>
              </div>
              <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">Central Govt Jobs</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {jobs.filter(j => j.category === 'CENTRAL').length}
                </span>
                <span className="text-[10px] text-amber-500 font-bold">UPSC, SSC, Railways, Banks</span>
              </div>
              <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">State Govt Jobs</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {jobs.filter(j => j.category === 'STATE').length}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">State PSC & Police Boards</span>
              </div>
              <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider theme-muted block">Active Public Listings</span>
                <span className="text-2xl font-black text-[#8B2626] dark:text-rose-400 mt-1 block">
                  {jobs.filter(j => j.isActive).length}
                </span>
                <span className="text-[10px] text-[#8B2626] font-bold">Visible on /govt-jobs</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="theme-surface border theme-border rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="inline-flex p-1 rounded-xl border theme-border bg-slate-100 dark:bg-slate-800/80 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => { setTabFilter('ALL'); setStateFilter('All States'); }}
                    className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tabFilter === 'ALL' ? 'bg-[#8B2626] text-white shadow-xs' : 'theme-muted hover:theme-text'
                    }`}
                  >
                    All ({jobs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTabFilter('CENTRAL'); setStateFilter('All States'); }}
                    className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tabFilter === 'CENTRAL' ? 'bg-[#8B2626] text-white shadow-xs' : 'theme-muted hover:theme-text'
                    }`}
                  >
                    Central Govt ({jobs.filter(j => j.category === 'CENTRAL').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabFilter('STATE')}
                    className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tabFilter === 'STATE' ? 'bg-[#8B2626] text-white shadow-xs' : 'theme-muted hover:theme-text'
                    }`}
                  >
                    State Govt ({jobs.filter(j => j.category === 'STATE').length})
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={openAddJobModal}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#8B2626] hover:bg-rose-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Govt Job</span>
                  </button>
                </div>
              </div>

              {/* Search & State Filter */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t theme-border">
                <div className="md:col-span-8 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
                  <input
                    type="text"
                    placeholder="Search by Title, Department, or Sector..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-[#8B2626]"
                  />
                </div>

                {tabFilter === 'STATE' && (
                  <div className="md:col-span-4">
                    <select
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-bold focus:outline-none focus:ring-2 focus:ring-[#8B2626]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st === 'All States' ? 'Filter by All States' : `📍 ${st}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Jobs Table */}
            <div className="theme-surface border theme-border rounded-2xl shadow-xs overflow-hidden">
              {loadingJobs ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8B2626] mx-auto" />
                  <p className="text-xs font-semibold theme-muted">Loading government job notices...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Landmark className="w-12 h-12 text-[#8B2626] mx-auto opacity-60" />
                  <h4 className="text-sm font-bold theme-text">No government jobs found</h4>
                  <p className="text-xs theme-muted">Try adjusting your filters or click Post New Govt Job.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b theme-border text-[11px] font-black uppercase tracking-wider theme-muted">
                      <tr>
                        <th className="py-3 px-4">Post & Department</th>
                        <th className="py-3 px-4">Category / State</th>
                        <th className="py-3 px-4">Vacancies</th>
                        <th className="py-3 px-4">Last Date</th>
                        <th className="py-3 px-4">Apply URL</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="space-y-0.5">
                              <p className="font-extrabold theme-text line-clamp-1">{job.titleEn}</p>
                              {job.titleHi && job.titleHi !== job.titleEn && (
                                <p className="text-[11px] theme-muted line-clamp-1 italic font-medium">{job.titleHi}</p>
                              )}
                              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{job.departmentEn}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              job.category === 'CENTRAL'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {job.category === 'CENTRAL' ? 'Central' : (job.state || 'State')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-black theme-text whitespace-nowrap">
                            {job.totalVacancies}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            {job.lastDate}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap max-w-[140px] truncate">
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-bold"
                            >
                              <span className="truncate">{job.applyUrl.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleJobStatus(job)}
                              className="cursor-pointer transition-transform hover:scale-105"
                              title="Toggle active status"
                            >
                              {job.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                  <XCircle className="w-3 h-3" /> Draft
                                </span>
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open in Canvas Studio */}
                              <button
                                type="button"
                                onClick={() => handleOpenInStudio(job)}
                                className="p-1.5 rounded-lg border border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                                title="Open in Canvas Studio"
                              >
                                <Palette className="w-3.5 h-3.5" />
                              </button>

                              {/* Canvas Poster Generator Modal */}
                              <button
                                type="button"
                                onClick={() => setPosterJob(job)}
                                className="p-1.5 rounded-lg border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                                title="Generate Canvas Poster (PNG)"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditJobModal(job)}
                                className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Edit notice"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingJob(job)}
                                className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete notice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXAMINATION CALENDAR MANAGEMENT                                    */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl theme-surface border theme-border shadow-xs">
              <div>
                <h3 className="text-base font-black theme-text flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#8B2626]" />
                  <span>Examination Calendar Timeline Events</span>
                </h3>
                <p className="text-xs theme-muted">
                  Events configured here display in the terracotta date timeline strip on the public page.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleReseedCalDefaults}
                  className="px-3 py-2 rounded-xl border theme-border text-xs font-bold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reseed Calendar Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={openAddCalModal}
                  className="px-4 py-2 rounded-xl bg-[#8B2626] hover:bg-rose-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Exam Event</span>
                </button>
              </div>
            </div>

            <div className="theme-surface border theme-border rounded-2xl shadow-xs overflow-hidden">
              {loadingCalendar ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8B2626] mx-auto" />
                  <p className="text-xs font-semibold theme-muted">Loading exam calendar...</p>
                </div>
              ) : calendarItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Calendar className="w-12 h-12 text-[#8B2626] mx-auto opacity-60" />
                  <h4 className="text-sm font-bold theme-text">No calendar events configured</h4>
                  <p className="text-xs theme-muted">Click "Add Exam Event" or "Reseed Calendar Defaults" to populate.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b theme-border text-[11px] font-black uppercase tracking-wider theme-muted">
                      <tr>
                        <th className="py-3 px-4 w-28">Date Block</th>
                        <th className="py-3 px-4">Examination / Event Title</th>
                        <th className="py-3 px-4">Conducting Board</th>
                        <th className="py-3 px-4">Exam Stage</th>
                        <th className="py-3 px-4">Portal Link</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {calendarItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-xl bg-[#8B2626] text-white flex flex-col items-center justify-center font-serif shadow-xs">
                              <span className="text-base font-black leading-none">{item.day}</span>
                              <span className="text-[9px] font-bold uppercase leading-none mt-0.5">{item.month}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="font-extrabold theme-text leading-snug">{item.titleEn}</p>
                            {item.titleHi && item.titleHi !== item.titleEn && (
                              <p className="text-[11px] theme-muted italic mt-0.5">{item.titleHi}</p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#8B2626] dark:text-rose-400">
                            {item.board}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.stage}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap max-w-[140px] truncate">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                            >
                              <span className="truncate">{item.link.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={async () => {
                                await sdk.saveGovtExamCalendarItem({ id: item.id, isActive: !item.isActive });
                                loadExamCalendar();
                              }}
                              className="cursor-pointer"
                            >
                              {item.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                  <XCircle className="w-3 h-3" /> Inactive
                                </span>
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditCalModal(item)}
                                className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingCalItem(item)}
                                className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COMMISSION PORTALS DIRECTORY MANAGEMENT                            */}
        {/* ========================================================================= */}
        {activeTab === 'portals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl theme-surface border theme-border shadow-xs">
              <div>
                <h3 className="text-base font-black theme-text flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-600" />
                  <span>Official Government Commission Portals & Direct Links</span>
                </h3>
                <p className="text-xs theme-muted">
                  Official recruitment boards displayed at the footer of the public government jobs portal.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleReseedPortalDefaults}
                  className="px-3 py-2 rounded-xl border theme-border text-xs font-bold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reseed Portals Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={openAddPortalModal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Commission Portal</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingPortals ? (
                <div className="col-span-full py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs font-semibold theme-muted">Loading commission portals...</p>
                </div>
              ) : portals.length === 0 ? (
                <div className="col-span-full py-16 text-center space-y-3 theme-surface border theme-border rounded-2xl">
                  <Landmark className="w-12 h-12 text-indigo-500 mx-auto opacity-60" />
                  <h4 className="text-sm font-bold theme-text">No portals found</h4>
                  <p className="text-xs theme-muted">Click "Add Commission Portal" or "Reseed Defaults" to populate.</p>
                </div>
              ) : (
                portals.map((p) => (
                  <div
                    key={p.id}
                    className="theme-surface border theme-border rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-black theme-text flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {p.badgeText || '.gov.in'}
                          </span>
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          p.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>

                      {p.nameHi && (
                        <p className="text-xs font-medium theme-muted italic">{p.nameHi}</p>
                      )}

                      <p className="text-xs theme-text font-medium leading-relaxed">{p.desc}</p>
                      {p.descHi && (
                        <p className="text-[11px] theme-muted">{p.descHi}</p>
                      )}

                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 text-xs font-bold pt-1"
                      >
                        <span className="truncate">{p.url}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                      </a>
                    </div>

                    <div className="pt-2 border-t theme-border flex items-center justify-between text-xs">
                      <span className="theme-muted text-[10px]">Order: #{p.orderIndex}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditPortalModal(p)}
                          className="p-1.5 rounded-lg border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPortal(p)}
                          className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HTML5 CANVAS NOTICE & POSTER STUDIO (REALTIME VECTOR DESIGNER)      */}
        {/* ========================================================================= */}
        {activeTab === 'studio' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-700 dark:text-purple-300">
                    Live HTML5 Canvas Engine
                  </span>
                  <span className="text-xs font-semibold theme-muted">1080 × 1080 High-DPI Vector Rendering</span>
                </div>
                <h3 className="text-base sm:text-lg font-black theme-text flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <span>Government Notice & Social Banner Designer Studio</span>
                </h3>
                <p className="text-xs theme-muted max-w-2xl leading-relaxed">
                  Design official announcement posters for social media or publish directly as a verified Government Job Notice in 1-click.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCopyStudioImage}
                  className="px-4 py-2 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {studioCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{studioCopied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadStudioPNG}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Poster (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublishFromStudio}
                  disabled={isPublishingFromStudio}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPublishingFromStudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Publish as Live Govt Job</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-4 theme-surface border theme-border rounded-2xl p-5 shadow-xs">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-2">
                    Canvas Theme Palette
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'tricolor', label: 'Tricolor', desc: 'Official' },
                      { id: 'navy', label: 'Navy Blue', desc: 'Parliament' },
                      { id: 'crimson', label: 'Crimson', desc: 'Gazette' },
                      { id: 'emerald', label: 'Emerald', desc: 'Forest' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setStudioTheme(th.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          studioTheme === th.id
                            ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black shadow-xs'
                            : 'theme-border theme-text hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold'
                        }`}
                      >
                        <div className="text-xs font-bold">{th.label}</div>
                        <div className="text-[9px] theme-muted mt-0.5">{th.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Header Badge Text
                    </label>
                    <input
                      type="text"
                      value={studioBadge}
                      onChange={(e) => setStudioBadge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Notice Title (English) *
                    </label>
                    <input
                      type="text"
                      value={studioTitleEn}
                      onChange={(e) => setStudioTitleEn(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Notice Title (हिंदी / Hindi Translation)
                    </label>
                    <input
                      type="text"
                      value={studioTitleHi}
                      onChange={(e) => setStudioTitleHi(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Ministry / Department Name *
                    </label>
                    <input
                      type="text"
                      value={studioDept}
                      onChange={(e) => setStudioDept(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Category
                      </label>
                      <select
                        value={studioCategory}
                        onChange={(e) => setStudioCategory(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="CENTRAL">Central Govt</option>
                        <option value="STATE">State Govt</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        State / Region
                      </label>
                      <input
                        type="text"
                        value={studioState}
                        onChange={(e) => setStudioState(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Total Vacancies
                      </label>
                      <input
                        type="text"
                        value={studioVacancies}
                        onChange={(e) => setStudioVacancies(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Sector
                      </label>
                      <select
                        value={studioSector}
                        onChange={(e) => setStudioSector(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      >
                        {SECTOR_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Pay Scale
                      </label>
                      <input
                        type="text"
                        value={studioSalary}
                        onChange={(e) => setStudioSalary(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Age Limit
                      </label>
                      <input
                        type="text"
                        value={studioAge}
                        onChange={(e) => setStudioAge(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={studioStartDate}
                        onChange={(e) => setStudioStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                        Last Date *
                      </label>
                      <input
                        type="text"
                        value={studioLastDate}
                        onChange={(e) => setStudioLastDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500 text-rose-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Official Application URL (.gov.in) *
                    </label>
                    <input
                      type="url"
                      value={studioApplyUrl}
                      onChange={(e) => setStudioApplyUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right Canvas Live Preview (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
                <div className="w-full max-w-[480px] aspect-square rounded-2xl shadow-2xl overflow-hidden border theme-border bg-slate-900/5 relative">
                  <canvas
                    ref={studioCanvasRef}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center text-xs theme-muted font-medium">
                  Live HTML5 Vector Canvas Preview • 1080 × 1080 Realtime Rendering
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ADD / EDIT GOVERNMENT JOB                                        */}
        {/* ========================================================================= */}
        {isJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl max-h-[92vh] my-auto flex flex-col theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-start justify-between gap-3 bg-inherit">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black theme-text flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#8B2626]" />
                    <span>{editingJob ? 'Edit Government Job Notice' : 'Post New Government Job Notice'}</span>
                  </h3>
                  <p className="text-[10px] theme-muted mt-0.5">Bilingual English & Hindi support with official .gov.in URLs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Recruitment Category *
                    </label>
                    <select
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    >
                      <option value="CENTRAL">Central Govt (All India)</option>
                      <option value="STATE">State Govt (State PSC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Sector / Ministry *
                    </label>
                    <select
                      value={jobForm.sector}
                      onChange={(e) => setJobForm({ ...jobForm, sector: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    >
                      {SECTOR_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {jobForm.category === 'STATE' && (
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      State *
                    </label>
                    <select
                      value={jobForm.state}
                      onChange={(e) => setJobForm({ ...jobForm, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    >
                      {INDIAN_STATES.filter(s => s !== 'All States').map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Notice Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.titleEn}
                    onChange={(e) => setJobForm({ ...jobForm, titleEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Notice Title (हिंदी / Hindi)
                  </label>
                  <input
                    type="text"
                    value={jobForm.titleHi}
                    onChange={(e) => setJobForm({ ...jobForm, titleHi: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Department (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.departmentEn}
                      onChange={(e) => setJobForm({ ...jobForm, departmentEn: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Department (हिंदी / Hindi)
                    </label>
                    <input
                      type="text"
                      value={jobForm.departmentHi}
                      onChange={(e) => setJobForm({ ...jobForm, departmentHi: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Total Vacancies
                    </label>
                    <input
                      type="text"
                      value={jobForm.totalVacancies}
                      onChange={(e) => setJobForm({ ...jobForm, totalVacancies: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Salary / Pay Scale
                    </label>
                    <input
                      type="text"
                      value={jobForm.salaryScale}
                      onChange={(e) => setJobForm({ ...jobForm, salaryScale: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Age Limit
                    </label>
                    <input
                      type="text"
                      value={jobForm.ageLimit}
                      onChange={(e) => setJobForm({ ...jobForm, ageLimit: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={jobForm.startDate}
                      onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Application Last Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={jobForm.lastDate}
                      onChange={(e) => setJobForm({ ...jobForm, lastDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold text-rose-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Official Apply URL * (.gov.in / .nic.in)
                    </label>
                    <input
                      type="url"
                      required
                      value={jobForm.applyUrl}
                      onChange={(e) => setJobForm({ ...jobForm, applyUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Notification PDF Brochure URL
                    </label>
                    <input
                      type="url"
                      value={jobForm.notificationUrl}
                      onChange={(e) => setJobForm({ ...jobForm, notificationUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Qualification (English)
                  </label>
                  <input
                    type="text"
                    value={jobForm.qualificationEn}
                    onChange={(e) => setJobForm({ ...jobForm, qualificationEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold theme-text">
                    <input
                      type="checkbox"
                      checked={jobForm.isActive}
                      onChange={(e) => setJobForm({ ...jobForm, isActive: e.target.checked })}
                      className="rounded text-[#8B2626]"
                    />
                    <span>Active & Visible Publicly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold theme-text">
                    <input
                      type="checkbox"
                      checked={jobForm.isFeatured}
                      onChange={(e) => setJobForm({ ...jobForm, isFeatured: e.target.checked })}
                      className="rounded text-amber-500"
                    />
                    <span>Featured / Top Notice Badge</span>
                  </label>
                </div>

                <div className="flex-shrink-0 pt-4 border-t theme-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingJob}
                    className="px-5 py-2 rounded-xl bg-[#8B2626] hover:bg-rose-900 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingJob && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingJob ? 'Update Notice' : 'Post Govt Notice'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: ADD / EDIT EXAMINATION CALENDAR EVENT                            */}
        {/* ========================================================================= */}
        {isCalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg my-auto flex flex-col theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-start justify-between gap-3 bg-inherit">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black theme-text flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#8B2626]" />
                    <span>{editingCalItem ? 'Edit Examination Calendar Event' : 'Add Examination Calendar Event'}</span>
                  </h3>
                  <p className="text-[10px] theme-muted mt-0.5">Renders in the vertical terracotta timeline strip on the public page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCalModalOpen(false)}
                  className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCalItem} className="p-4 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Day (DD) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="14"
                      value={calForm.day}
                      onChange={(e) => setCalForm({ ...calForm, day: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-black text-center font-serif text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Month (MMM) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MAR"
                      value={calForm.month}
                      onChange={(e) => setCalForm({ ...calForm, month: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-black text-center text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      placeholder="2026"
                      value={calForm.year}
                      onChange={(e) => setCalForm({ ...calForm, year: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Exam / Event Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Indian Navy Entrance Test (INET)..."
                    value={calForm.titleEn}
                    onChange={(e) => setCalForm({ ...calForm, titleEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Exam / Event Title (हिंदी / Hindi Translation)
                  </label>
                  <input
                    type="text"
                    placeholder="भारतीय नौसेना प्रवेश परीक्षा..."
                    value={calForm.titleHi}
                    onChange={(e) => setCalForm({ ...calForm, titleHi: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Conducting Board *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="SSC Portal / Indian Navy"
                      value={calForm.board}
                      onChange={(e) => setCalForm({ ...calForm, board: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Exam Stage / Phase
                    </label>
                    <input
                      type="text"
                      placeholder="Computer Based Exam"
                      value={calForm.stage}
                      onChange={(e) => setCalForm({ ...calForm, stage: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold text-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Official Information Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://ssc.gov.in"
                    value={calForm.link}
                    onChange={(e) => setCalForm({ ...calForm, link: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold theme-text">
                    <input
                      type="checkbox"
                      checked={calForm.isActive}
                      onChange={(e) => setCalForm({ ...calForm, isActive: e.target.checked })}
                      className="rounded text-[#8B2626]"
                    />
                    <span>Active on Timeline</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <span className="theme-muted font-bold text-[11px]">Order:</span>
                    <input
                      type="number"
                      value={calForm.orderIndex}
                      onChange={(e) => setCalForm({ ...calForm, orderIndex: parseInt(e.target.value, 10) || 0 })}
                      className="w-16 px-2 py-1 rounded-lg border theme-border theme-surface text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t theme-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCalModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCal}
                    className="px-5 py-2 rounded-xl bg-[#8B2626] hover:bg-rose-900 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingCal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingCalItem ? 'Update Event' : 'Add Event'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: ADD / EDIT COMMISSION PORTAL                                     */}
        {/* ========================================================================= */}
        {isPortalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg my-auto flex flex-col theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-start justify-between gap-3 bg-inherit">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black theme-text flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" />
                    <span>{editingPortal ? 'Edit Commission Portal' : 'Add Commission Portal Link'}</span>
                  </h3>
                  <p className="text-[10px] theme-muted mt-0.5">Government board links directory displayed in footer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPortalModalOpen(false)}
                  className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePortal} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Portal Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UPSC Online / Staff Selection Commission"
                    value={portalForm.name}
                    onChange={(e) => setPortalForm({ ...portalForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Portal Name (हिंदी / Hindi Translation)
                  </label>
                  <input
                    type="text"
                    placeholder="संघ लोक सेवा आयोग..."
                    value={portalForm.nameHi}
                    onChange={(e) => setPortalForm({ ...portalForm, nameHi: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Official Website URL * (.gov.in / .nic.in)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://upsconline.nic.in"
                    value={portalForm.url}
                    onChange={(e) => setPortalForm({ ...portalForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Recruitment Coverage / Description (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Civil Services, NDA, CDS Exams"
                    value={portalForm.desc}
                    onChange={(e) => setPortalForm({ ...portalForm, desc: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                    Recruitment Coverage (हिंदी / Hindi)
                  </label>
                  <input
                    type="text"
                    placeholder="सिविल सेवा, एनडीए एवं सीडीएस भर्ती"
                    value={portalForm.descHi}
                    onChange={(e) => setPortalForm({ ...portalForm, descHi: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      placeholder=".gov.in / .nic.in"
                      value={portalForm.badgeText}
                      onChange={(e) => setPortalForm({ ...portalForm, badgeText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1">
                      Display Order Index
                    </label>
                    <input
                      type="number"
                      value={portalForm.orderIndex}
                      onChange={(e) => setPortalForm({ ...portalForm, orderIndex: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl theme-surface border theme-border theme-text font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold theme-text">
                    <input
                      type="checkbox"
                      checked={portalForm.isActive}
                      onChange={(e) => setPortalForm({ ...portalForm, isActive: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Active in Directory</span>
                  </label>
                </div>

                <div className="pt-4 border-t theme-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPortalModalOpen(false)}
                    className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPortal}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingPortal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingPortal ? 'Update Portal' : 'Add Portal'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODALS                                                */}
        {/* ========================================================================= */}
        {deletingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md theme-surface border theme-border rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black theme-text">Delete Government Notice?</h3>
                <p className="text-xs theme-muted">
                  Are you sure you want to delete <strong className="theme-text">"{deletingJob.titleEn}"</strong>?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingJob(null)}
                  className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteJob}
                  disabled={isDeletingJob}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeletingJob && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingCalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md theme-surface border theme-border rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black theme-text">Delete Examination Event?</h3>
                <p className="text-xs theme-muted">
                  Are you sure you want to remove <strong className="theme-text">"{deletingCalItem.titleEn}"</strong> from the calendar?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCalItem(null)}
                  className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCalItem}
                  disabled={isDeletingCal}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeletingCal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingPortal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md theme-surface border theme-border rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black theme-text">Delete Commission Portal?</h3>
                <p className="text-xs theme-muted">
                  Are you sure you want to remove <strong className="theme-text">"{deletingPortal.name}"</strong> from the directory?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPortal(null)}
                  className="px-4 py-2 rounded-xl border theme-border font-bold text-xs theme-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePortal}
                  disabled={isDeletingPortal}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeletingPortal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HTML5 Canvas Poster Generator Modal for Individual Job */}
        {posterJob && (
          <GovtJobPosterCanvasModal
            job={posterJob}
            onClose={() => setPosterJob(null)}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
