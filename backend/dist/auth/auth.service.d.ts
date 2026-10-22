import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { RestrictedDomain } from '../admin/entities/restricted-domain.entity';
import { LoginActivity, LoginStatus, LoginMethod } from '../admin/entities/login-activity.entity';
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
    private readonly domainRepo;
    private readonly activityRepo;
    private readonly mailService;
    private otpStore;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>, candidateRepo: Repository<Candidate>, subRepo: Repository<TenantSubscription>, planRepo: Repository<SubscriptionPlan>, domainRepo: Repository<RestrictedDomain>, activityRepo: Repository<LoginActivity>, mailService: MailService);
    private parseUserAgent;
    recordLoginActivity(data: {
        email: string;
        userId?: string | null;
        userName?: string | null;
        role?: string | null;
        status: LoginStatus | string;
        failureReason?: string | null;
        loginMethod?: LoginMethod | string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    login(email: string, rawPassword?: string, meta?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        accessToken: string;
        user: UserDto;
    }>;
    checkDomainRestriction(emailOrDomain: string): Promise<{
        restricted: boolean;
        domain: string;
        message?: string;
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
    verifyOtp(identifier: string, otpCode: string, meta?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
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
