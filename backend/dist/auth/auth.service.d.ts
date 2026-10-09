import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
export interface UserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CONSULTANCY_ADMIN' | 'AGENCY_AGENT' | 'CANDIDATE';
    tenantId?: string;
    tenantName?: string;
    tenantType?: 'COMPANY' | 'CONSULTANCY';
    avatarUrl?: string;
}
export declare class AuthService {
    private readonly userRepo;
    private readonly tenantRepo;
    private readonly candidateRepo;
    private readonly subRepo;
    private readonly planRepo;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>, candidateRepo: Repository<Candidate>, subRepo: Repository<TenantSubscription>, planRepo: Repository<SubscriptionPlan>);
    login(email: string, password_hash: string): Promise<{
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
    private mapToDto;
}
