export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CONSULTANCY_ADMIN' | 'AGENCY_AGENT' | 'CANDIDATE';
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    lastLoginAt?: string;
    createdAt?: string;
    tenantId?: string;
    tenantName?: string;
    tenantType?: 'COMPANY' | 'CONSULTANCY';
    candidateId?: string;
    avatarUrl?: string;
}
export interface AuthResponse {
    accessToken: string;
    user: User;
    isNewAccount?: boolean;
    message?: string;
}
export interface CandidateProfile {
    id: string;
    userId: string;
    headline: string;
    summary: string;
    currentTitle: string;
    experienceYears: number;
    currentSalary?: number;
    expectedSalary?: number;
    noticePeriod?: string;
    preferredLocations?: string[];
    resumeUrl?: string;
    resumes?: Array<{
        id: string;
        title: string;
        resumeUrl: string;
        isDefault?: boolean;
        uploadedAt?: string;
    }>;
    skills: string[];
    user?: {
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        avatarUrl?: string;
        isEmailVerified?: boolean;
        isPhoneVerified?: boolean;
        lastLoginAt?: string;
        createdAt?: string;
    };
    experience?: Array<any>;
    education?: Array<any>;
    certifications?: Array<any>;
    projects?: Array<any>;
    languages?: Array<any>;
    socialLinks?: Record<string, string>;
    visibility?: 'PUBLIC' | 'ANONYMOUS' | 'PRIVATE';
}
export interface UploadResumeResponse {
    success: boolean;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    fullUrl: string;
}
export interface ThemeConfig {
    id: string;
    name: string;
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    primaryHover: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    borderRadius: string;
    fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Roboto' | 'Poppins';
    headerStyle: 'solid' | 'glassmorphism' | 'gradient';
    isDefault: boolean;
    customCssVars?: Record<string, string>;
    updatedAt: string;
}
export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    config: Omit<ThemeConfig, 'id' | 'updatedAt'>;
}
export interface AppConfig {
    id: string;
    siteName: string;
    siteTagline: string;
    siteDescription: string;
    supportEmail: string;
    defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'INR';
    enableConsultancies: boolean;
    enableFreeJobPosting: boolean;
    enableResumeDownloads: boolean;
    requireEmailVerification: boolean;
    requireCompanyTaxVerification: boolean;
    maintenanceMode: boolean;
    defaultPlanId: string;
    updatedAt: string;
}
export interface ScreeningQuestion {
    id: string;
    questionText: string;
    questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
    options?: string[];
    isRequired?: boolean;
}
export interface ScreeningAnswer {
    questionId: string;
    questionText: string;
    answer: string;
}
export interface LocationItem {
    id: string;
    country: string;
    countryCode?: string;
    state?: string;
    city: string;
    isPopular?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface SkillKeywordItem {
    id: string;
    name: string;
    category: string;
    keywords: string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface SkillSuggestionResponse {
    query: string;
    suggestions: string[];
    clusters: Array<{
        name: string;
        category: string;
        matchingKeywords: string[];
        allKeywords: string[];
    }>;
}
export interface ExperienceRangeItem {
    id: string;
    label: string;
    minYears: number;
    maxYears: number;
    sortOrder: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface JobListing {
    id: string;
    tenantId?: string;
    title: string;
    companyName: string;
    companyLogoUrl?: string;
    isConsultancy: boolean;
    consultancyName?: string;
    clientCompanyName?: string;
    location: string;
    locationCountry?: string;
    locationState?: string;
    locationCity?: string;
    isRemote: boolean;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    isSalaryVisible: boolean;
    category: string;
    experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    minExperience?: number;
    maxExperience?: number;
    description: string;
    isFeatured: boolean;
    applyType?: 'INTERNAL' | 'EXTERNAL';
    applyUrl?: string;
    skills?: string[];
    benefits?: string[];
    genderPreference?: 'ANY' | 'MALE' | 'FEMALE';
    screeningQuestions?: ScreeningQuestion[];
    createdAt: string;
}
export interface QuotaProgress {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
}
export interface TenantSubscriptionOverview {
    id: string;
    tenantId: string;
    tenantName: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    plan: {
        id: string;
        name: string;
        code: string;
        priceMonthly: number;
        priceYearly: number;
        maxActiveJobs: number;
        maxResumeDownloads: number;
        maxTeamSeats: number;
    };
    quotas: {
        activeJobs: QuotaProgress;
        resumeDownloads: QuotaProgress;
        teamSeats: QuotaProgress;
    };
}
export interface BillingTransaction {
    id: string;
    invoiceNumber: string;
    tenantId?: string;
    tenantName: string;
    description: string;
    amount: number;
    currency: string;
    type: 'SUBSCRIPTION' | 'QUOTA_TOPUP' | 'SEAT_ADDON';
    status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
    paymentMethod: string;
    planCode?: string;
    quotaDetails?: {
        activeJobs?: number;
        resumeDownloads?: number;
        teamSeats?: number;
    };
    periodStart?: string;
    periodEnd?: string;
    createdAt: string;
}
export interface DashboardMetrics {
    totalJobs: number;
    totalCompanies: number;
    totalConsultancies: number;
    totalCandidates: number;
    totalApplications: number;
    activeSubscriptions: number;
    totalResumeDownloads?: number;
    totalTeamSeats?: number;
    totalRevenue?: number;
    monthlyRevenue: number;
}
export interface SystemTaxonomyItem {
    id: string;
    type: string;
    name: string;
    code?: string;
    slug?: string;
    description?: string;
    orderIndex: number;
    isActive: boolean;
    metaData?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}
export interface CmsPageItem {
    id: string;
    title: string;
    slug: string;
    locale: string;
    language?: string;
    contentHtml?: string;
    content?: string;
    isPublished: boolean;
    seoTitle?: string;
    seoDescription?: string;
    metaTitle?: string;
    metaDescription?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface BlogPostItem {
    id: string;
    title: string;
    slug: string;
    category: string;
    categorySlug?: string;
    authorName?: string;
    summary?: string;
    content?: string;
    coverImageUrl?: string;
    tags?: string[];
    isPublished: boolean;
    publishedAt?: string;
    createdAt?: string;
}
export interface BlogCategoryItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
}
export interface SeoConfigItem {
    id: string;
    pageKey: string;
    pageName: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogImageUrl?: string;
}
export interface FaqItemData {
    id: string;
    question: string;
    answer: string;
    category: string;
    targetAudience: string;
    orderIndex: number;
    isActive: boolean;
}
export interface BroadcastRecipient {
    id: string;
    realId: string;
    name: string;
    email: string;
    role: string;
    status: string;
    skills?: string[];
    companyName?: string;
    planName?: string;
    inactiveMonths?: number;
    lastActive?: string;
    createdAt: string;
}
export interface BroadcastRecipientResponse {
    recipients: BroadcastRecipient[];
    total: number;
    page: number;
    limit: number;
}
export interface EmailBroadcastItem {
    id: string;
    campaignName: string;
    targetSegment: string;
    subject: string;
    htmlBody: string;
    recipientCount: number;
    status: string;
    sentAt?: string;
    createdAt?: string;
}
export interface SubscriptionPackageItem {
    id: string;
    name: string;
    code: string;
    priceMonthly: number;
    priceYearly: number;
    maxActiveJobs: number;
    maxResumeDownloads: number;
    maxTeamSeats: number;
    features: string[];
}
export interface AdminUserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: string;
    status: string;
    tenantId?: string;
    companyName?: string;
    candidateId?: string;
    headline?: string;
    currentTitle?: string;
    experienceYears?: number;
    resumeUrl?: string;
    hasResume?: boolean;
    experienceCount?: number;
    educationCount?: number;
    phone?: string;
    createdAt: string;
}
export interface CrossCompanyJobItem {
    id: string;
    title: string;
    companyName: string;
    tenantId: string;
    category: string;
    location: string;
    status: string;
    isFeatured: boolean;
    isRemote: boolean;
    minExperience?: number;
    maxExperience?: number;
    salaryMin?: number;
    salaryMax?: number;
    skills: string[];
    applicationCount: number;
    createdAt: string;
}
export interface CompanyDirectoryItem {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    isVerified: boolean;
    planName: string;
    planCode: string;
    maxJobs: number;
    activeJobs: number;
    resumeDownloadsUsed: number;
    resumeDownloadsLimit: number;
    createdAt: string;
}
export interface RestrictedDomainItem {
    id: string;
    domain: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface AtsApplicationItem {
    id: string;
    jobId: string;
    jobTitle: string;
    candidateId: string;
    candidateName: string;
    candidateEmail?: string;
    candidatePhone?: string;
    candidateHeadline: string;
    coverLetter?: string;
    resumeUrlSnapshot: string;
    stage: string;
    rating: number;
    createdAt: string;
}
export interface LoginActivityItem {
    id: string;
    userId?: string | null;
    email: string;
    userName?: string | null;
    role?: string | null;
    ipAddress: string;
    userAgent?: string | null;
    deviceType: string;
    browser?: string | null;
    os?: string | null;
    status: 'SUCCESS' | 'FAILED';
    failureReason?: string | null;
    loginMethod: 'PASSWORD' | 'OTP' | 'GOOGLE' | 'MAGIC_LINK' | string;
    location?: string | null;
    createdAt: string;
}
export interface LoginActivityStats {
    totalAllTime: number;
    total24h: number;
    success24h: number;
    failed24h: number;
    uniqueUsers24h: number;
    uniqueUsersAllTime: number;
    successRate: number;
    recentFailures: LoginActivityItem[];
    deviceBreakdown: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
}
export interface PaginatedLoginActivities {
    items: LoginActivityItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
