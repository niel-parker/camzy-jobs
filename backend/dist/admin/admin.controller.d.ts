import { Repository } from 'typeorm';
import { AppConfigDto, AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
export declare class AdminController {
    private readonly appConfigService;
    private readonly jobRepo;
    private readonly tenantRepo;
    private readonly candidateRepo;
    private readonly appRepo;
    private readonly subRepo;
    constructor(appConfigService: AppConfigService, jobRepo: Repository<JobPosting>, tenantRepo: Repository<Tenant>, candidateRepo: Repository<Candidate>, appRepo: Repository<JobApplication>, subRepo: Repository<TenantSubscription>);
    getDashboardMetrics(): Promise<{
        totalJobs: number;
        totalCompanies: number;
        totalConsultancies: number;
        totalCandidates: number;
        totalApplications: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
    }>;
    getAppConfig(): AppConfigDto;
    updateAppConfig(body: Partial<AppConfigDto>): AppConfigDto;
}
