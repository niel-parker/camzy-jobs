import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly stripeService;
    constructor(subscriptionsService: SubscriptionsService, stripeService: StripeService);
    findAllPlans(): Promise<import("./entities/subscription-plan.entity").SubscriptionPlan[]>;
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
