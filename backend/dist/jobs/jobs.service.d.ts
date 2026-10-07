import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
export interface JobListingDto {
    id: string;
    tenantId?: string;
    title: string;
    companyName: string;
    companyLogoUrl?: string;
    isConsultancy: boolean;
    consultancyName?: string;
    clientCompanyName?: string;
    location: string;
    isRemote: boolean;
    employmentType: string;
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    isSalaryVisible: boolean;
    category: string;
    experienceLevel: string;
    description: string;
    isFeatured: boolean;
    screeningQuestions?: Array<{
        id: string;
        questionText: string;
        questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
        options?: string[];
        isRequired?: boolean;
    }>;
    createdAt: string;
}
export declare class JobsService {
    private readonly jobRepo;
    private readonly tenantRepo;
    constructor(jobRepo: Repository<JobPosting>, tenantRepo: Repository<Tenant>);
    findAll(category?: string, query?: string): Promise<JobListingDto[]>;
    findOne(id: string): Promise<JobListingDto>;
    getActiveJobsCountForTenant(tenantId: string): Promise<number>;
    getPlanJobLimitForTenant(tenantId: string): Promise<number>;
    createJob(jobData: Partial<JobListingDto>): Promise<JobListingDto>;
    featureJob(id: string): Promise<JobListingDto>;
    private mapToDto;
}
