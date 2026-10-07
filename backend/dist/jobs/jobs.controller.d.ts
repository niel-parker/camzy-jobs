import { JobListingDto, JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(category?: string, query?: string): Promise<JobListingDto[]>;
    findOne(id: string): Promise<JobListingDto>;
    createJob(body: Partial<JobListingDto>): Promise<JobListingDto>;
    featureJob(id: string): Promise<JobListingDto>;
}
