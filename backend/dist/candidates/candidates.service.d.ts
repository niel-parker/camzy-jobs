import { Repository } from 'typeorm';
import { Candidate, ProfileVisibility } from './entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { MailService } from '../mail/mail.service';
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
        url?: string;
        isDefault?: boolean;
        uploadedAt?: string;
    }>;
    savedJobIds?: string[];
    skills: string[];
    updatedAt?: Date | string;
    createdAt?: Date | string;
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
        title?: string;
        companyName: string;
        company?: string;
        isCurrentJob?: boolean;
        isCurrent?: boolean;
        startDate?: string;
        endDate?: string;
        noticePeriod?: string;
        location?: string;
        jobSummary?: string;
        rolesAndResponsibilities?: string;
        description?: string;
    }>;
    education?: Array<{
        id?: string;
        degree: string;
        degree_title?: string;
        fieldOfStudy?: string;
        institution: string;
        startYear?: string;
        endYear?: string;
        year?: string;
        grade?: string;
        result?: string;
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
    private readonly tenantRepo;
    private readonly mailService;
    constructor(candidateRepo: Repository<Candidate>, userRepo: Repository<User>, jobRepo: Repository<JobPosting>, tenantRepo: Repository<Tenant>, mailService: MailService);
    findAll(params?: {
        skill?: string;
        query?: string;
        excludeKeywords?: string;
        searchIn?: string;
        noticePeriod?: string;
        city?: string;
        location?: string;
        minExp?: number;
        maxExp?: number;
        minSalary?: number;
        maxSalary?: number;
        company?: string;
        designation?: string;
        activeIn?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
    }): Promise<{
        candidates: CandidateProfileDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<CandidateProfileDto>;
    updateProfile(id: string, partial: Partial<CandidateProfileDto>): Promise<CandidateProfileDto>;
    toggleSaveJob(candidateOrUserId: string, jobId: string): Promise<{
        saved: boolean;
        savedJobIds: string[];
    }>;
    getSavedJobs(candidateOrUserId: string): Promise<any[]>;
    private mapToDto;
    inviteCandidate(dto: {
        candidateId?: string;
        candidateIds?: string[];
        candidateEmail?: string;
        candidateEmails?: string[];
        jobId?: string;
        jobTitle?: string;
        companyName?: string;
        location?: string;
        salary?: string;
        message?: string;
        subject?: string;
    }, currentUser?: any): Promise<{
        success: boolean;
        message: string;
        sentCount: number;
        failedCount: number;
        recipients: Array<{
            email: string;
            name: string;
        }>;
    }>;
}
