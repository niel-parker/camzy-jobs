import { JobListingDto, JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(category?: string, query?: string, tenantId?: string, location?: string, experienceLevel?: string, minExp?: string, maxExp?: string, includeExpired?: string, skills?: string): Promise<JobListingDto[]>;
    findOne(id: string): Promise<JobListingDto>;
    createJob(body: Partial<JobListingDto>, req: any): Promise<JobListingDto>;
    repostJob(id: string, body: Partial<JobListingDto>, req: any): Promise<JobListingDto>;
    updateJob(id: string, body: Partial<JobListingDto>, req: any): Promise<JobListingDto>;
    deleteJob(id: string): Promise<{
        success: boolean;
    }>;
    featureJob(id: string): Promise<JobListingDto>;
}
