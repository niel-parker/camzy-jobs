import { Repository } from 'typeorm';
import { Candidate, ProfileVisibility } from './entities/candidate.entity';
export interface CandidateProfileDto {
    id: string;
    userId: string;
    headline: string;
    summary: string;
    currentTitle: string;
    experienceYears: number;
    expectedSalary: number;
    resumeUrl?: string;
    skills: string[];
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
    constructor(candidateRepo: Repository<Candidate>);
    findAll(skill?: string): Promise<CandidateProfileDto[]>;
    findOne(id: string): Promise<CandidateProfileDto>;
    updateProfile(id: string, partial: Partial<CandidateProfileDto>): Promise<CandidateProfileDto>;
    private mapToDto;
}
