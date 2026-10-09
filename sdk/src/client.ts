import { AppConfig, AuthResponse, DashboardMetrics, JobListing, ThemeConfig, User } from './types';

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

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
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

  async getJobs(params?: { category?: string; query?: string }): Promise<JobListing[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.query) searchParams.append('query', params.query);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<JobListing[]>(`/jobs${queryString}`);
  }

  async getJobListings(params?: { category?: string; query?: string }): Promise<JobListing[]> {
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
}
