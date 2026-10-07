"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
let StripeService = class StripeService {
    async createCheckoutSession(tenantId, planId) {
        const mockSessionId = `cs_test_${Date.now()}`;
        const mockCheckoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;
        return {
            sessionId: mockSessionId,
            checkoutUrl: mockCheckoutUrl,
        };
    }
    async handleWebhookEvent(event) {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                console.log('💳 Stripe Payment Succeeded:', event.data);
                return { status: 'subscription_renewed' };
            case 'customer.subscription.updated':
                console.log('🔄 Stripe Subscription Updated:', event.data);
                return { status: 'subscription_updated' };
            case 'customer.subscription.deleted':
                console.log('⚠️ Stripe Subscription Canceled:', event.data);
                return { status: 'subscription_canceled' };
            default:
                return { status: 'event_ignored' };
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)()
], StripeService);
//# sourceMappingURL=stripe.service.js.map