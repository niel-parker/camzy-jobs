import { Repository } from 'typeorm';
import { AppConfigDto, AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant, TenantType, TenantStatus } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan, PlanCode } from '../subscriptions/entities/subscription-plan.entity';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { BillingTransaction } from '../subscriptions/entities/billing-transaction.entity';
import { Location } from './entities/location.entity';
import { SkillKeyword } from './entities/skill-keyword.entity';
import { ExperienceRange } from './entities/experience-range.entity';
import { SystemTaxonomy } from './entities/system-taxonomy.entity';
import { CmsPage } from './entities/cms-page.entity';
import { BlogPost, BlogCategory } from './entities/blog-post.entity';
import { SeoConfig } from './entities/seo-config.entity';
import { FaqItem } from './entities/faq-item.entity';
import { EmailBroadcast } from './entities/email-broadcast.entity';
import { RestrictedDomain } from './entities/restricted-domain.entity';
import { LoginActivity } from './entities/login-activity.entity';
export declare class AdminController {
    private readonly appConfigService;
    private readonly jobRepo;
    private readonly tenantRepo;
    private readonly candidateRepo;
    private readonly appRepo;
    private readonly subRepo;
    private readonly planRepo;
    private readonly txnRepo;
    private readonly userRepo;
    private readonly locationRepo;
    private readonly skillRepo;
    private readonly expRangeRepo;
    private readonly taxonomyRepo;
    private readonly cmsRepo;
    private readonly blogPostRepo;
    private readonly blogCatRepo;
    private readonly seoRepo;
    private readonly faqRepo;
    private readonly broadcastRepo;
    private readonly domainRepo;
    private readonly loginActivityRepo;
    constructor(appConfigService: AppConfigService, jobRepo: Repository<JobPosting>, tenantRepo: Repository<Tenant>, candidateRepo: Repository<Candidate>, appRepo: Repository<JobApplication>, subRepo: Repository<TenantSubscription>, planRepo: Repository<SubscriptionPlan>, txnRepo: Repository<BillingTransaction>, userRepo: Repository<User>, locationRepo: Repository<Location>, skillRepo: Repository<SkillKeyword>, expRangeRepo: Repository<ExperienceRange>, taxonomyRepo: Repository<SystemTaxonomy>, cmsRepo: Repository<CmsPage>, blogPostRepo: Repository<BlogPost>, blogCatRepo: Repository<BlogCategory>, seoRepo: Repository<SeoConfig>, faqRepo: Repository<FaqItem>, broadcastRepo: Repository<EmailBroadcast>, domainRepo: Repository<RestrictedDomain>, loginActivityRepo: Repository<LoginActivity>);
    getDashboardMetrics(): Promise<{
        totalJobs: number;
        totalCompanies: number;
        totalConsultancies: number;
        totalCandidates: number;
        totalApplications: number;
        activeSubscriptions: number;
        totalResumeDownloads: number;
        totalTeamSeats: number;
        totalRevenue: number;
        monthlyRevenue: number;
    }>;
    getTransactions(): Promise<BillingTransaction[]>;
    getAllTenants(): Promise<{
        id: string;
        name: string;
        slug: string;
        industry: string;
        status: TenantStatus;
        planCode: PlanCode;
        planName: string;
        maxActiveJobs: number;
        maxResumeDownloads: number;
        maxTeamSeats: number;
        activeJobsCount: number;
        createdAt: string;
    }[]>;
    upgradeTenantPlan(id: string, body: {
        planCode: PlanCode;
    }): Promise<{
        message: string;
        tenantId: string;
        planCode: PlanCode;
        maxActiveJobs: number;
        maxResumeDownloads: number;
        maxTeamSeats: number;
    }>;
    updateTenantStatus(id: string, body: {
        status?: TenantStatus;
    }): Promise<Tenant>;
    getAppConfig(): AppConfigDto;
    updateAppConfig(body: Partial<AppConfigDto>): AppConfigDto;
    getLocations(query?: string, popular?: string): Promise<Location[]>;
    createLocation(body: Partial<Location>): Promise<Location>;
    updateLocation(id: string, body: Partial<Location>): Promise<Location>;
    deleteLocation(id: string): Promise<{
        success: boolean;
    }>;
    getSkills(): Promise<SkillKeyword[]>;
    suggestSkills(query?: string): Promise<{
        query: string;
        suggestions: string[];
        clusters: any[];
    }>;
    createSkill(body: {
        name: string;
        category?: string;
        keywords: string[];
    }): Promise<SkillKeyword>;
    updateSkill(id: string, body: Partial<SkillKeyword>): Promise<SkillKeyword>;
    deleteSkill(id: string): Promise<{
        success: boolean;
    }>;
    getExperienceRanges(): Promise<ExperienceRange[]>;
    createExperienceRange(body: Partial<ExperienceRange>): Promise<ExperienceRange>;
    updateExperienceRange(id: string, body: Partial<ExperienceRange>): Promise<ExperienceRange>;
    deleteExperienceRange(id: string): Promise<{
        success: boolean;
    }>;
    getUserProfiles(role?: string, search?: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        name: string;
        role: UserRole;
        status: UserStatus;
        tenantId: string;
        companyName: string;
        candidateId: string;
        headline: string;
        currentTitle: string;
        experienceYears: number;
        resumeUrl: string;
        hasResume: boolean;
        experienceCount: number;
        educationCount: number;
        phone: string;
        createdAt: Date;
    }[]>;
    createUser(body: any): Promise<User>;
    updateUser(id: string, body: any): Promise<User>;
    deleteUser(id: string): Promise<{
        success: boolean;
    }>;
    getAllJobsAcrossCompanies(tenantId?: string, search?: string): Promise<{
        id: any;
        title: any;
        companyName: any;
        tenantId: any;
        category: any;
        location: string;
        status: any;
        isFeatured: any;
        isRemote: any;
        minExperience: any;
        maxExperience: any;
        salaryMin: any;
        salaryMax: any;
        skills: any;
        applicationCount: any;
        createdAt: any;
    }[]>;
    postJobAsCompany(body: any): Promise<JobPosting>;
    updateJobStatus(id: string, body: {
        status?: any;
        isFeatured?: boolean;
    }): Promise<JobPosting>;
    getAllCompanies(): Promise<{
        id: string;
        name: string;
        slug: string;
        type: TenantType;
        status: TenantStatus;
        isVerified: boolean;
        planName: string;
        planCode: string;
        maxJobs: number;
        activeJobs: number;
        resumeDownloadsUsed: number;
        resumeDownloadsLimit: number;
        createdAt: Date;
    }[]>;
    registerCompanyDirect(body: any): Promise<Tenant>;
    updateCompanyStatus(id: string, body: any): Promise<Tenant>;
    getCmsPages(locale?: string): Promise<CmsPage[]>;
    createCmsPage(body: Partial<CmsPage>): Promise<CmsPage>;
    updateCmsPage(id: string, body: Partial<CmsPage>): Promise<CmsPage>;
    deleteCmsPage(id: string): Promise<{
        success: boolean;
    }>;
    getBlogPosts(): Promise<BlogPost[]>;
    createBlogPost(body: Partial<BlogPost>): Promise<BlogPost>;
    updateBlogPost(id: string, body: Partial<BlogPost>): Promise<BlogPost>;
    deleteBlogPost(id: string): Promise<{
        success: boolean;
    }>;
    getBlogCategories(): Promise<BlogCategory[]>;
    createBlogCategory(body: Partial<BlogCategory>): Promise<BlogCategory>;
    updateBlogCategory(id: string, body: Partial<BlogCategory>): Promise<BlogCategory>;
    deleteBlogCategory(id: string): Promise<{
        success: boolean;
    }>;
    getSeoConfigs(): Promise<SeoConfig[]>;
    saveSeoConfig(body: Partial<SeoConfig>): Promise<SeoConfig>;
    updateSeoConfig(id: string, body: Partial<SeoConfig>): Promise<SeoConfig>;
    getFaqs(audience?: string): Promise<FaqItem[]>;
    createFaq(body: Partial<FaqItem>): Promise<FaqItem>;
    updateFaq(id: string, body: Partial<FaqItem>): Promise<FaqItem>;
    deleteFaq(id: string): Promise<{
        success: boolean;
    }>;
    getBroadcasts(): Promise<EmailBroadcast[]>;
    getBroadcastSegmentStats(): Promise<{
        INACTIVE_USERS: number;
        SKILLS_JOB_EMAIL: number;
        USER_ADV_EMAIL: number;
        EMPLOYER_ADV_EMAIL: number;
        EMPLOYER_ACTIVE_COMPANIES: number;
        EMPLOYER_EXPIRED_COMPANIES: number;
    }>;
    getBroadcastRecipients(segment?: string, monthsStr?: string, skill?: string, searchId?: string, searchName?: string, searchEmail?: string, pageStr?: string, limitStr?: string): Promise<{
        recipients: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    sendBroadcast(body: any): Promise<EmailBroadcast>;
    getPackages(): Promise<SubscriptionPlan[]>;
    createPackage(body: any): Promise<SubscriptionPlan>;
    updatePackage(id: string, body: any): Promise<SubscriptionPlan>;
    deletePackage(id: string): Promise<{
        success: boolean;
    }>;
    getTaxonomies(type?: string): Promise<SystemTaxonomy[]>;
    createTaxonomy(body: Partial<SystemTaxonomy>): Promise<SystemTaxonomy>;
    updateTaxonomy(id: string, body: Partial<SystemTaxonomy>): Promise<SystemTaxonomy>;
    deleteTaxonomy(id: string): Promise<{
        success: boolean;
    }>;
    getRestrictedDomains(): Promise<RestrictedDomain[]>;
    createRestrictedDomain(body: {
        domain: string;
        description?: string;
        isActive?: boolean;
    }): Promise<RestrictedDomain>;
    updateRestrictedDomain(id: string, body: {
        domain?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<RestrictedDomain>;
    deleteRestrictedDomain(id: string): Promise<{
        success: boolean;
    }>;
    seedDefaultRestrictedDomains(): Promise<{
        message: string;
        addedCount: number;
        totalCount: number;
        domains: RestrictedDomain[];
    }>;
    getLoginActivities(page?: string, limit?: string, status?: string, role?: string, method?: string, search?: string, startDate?: string, endDate?: string): Promise<{
        items: LoginActivity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLoginActivityStats(): Promise<{
        totalAllTime: number;
        total24h: number;
        success24h: number;
        failed24h: number;
        uniqueUsers24h: number;
        uniqueUsersAllTime: number;
        successRate: number;
        recentFailures: LoginActivity[];
        deviceBreakdown: {
            desktop: number;
            mobile: number;
            tablet: number;
        };
    }>;
    seedDemoLoginActivities(): Promise<{
        message: string;
        count: number;
    }>;
    clearLoginActivities(days?: string): Promise<{
        message: string;
    }>;
}
