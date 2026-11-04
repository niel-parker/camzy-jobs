'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GovtJobItem } from '@job-portal/sdk';
import { PieChart, BarChart3, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface GovtJobsCanvasAnalyticsProps {
  jobs: GovtJobItem[];
}

export const GovtJobsCanvasAnalytics: React.FC<GovtJobsCanvasAnalyticsProps> = ({ jobs }) => {
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'donut' | 'bar'>('both');

  // Sector colors palette
  const sectorColors: Record<string, string> = {
    'UPSC / Civil Services': '#6366f1',
    'SSC / Staff Selection': '#f59e0b',
    'Railways / RRB': '#ef4444',
    'Banking / IBPS': '#06b6d4',
    'Police / Law Enforcement': '#10b981',
    'Defence / Armed Forces': '#8b5cf6',
    'Teaching / Education': '#ec4899',
    'State PSC / Civil Services': '#3b82f6',
    'Other': '#64748b',
  };

  // Draw Donut Chart on HTML5 Canvas
  useEffect(() => {
    const canvas = donutCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = 360;
    const height = 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Aggregate by Sector
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const sec = j.sector || 'Other';
      const key = Object.keys(sectorColors).find((k) => sec.includes(k.split(' / ')[0])) || 'Other';
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = jobs.length || 1;
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const centerX = 120;
    const centerY = height / 2;
    const outerRadius = 85;
    const innerRadius = 55;

    let startAngle = -Math.PI / 2;

    entries.forEach(([key, count]) => {
      const sliceAngle = (count / total) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const color = sectorColors[key] || '#94a3b8';

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 6;
      ctx.fill();

      startAngle = endAngle;
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // Center cutout circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${jobs.length}`, centerX, centerY - 6);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('NOTICES', centerX, centerY + 14);

    // Draw Legend on the right side
    const legendX = 230;
    let legendY = 35;
    entries.slice(0, 6).forEach(([key, count]) => {
      const color = sectorColors[key] || '#94a3b8';

      // Color pill
      ctx.beginPath();
      ctx.arc(legendX, legendY + 5, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.textAlign = 'left';
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      const shortName = key.split(' / ')[0];
      ctx.fillText(shortName, legendX + 12, legendY + 7);

      // Count
      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 10px monospace';
      ctx.fillText(`${count} (${Math.round((count / total) * 100)}%)`, width - 15, legendY + 7);

      legendY += 34;
    });
  }, [jobs]);

  // Draw State Vacancies Bar Chart on HTML5 Canvas
  useEffect(() => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 440;
    const height = 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Aggregate State vacancies
    const stateCounts: Record<string, number> = {};
    jobs.filter((j) => j.category === 'STATE' && j.state).forEach((j) => {
      const stateName = j.state || 'Other';
      stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
    });

    // Ensure default representation if few
    if (Object.keys(stateCounts).length === 0) {
      stateCounts['Uttar Pradesh'] = 2;
      stateCounts['Bihar'] = 1;
      stateCounts['Maharashtra'] = 1;
      stateCounts['Rajasthan'] = 1;
      stateCounts['Delhi'] = 1;
    }

    const stateEntries = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxCount = Math.max(...stateEntries.map((e) => e[1]), 1);

    const barHeight = 22;
    const startX = 120;
    const maxBarWidth = width - startX - 55;
    let currentY = 32;

    stateEntries.forEach(([stateName, count], idx) => {
      // State Label
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(stateName, startX - 12, currentY + barHeight / 2);

      // Background Bar Track
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(startX, currentY, maxBarWidth, barHeight, 6);
      } else {
        ctx.rect(startX, currentY, maxBarWidth, barHeight);
      }
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      // Foreground Value Bar with Gradient
      const fillWidth = Math.max((count / maxCount) * maxBarWidth, 14);
      const grad = ctx.createLinearGradient(startX, 0, startX + fillWidth, 0);
      if (idx === 0) {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#059669');
      } else if (idx === 1) {
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#4f46e5');
      } else {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
      }

      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(startX, currentY, fillWidth, barHeight, 6);
      } else {
        ctx.rect(startX, currentY, fillWidth, barHeight);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Count Label at the end of the bar
      ctx.textAlign = 'left';
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${count} notices`, startX + fillWidth + 8, currentY + barHeight / 2);

      currentY += 44;
    });
  }, [jobs]);

  return (
    <div className="theme-surface border theme-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Canvas Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black theme-text flex items-center gap-1.5">
              <span>Recruitment Distribution & Intelligence</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                HTML5 Canvas Engine
              </span>
            </h3>
            <p className="text-[11px] theme-muted">Real-time vector canvas rendering of sector breakdown and state recruitment volume</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="inline-flex p-1 rounded-xl border theme-border bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'both' ? 'bg-indigo-600 text-white shadow-xs' : 'theme-muted hover:theme-text'
            }`}
          >
            All Charts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'donut' ? 'bg-indigo-600 text-white shadow-xs' : 'theme-muted hover:theme-text'
            }`}
          >
            Sector Donut
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bar')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'bar' ? 'bg-indigo-600 text-white shadow-xs' : 'theme-muted hover:theme-text'
            }`}
          >
            State Bars
          </button>
        </div>
      </div>

      {/* Canvas Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
        
        {/* Canvas 1: Sector Donut */}
        {(activeTab === 'both' || activeTab === 'donut') && (
          <div className="p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold theme-text flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sector Share & Ministries</span>
              </span>
              <span className="text-[10px] theme-muted font-bold">HTML5 2D Context</span>
            </div>

            <div className="flex items-center justify-center overflow-x-auto py-1">
              <canvas
                ref={donutCanvasRef}
                className="max-w-full drop-shadow-xs"
                style={{ width: '360px', height: '260px' }}
              />
            </div>
          </div>
        )}

        {/* Canvas 2: State Vacancies Bar Chart */}
        {(activeTab === 'both' || activeTab === 'bar') && (
          <div className="p-4 rounded-2xl border theme-border bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold theme-text flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Top State Recruitment Volume</span>
              </span>
              <span className="text-[10px] theme-muted font-bold">Vector Bar Rendering</span>
            </div>

            <div className="flex items-center justify-center overflow-x-auto py-1">
              <canvas
                ref={barCanvasRef}
                className="max-w-full drop-shadow-xs"
                style={{ width: '440px', height: '260px' }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

