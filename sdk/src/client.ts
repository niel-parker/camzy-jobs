import {
  AdminUserProfile,
  AppConfig,
  AuthResponse,
  BlogCategoryItem,
  BlogPostItem,
  BroadcastRecipient,
  BroadcastRecipientResponse,
  CmsPageItem,
  CompanyDirectoryItem,
  CrossCompanyJobItem,
  DashboardMetrics,
  EmailBroadcastItem,
  ExperienceRangeItem,
  FaqItemData,
  JobListing,
  LocationItem,
  SeoConfigItem,
  SkillKeywordItem,
  SkillSuggestionResponse,
  SubscriptionPackageItem,
  SystemTaxonomyItem,
  ThemeConfig,
  UploadResumeResponse,
  User,
} from './types';

declare const process: any;

export class JobPortalSdk {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000/api/v1';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('jp_access_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('jp_access_token', token);
      } else {
        localStorage.removeItem('jp_access_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API Request failed' }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth Methods
  async login(email: string, password_hash: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password_hash }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async requestOtp(identifier: string): Promise<{ success: boolean; message: string; expiresInSeconds: number; isEmail: boolean; otpCode?: string }> {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async verifyOtp(identifier: string, otp: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async shareJob(shareData: { toEmail: string; senderName?: string; jobTitle: string; companyName?: string; jobUrl: string; personalNote?: string }): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/share-job', {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Candidate Profile Methods
  async getCandidateProfile(id: string): Promise<any> {
    return this.request(`/candidates/${id}`);
  }

  async updateCandidateProfile(id: string, profileData: any): Promise<any> {
    return this.request(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadResume(file: any): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${this.baseUrl}/candidates/upload-resume`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload resume file.');
    }
    return res.json();
  }

  async uploadAvatar(file: any): Promise<{ success: boolean; filename: string; originalName: string; size: number; mimeType: string; url: string; fullUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${this.baseUrl}/candidates/upload-avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload avatar picture.');
    }
    return res.json();
  }

  async searchCandidates(params?: { skill?: string; noticePeriod?: string; city?: string; minExp?: number; maxSalary?: number }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.skill) searchParams.append('skill', params.skill);
    if (params?.noticePeriod) searchParams.append('noticePeriod', params.noticePeriod);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.minExp) searchParams.append('minExp', params.minExp.toString());
    if (params?.maxSalary) searchParams.append('maxSalary', params.maxSalary.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/candidates${queryString}`);
  }

  async toggleSaveJob(candidateId: string, jobId: string): Promise<{ saved: boolean; savedJobIds: string[] }> {
    return this.request(`/candidates/${candidateId}/saved-jobs/${jobId}`, {
      method: 'POST',
    });
  }

  async getSavedJobs(candidateId: string): Promise<any[]> {
    return this.request<any[]>(`/candidates/${candidateId}/saved-jobs`);
  }

  // Theme Management Methods (Super Admin & Public Theme sync)
  async getActiveTheme(): Promise<ThemeConfig> {
    return this.request<ThemeConfig>('/theme/active');
  }

  async updateActiveTheme(themeData: Partial<ThemeConfig>): Promise<ThemeConfig> {
    return this.request<ThemeConfig>('/theme/active', {
      method: 'PUT',
      body: JSON.stringify(themeData),
    });
  }

  async resetThemeToPreset(presetId: string): Promise<ThemeConfig> {
    return this.request<ThemeConfig>(`/theme/reset/${presetId}`, {
      method: 'POST',
    });
  }

  // Platform App Config Methods (Super Admin Platform Settings)
  async getAppConfig(): Promise<AppConfig> {
    return this.request<AppConfig>('/admin/app-config');
  }

  async updateAppConfig(config: Partial<AppConfig>): Promise<AppConfig> {
    return this.request<AppConfig>('/admin/app-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getJobs(params?: {
    category?: string;
    query?: string;
    tenantId?: string;
    location?: string;
    experienceLevel?: string;
    minExp?: number;
    maxExp?: number;
  }): Promise<JobListing[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.query) searchParams.append('query', params.query);
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.experienceLevel) searchParams.append('experienceLevel', params.experienceLevel);
    if (params?.minExp !== undefined) searchParams.append('minExp', params.minExp.toString());
    if (params?.maxExp !== undefined) searchParams.append('maxExp', params.maxExp.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<JobListing[]>(`/jobs${queryString}`);
  }

  async getJobListings(params?: {
    category?: string;
    query?: string;
    tenantId?: string;
    location?: string;
    experienceLevel?: string;
    minExp?: number;
    maxExp?: number;
  }): Promise<JobListing[]> {
    return this.getJobs(params);
  }

  async getJobById(id: string): Promise<JobListing> {
    return this.request<JobListing>(`/jobs/${id}`);
  }

  async createJob(jobData: Partial<JobListing>): Promise<JobListing> {
    return this.request<JobListing>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: Partial<JobListing>): Promise<JobListing> {
    return this.request<JobListing>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async featureJob(id: string): Promise<JobListing> {
    return this.request<JobListing>(`/jobs/${id}/feature`, {
      method: 'POST',
    });
  }

  // Admin Dashboard Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/admin/metrics');
  }

  // Subscriptions, Quota Consumption & Billing Transactions
  async getCurrentSubscription(tenantId?: string): Promise<any> {
    const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
    return this.request(`/subscriptions/current${q}`);
  }

  async getBillingTransactions(tenantId?: string): Promise<any[]> {
    const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
    return this.request(`/subscriptions/transactions${q}`);
  }

  async upgradeSubscriptionPlan(planCode: string, billingCycle: 'monthly' | 'yearly' = 'monthly', tenantId?: string): Promise<any> {
    return this.request('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planCode, billingCycle, tenantId }),
    });
  }

  async purchaseQuotaTopup(topupType: string, tenantId?: string): Promise<any> {
    return this.request('/subscriptions/topup', {
      method: 'POST',
      body: JSON.stringify({ topupType, tenantId }),
    });
  }

  async trackResumeDownload(candidateId?: string, tenantId?: string): Promise<any> {
    return this.request('/subscriptions/consume-download', {
      method: 'POST',
      body: JSON.stringify({ candidateId, tenantId }),
    });
  }

  async getAdminTransactions(): Promise<any[]> {
    return this.request('/admin/transactions');
  }

  // Master Locations (Cities, States, Countries)
  async getLocations(params?: { q?: string; popular?: boolean }): Promise<LocationItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.popular !== undefined) searchParams.append('popular', String(params.popular));
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<LocationItem[]>(`/admin/locations${qs}`);
  }

  async createLocation(location: Partial<LocationItem>): Promise<LocationItem> {
    return this.request<LocationItem>('/admin/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async updateLocation(id: string, location: Partial<LocationItem>): Promise<LocationItem> {
    return this.request<LocationItem>(`/admin/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  async deleteLocation(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Skills & Workday-style Taxonomy
  async getSkills(): Promise<SkillKeywordItem[]> {
    return this.request<SkillKeywordItem[]>('/admin/skills');
  }

  async suggestSkills(query: string): Promise<SkillSuggestionResponse> {
    const q = encodeURIComponent(query || '');
    return this.request<SkillSuggestionResponse>(`/admin/skills/suggest?q=${q}`);
  }

  async createSkill(skill: { name: string; category?: string; keywords: string[] }): Promise<SkillKeywordItem> {
    return this.request<SkillKeywordItem>('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  async updateSkill(id: string, skill: Partial<SkillKeywordItem>): Promise<SkillKeywordItem> {
    return this.request<SkillKeywordItem>(`/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill),
    });
  }

  async deleteSkill(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/skills/${id}`, {
      method: 'DELETE',
    });
  }

  // Experience Ranges
  async getExperienceRanges(): Promise<ExperienceRangeItem[]> {
    return this.request<ExperienceRangeItem[]>('/admin/experience-ranges');
  }

  async createExperienceRange(range: Partial<ExperienceRangeItem>): Promise<ExperienceRangeItem> {
    return this.request<ExperienceRangeItem>('/admin/experience-ranges', {
      method: 'POST',
      body: JSON.stringify(range),
    });
  }

  async updateExperienceRange(id: string, range: Partial<ExperienceRangeItem>): Promise<ExperienceRangeItem> {
    return this.request<ExperienceRangeItem>(`/admin/experience-ranges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(range),
    });
  }

  async deleteExperienceRange(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/experience-ranges/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Super Admin User Profiles ---
  async getAdminProfiles(role?: string, search?: string): Promise<AdminUserProfile[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<AdminUserProfile[]>(`/admin/users/profiles${qs}`);
  }

  async createAdminUser(data: { email: string; password?: string; firstName: string; lastName: string; role: string; tenantId?: string; phoneNumber?: string }): Promise<User> {
    return this.request<User>('/admin/users/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUserStatus(id: string, status: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // --- Super Admin Cross-Company Jobs ---
  async getAdminJobs(params?: { tenantId?: string; search?: string }): Promise<CrossCompanyJobItem[]> {
    const sp = new URLSearchParams();
    if (params?.tenantId) sp.append('tenantId', params.tenantId);
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return this.request<CrossCompanyJobItem[]>(`/admin/jobs/all${qs}`);
  }

  async postJobAsCompany(jobData: any): Promise<JobListing> {
    return this.request<JobListing>('/admin/jobs/post-as-company', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateAdminJobStatus(id: string, status: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/jobs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // --- Super Admin Companies Directory ---
  async getAdminCompanies(): Promise<CompanyDirectoryItem[]> {
    return this.request<CompanyDirectoryItem[]>('/admin/companies/all');
  }

  async registerCompanyDirect(data: { name: string; type?: string; planCode?: string; adminEmail: string; adminFirstName: string; adminLastName: string }): Promise<CompanyDirectoryItem> {
    return this.request<CompanyDirectoryItem>('/admin/companies/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCompanyStatus(id: string, data: { isVerified?: boolean; status?: string }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/companies/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Super Admin CMS Pages ---
  async getCmsPages(): Promise<CmsPageItem[]> {
    return this.request<CmsPageItem[]>('/admin/cms/pages');
  }

  async getCmsPageById(id: string): Promise<CmsPageItem> {
    return this.request<CmsPageItem>(`/admin/cms/pages/${id}`);
  }

  async saveCmsPage(page: Partial<CmsPageItem>): Promise<CmsPageItem> {
    return this.request<CmsPageItem>('/admin/cms/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  async deleteCmsPage(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/cms/pages/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Super Admin Blogs & Categories ---
  async getBlogPosts(params?: { categorySlug?: string; search?: string }): Promise<BlogPostItem[]> {
    const sp = new URLSearchParams();
    if (params?.categorySlug) sp.append('categorySlug', params.categorySlug);
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return this.request<BlogPostItem[]>(`/admin/blogs/posts${qs}`);
  }

  async saveBlogPost(post: Partial<BlogPostItem>): Promise<BlogPostItem> {
    return this.request<BlogPostItem>('/admin/blogs/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async deleteBlogPost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/blogs/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async getBlogCategories(): Promise<BlogCategoryItem[]> {
    return this.request<BlogCategoryItem[]>('/admin/blogs/categories');
  }

  async saveBlogCategory(cat: Partial<BlogCategoryItem>): Promise<BlogCategoryItem> {
    return this.request<BlogCategoryItem>('/admin/blogs/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
  }

  // --- Super Admin SEO Configs ---
  async getSeoConfigs(): Promise<SeoConfigItem[]> {
    return this.request<SeoConfigItem[]>('/admin/seo/configs');
  }

  async saveSeoConfig(config: Partial<SeoConfigItem>): Promise<SeoConfigItem> {
    return this.request<SeoConfigItem>('/admin/seo/configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // --- Super Admin FAQs ---
  async getFaqs(audience?: string): Promise<FaqItemData[]> {
    const qs = audience ? `?audience=${encodeURIComponent(audience)}` : '';
    return this.request<FaqItemData[]>(`/admin/faqs${qs}`);
  }

  async saveFaq(faq: Partial<FaqItemData>): Promise<FaqItemData> {
    return this.request<FaqItemData>('/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(faq),
    });
  }

  async deleteFaq(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/faqs/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Super Admin Email Broadcasting ---
  async getBroadcasts(): Promise<EmailBroadcastItem[]> {
    return this.request<EmailBroadcastItem[]>('/admin/broadcasts');
  }

  async getBroadcastStats(): Promise<Record<string, number>> {
    return this.request<Record<string, number>>('/admin/broadcasts/segments/stats');
  }

  async getBroadcastRecipients(params: {
    segment?: string;
    months?: number;
    skill?: string;
    searchId?: string;
    searchName?: string;
    searchEmail?: string;
    page?: number;
    limit?: number;
  }): Promise<BroadcastRecipientResponse> {
    const sp = new URLSearchParams();
    if (params.segment) sp.append('segment', params.segment);
    if (params.months !== undefined) sp.append('months', String(params.months));
    if (params.skill) sp.append('skill', params.skill);
    if (params.searchId) sp.append('searchId', params.searchId);
    if (params.searchName) sp.append('searchName', params.searchName);
    if (params.searchEmail) sp.append('searchEmail', params.searchEmail);
    if (params.page !== undefined) sp.append('page', String(params.page));
    if (params.limit !== undefined) sp.append('limit', String(params.limit));
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return this.request<BroadcastRecipientResponse>(`/admin/broadcasts/recipients${qs}`);
  }

  async sendBroadcast(data: {
    campaignName: string;
    targetSegment: string;
    subject: string;
    htmlBody: string;
    recipientIds?: string[];
    recipientEmails?: string[];
  }): Promise<EmailBroadcastItem> {
    return this.request<EmailBroadcastItem>('/admin/broadcasts/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Super Admin Subscription Packages ---
  async getPackages(): Promise<SubscriptionPackageItem[]> {
    return this.request<SubscriptionPackageItem[]>('/admin/packages');
  }

  async savePackage(pkg: Partial<SubscriptionPackageItem>): Promise<SubscriptionPackageItem> {
    return this.request<SubscriptionPackageItem>('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(pkg),
    });
  }

  async deletePackage(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/packages/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Super Admin Master System Taxonomies ---
  async getTaxonomies(type?: string): Promise<SystemTaxonomyItem[]> {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    return this.request<SystemTaxonomyItem[]>(`/admin/taxonomies${qs}`);
  }

  async saveTaxonomy(item: Partial<SystemTaxonomyItem>): Promise<SystemTaxonomyItem> {
    return this.request<SystemTaxonomyItem>('/admin/taxonomies', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateTaxonomy(id: string, item: Partial<SystemTaxonomyItem>): Promise<SystemTaxonomyItem> {
    return this.request<SystemTaxonomyItem>(`/admin/taxonomies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteTaxonomy(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/taxonomies/${id}`, {
      method: 'DELETE',
    });
  }
}
