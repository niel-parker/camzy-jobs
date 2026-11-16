import { Repository } from 'typeorm';
import { ApplicationStage, JobApplication } from './entities/job-application.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { User } from '../users/entities/user.entity';
export interface ApplicationDto {
    id: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    companyLogo?: string;
    tenantId?: string;
    location?: string;
    employmentType?: string;
    category?: string;
    candidateId: string;
    candidateName: string;
    candidateEmail?: string;
    candidatePhone?: string;
    candidateHeadline: string;
    coverLetter?: string;
    resumeUrlSnapshot: string;
    stage: ApplicationStage;
    rating: number;
    createdAt: string;
}
export interface FindApplicationsOptions {
    jobId?: string;
    tenantId?: string;
    candidateId?: string;
    userId?: string;
    currentUser?: {
        id: string;
        role: string;
        tenantId?: string;
        candidateId?: string;
    } | null;
}
export declare class ApplicationsService {
    private readonly appRepo;
    private readonly jobRepo;
    private readonly candidateRepo;
    private readonly userRepo;
    constructor(appRepo: Repository<JobApplication>, jobRepo: Repository<JobPosting>, candidateRepo: Repository<Candidate>, userRepo: Repository<User>);
    findAll(options?: FindApplicationsOptions): Promise<ApplicationDto[]>;
    findAllByJob(jobId?: string): Promise<ApplicationDto[]>;
    submitApplication(data: Partial<ApplicationDto> & {
        answersJson?: Record<string, any>;
    }, currentUser?: {
        id: string;
        role: string;
        candidateId?: string;
    } | null): Promise<ApplicationDto>;
    updateStage(id: string, stage: ApplicationStage, rating?: number, currentUser?: {
        id: string;
        role: string;
        tenantId?: string;
    } | null): Promise<ApplicationDto>;
    private mapToDto;
}
