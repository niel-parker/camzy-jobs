import { Tenant } from './tenant.entity';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    COMPANY_ADMIN = "COMPANY_ADMIN",
    RECRUITER = "RECRUITER",
    CONSULTANCY_ADMIN = "CONSULTANCY_ADMIN",
    AGENCY_AGENT = "AGENCY_AGENT",
    CANDIDATE = "CANDIDATE"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BANNED = "BANNED"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber: string;
    avatarUrl: string;
    isEmailVerified: boolean;
    status: UserStatus;
    tenant: Tenant;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
