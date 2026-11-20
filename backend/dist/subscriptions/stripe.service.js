"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const billing_transaction_entity_1 = require("./entities/billing-transaction.entity");
const tenant_subscription_entity_1 = require("./entities/tenant-subscription.entity");
const subscriptions_service_1 = require("./subscriptions.service");
let StripeService = StripeService_1 = class StripeService {
    constructor(planRepo, txnRepo, subRepo, subscriptionsService) {
        this.planRepo = planRepo;
        this.txnRepo = txnRepo;
        this.subRepo = subRepo;
        this.subscriptionsService = subscriptionsService;
        this.logger = new common_1.Logger(StripeService_1.name);
        this.apiKey = process.env.STRIPE_SECRET_KEY || '';
    }
    async createCheckoutSession(dto) {
        if (!this.apiKey) {
            throw new Error('Stripe API key (STRIPE_SECRET_KEY) is not configured in backend environment.');
        }
        const tenantId = dto.tenantId || 'techcorp-global';
        const billingCycle = dto.billingCycle || 'monthly';
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const successUrl = dto.successUrl || `${baseUrl}/employer/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = dto.cancelUrl || `${baseUrl}/employer/billing?canceled=true`;
        const params = new URLSearchParams();
        params.append('client_reference_id', tenantId);
        params.append('success_url', successUrl);
        params.append('cancel_url', cancelUrl);
        if (dto.topupType) {
            params.append('mode', 'payment');
            let name = '';
            let amountPaise = 0;
            switch (dto.topupType) {
                case 'RESUME_50':
                    name = '+50 Candidate Resume Downloads Pack';
                    amountPaise = 2900;
                    break;
                case 'RESUME_150':
                    name = '+150 Candidate Resume Downloads Pack';
                    amountPaise = 6900;
                    break;
                case 'JOBS_5':
                    name = '+5 Active Job Posting Slots';
                    amountPaise = 4900;
                    break;
                case 'SEATS_2':
                    name = '+2 Team Recruiter Seats Add-on';
                    amountPaise = 3900;
                    break;
                default:
                    throw new common_1.BadRequestException('Invalid topup type');
            }
            params.append('line_items[0][price_data][currency]', 'inr');
            params.append('line_items[0][price_data][product_data][name]', name);
            params.append('line_items[0][price_data][unit_amount]', String(amountPaise));
            params.append('line_items[0][quantity]', '1');
            params.append('metadata[tenantId]', tenantId);
            params.append('metadata[type]', 'QUOTA_TOPUP');
            params.append('metadata[topupType]', dto.topupType);
        }
        else {
            const planCodeOrId = dto.planCodeOrId || 'PRO';
            let plan = await this.planRepo.findOne({ where: { code: planCodeOrId } });
            if (!plan) {
                plan = await this.planRepo.findOne({ where: { id: planCodeOrId } });
            }
            if (!plan) {
                plan = await this.planRepo.findOne({ where: { isActive: true }, order: { priceMonthly: 'ASC' } });
            }
            if (!plan) {
                throw new common_1.NotFoundException(`Subscription plan ${planCodeOrId} not found`);
            }
            const priceMonthly = Number(plan.priceMonthly);
            const priceYearly = Number(plan.priceYearly || Math.round(priceMonthly * 0.8));
            const unitAmountPaise = billingCycle === 'yearly'
                ? Math.max(100, Math.round(priceYearly * 12 * 100))
                : Math.max(100, Math.round(priceMonthly * 100));
            params.append('mode', 'subscription');
            params.append('line_items[0][price_data][currency]', 'inr');
            params.append('line_items[0][price_data][product_data][name]', `${plan.name} (${billingCycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'})`);
            params.append('line_items[0][price_data][unit_amount]', String(unitAmountPaise));
            params.append('line_items[0][price_data][recurring][interval]', billingCycle === 'yearly' ? 'year' : 'month');
            params.append('line_items[0][quantity]', '1');
            params.append('metadata[tenantId]', tenantId);
            params.append('metadata[type]', 'SUBSCRIPTION');
            params.append('metadata[planId]', plan.id);
            params.append('metadata[planCode]', plan.code);
            params.append('metadata[billingCycle]', billingCycle);
        }
        try {
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
    async verifyAndFulfillSession(sessionId) {
        if (!this.apiKey) {
            throw new Error('Stripe API key (STRIPE_SECRET_KEY) not configured.');
        }
        if (!sessionId) {
            throw new common_1.BadRequestException('Session ID is required');
        }
        const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err?.error?.message || 'Failed to retrieve Stripe session');
        }
        const session = await res.json();
        this.logger.log(`Verifying Stripe Session: ${session.id}, status: ${session.status}, payment_status: ${session.payment_status}`);
        const isPaid = session.payment_status === 'paid' || session.status === 'complete';
        if (!isPaid) {
            return {
                success: false,
                paymentStatus: session.payment_status,
                message: 'Payment has not been completed yet.',
                session,
            };
        }
        const existingTxn = await this.txnRepo.findOne({
            where: { paymentMethod: `Stripe Checkout (${sessionId})` },
        });
        if (existingTxn) {
            const currentSub = await this.subscriptionsService.getCurrentSubscription(existingTxn.tenantId);
            return {
                success: true,
                alreadyFulfilled: true,
                message: 'Subscription was already activated for this Stripe session.',
                transaction: existingTxn,
                subscription: currentSub,
            };
        }
        const metadata = session.metadata || {};
        const tenantId = metadata.tenantId || session.client_reference_id || 'techcorp-global';
        const type = metadata.type || 'SUBSCRIPTION';
        const paymentLabel = `Stripe Checkout (${sessionId})`;
        if (type === 'QUOTA_TOPUP') {
            const topupType = metadata.topupType || 'RESUME_50';
            const result = await this.subscriptionsService.purchaseTopup(tenantId, topupType, paymentLabel);
            return {
                success: true,
                message: 'Stripe quota purchase fulfilled successfully!',
                transaction: result.transaction,
                subscription: result.subscription,
            };
        }
        else {
            const planCodeOrId = metadata.planCode || metadata.planId || 'PRO';
            const billingCycle = metadata.billingCycle || 'monthly';
            const result = await this.subscriptionsService.upgradePlan(tenantId, planCodeOrId, billingCycle, paymentLabel);
            return {
                success: true,
                message: 'Stripe subscription upgrade fulfilled successfully!',
                transaction: result.transaction,
                subscription: result.subscription,
            };
        }
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Received Stripe Webhook Event: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data?.object;
                if (session?.id) {
                    try {
                        await this.verifyAndFulfillSession(session.id);
                        this.logger.log(`Successfully fulfilled checkout session ${session.id} from webhook`);
                    }
                    catch (e) {
                        this.logger.error(`Error fulfilling webhook checkout session: ${e.message}`);
                    }
                }
                return { status: 'session_fulfilled' };
            case 'invoice.payment_succeeded':
                this.logger.log('Stripe Recurring Invoice Payment Succeeded:', event.data?.object?.id);
                return { status: 'subscription_renewed' };
            case 'customer.subscription.deleted':
                this.logger.log('Stripe Subscription Canceled:', event.data?.object?.id);
                return { status: 'subscription_canceled' };
            default:
                return { status: 'event_ignored' };
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(billing_transaction_entity_1.BillingTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => subscriptions_service_1.SubscriptionsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        subscriptions_service_1.SubscriptionsService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map