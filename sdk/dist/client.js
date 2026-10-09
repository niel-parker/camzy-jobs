"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPortalSdk = void 0;
class JobPortalSdk {
    baseUrl;
    token = null;
    constructor(baseUrl) {
        this.baseUrl = baseUrl || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000/api/v1';
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('jp_access_token');
        }
    }
    setToken(token) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('jp_access_token', token);
            }
            else {
                localStorage.removeItem('jp_access_token');
            }
        }
    }
    getToken() {
        return this.token;
    }
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
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
        return response.json();
    }
    // Auth Methods
    async login(email, password_hash) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password: password_hash }),
        });
        this.setToken(data.accessToken);
        return data;
    }
    async getCurrentUser() {
        return this.request('/auth/me');
    }
    // Theme Management Methods (Super Admin & Public Theme sync)
    async getActiveTheme() {
        return this.request('/theme/active');
    }
    async updateActiveTheme(themeData) {
        return this.request('/theme/active', {
            method: 'PUT',
            body: JSON.stringify(themeData),
        });
    }
    async resetThemeToPreset(presetId) {
        return this.request(`/theme/reset/${presetId}`, {
            method: 'POST',
        });
    }
    // Platform App Config Methods (Super Admin Platform Settings)
    async getAppConfig() {
        return this.request('/admin/app-config');
    }
    async updateAppConfig(config) {
        return this.request('/admin/app-config', {
            method: 'PUT',
            body: JSON.stringify(config),
        });
    }
    async getJobs(params) {
        const searchParams = new URLSearchParams();
        if (params?.category)
            searchParams.append('category', params.category);
        if (params?.query)
            searchParams.append('query', params.query);
        const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return this.request(`/jobs${queryString}`);
    }
    async getJobListings(params) {
        return this.getJobs(params);
    }
    async getJobById(id) {
        return this.request(`/jobs/${id}`);
    }
    async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }
    async updateJob(id, jobData) {
        return this.request(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData),
        });
    }
    async deleteJob(id) {
        return this.request(`/jobs/${id}`, {
            method: 'DELETE',
        });
    }
    async featureJob(id) {
        return this.request(`/jobs/${id}/feature`, {
            method: 'POST',
        });
    }
    // Admin Dashboard Metrics
    async getDashboardMetrics() {
        return this.request('/admin/metrics');
    }
}
exports.JobPortalSdk = JobPortalSdk;
