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
    expectedSalary: number;
    resumeUrl: string;
    resumeParsedText: string;
    skills: string[];
    visibility: ProfileVisibility;
    createdAt: Date;
    updatedAt: Date;
}
