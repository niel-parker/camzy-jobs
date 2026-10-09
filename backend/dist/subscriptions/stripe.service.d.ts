export declare class StripeService {
    private readonly logger;
    private readonly apiKey;
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
