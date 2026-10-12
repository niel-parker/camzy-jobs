import { Repository } from 'typeorm';
import { SubscriptionPlan, PlanCode } from './entities/subscription-plan.entity';
import { TenantSubscription, SubscriptionStatus } from './entities/tenant-subscription.entity';
import { BillingTransaction, TransactionType, TransactionStatus } from './entities/billing-transaction.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { User } from '../users/entities/user.entity';
export declare class SubscriptionsService {
    private readonly planRepo;
    private readonly subRepo;
    private readonly txnRepo;
    private readonly tenantRepo;
    private readonly jobRepo;
    private readonly userRepo;
    constructor(planRepo: Repository<SubscriptionPlan>, subRepo: Repository<TenantSubscription>, txnRepo: Repository<BillingTransaction>, tenantRepo: Repository<Tenant>, jobRepo: Repository<JobPosting>, userRepo: Repository<User>);
    findAllPlans(): Promise<SubscriptionPlan[]>;
    resolveTenant(tenantIdOrSlug?: string): Promise<Tenant>;
    getCurrentSubscription(tenantIdOrSlug?: string): Promise<{
        id: string;
        tenantId: string;
        tenantName: string;
        status: SubscriptionStatus;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        plan: {
            id: string;
            name: string;
            code: PlanCode;
            priceMonthly: number;
            priceYearly: number;
            maxActiveJobs: number;
            maxResumeDownloads: number;
            maxTeamSeats: number;
        };
        quotas: {
            activeJobs: {
                used: number;
                limit: number;
                remaining: number;
                percentUsed: number;
            };
            resumeDownloads: {
                used: number;
                limit: number;
                remaining: number;
                percentUsed: number;
            };
            teamSeats: {
                used: number;
                limit: number;
                remaining: number;
                percentUsed: number;
            };
        };
    }>;
    getTransactions(tenantIdOrSlug?: string): Promise<BillingTransaction[]>;
    trackResumeDownload(tenantIdOrSlug?: string, candidateId?: string): Promise<{
        success: boolean;
        quotaExceeded: boolean;
        used: number;
        limit: number;
        remaining: number;
        message: string;
    }>;
    upgradePlan(tenantIdOrSlug: string, planCode: PlanCode, billingCycle?: 'monthly' | 'yearly'): Promise<{
        success: boolean;
        message: string;
        subscription: {
            id: string;
            tenantId: string;
            tenantName: string;
            status: SubscriptionStatus;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            plan: {
                id: string;
                name: string;
                code: PlanCode;
                priceMonthly: number;
                priceYearly: number;
                maxActiveJobs: number;
                maxResumeDownloads: number;
                maxTeamSeats: number;
            };
            quotas: {
                activeJobs: {
                    used: number;
                    limit: number;
                    remaining: number;
                    percentUsed: number;
                };
                resumeDownloads: {
                    used: number;
                    limit: number;
                    remaining: number;
                    percentUsed: number;
                };
                teamSeats: {
                    used: number;
                    limit: number;
                    remaining: number;
                    percentUsed: number;
                };
            };
        };
        transaction: {
            invoiceNumber: string;
            tenantId: string;
            tenantName: string;
            description: string;
            amount: number;
            currency: string;
            type: TransactionType.SUBSCRIPTION;
            status: TransactionStatus.PAID;
            paymentMethod: string;
            planCode: PlanCode;
            quotaDetails: {
                activeJobs: number;
                resumeDownloads: number;
                teamSeats: number;
            };
            periodStart: Date;
            periodEnd: Date;
        } & BillingTransaction;
    }>;
    purchaseTopup(tenantIdOrSlug: string, topupType: 'RESUME_50' | 'RESUME_150' | 'JOBS_5' | 'SEATS_2'): Promise<{
        success: boolean;
        message: string;
        transaction: {
            invoiceNumber: string;
            tenantId: string;
            tenantName: string;
            description: string;
            amount: number;
            currency: string;
            type: TransactionType.QUOTA_TOPUP | TransactionType.SEAT_ADDON;
            status: TransactionStatus.PAID;
            paymentMethod: string;
            planCode: string;
            quotaDetails: any;
            periodStart: Date;
            periodEnd: Date;
        } & BillingTransaction;
        subscription: {
            id: string;
            tenantId: string;
            tenantName: string;
            status: SubscriptionStatus;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            plan: {
                id: string;
                name: string;
                code: PlanCode;
                priceMonthly: number;
                priceYearly: number;
                maxActiveJobs: number;
                maxResumeDownloads: number;
                maxTeamSeats: number;
            };
            quotas: {
                activeJobs: {
                    used: number;
                    limit: number;
                    remaining: number;
                    percentUsed: number;
                };
                resumeDownloads: {
                    used: number;
                    limit: number;
                    remaining: number;
                    percentUsed: number;
                };
                teamSeats: {
                    used: number;
                    limit: number;
                    remaining: number;
                    percentUsed: number;
                };
            };
        };
    }>;
}
