import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { BillingTransaction } from './entities/billing-transaction.entity';
import { TenantSubscription } from './entities/tenant-subscription.entity';
import { SubscriptionsService } from './subscriptions.service';
export interface CreateCheckoutDto {
    tenantId?: string;
    planCodeOrId?: string;
    billingCycle?: 'monthly' | 'yearly';
    topupType?: 'RESUME_50' | 'RESUME_150' | 'JOBS_5' | 'SEATS_2';
    successUrl?: string;
    cancelUrl?: string;
}
export declare class StripeService {
    private readonly planRepo;
    private readonly txnRepo;
    private readonly subRepo;
    private readonly subscriptionsService;
    private readonly logger;
    private readonly apiKey;
    constructor(planRepo: Repository<SubscriptionPlan>, txnRepo: Repository<BillingTransaction>, subRepo: Repository<TenantSubscription>, subscriptionsService: SubscriptionsService);
    createCheckoutSession(dto: CreateCheckoutDto): Promise<{
        checkoutUrl: string;
        sessionId: string;
    }>;
    verifyAndFulfillSession(sessionId: string): Promise<any>;
    handleWebhookEvent(event: {
        type: string;
        data: any;
    }): Promise<{
        status: string;
    }>;
}
