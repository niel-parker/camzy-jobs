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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const tenant_subscription_entity_1 = require("./entities/tenant-subscription.entity");
const billing_transaction_entity_1 = require("./entities/billing-transaction.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SubscriptionsService = class SubscriptionsService {
    constructor(planRepo, subRepo, txnRepo, tenantRepo, jobRepo, userRepo) {
        this.planRepo = planRepo;
        this.subRepo = subRepo;
        this.txnRepo = txnRepo;
        this.tenantRepo = tenantRepo;
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
    }
    async findAllPlans() {
        return await this.planRepo.find({
            where: { isActive: true },
            order: { priceMonthly: 'ASC' },
        });
    }
    async resolveTenant(tenantIdOrSlug) {
        if (tenantIdOrSlug && tenantIdOrSlug !== 'undefined' && tenantIdOrSlug !== 'null') {
            const byId = await this.tenantRepo.findOne({ where: { id: tenantIdOrSlug } });
            if (byId)
                return byId;
            const bySlug = await this.tenantRepo.findOne({ where: { slug: tenantIdOrSlug } });
            if (bySlug)
                return bySlug;
            const byName = await this.tenantRepo.createQueryBuilder('t')
                .where('LOWER(t.name) LIKE LOWER(:name)', { name: `%${tenantIdOrSlug}%` })
                .getOne();
            if (byName)
                return byName;
        }
        const defaultTenant = await this.tenantRepo.findOne({ where: { slug: 'techcorp-global' } });
        if (defaultTenant)
            return defaultTenant;
        const firstTenant = await this.tenantRepo.findOne({ where: {} });
        if (!firstTenant)
            throw new common_1.NotFoundException('No tenants found in system');
        return firstTenant;
    }
    async getCurrentSubscription(tenantIdOrSlug) {
        const tenant = await this.resolveTenant(tenantIdOrSlug);
        let sub = await this.subRepo.findOne({
            where: { tenantId: tenant.id },
            relations: { plan: true },
        });
        if (!sub) {
            let plan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.PRO } });
            if (!plan)
                plan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.FREE } });
            if (!plan) {
                plan = await this.planRepo.save({
                    name: 'Professional Employer',
                    code: subscription_plan_entity_1.PlanCode.PRO,
                    priceMonthly: 199,
                    priceYearly: 159,
                    maxActiveJobs: 15,
                    maxResumeDownloads: 150,
                    maxFeaturedJobs: 0,
                    maxTeamSeats: 5,
                    isActive: true,
                });
            }
            const now = new Date();
            const monthLater = new Date(now.getTime() + 30 * 86400000);
            sub = await this.subRepo.save({
                tenantId: tenant.id,
                planId: plan.id,
                status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE,
                activeJobsUsed: 0,
                resumeDownloadsUsed: 0,
                featuredJobsUsed: 0,
                currentPeriodStart: now,
                currentPeriodEnd: monthLater,
            });
            sub.plan = plan;
        }
        const liveActiveJobs = await this.jobRepo.count({
            where: { tenantId: tenant.id, status: job_posting_entity_1.JobStatus.PUBLISHED },
        });
        const liveTeamSeats = await this.userRepo.count({
            where: { tenantId: tenant.id },
        });
        if (sub.activeJobsUsed !== liveActiveJobs) {
            sub.activeJobsUsed = liveActiveJobs;
            await this.subRepo.save(sub);
        }
        const plan = sub.plan;
        return {
            id: sub.id,
            tenantId: tenant.id,
            tenantName: tenant.name,
            status: sub.status,
            currentPeriodStart: sub.currentPeriodStart,
            currentPeriodEnd: sub.currentPeriodEnd,
            plan: {
                id: plan.id,
                name: plan.name,
                code: plan.code,
                priceMonthly: Number(plan.priceMonthly),
                priceYearly: Number(plan.priceYearly),
                maxActiveJobs: plan.maxActiveJobs,
                maxResumeDownloads: plan.maxResumeDownloads,
                maxTeamSeats: plan.maxTeamSeats,
            },
            quotas: {
                activeJobs: {
                    used: liveActiveJobs,
                    limit: plan.maxActiveJobs,
                    remaining: Math.max(0, plan.maxActiveJobs - liveActiveJobs),
                    percentUsed: Math.min(100, Math.round((liveActiveJobs / (plan.maxActiveJobs || 1)) * 100)),
                },
                resumeDownloads: {
                    used: sub.resumeDownloadsUsed,
                    limit: plan.maxResumeDownloads,
                    remaining: Math.max(0, plan.maxResumeDownloads - sub.resumeDownloadsUsed),
                    percentUsed: Math.min(100, Math.round((sub.resumeDownloadsUsed / (plan.maxResumeDownloads || 1)) * 100)),
                },
                teamSeats: {
                    used: Math.max(1, liveTeamSeats),
                    limit: plan.maxTeamSeats,
                    remaining: Math.max(0, plan.maxTeamSeats - Math.max(1, liveTeamSeats)),
                    percentUsed: Math.min(100, Math.round((Math.max(1, liveTeamSeats) / (plan.maxTeamSeats || 1)) * 100)),
                },
            },
        };
    }
    async getTransactions(tenantIdOrSlug) {
        if (tenantIdOrSlug && tenantIdOrSlug !== 'all') {
            const tenant = await this.resolveTenant(tenantIdOrSlug);
            return await this.txnRepo.find({
                where: { tenantId: tenant.id },
                order: { createdAt: 'DESC' },
            });
        }
        return await this.txnRepo.find({
            order: { createdAt: 'DESC' },
        });
    }
    async trackResumeDownload(tenantIdOrSlug, candidateId) {
        const tenant = await this.resolveTenant(tenantIdOrSlug);
        let sub = await this.subRepo.findOne({
            where: { tenantId: tenant.id },
            relations: { plan: true },
        });
        if (!sub) {
            await this.getCurrentSubscription(tenant.id);
            sub = await this.subRepo.findOne({
                where: { tenantId: tenant.id },
                relations: { plan: true },
            });
        }
        const limit = sub?.plan?.maxResumeDownloads || 150;
        const currentUsed = sub?.resumeDownloadsUsed || 0;
        if (currentUsed >= limit) {
            return {
                success: false,
                quotaExceeded: true,
                used: currentUsed,
                limit,
                remaining: 0,
                message: `Resume download quota limit reached (${currentUsed}/${limit}). Please upgrade your plan or top up quota in Billing.`,
            };
        }
        if (sub) {
            sub.resumeDownloadsUsed = currentUsed + 1;
            await this.subRepo.save(sub);
        }
        return {
            success: true,
            quotaExceeded: false,
            used: currentUsed + 1,
            limit,
            remaining: Math.max(0, limit - (currentUsed + 1)),
            message: 'Resume download successfully recorded against monthly quota.',
        };
    }
    async upgradePlan(tenantIdOrSlug, planCode, billingCycle = 'monthly') {
        const tenant = await this.resolveTenant(tenantIdOrSlug);
        const plan = await this.planRepo.findOne({ where: { code: planCode } });
        if (!plan)
            throw new common_1.NotFoundException(`Subscription plan ${planCode} not found`);
        let sub = await this.subRepo.findOne({ where: { tenantId: tenant.id } });
        const now = new Date();
        const periodEnd = new Date(now.getTime() + (billingCycle === 'yearly' ? 365 : 30) * 86400000);
        if (sub) {
            sub.planId = plan.id;
            sub.status = tenant_subscription_entity_1.SubscriptionStatus.ACTIVE;
            sub.currentPeriodStart = now;
            sub.currentPeriodEnd = periodEnd;
            await this.subRepo.save(sub);
        }
        else {
            sub = await this.subRepo.save({
                tenantId: tenant.id,
                planId: plan.id,
                status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE,
                activeJobsUsed: 0,
                resumeDownloadsUsed: 0,
                featuredJobsUsed: 0,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            });
        }
        const price = billingCycle === 'yearly' ? Number(plan.priceYearly) * 12 : Number(plan.priceMonthly);
        const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const txn = await this.txnRepo.save({
            invoiceNumber: invoiceNum,
            tenantId: tenant.id,
            tenantName: tenant.name,
            description: `${plan.name} (${billingCycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'})`,
            amount: price,
            currency: 'USD',
            type: billing_transaction_entity_1.TransactionType.SUBSCRIPTION,
            status: billing_transaction_entity_1.TransactionStatus.PAID,
            paymentMethod: 'Stripe Card (•••• 4242)',
            planCode: plan.code,
            quotaDetails: {
                activeJobs: plan.maxActiveJobs,
                resumeDownloads: plan.maxResumeDownloads,
                teamSeats: plan.maxTeamSeats,
            },
            periodStart: now,
            periodEnd,
        });
        return {
            success: true,
            message: `Successfully upgraded to ${plan.name}`,
            subscription: await this.getCurrentSubscription(tenant.id),
            transaction: txn,
        };
    }
    async purchaseTopup(tenantIdOrSlug, topupType) {
        const tenant = await this.resolveTenant(tenantIdOrSlug);
        let sub = await this.subRepo.findOne({
            where: { tenantId: tenant.id },
            relations: { plan: true },
        });
        if (!sub) {
            await this.getCurrentSubscription(tenant.id);
            sub = await this.subRepo.findOne({
                where: { tenantId: tenant.id },
                relations: { plan: true },
            });
        }
        let description = '';
        let amount = 0;
        let type = billing_transaction_entity_1.TransactionType.QUOTA_TOPUP;
        let quotaDetails = {};
        switch (topupType) {
            case 'RESUME_50':
                description = '+50 Candidate Resume Downloads Pack';
                amount = 29.00;
                quotaDetails = { resumeDownloads: 50 };
                if (sub) {
                    sub.resumeDownloadsUsed = Math.max(0, sub.resumeDownloadsUsed - 50);
                    await this.subRepo.save(sub);
                }
                break;
            case 'RESUME_150':
                description = '+150 Candidate Resume Downloads Pack';
                amount = 69.00;
                quotaDetails = { resumeDownloads: 150 };
                if (sub) {
                    sub.resumeDownloadsUsed = Math.max(0, sub.resumeDownloadsUsed - 150);
                    await this.subRepo.save(sub);
                }
                break;
            case 'JOBS_5':
                description = '+5 Active Job Posting Slots';
                amount = 49.00;
                quotaDetails = { activeJobs: 5 };
                break;
            case 'SEATS_2':
                description = '+2 Team Recruiter Seats Add-on';
                amount = 39.00;
                type = billing_transaction_entity_1.TransactionType.SEAT_ADDON;
                quotaDetails = { teamSeats: 2 };
                break;
            default:
                throw new common_1.BadRequestException('Invalid quota top-up type');
        }
        const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const txn = await this.txnRepo.save({
            invoiceNumber: invoiceNum,
            tenantId: tenant.id,
            tenantName: tenant.name,
            description,
            amount,
            currency: 'USD',
            type,
            status: billing_transaction_entity_1.TransactionStatus.PAID,
            paymentMethod: 'Stripe Card (•••• 4242)',
            planCode: sub?.plan?.code || 'PRO',
            quotaDetails,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 86400000),
        });
        return {
            success: true,
            message: `Successfully purchased ${description}`,
            transaction: txn,
            subscription: await this.getCurrentSubscription(tenant.id),
        };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __param(2, (0, typeorm_1.InjectRepository)(billing_transaction_entity_1.BillingTransaction)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(4, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map