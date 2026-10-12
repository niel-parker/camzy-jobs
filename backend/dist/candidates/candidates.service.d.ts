import { Repository } from 'typeorm';
import { Candidate, ProfileVisibility } from './entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
export interface CandidateProfileDto {
    id: string;
    userId: string;
    headline: string;
    summary: string;
    currentTitle: string;
    experienceYears: number;
    currentSalary?: number;
    expectedSalary?: number;
    noticePeriod?: string;
    preferredLocations?: string[];
    resumeUrl?: string;
    resumes?: Array<{
        id: string;
        title: string;
        resumeUrl: string;
        isDefault?: boolean;
        uploadedAt?: string;
    }>;
    savedJobIds?: string[];
    skills: string[];
    user?: {
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        avatarUrl?: string;
        isEmailVerified?: boolean;
        isPhoneVerified?: boolean;
        lastLoginAt?: Date | string;
        createdAt?: Date | string;
    };
    experience?: Array<{
        id?: string;
        designation: string;
        companyName: string;
        isCurrentJob?: boolean;
        startDate?: string;
        endDate?: string;
        noticePeriod?: string;
        location?: string;
        jobSummary?: string;
        rolesAndResponsibilities?: string;
    }>;
    education?: Array<{
        id?: string;
        degree: string;
        fieldOfStudy?: string;
        institution: string;
        startYear?: string;
        endYear?: string;
        grade?: string;
    }>;
    certifications?: Array<{
        id?: string;
        title: string;
        issuingOrganization: string;
        issueDate?: string;
        expiryDate?: string;
        credentialUrl?: string;
    }>;
    projects?: Array<{
        id?: string;
        projectTitle: string;
        client?: string;
        role?: string;
        projectDescription?: string;
        technologies?: string[];
        projectUrl?: string;
    }>;
    languages?: Array<{
        language: string;
        proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
    }>;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
    visibility: ProfileVisibility;
}
export declare class CandidatesService {
    private readonly candidateRepo;
    private readonly userRepo;
    private readonly jobRepo;
    constructor(candidateRepo: Repository<Candidate>, userRepo: Repository<User>, jobRepo: Repository<JobPosting>);
    findAll(params?: {
        skill?: string;
        noticePeriod?: string;
        city?: string;
        minExp?: number;
        maxSalary?: number;
    }): Promise<CandidateProfileDto[]>;
    findOne(id: string): Promise<CandidateProfileDto>;
    updateProfile(id: string, partial: Partial<CandidateProfileDto>): Promise<CandidateProfileDto>;
    toggleSaveJob(candidateOrUserId: string, jobId: string): Promise<{
        saved: boolean;
        savedJobIds: string[];
    }>;
    getSavedJobs(candidateOrUserId: string): Promise<any[]>;
    private mapToDto;
}
