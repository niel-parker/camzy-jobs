import { AppConfig, AuthResponse, DashboardMetrics, JobListing, ThemeConfig, UploadResumeResponse, User } from './types';
export declare class JobPortalSdk {
    private baseUrl;
    private token;
    constructor(baseUrl?: string);
    setToken(token: string | null): void;
    getToken(): string | null;
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    login(email: string, password_hash: string): Promise<AuthResponse>;
    requestOtp(identifier: string): Promise<{
        success: boolean;
        message: string;
        expiresInSeconds: number;
        isEmail: boolean;
        otpCode?: string;
    }>;
    verifyOtp(identifier: string, otp: string): Promise<AuthResponse>;
    shareJob(shareData: {
        toEmail: string;
        senderName?: string;
        jobTitle: string;
        companyName?: string;
        jobUrl: string;
        personalNote?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentUser(): Promise<User>;
    getCandidateProfile(id: string): Promise<any>;
    updateCandidateProfile(id: string, profileData: any): Promise<any>;
    uploadResume(file: any): Promise<UploadResumeResponse>;
    uploadAvatar(file: any): Promise<{
        success: boolean;
        filename: string;
        originalName: string;
        size: number;
        mimeType: string;
        url: string;
        fullUrl: string;
    }>;
    searchCandidates(params?: {
        skill?: string;
        noticePeriod?: string;
        city?: string;
        minExp?: number;
        maxSalary?: number;
    }): Promise<any[]>;
    toggleSaveJob(candidateId: string, jobId: string): Promise<{
        saved: boolean;
        savedJobIds: string[];
    }>;
    getSavedJobs(candidateId: string): Promise<any[]>;
    getActiveTheme(): Promise<ThemeConfig>;
    updateActiveTheme(themeData: Partial<ThemeConfig>): Promise<ThemeConfig>;
    resetThemeToPreset(presetId: string): Promise<ThemeConfig>;
    getAppConfig(): Promise<AppConfig>;
    updateAppConfig(config: Partial<AppConfig>): Promise<AppConfig>;
    getJobs(params?: {
        category?: string;
        query?: string;
    }): Promise<JobListing[]>;
    getJobListings(params?: {
        category?: string;
        query?: string;
    }): Promise<JobListing[]>;
    getJobById(id: string): Promise<JobListing>;
    createJob(jobData: Partial<JobListing>): Promise<JobListing>;
    updateJob(id: string, jobData: Partial<JobListing>): Promise<JobListing>;
    deleteJob(id: string): Promise<{
        success: boolean;
    }>;
    featureJob(id: string): Promise<JobListing>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getCurrentSubscription(tenantId?: string): Promise<any>;
    getBillingTransactions(tenantId?: string): Promise<any[]>;
    upgradeSubscriptionPlan(planCode: string, billingCycle?: 'monthly' | 'yearly', tenantId?: string): Promise<any>;
    purchaseQuotaTopup(topupType: string, tenantId?: string): Promise<any>;
    trackResumeDownload(candidateId?: string, tenantId?: string): Promise<any>;
    getAdminTransactions(): Promise<any[]>;
}
