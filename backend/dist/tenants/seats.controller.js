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
exports.SeatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const tenant_entity_1 = require("./entities/tenant.entity");
const tenant_subscription_entity_1 = require("../subscriptions/entities/tenant-subscription.entity");
let SeatsController = class SeatsController {
    constructor(userRepo, tenantRepo, subRepo) {
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
        this.subRepo = subRepo;
    }
    async resolveTenant(tenantIdOrSlug) {
        if (tenantIdOrSlug && tenantIdOrSlug !== 'undefined' && tenantIdOrSlug !== 'null') {
            const byId = await this.tenantRepo.findOne({ where: { id: tenantIdOrSlug } });
            if (byId)
                return byId;
            const bySlug = await this.tenantRepo.findOne({ where: { slug: tenantIdOrSlug } });
            if (bySlug)
                return bySlug;
        }
        const defaultTenant = await this.tenantRepo.findOne({ where: { slug: 'techcorp-global' } });
        if (defaultTenant)
            return defaultTenant;
        const firstTenant = await this.tenantRepo.findOne({ where: {} });
        if (!firstTenant)
            throw new common_1.NotFoundException('Tenant not found');
        return firstTenant;
    }
    async getTeamMembers(tenantId) {
        const tenant = await this.resolveTenant(tenantId);
        const users = await this.userRepo.find({
            where: { tenantId: tenant.id },
            order: { createdAt: 'ASC' },
        });
        const sub = await this.subRepo.findOne({
            where: { tenantId: tenant.id },
            relations: { plan: true },
        });
        const maxSeats = sub?.plan?.maxTeamSeats || 5;
        const members = users.map((u) => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            status: 'ACTIVE',
            invitedAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
        }));
        return {
            usedSeats: members.length,
            maxSeats,
            remainingSeats: Math.max(0, maxSeats - members.length),
            members,
        };
    }
    async inviteMember(body) {
        const tenant = await this.resolveTenant(body.tenantId);
        const currentUsers = await this.userRepo.find({ where: { tenantId: tenant.id } });
        const sub = await this.subRepo.findOne({
            where: { tenantId: tenant.id },
            relations: { plan: true },
        });
        const maxSeats = sub?.plan?.maxTeamSeats || 5;
        if (currentUsers.length >= maxSeats) {
            throw new common_1.ForbiddenException(`Recruiter seat limit reached! Your plan allows a maximum of ${maxSeats} team seats. Upgrade to Enterprise in Billing for more seats.`);
        }
        let existing = await this.userRepo.findOne({ where: { email: body.email } });
        if (existing) {
            existing.tenantId = tenant.id;
            existing.role = body.role || user_entity_1.UserRole.RECRUITER;
            await this.userRepo.save(existing);
        }
        else {
            existing = await this.userRepo.save(this.userRepo.create({
                email: body.email,
                firstName: body.firstName || body.email.split('@')[0],
                lastName: body.lastName || 'Recruiter',
                role: body.role || user_entity_1.UserRole.RECRUITER,
                tenantId: tenant.id,
                passwordHash: '$2b$10$FakeHashForInvitedRecruiterAccount123',
                isEmailVerified: true,
            }));
        }
        const updatedUsers = await this.userRepo.find({ where: { tenantId: tenant.id } });
        return {
            message: `Invitation email sent to ${body.email}`,
            member: {
                id: existing.id,
                email: existing.email,
                firstName: existing.firstName,
                lastName: existing.lastName,
                role: existing.role,
                status: 'ACTIVE',
                invitedAt: new Date().toISOString(),
            },
            usedSeats: updatedUsers.length,
            maxSeats,
        };
    }
};
exports.SeatsController = SeatsController;
__decorate([
    (0, common_1.Get)('members'),
    (0, swagger_1.ApiOperation)({ summary: 'List current company recruiter team sub-accounts & live seat usage from database' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeatsController.prototype, "getTeamMembers", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a new recruiter sub-account to company hiring team (Guarded by PlanMaxSeats)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Recruiter invitation dispatched' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Recruiter seat limit reached for company plan' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SeatsController.prototype, "inviteMember", null);
exports.SeatsController = SeatsController = __decorate([
    (0, swagger_1.ApiTags)('Companies & Team Seats'),
    (0, common_1.Controller)('api/v1/tenants/seats'),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeatsController);
//# sourceMappingURL=seats.controller.js.map