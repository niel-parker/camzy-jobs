'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GovtJobItem } from '@job-portal/sdk';
import { Download, Copy, Check, X, Sparkles, Image as ImageIcon, Palette, Globe } from 'lucide-react';

interface GovtJobPosterCanvasModalProps {
  job: GovtJobItem;
  onClose: () => void;
}

export const GovtJobPosterCanvasModal: React.FC<GovtJobPosterCanvasModalProps> = ({ job, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<'tricolor' | 'navy' | 'emerald'>('tricolor');
  const [lang, setLang] = useState<'bilingual' | 'en' | 'hi'>('bilingual');
  const [copied, setCopied] = useState<boolean>(false);

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size (Instagram / WhatsApp shareable banner 1080x1080)
    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background themes
    if (theme === 'navy') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(1, '#020c1b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (theme === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // Tricolor clean card style
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // Subtle warm gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fffbf5');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, '#f8fafc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    const isDark = theme !== 'tricolor';
    const textColorPrimary = isDark ? '#ffffff' : '#0f172a';
    const textColorSecondary = isDark ? '#94a3b8' : '#475569';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';

    // 1. Top India Tricolor Ribbon
    ctx.fillStyle = '#FF9933'; // Saffron
    ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = '#FFFFFF'; // White
    ctx.fillRect(0, 14, W, 14);
    ctx.fillStyle = '#138808'; // Green
    ctx.fillRect(0, 28, W, 14);

    // 2. Header Strip: Official Notification
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(40, 70, W - 80, 72);
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 70, W - 80, 72);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('CAMZY JOBS • OFFICIAL GOVT RECRUITMENT DESK', 65, 114);

    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    const catLabel = job.category === 'CENTRAL' ? 'CENTRAL GOVT / केंद्र सरकार' : `STATE GOVT (${job.state || 'All'})`;
    ctx.fillText(catLabel, W - 65, 114);

    // 3. Department / Ministry Title
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    const deptText = (lang === 'hi' && job.departmentHi ? job.departmentHi : (job.departmentEn || 'Government Department')).toUpperCase();
    ctx.fillText(deptText, W / 2, 200);

    // Sector badge
    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`[ ${job.sector || 'Public Sector'} ]`, W / 2, 240);

    // 4. Primary Job Title Card (Hero)
    const heroY = 275;
    const heroH = 175;
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(40, heroY, W - 80, heroH, 20);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = textColorPrimary;
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';

    // Wrap title if long
    const titleText = lang === 'hi' && job.titleHi ? job.titleHi : (job.titleEn || 'Govt Recruitment Notice');
    if (titleText.length > 42) {
      const half = Math.floor(titleText.length / 2);
      const splitIdx = titleText.lastIndexOf(' ', half) !== -1 ? titleText.lastIndexOf(' ', half) : half;
      const l1 = titleText.substring(0, splitIdx);
      const l2 = titleText.substring(splitIdx).trim();
      ctx.fillText(l1, W / 2, heroY + 68);
      ctx.fillText(l2, W / 2, heroY + 120);
    } else {
      ctx.fillText(titleText, W / 2, heroY + (lang === 'bilingual' && job.titleHi ? 68 : 100));
      if (lang === 'bilingual' && job.titleHi && job.titleHi !== job.titleEn) {
        ctx.fillStyle = textColorSecondary;
        ctx.font = '600 30px system-ui, -apple-system, sans-serif';
        ctx.fillText(job.titleHi, W / 2, heroY + 124);
      }
    }

    // 5. Four Key Metric Cards Grid
    const gridY = 480;
    const cardW = (W - 80 - 45) / 4;
    const cardH = 160;

    const vacDisplay = isNaN(Number(job.totalVacancies)) ? (job.totalVacancies || 'Multiple Posts') : Number(job.totalVacancies).toLocaleString('en-IN');
    const qualText = (lang === 'hi' && job.qualificationHi ? job.qualificationHi : (job.qualificationEn || 'Graduate / Diploma')).slice(0, 24);

    const metrics = [
      { label: 'TOTAL VACANCIES', value: `${vacDisplay}`, color: '#10b981' },
      { label: 'PAY SCALE', value: job.salaryScale || '7th CPC Scale', color: '#6366f1' },
      { label: 'AGE LIMIT', value: job.ageLimit || '18 - 32 Yrs', color: '#f59e0b' },
      { label: 'QUALIFICATION', value: qualText, color: '#ec4899' },
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

      // Top color indicator pill
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.roundRect(cx + cardW / 2 - 25, gridY + 12, 50, 6, 3);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = textColorSecondary;
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.label, cx + cardW / 2, gridY + 48);

      ctx.fillStyle = textColorPrimary;
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.value, cx + cardW / 2, gridY + 105);
    });

    // 6. Dates Banner: Start & Last Date
    const dateY = 670;
    const dateH = 150;
    const isUrgent = job.lastDate ? (new Date(job.lastDate).getTime() - Date.now()) / 86400000 <= 7 : false;

    ctx.fillStyle = isUrgent
      ? (isDark ? '#450a0a' : '#fef2f2')
      : (isDark ? '#0c4a6e' : '#f0f9ff');
    ctx.beginPath();
    ctx.roundRect(40, dateY, W - 80, dateH, 20);
    ctx.fill();
    ctx.strokeStyle = isUrgent ? '#ef4444' : '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Start Date
    ctx.textAlign = 'left';
    ctx.fillStyle = textColorSecondary;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('ONLINE REGISTRATION COMMENCES', 75, dateY + 50);
    ctx.fillStyle = textColorPrimary;
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(job.startDate || 'Open Now', 75, dateY + 95);

    // Last Date (Right Side - Callout)
    ctx.textAlign = 'right';
    ctx.fillStyle = isUrgent ? '#ef4444' : textColorSecondary;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('DEADLINE / अंतिम तिथि', W - 75, dateY + 50);
    ctx.fillStyle = isUrgent ? '#ef4444' : '#0284c7';
    ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
    ctx.fillText(job.lastDate || 'Check Notification', W - 75, dateY + 98);

    // 7. Official Portal Watermark & Verification Seal
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
    ctx.fillText('✓ VERIFIED OFFICIAL GOVT NOTICE', 75, footerY + 50);

    ctx.fillStyle = textColorSecondary;
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('APPLY ONLINE AT OFFICIAL DOMAIN:', 75, footerY + 86);

    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    const applyDomain = job.applyUrl ? new URL(job.applyUrl).hostname : 'www.india.gov.in';
    ctx.fillText(`https://${applyDomain}`, 75, footerY + 120);

    // Right side badge
    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('Powered by CamzyJobs Govt Desk', W - 75, footerY + 70);
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText('Scan QR or visit jobs.camzytech.com/govt-jobs', W - 75, footerY + 105);

    // 8. Bottom India Tricolor Accent
    ctx.fillStyle = '#138808';
    ctx.fillRect(0, H - 12, W, 12);
  };

  useEffect(() => {
    drawPoster();
  }, [job, theme, lang]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Govt-Job-${(job.titleEn || 'notice').toLowerCase().replace(/[^a-z0-9]/g, '-')}-poster.png`;
    a.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      alert('Could not copy image to clipboard in this browser. Please use Download PNG.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] my-auto flex flex-col theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b theme-border flex items-center justify-between gap-3 bg-inherit">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                HTML5 Canvas Engine
              </span>
              <span className="text-xs font-semibold theme-muted">Direct Vector Rendering</span>
            </div>
            <h3 className="text-base font-black theme-text flex items-center gap-2 mt-0.5 truncate">
              <ImageIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span>Official Notice Social Poster & Banner Generator</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border theme-border space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Notice Source</div>
              <div className="text-xs font-black theme-text line-clamp-1">{job.titleEn}</div>
              <div className="text-[11px] theme-muted">{job.departmentEn} • {job.totalVacancies} Posts</div>
            </div>

            {/* Theme Picker */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Canvas Color Theme</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tricolor', label: 'Tricolor', desc: 'Official White' },
                  { id: 'navy', label: 'Navy Blue', desc: 'Gazette Dark' },
                  { id: 'emerald', label: 'Emerald', desc: 'Deep Forest' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setTheme(th.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === th.id
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black shadow-sm'
                        : 'theme-border theme-text hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold'
                    }`}
                  >
                    <div className="text-xs font-bold">{th.label}</div>
                    <div className="text-[10px] theme-muted mt-0.5">{th.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Picker */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider theme-muted block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Poster Language</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bilingual', label: 'Bilingual', sub: 'Eng + हिंदी' },
                  { id: 'en', label: 'English', sub: 'Eng Only' },
                  { id: 'hi', label: 'हिंदी', sub: 'Hindi Only' },
                ].map((lg) => (
                  <button
                    key={lg.id}
                    type="button"
                    onClick={() => setLang(lg.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      lang === lg.id
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-sm'
                        : 'theme-border theme-text hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold'
                    }`}
                  >
                    <div className="text-xs font-bold">{lg.label}</div>
                    <div className="text-[10px] theme-muted mt-0.5">{lg.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                High-Resolution (1080x1080)
              </div>
              <p>
                Renders with 2D HTML5 Canvas hardware acceleration. Perfect for WhatsApp job groups, Telegram channels, and Instagram feeds.
              </p>
            </div>
          </div>

          {/* Canvas Preview Column */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full max-w-[380px] aspect-square rounded-2xl shadow-xl overflow-hidden border theme-border bg-slate-900/5 relative group">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[11px] theme-muted mt-2 font-medium">
              Live Preview • 1080 × 1080 Vector Canvas
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-t theme-border flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border theme-border text-xs font-bold theme-text hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyImage}
              className="px-4 py-2 rounded-xl border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Poster (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
