import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JobPosting, EmploymentType, ExperienceLevel } from './entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
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
    locationCountry?: string;
    locationState?: string;
    locationCity?: string;
    isRemote: boolean;
    employmentType: string;
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    isSalaryVisible: boolean;
    category: string;
    experienceLevel: string;
    minExperience?: number;
    maxExperience?: number;
    skills?: string[];
    description: string;
    isFeatured: boolean;
    applyType?: 'INTERNAL' | 'EXTERNAL';
    applyUrl?: string;
    screeningQuestions?: Array<{
        id: string;
        questionText: string;
        questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
        options?: string[];
        isRequired?: boolean;
    }>;
    status: string;
    expiresAt?: string;
    isExpired: boolean;
    createdAt: string;
}
export declare function normalizeEmploymentType(input?: any): EmploymentType;
export declare function normalizeExperienceLevel(input?: any): ExperienceLevel;
export declare class JobsService implements OnModuleInit {
    private readonly jobRepo;
    private readonly tenantRepo;
    private readonly userRepo;
    private readonly subRepo;
    constructor(jobRepo: Repository<JobPosting>, tenantRepo: Repository<Tenant>, userRepo: Repository<User>, subRepo: Repository<TenantSubscription>);
    onModuleInit(): Promise<void>;
    expireOverdueJobs(): Promise<number>;
    findAll(category?: string, query?: string, tenantId?: string, location?: string, experienceLevel?: string, minExp?: number, maxExp?: number, includeExpired?: boolean, skills?: string): Promise<JobListingDto[]>;
    findOne(id: string): Promise<JobListingDto>;
    getActiveJobsCountForTenant(tenantId: string): Promise<number>;
    getPlanJobLimitForTenant(tenantId: string): Promise<number>;
    createJob(jobData: Partial<JobListingDto>, isSuperAdmin?: boolean): Promise<JobListingDto>;
    repostJob(originalJobId: string, editedData: Partial<JobListingDto>, user?: any): Promise<JobListingDto>;
    updateJob(id: string, updateData: Partial<JobListingDto>, isSuperAdmin?: boolean): Promise<JobListingDto>;
    deleteJob(id: string): Promise<{
        success: boolean;
    }>;
    featureJob(id: string): Promise<JobListingDto>;
    private mapToDto;
}
