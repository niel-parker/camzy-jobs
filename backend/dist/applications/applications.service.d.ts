import { Repository } from 'typeorm';
import { ApplicationStage, JobApplication } from './entities/job-application.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
export interface ApplicationDto {
    id: string;
    jobId: string;
    jobTitle: string;
    candidateId: string;
    candidateName: string;
    candidateHeadline: string;
    coverLetter?: string;
    resumeUrlSnapshot: string;
    stage: ApplicationStage;
    rating: number;
    createdAt: string;
}
export declare class ApplicationsService {
    private readonly appRepo;
    private readonly jobRepo;
    private readonly candidateRepo;
    constructor(appRepo: Repository<JobApplication>, jobRepo: Repository<JobPosting>, candidateRepo: Repository<Candidate>);
    findAllByJob(jobId?: string): Promise<ApplicationDto[]>;
    submitApplication(data: Partial<ApplicationDto> & {
        answersJson?: Record<string, any>;
    }): Promise<ApplicationDto>;
    updateStage(id: string, stage: ApplicationStage, rating?: number): Promise<ApplicationDto>;
    private mapToDto;
}
