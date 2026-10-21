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
        if (params?.location)
            searchParams.append('location', params.location);
        if (params?.experienceLevel)
            searchParams.append('experienceLevel', params.experienceLevel);
        if (params?.minExp !== undefined)
            searchParams.append('minExp', params.minExp.toString());
        if (params?.maxExp !== undefined)
            searchParams.append('maxExp', params.maxExp.toString());
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
    // Master Locations (Cities, States, Countries)
    async getLocations(params) {
        const searchParams = new URLSearchParams();
        if (params?.q)
            searchParams.append('q', params.q);
        if (params?.popular !== undefined)
            searchParams.append('popular', String(params.popular));
        const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return this.request(`/admin/locations${qs}`);
    }
    async createLocation(location) {
        return this.request('/admin/locations', {
            method: 'POST',
            body: JSON.stringify(location),
        });
    }
    async updateLocation(id, location) {
        return this.request(`/admin/locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(location),
        });
    }
    async deleteLocation(id) {
        return this.request(`/admin/locations/${id}`, {
            method: 'DELETE',
        });
    }
    // Skills & Workday-style Taxonomy
    async getSkills() {
        return this.request('/admin/skills');
    }
    async suggestSkills(query) {
        const q = encodeURIComponent(query || '');
        return this.request(`/admin/skills/suggest?q=${q}`);
    }
    async createSkill(skill) {
        return this.request('/admin/skills', {
            method: 'POST',
            body: JSON.stringify(skill),
        });
    }
    async updateSkill(id, skill) {
        return this.request(`/admin/skills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(skill),
        });
    }
    async deleteSkill(id) {
        return this.request(`/admin/skills/${id}`, {
            method: 'DELETE',
        });
    }
    // Experience Ranges
    async getExperienceRanges() {
        return this.request('/admin/experience-ranges');
    }
    async createExperienceRange(range) {
        return this.request('/admin/experience-ranges', {
            method: 'POST',
            body: JSON.stringify(range),
        });
    }
    async updateExperienceRange(id, range) {
        return this.request(`/admin/experience-ranges/${id}`, {
            method: 'PUT',
            body: JSON.stringify(range),
        });
    }
    async deleteExperienceRange(id) {
        return this.request(`/admin/experience-ranges/${id}`, {
            method: 'DELETE',
        });
    }
    // --- Super Admin User Profiles ---
    async getAdminProfiles(role, search) {
        const params = new URLSearchParams();
        if (role)
            params.append('role', role);
        if (search)
            params.append('search', search);
        const qs = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/admin/users/profiles${qs}`);
    }
    async createAdminUser(data) {
        return this.request('/admin/users/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateAdminUserStatus(id, status) {
        return this.request(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }
    // --- Super Admin Cross-Company Jobs ---
    async getAdminJobs(params) {
        const sp = new URLSearchParams();
        if (params?.tenantId)
            sp.append('tenantId', params.tenantId);
        if (params?.search)
            sp.append('search', params.search);
        const qs = sp.toString() ? `?${sp.toString()}` : '';
        return this.request(`/admin/jobs/all${qs}`);
    }
    async postJobAsCompany(jobData) {
        return this.request('/admin/jobs/post-as-company', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }
    async updateAdminJobStatus(id, status) {
        return this.request(`/admin/jobs/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }
    // --- Super Admin Companies Directory ---
    async getAdminCompanies() {
        return this.request('/admin/companies/all');
    }
    async registerCompanyDirect(data) {
        return this.request('/admin/companies/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateAdminCompanyStatus(id, data) {
        return this.request(`/admin/companies/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    // --- Super Admin CMS Pages ---
    async getCmsPages() {
        return this.request('/admin/cms/pages');
    }
    async getCmsPageById(id) {
        return this.request(`/admin/cms/pages/${id}`);
    }
    async saveCmsPage(page) {
        return this.request('/admin/cms/pages', {
            method: 'POST',
            body: JSON.stringify(page),
        });
    }
    async deleteCmsPage(id) {
        return this.request(`/admin/cms/pages/${id}`, {
            method: 'DELETE',
        });
    }
    // --- Super Admin Blogs & Categories ---
    async getBlogPosts(params) {
        const sp = new URLSearchParams();
        if (params?.categorySlug)
            sp.append('categorySlug', params.categorySlug);
        if (params?.search)
            sp.append('search', params.search);
        const qs = sp.toString() ? `?${sp.toString()}` : '';
        return this.request(`/admin/blogs/posts${qs}`);
    }
    async saveBlogPost(post) {
        return this.request('/admin/blogs/posts', {
            method: 'POST',
            body: JSON.stringify(post),
        });
    }
    async deleteBlogPost(id) {
        return this.request(`/admin/blogs/posts/${id}`, {
            method: 'DELETE',
        });
    }
    async getBlogCategories() {
        return this.request('/admin/blogs/categories');
    }
    async saveBlogCategory(cat) {
        return this.request('/admin/blogs/categories', {
            method: 'POST',
            body: JSON.stringify(cat),
        });
    }
    // --- Super Admin SEO Configs ---
    async getSeoConfigs() {
        return this.request('/admin/seo/configs');
    }
    async saveSeoConfig(config) {
        return this.request('/admin/seo/configs', {
            method: 'POST',
            body: JSON.stringify(config),
        });
    }
    // --- Super Admin FAQs ---
    async getFaqs(audience) {
        const qs = audience ? `?audience=${encodeURIComponent(audience)}` : '';
        return this.request(`/admin/faqs${qs}`);
    }
    async saveFaq(faq) {
        return this.request('/admin/faqs', {
            method: 'POST',
            body: JSON.stringify(faq),
        });
    }
    async deleteFaq(id) {
        return this.request(`/admin/faqs/${id}`, {
            method: 'DELETE',
        });
    }
    // --- Super Admin Email Broadcasting ---
    async getBroadcasts() {
        return this.request('/admin/broadcasts');
    }
    async getBroadcastStats() {
        return this.request('/admin/broadcasts/segments/stats');
    }
    async getBroadcastRecipients(params) {
        const sp = new URLSearchParams();
        if (params.segment)
            sp.append('segment', params.segment);
        if (params.months !== undefined)
            sp.append('months', String(params.months));
        if (params.skill)
            sp.append('skill', params.skill);
        if (params.searchId)
            sp.append('searchId', params.searchId);
        if (params.searchName)
            sp.append('searchName', params.searchName);
        if (params.searchEmail)
            sp.append('searchEmail', params.searchEmail);
        if (params.page !== undefined)
            sp.append('page', String(params.page));
        if (params.limit !== undefined)
            sp.append('limit', String(params.limit));
        const qs = sp.toString() ? `?${sp.toString()}` : '';
        return this.request(`/admin/broadcasts/recipients${qs}`);
    }
    async sendBroadcast(data) {
        return this.request('/admin/broadcasts/send', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // --- Super Admin Subscription Packages ---
    async getPackages() {
        return this.request('/admin/packages');
    }
    async savePackage(pkg) {
        return this.request('/admin/packages', {
            method: 'POST',
            body: JSON.stringify(pkg),
        });
    }
    async deletePackage(id) {
        return this.request(`/admin/packages/${id}`, {
            method: 'DELETE',
        });
    }
    // --- Super Admin Master System Taxonomies ---
    async getTaxonomies(type) {
        const qs = type ? `?type=${encodeURIComponent(type)}` : '';
        return this.request(`/admin/taxonomies${qs}`);
    }
    async saveTaxonomy(item) {
        return this.request('/admin/taxonomies', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }
    async updateTaxonomy(id, item) {
        return this.request(`/admin/taxonomies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(item),
        });
    }
    async deleteTaxonomy(id) {
        return this.request(`/admin/taxonomies/${id}`, {
            method: 'DELETE',
        });
    }
}
exports.JobPortalSdk = JobPortalSdk;
