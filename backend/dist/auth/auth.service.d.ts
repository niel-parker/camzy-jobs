import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { MailService } from '../mail/mail.service';
export interface UserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CONSULTANCY_ADMIN' | 'AGENCY_AGENT' | 'CANDIDATE';
    phoneNumber?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    lastLoginAt?: Date | string;
    createdAt?: Date | string;
    tenantId?: string;
    tenantName?: string;
    tenantType?: 'COMPANY' | 'CONSULTANCY';
    candidateId?: string;
    avatarUrl?: string;
}
export declare class AuthService {
    private readonly userRepo;
    private readonly tenantRepo;
    private readonly candidateRepo;
    private readonly subRepo;
    private readonly planRepo;
    private readonly mailService;
    private otpStore;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>, candidateRepo: Repository<Candidate>, subRepo: Repository<TenantSubscription>, planRepo: Repository<SubscriptionPlan>, mailService: MailService);
    login(email: string, rawPassword?: string): Promise<{
        accessToken: string;
        user: UserDto;
    }>;
    registerCompany(body: {
        companyName: string;
        industry?: string;
        website?: string;
        taxId?: string;
        adminName?: string;
        adminEmail: string;
        adminPassword?: string;
        logoUrl?: string;
        description?: string;
        selectedPlan?: string;
    }): Promise<{
        accessToken: string;
        user: UserDto;
        tenant: Tenant;
    }>;
    registerCandidate(body: {
        fullName: string;
        email: string;
        password?: string;
        headline?: string;
        experienceLevel?: string;
        expectedSalary?: string;
        skills?: string;
    }): Promise<{
        accessToken: string;
        user: UserDto;
    }>;
    getCurrentUser(token?: string): Promise<UserDto>;
    requestOtp(identifier: string): Promise<{
        success: boolean;
        message: string;
        expiresInSeconds: number;
        isEmail: boolean;
        otpCode: string;
    }>;
    verifyOtp(identifier: string, otpCode: string): Promise<{
        accessToken: string;
        user: UserDto;
        isNewAccount: boolean;
        message: string;
    }>;
    sendJobShareEmail(body: {
        toEmail: string;
        senderName?: string;
        jobTitle: string;
        companyName?: string;
        jobUrl: string;
        personalNote?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    private mapToDto;
}
