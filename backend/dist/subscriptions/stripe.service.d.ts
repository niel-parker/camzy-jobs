export declare class StripeService {
    createCheckoutSession(tenantId: string, planId: string): Promise<{
        checkoutUrl: string;
        sessionId: string;
    }>;
    handleWebhookEvent(event: {
        type: string;
        data: any;
    }): Promise<{
        status: string;
    }>;
}
