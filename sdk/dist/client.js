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
    async requestOtp(identifier) {
        return this.request('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier }),
        });
    }
    async verifyOtp(identifier, otp) {
        const data = await this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier, otp }),
        });
        this.setToken(data.accessToken);
        return data;
    }
    async shareJob(shareData) {
        return this.request('/auth/share-job', {
            method: 'POST',
            body: JSON.stringify(shareData),
        });
    }
    async getCurrentUser() {
        return this.request('/auth/me');
    }
    // Candidate Profile Methods
    async getCandidateProfile(id) {
        return this.request(`/candidates/${id}`);
    }
    async updateCandidateProfile(id, profileData) {
        return this.request(`/candidates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }
    async uploadResume(file) {
        const formData = new FormData();
        formData.append('file', file);
        const headers = {};
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
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        const headers = {};
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
    async searchCandidates(params) {
        const searchParams = new URLSearchParams();
        if (params?.skill)
            searchParams.append('skill', params.skill);
        if (params?.noticePeriod)
            searchParams.append('noticePeriod', params.noticePeriod);
        if (params?.city)
            searchParams.append('city', params.city);
        if (params?.minExp)
            searchParams.append('minExp', params.minExp.toString());
        if (params?.maxSalary)
            searchParams.append('maxSalary', params.maxSalary.toString());
        const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return this.request(`/candidates${queryString}`);
    }
    async toggleSaveJob(candidateId, jobId) {
        return this.request(`/candidates/${candidateId}/saved-jobs/${jobId}`, {
            method: 'POST',
        });
    }
    async getSavedJobs(candidateId) {
        return this.request(`/candidates/${candidateId}/saved-jobs`);
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
        if (params?.tenantId)
            searchParams.append('tenantId', params.tenantId);
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
    // Subscriptions, Quota Consumption & Billing Transactions
    async getCurrentSubscription(tenantId) {
        const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
        return this.request(`/subscriptions/current${q}`);
    }
    async getBillingTransactions(tenantId) {
        const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
        return this.request(`/subscriptions/transactions${q}`);
    }
    async upgradeSubscriptionPlan(planCode, billingCycle = 'monthly', tenantId) {
        return this.request('/subscriptions/upgrade', {
            method: 'POST',
            body: JSON.stringify({ planCode, billingCycle, tenantId }),
        });
    }
    async purchaseQuotaTopup(topupType, tenantId) {
        return this.request('/subscriptions/topup', {
            method: 'POST',
            body: JSON.stringify({ topupType, tenantId }),
        });
    }
    async trackResumeDownload(candidateId, tenantId) {
        return this.request('/subscriptions/consume-download', {
            method: 'POST',
            body: JSON.stringify({ candidateId, tenantId }),
        });
    }
    async getAdminTransactions() {
        return this.request('/admin/transactions');
    }
}
exports.JobPortalSdk = JobPortalSdk;
