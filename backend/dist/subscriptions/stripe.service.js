"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
let StripeService = StripeService_1 = class StripeService {
    constructor() {
        this.logger = new common_1.Logger(StripeService_1.name);
        this.apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51UOPRtIeu7vvxPLc3VaRMJDdlMzK00tDlUoFZUlqWpIccZ1xHoCz4hxkL7qFoMJl3LrXiH2aMK1Zf2qxf4wszWfS00pxU3Dt0W';
    }
    async createCheckoutSession(tenantId, planId) {
        try {
            const params = new URLSearchParams();
            params.append('mode', 'subscription');
            params.append('line_items[0][price_data][currency]', 'usd');
            params.append('line_items[0][price_data][product_data][name]', `Company Subscription Plan (${planId || 'PRO'})`);
            params.append('line_items[0][price_data][unit_amount]', '19900');
            params.append('line_items[0][price_data][recurring][interval]', 'month');
            params.append('line_items[0][quantity]', '1');
            params.append('success_url', 'http://localhost:3000/employer/billing?success=true&session_id={CHECKOUT_SESSION_ID}');
            params.append('cancel_url', 'http://localhost:3000/employer/billing?canceled=true');
            params.append('client_reference_id', tenantId || 'default-tenant');
            const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            if (!res.ok) {
                const errJson = await res.json();
                this.logger.error('Stripe API error response:', errJson);
                throw new Error(errJson?.error?.message || 'Failed to create Stripe Checkout Session');
            }
            const session = await res.json();
            this.logger.log(`Created Stripe Checkout Session: ${session.id}, URL: ${session.url}`);
            return {
                sessionId: session.id,
                checkoutUrl: session.url,
            };
        }
        catch (err) {
            this.logger.error(`Stripe session creation error: ${err.message}`);
            throw err;
        }
    }
    async handleWebhookEvent(event) {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                this.logger.log('💳 Stripe Payment Succeeded:', event.data);
                return { status: 'subscription_renewed' };
            case 'customer.subscription.updated':
                this.logger.log('🔄 Stripe Subscription Updated:', event.data);
                return { status: 'subscription_updated' };
            case 'customer.subscription.deleted':
                this.logger.log('⚠️ Stripe Subscription Canceled:', event.data);
                return { status: 'subscription_canceled' };
            default:
                return { status: 'event_ignored' };
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)()
], StripeService);
//# sourceMappingURL=stripe.service.js.map