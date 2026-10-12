import { AppConfig, AuthResponse, DashboardMetrics, JobListing, ThemeConfig, UploadResumeResponse, User } from './types';

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

  async getJobs(params?: { category?: string; query?: string; tenantId?: string }): Promise<JobListing[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.query) searchParams.append('query', params.query);
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<JobListing[]>(`/jobs${queryString}`);
  }

  async getJobListings(params?: { category?: string; query?: string; tenantId?: string }): Promise<JobListing[]> {
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
}
