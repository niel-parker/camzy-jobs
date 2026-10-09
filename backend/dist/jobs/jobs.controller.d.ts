import { JobListingDto, JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(category?: string, query?: string): Promise<JobListingDto[]>;
    findOne(id: string): Promise<JobListingDto>;
    createJob(body: Partial<JobListingDto>): Promise<JobListingDto>;
    updateJob(id: string, body: Partial<JobListingDto>): Promise<JobListingDto>;
    deleteJob(id: string): Promise<{
        success: boolean;
    }>;
    featureJob(id: string): Promise<JobListingDto>;
}
