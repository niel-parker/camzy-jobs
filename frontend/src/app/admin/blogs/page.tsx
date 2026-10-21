'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { BlogPostItem, BlogCategoryItem } from '@job-portal/sdk';
import { 
  BookOpen, FolderTree, Plus, Search, Edit3, Trash2, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, AlertCircle, Eye, Tag 
} from 'lucide-react';

export default function AdminBlogManagementPage() {
  const { sdk } = useTheme();

  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    categorySlug: 'career-advice',
    summary: '',
    content: '',
    coverImageUrl: '',
    tags: 'Career, Interviews, Resume',
    isPublished: true,
  });

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsList, catsList] = await Promise.all([
        sdk.getBlogPosts(),
        sdk.getBlogCategories(),
      ]);
      setPosts(postsList);
      setCategories(catsList);
    } catch (err: any) {
      console.error('Failed to load blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sdk]);

  const openAddPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      categorySlug: categories[0]?.slug || 'career-advice',
      summary: '',
      content: '',
      coverImageUrl: '',
      tags: 'Recruitment, Career',
      isPublished: true,
    });
    setErrorMsg(null);
    setIsPostModalOpen(true);
  };

  const openEditPost = (post: BlogPostItem) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      categorySlug: post.categorySlug || 'career-advice',
      summary: post.summary || '',
      content: post.content || '',
      coverImageUrl: post.coverImageUrl || '',
      tags: post.tags?.join(', ') || '',
      isPublished: post.isPublished,
    });
    setErrorMsg(null);
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.slug) {
      setErrorMsg('Title and Slug are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const tagsArray = postForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await sdk.saveBlogPost({
        id: editingPost ? editingPost.id : undefined,
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        category: postForm.categorySlug,
        categorySlug: postForm.categorySlug,
        summary: postForm.summary || undefined,
        content: postForm.content,
        coverImageUrl: postForm.coverImageUrl || undefined,
        tags: tagsArray,
        isPublished: postForm.isPublished,
      });

      setIsPostModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) {
      setErrorMsg('Category name is required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const slug = catForm.slug.trim() || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await sdk.saveBlogCategory({
        name: catForm.name.trim(),
        slug,
        description: catForm.description || undefined,
        isActive: true,
      });

      setIsCatModalOpen(false);
      setCatForm({ name: '', slug: '', description: '' });
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Delete blog post "${title}"?`)) return;
    try {
      await sdk.deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog post');
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.categorySlug && p.categorySlug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Editorial & Thought Leadership
              </span>
              <span className="text-xs font-semibold theme-muted">Articles & Guides</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              Manage Blogs & Categories
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Publish career tips, tech industry insights, recruitment strategies, and organize content under targeted categories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {activeTab === 'posts' ? (
              <button
                onClick={openAddPost}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Article</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setCatForm({ name: '', slug: '', description: '' });
                  setIsCatModalOpen(true);
                  setErrorMsg(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Blog Category</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="border-b theme-border flex items-center space-x-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog Articles ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-xs font-black transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent theme-muted hover:theme-text'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Blog Categories ({categories.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'posts' ? 'articles' : 'categories'}...`}
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
            Showing <span className="font-bold theme-text">{activeTab === 'posts' ? filteredPosts.length : filteredCats.length}</span> items
          </div>
        </div>

        {/* Posts Table */}
        {activeTab === 'posts' && (
          <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-xs font-semibold theme-muted">Loading blog posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold theme-text">No articles found</h4>
                  <p className="text-xs theme-muted max-w-sm mx-auto">
                    No articles matching your criteria. Click Write New Article above to begin.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                      <th className="py-3 px-4">Article Title & Slug</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Tags</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border text-xs">
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold theme-text block">{post.title}</span>
                            <span className="font-mono text-[11px] text-indigo-500 font-medium">/{post.slug}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {post.categorySlug || 'General'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {post.tags?.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[10px] theme-muted bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              post.isPublished
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}
                          >
                            {post.isPublished ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Published
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Draft
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => openEditPost(post)}
                              className="p-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="p-1.5 rounded-lg border theme-border theme-text hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                              title="Delete Article"
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
        )}

        {/* Categories Table */}
        {activeTab === 'categories' && (
          <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug Path</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredCats.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold theme-text">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-500 font-medium">
                        /{cat.slug}
                      </td>
                      <td className="py-3.5 px-4 theme-muted max-w-sm truncate text-[11px]">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Write / Edit Article Modal */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="max-w-2xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">
                    {editingPost ? 'Edit Blog Article' : 'Write New Blog Article'}
                  </h3>
                  <p className="text-[10px] theme-muted">Career guide or industry editorial piece</p>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Article Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Essential High-Demand Tech Skills for 2026"
                    value={postForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setPostForm((prev) => ({
                        ...prev,
                        title,
                        slug: editingPost ? prev.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      URL Slug Path <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10-essential-tech-skills-2026"
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Category
                    </label>
                    <select
                      value={postForm.categorySlug}
                      onChange={(e) => setPostForm({ ...postForm, categorySlug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Summary / Excerpt
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence lead-in..."
                    value={postForm.summary}
                    onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Article Body (HTML / Markdown)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="<p>Full article content...</p>"
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Tech, Career, Interview, React"
                      value={postForm.tags}
                      onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={postForm.coverImageUrl}
                      onChange={(e) => setPostForm({ ...postForm, coverImageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postForm.isPublished}
                      onChange={(e) => setPostForm({ ...postForm, isPublished: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold theme-text">Publish immediately</span>
                  </label>
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
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
                    <span>{editingPost ? 'Save Changes' : 'Publish Article'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-md w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text">Add Blog Category</h3>
                  <p className="text-[10px] theme-muted">Taxonomy folder for blog articles</p>
                </div>
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote Work Culture"
                    value={catForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCatForm({
                        ...catForm,
                        name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Category Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. remote-work-culture"
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider theme-text">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Category overview..."
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-4 border-t theme-border flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
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
                    <span>Save Category</span>
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
