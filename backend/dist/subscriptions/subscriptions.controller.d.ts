import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { PlanCode } from './entities/subscription-plan.entity';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly stripeService;
    constructor(subscriptionsService: SubscriptionsService, stripeService: StripeService);
    findAllPlans(): Promise<import("./entities/subscription-plan.entity").SubscriptionPlan[]>;
    getCurrentSubscription(tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        tenantName: string;
        status: import("./entities/tenant-subscription.entity").SubscriptionStatus;
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
    getTransactions(tenantId?: string): Promise<import("./entities/billing-transaction.entity").BillingTransaction[]>;
    upgradePlan(body: {
        tenantId?: string;
        planCode: PlanCode;
        billingCycle?: 'monthly' | 'yearly';
    }): Promise<{
        success: boolean;
        message: string;
        subscription: {
            id: string;
            tenantId: string;
            tenantName: string;
            status: import("./entities/tenant-subscription.entity").SubscriptionStatus;
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
            type: import("./entities/billing-transaction.entity").TransactionType.SUBSCRIPTION;
            status: import("./entities/billing-transaction.entity").TransactionStatus.PAID;
            paymentMethod: string;
            planCode: PlanCode;
            quotaDetails: {
                activeJobs: number;
                resumeDownloads: number;
                teamSeats: number;
            };
            periodStart: Date;
            periodEnd: Date;
        } & import("./entities/billing-transaction.entity").BillingTransaction;
    }>;
    purchaseTopup(body: {
        tenantId?: string;
        topupType: 'RESUME_50' | 'RESUME_150' | 'JOBS_5' | 'SEATS_2';
    }): Promise<{
        success: boolean;
        message: string;
        transaction: {
            invoiceNumber: string;
            tenantId: string;
            tenantName: string;
            description: string;
            amount: number;
            currency: string;
            type: import("./entities/billing-transaction.entity").TransactionType.QUOTA_TOPUP | import("./entities/billing-transaction.entity").TransactionType.SEAT_ADDON;
            status: import("./entities/billing-transaction.entity").TransactionStatus.PAID;
            paymentMethod: string;
            planCode: string;
            quotaDetails: any;
            periodStart: Date;
            periodEnd: Date;
        } & import("./entities/billing-transaction.entity").BillingTransaction;
        subscription: {
            id: string;
            tenantId: string;
            tenantName: string;
            status: import("./entities/tenant-subscription.entity").SubscriptionStatus;
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
    trackResumeDownload(body: {
        tenantId?: string;
        candidateId?: string;
    }): Promise<{
        success: boolean;
        quotaExceeded: boolean;
        used: number;
        limit: number;
        remaining: number;
        message: string;
    }>;
    createCheckoutSession(body: {
        tenantId: string;
        planId: string;
    }): Promise<{
        checkoutUrl: string;
        sessionId: string;
    }>;
    handleStripeWebhook(body: {
        type: string;
        data: any;
    }): Promise<{
        status: string;
    }>;
}
