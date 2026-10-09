import { Repository } from 'typeorm';
import { AppConfigDto, AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan, PlanCode } from '../subscriptions/entities/subscription-plan.entity';
export declare class AdminController {
    private readonly appConfigService;
    private readonly jobRepo;
    private readonly tenantRepo;
    private readonly candidateRepo;
    private readonly appRepo;
    private readonly subRepo;
    private readonly planRepo;
    constructor(appConfigService: AppConfigService, jobRepo: Repository<JobPosting>, tenantRepo: Repository<Tenant>, candidateRepo: Repository<Candidate>, appRepo: Repository<JobApplication>, subRepo: Repository<TenantSubscription>, planRepo: Repository<SubscriptionPlan>);
    getDashboardMetrics(): Promise<{
        totalJobs: number;
        totalCompanies: number;
        totalConsultancies: number;
        totalCandidates: number;
        totalApplications: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
    }>;
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
}
