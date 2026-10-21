import { AdminUserProfile, AppConfig, AuthResponse, BlogCategoryItem, BlogPostItem, BroadcastRecipientResponse, CmsPageItem, CompanyDirectoryItem, CrossCompanyJobItem, DashboardMetrics, EmailBroadcastItem, ExperienceRangeItem, FaqItemData, JobListing, LocationItem, SeoConfigItem, SkillKeywordItem, SkillSuggestionResponse, SubscriptionPackageItem, SystemTaxonomyItem, ThemeConfig, UploadResumeResponse, User } from './types';
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
        tenantId?: string;
        location?: string;
        experienceLevel?: string;
        minExp?: number;
        maxExp?: number;
    }): Promise<JobListing[]>;
    getJobListings(params?: {
        category?: string;
        query?: string;
        tenantId?: string;
        location?: string;
        experienceLevel?: string;
        minExp?: number;
        maxExp?: number;
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
    getLocations(params?: {
        q?: string;
        popular?: boolean;
    }): Promise<LocationItem[]>;
    createLocation(location: Partial<LocationItem>): Promise<LocationItem>;
    updateLocation(id: string, location: Partial<LocationItem>): Promise<LocationItem>;
    deleteLocation(id: string): Promise<{
        success: boolean;
    }>;
    getSkills(): Promise<SkillKeywordItem[]>;
    suggestSkills(query: string): Promise<SkillSuggestionResponse>;
    createSkill(skill: {
        name: string;
        category?: string;
        keywords: string[];
    }): Promise<SkillKeywordItem>;
    updateSkill(id: string, skill: Partial<SkillKeywordItem>): Promise<SkillKeywordItem>;
    deleteSkill(id: string): Promise<{
        success: boolean;
    }>;
    getExperienceRanges(): Promise<ExperienceRangeItem[]>;
    createExperienceRange(range: Partial<ExperienceRangeItem>): Promise<ExperienceRangeItem>;
    updateExperienceRange(id: string, range: Partial<ExperienceRangeItem>): Promise<ExperienceRangeItem>;
    deleteExperienceRange(id: string): Promise<{
        success: boolean;
    }>;
    getAdminProfiles(role?: string, search?: string): Promise<AdminUserProfile[]>;
    createAdminUser(data: {
        email: string;
        password?: string;
        firstName: string;
        lastName: string;
        role: string;
        tenantId?: string;
        phoneNumber?: string;
    }): Promise<User>;
    updateAdminUserStatus(id: string, status: string): Promise<User>;
    getAdminJobs(params?: {
        tenantId?: string;
        search?: string;
    }): Promise<CrossCompanyJobItem[]>;
    postJobAsCompany(jobData: any): Promise<JobListing>;
    updateAdminJobStatus(id: string, status: string): Promise<{
        success: boolean;
    }>;
    getAdminCompanies(): Promise<CompanyDirectoryItem[]>;
    registerCompanyDirect(data: {
        name: string;
        type?: string;
        planCode?: string;
        adminEmail: string;
        adminFirstName: string;
        adminLastName: string;
    }): Promise<CompanyDirectoryItem>;
    updateAdminCompanyStatus(id: string, data: {
        isVerified?: boolean;
        status?: string;
    }): Promise<{
        success: boolean;
    }>;
    getCmsPages(): Promise<CmsPageItem[]>;
    getCmsPageById(id: string): Promise<CmsPageItem>;
    saveCmsPage(page: Partial<CmsPageItem>): Promise<CmsPageItem>;
    deleteCmsPage(id: string): Promise<{
        success: boolean;
    }>;
    getBlogPosts(params?: {
        categorySlug?: string;
        search?: string;
    }): Promise<BlogPostItem[]>;
    saveBlogPost(post: Partial<BlogPostItem>): Promise<BlogPostItem>;
    deleteBlogPost(id: string): Promise<{
        success: boolean;
    }>;
    getBlogCategories(): Promise<BlogCategoryItem[]>;
    saveBlogCategory(cat: Partial<BlogCategoryItem>): Promise<BlogCategoryItem>;
    getSeoConfigs(): Promise<SeoConfigItem[]>;
    saveSeoConfig(config: Partial<SeoConfigItem>): Promise<SeoConfigItem>;
    getFaqs(audience?: string): Promise<FaqItemData[]>;
    saveFaq(faq: Partial<FaqItemData>): Promise<FaqItemData>;
    deleteFaq(id: string): Promise<{
        success: boolean;
    }>;
    getBroadcasts(): Promise<EmailBroadcastItem[]>;
    getBroadcastStats(): Promise<Record<string, number>>;
    getBroadcastRecipients(params: {
        segment?: string;
        months?: number;
        skill?: string;
        searchId?: string;
        searchName?: string;
        searchEmail?: string;
        page?: number;
        limit?: number;
    }): Promise<BroadcastRecipientResponse>;
    sendBroadcast(data: {
        campaignName: string;
        targetSegment: string;
        subject: string;
        htmlBody: string;
        recipientIds?: string[];
        recipientEmails?: string[];
    }): Promise<EmailBroadcastItem>;
    getPackages(): Promise<SubscriptionPackageItem[]>;
    savePackage(pkg: Partial<SubscriptionPackageItem>): Promise<SubscriptionPackageItem>;
    deletePackage(id: string): Promise<{
        success: boolean;
    }>;
    getTaxonomies(type?: string): Promise<SystemTaxonomyItem[]>;
    saveTaxonomy(item: Partial<SystemTaxonomyItem>): Promise<SystemTaxonomyItem>;
    updateTaxonomy(id: string, item: Partial<SystemTaxonomyItem>): Promise<SystemTaxonomyItem>;
    deleteTaxonomy(id: string): Promise<{
        success: boolean;
    }>;
}
