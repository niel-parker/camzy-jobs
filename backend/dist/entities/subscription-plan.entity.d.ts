import { TenantSubscription } from './tenant-subscription.entity';
export declare enum PlanCode {
    FREE = "FREE",
    GROWTH = "GROWTH",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export declare class SubscriptionPlan {
    id: string;
    name: string;
    code: PlanCode;
    priceMonthly: number;
    priceYearly: number;
    maxActiveJobs: number;
    maxResumeDownloads: number;
    maxFeaturedJobs: number;
    maxTeamSeats: number;
    isActive: boolean;
    subscriptions: TenantSubscription[];
    createdAt: Date;
}
