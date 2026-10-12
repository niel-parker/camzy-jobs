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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscriptions_service_1 = require("./subscriptions.service");
const stripe_service_1 = require("./stripe.service");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService, stripeService) {
        this.subscriptionsService = subscriptionsService;
        this.stripeService = stripeService;
    }
    async findAllPlans() {
        return await this.subscriptionsService.findAllPlans();
    }
    async getCurrentSubscription(tenantId) {
        return await this.subscriptionsService.getCurrentSubscription(tenantId);
    }
    async getTransactions(tenantId) {
        return await this.subscriptionsService.getTransactions(tenantId);
    }
    async upgradePlan(body) {
        return await this.subscriptionsService.upgradePlan(body.tenantId || 'techcorp-global', body.planCode, body.billingCycle || 'monthly');
    }
    async purchaseTopup(body) {
        return await this.subscriptionsService.purchaseTopup(body.tenantId || 'techcorp-global', body.topupType);
    }
    async trackResumeDownload(body) {
        return await this.subscriptionsService.trackResumeDownload(body.tenantId || 'techcorp-global', body.candidateId);
    }
    createCheckoutSession(body) {
        return this.stripeService.createCheckoutSession(body.tenantId, body.planId);
    }
    handleStripeWebhook(body) {
        return this.stripeService.handleWebhookEvent(body);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available company subscription plans & quota packages' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "findAllPlans", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get live subscription status, limits, and real-time quota consumption for tenant' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch billing transaction history and invoices for tenant or platform' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    (0, swagger_1.ApiOperation)({ summary: 'Upgrade company subscription plan and generate paid invoice' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "upgradePlan", null);
__decorate([
    (0, common_1.Post)('topup'),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase extra quota pack (resumes, job slots, recruiter seats) and generate invoice' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "purchaseTopup", null);
__decorate([
    (0, common_1.Post)('consume-download'),
    (0, swagger_1.ApiOperation)({ summary: 'Record and decrement resume download from company monthly quota' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "trackResumeDownload", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe Checkout Session for company plan upgrade' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Hosted Stripe Checkout session URL generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe Webhook Listener for automated billing & quota resets' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "handleStripeWebhook", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions & Company Monetization'),
    (0, common_1.Controller)('api/v1/subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService,
        stripe_service_1.StripeService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map