import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
export declare enum EmploymentType {
    FULL_TIME = "Full-time",
    PART_TIME = "Part-time",
    CONTRACT = "Contract",
    INTERNSHIP = "Internship",
    REMOTE = "Remote"
}
export declare enum ExperienceLevel {
    ENTRY = "Entry",
    MID = "Mid",
    SENIOR = "Senior",
    LEAD = "Lead",
    EXECUTIVE = "Executive"
}
export declare enum JobStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    PUBLISHED = "PUBLISHED",
    EXPIRED = "EXPIRED",
    ARCHIVED = "ARCHIVED"
}
export declare class JobPosting {
    id: string;
    tenant: Tenant;
    tenantId: string;
    postedByUser: User;
    postedByUserId: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    employmentType: EmploymentType;
    experienceLevel: ExperienceLevel;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    isSalaryVisible: boolean;
    locationCountry: string;
    locationCity: string;
    isRemote: boolean;
    isFeatured: boolean;
    applyType: 'INTERNAL' | 'EXTERNAL';
    applyUrl: string;
    screeningQuestions: Array<{
        id: string;
        questionText: string;
        questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
        options?: string[];
        isRequired?: boolean;
    }>;
    status: JobStatus;
    expiresAt: Date;
    viewsCount: number;
    applicationsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
