import { AppConfig, AuthResponse, DashboardMetrics, JobListing, ThemeConfig, User } from './types';
export declare class JobPortalSdk {
    private baseUrl;
    private token;
    constructor(baseUrl?: string);
    setToken(token: string | null): void;
    getToken(): string | null;
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    login(email: string, password_hash: string): Promise<AuthResponse>;
    getCurrentUser(): Promise<User>;
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
}
