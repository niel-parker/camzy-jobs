import { User } from '../../users/entities/user.entity';
export declare enum ProfileVisibility {
    PUBLIC = "PUBLIC",
    ANONYMOUS = "ANONYMOUS",
    PRIVATE = "PRIVATE"
}
export declare class Candidate {
    id: string;
    user: User;
    userId: string;
    headline: string;
    summary: string;
    currentTitle: string;
    experienceYears: number;
    currentSalary: number;
    expectedSalary: number;
    noticePeriod: string;
    preferredLocations: string[];
    resumeUrl: string;
    resumes: Array<{
        id: string;
        title: string;
        resumeUrl: string;
        isDefault?: boolean;
        uploadedAt?: string;
    }>;
    savedJobIds: string[];
    resumeParsedText: string;
    skills: string[];
    experience: Array<{
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
    education: Array<{
        id?: string;
        degree: string;
        fieldOfStudy?: string;
        institution: string;
        startYear?: string;
        endYear?: string;
        grade?: string;
    }>;
    certifications: Array<{
        id?: string;
        title: string;
        issuingOrganization: string;
        issueDate?: string;
        expiryDate?: string;
        credentialUrl?: string;
    }>;
    projects: Array<{
        id?: string;
        projectTitle: string;
        client?: string;
        role?: string;
        projectDescription?: string;
        technologies?: string[];
        projectUrl?: string;
    }>;
    languages: Array<{
        language: string;
        proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
    }>;
    socialLinks: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
    visibility: ProfileVisibility;
    createdAt: Date;
    updatedAt: Date;
}
