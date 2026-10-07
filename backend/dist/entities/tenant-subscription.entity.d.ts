import { Tenant } from './tenant.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED"
}
export declare class TenantSubscription {
    id: string;
    tenant: Tenant;
    tenantId: string;
    plan: SubscriptionPlan;
    planId: string;
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    activeJobsUsed: number;
    resumeDownloadsUsed: number;
    featuredJobsUsed: number;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    createdAt: Date;
    updatedAt: Date;
}
