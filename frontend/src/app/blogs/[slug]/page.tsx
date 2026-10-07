'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, Share2, Bookmark, CheckCircle2, Sparkles } from 'lucide-react';

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/blogs"
        className="inline-flex items-center gap-2 text-xs font-bold theme-muted hover:text-indigo-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Journal & Articles
      </Link>

      <article className="theme-surface border theme-border rounded-2xl p-8 shadow-sm space-y-6">
        <div className="space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Engineering & Architecture
          </span>

          <h1 className="text-2xl sm:text-4xl font-black theme-text tracking-tight leading-tight">
            Architecting High-Performance Next.js 14 Micro-Frontends for Enterprise Portals
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b theme-border pb-4 text-xs theme-muted">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                alt="Sarah Jenkins"
                className="w-10 h-10 rounded-full object-cover border theme-border"
              />
              <div>
                <p className="font-bold theme-text text-sm">Sarah Jenkins</p>
                <p className="text-[11px] theme-muted">VP of Engineering, TechCorp Global</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-indigo-500" /> Published Oct 04, 2026
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-indigo-500" /> 6 min read
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-xl overflow-hidden h-72 sm:h-96 w-full border theme-border">
          <img
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200"
            alt="Architecture Diagram"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm theme-text leading-relaxed space-y-4">
          <p className="text-sm font-semibold theme-text">
            Modern enterprise platforms require seamless multi-tenancy, zero-flicker role access control, and modular UI component design. In this guide, we explore how Next.js 14 App Router and NestJS microservices power high-throughput applications.
          </p>

          <h3 className="text-lg font-bold theme-text pt-2">1. Layout Isolation & Server Components</h3>
          <p className="theme-muted">
            By separating public marketing layouts from internal portal layouts, developers ensure that heavy dashboard scripts do not pollute public page bundles. Utilizing React Server Components (RSC) minimizes hydration times on public landing pages.
          </p>

          <h3 className="text-lg font-bold theme-text pt-2">2. Dynamic Theme Tokens & CSS Variables</h3>
          <p className="theme-muted">
            Rather than relying on rigid compile-time CSS classes, storing HSL theme variables in a shared TypeScript SDK allows tenants to customize primary colors, border radii, and fonts on the fly.
          </p>

          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20 text-xs theme-text font-mono">
            <code>
              {`// Theme variable initialization
export function applyTheme(config: ThemeConfig) {
  document.documentElement.style.setProperty('--primary', config.primaryColor);
}`}
            </code>
          </div>
        </div>
      </article>
    </div>
  );
}
