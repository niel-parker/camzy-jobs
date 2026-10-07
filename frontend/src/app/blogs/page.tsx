'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, User, ArrowRight, Sparkles, Tag, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  publishedDate: string;
  coverImage: string;
  isFeatured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    slug: 'scaling-nextjs-microfrontends-enterprise',
    title: 'Architecting High-Performance Next.js 14 Micro-Frontends for Enterprise Portals',
    summary: 'Learn how modern engineering teams leverage App Router, Server Components, and multi-tenant SDKs to achieve sub-second load times.',
    category: 'Engineering & Architecture',
    readTime: '6 min read',
    authorName: 'Sarah Jenkins',
    authorRole: 'VP of Engineering, TechCorp',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    publishedDate: 'Oct 04, 2026',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
  },
  {
    id: 'b2',
    slug: 'the-2026-remote-tech-salary-report',
    title: 'The 2026 Remote Tech Salary Benchmark Report: Full Stack & AI Engineers',
    summary: 'Comprehensive compensation trends, equity breakdown, and salary ranges across North America, Europe, and Global Remote talent hubs.',
    category: 'Salary & Insights',
    readTime: '8 min read',
    authorName: 'Alex Morgan',
    authorRole: 'Lead Talent Researcher',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    publishedDate: 'Oct 01, 2026',
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
  },
  {
    id: 'b3',
    slug: 'ai-resume-parsing-and-kanban-workflows',
    title: 'How AI Screening Questions Reduce Candidate Screening Time by 75%',
    summary: 'Discover how automated screening questions and visual ATS Kanban boards empower recruiters to evaluate top talent faster.',
    category: 'Recruitment Tech',
    readTime: '5 min read',
    authorName: 'David Miller',
    authorRole: 'Principal Placement Director',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    publishedDate: 'Sep 28, 2026',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'b4',
    slug: 'mastering-the-full-stack-system-design-interview',
    title: 'Mastering Full-Stack System Design: Microservices, TypeORM & Redis Caching',
    summary: 'Key architectural questions asked during senior engineer technical screens at tier-1 unicorn technology companies.',
    category: 'Career Growth',
    readTime: '7 min read',
    authorName: 'Michael Chang',
    authorRole: 'Staff Software Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    publishedDate: 'Sep 24, 2026',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  },
];

export default function BlogsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl theme-surface border theme-border shadow-sm space-y-4">
        <div className="max-w-3xl space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Tech & Hiring Journal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight theme-text">
            Career Insights & Recruitment Engineering
          </h1>
          <p className="text-xs sm:text-sm theme-muted leading-relaxed">
            Stay ahead with salary benchmarks, Next.js architecture guides, AI sourcing trends, and executive career advice.
          </p>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
            <input
              type="text"
              placeholder="Search articles by topic, tech stack, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Articles' },
              { id: 'Engineering & Architecture', label: 'Engineering' },
              { id: 'Salary & Insights', label: 'Salaries' },
              { id: 'Recruitment Tech', label: 'Recruitment Tech' },
              { id: 'Career Growth', label: 'Career Growth' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'theme-surface border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Blog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border theme-border theme-surface overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center space-x-3 text-xs theme-muted">
                  <span className="flex items-center font-semibold">
                    <Clock className="w-3.5 h-3.5 mr-1 text-indigo-500" /> {post.readTime}
                  </span>
                  <span>•</span>
                  <span>{post.publishedDate}</span>
                </div>

                <h2 className="text-lg font-bold theme-text leading-snug hover:text-indigo-500 cursor-pointer transition-colors">
                  {post.title}
                </h2>

                <p className="text-xs theme-muted leading-relaxed line-clamp-2">
                  {post.summary}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t theme-border">
              <div className="flex items-center space-x-2.5">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-8 h-8 rounded-full object-cover border theme-border"
                />
                <div>
                  <p className="text-xs font-bold theme-text">{post.authorName}</p>
                  <p className="text-[10px] theme-muted">{post.authorRole}</p>
                </div>
              </div>

              <Link
                href={`/blogs/${post.slug}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
              >
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
