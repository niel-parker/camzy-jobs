import { JobPosting } from '../../jobs/entities/job-posting.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
export declare enum ApplicationStage {
    APPLIED = "APPLIED",
    UNDER_REVIEW = "UNDER_REVIEW",
    SHORTLISTED = "SHORTLISTED",
    INTERVIEW = "INTERVIEW",
    OFFERED = "OFFERED",
    REJECTED = "REJECTED"
}
export declare class JobApplication {
    id: string;
    job: JobPosting;
    jobId: string;
    candidate: Candidate;
    candidateId: string;
    coverLetter: string;
    resumeUrlSnapshot: string;
    answersJson: Record<string, any>;
    stage: ApplicationStage;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}
