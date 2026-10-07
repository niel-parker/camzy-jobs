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
const user_entity_1 = require("../users/entities/user.entity");
let SeatsController = class SeatsController {
    constructor() {
        this.teamMembers = [
            {
                id: 'usr-company-1',
                email: 'recruiter@techcorp.com',
                firstName: 'Sarah',
                lastName: 'Jenkins',
                role: user_entity_1.UserRole.COMPANY_ADMIN,
                status: 'ACTIVE',
                invitedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            },
            {
                id: 'usr-company-2',
                email: 'hiring.manager@techcorp.com',
                firstName: 'Alex',
                lastName: 'Rivera',
                role: user_entity_1.UserRole.RECRUITER,
                status: 'ACTIVE',
                invitedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            },
        ];
        this.planMaxSeats = 5;
    }
    getTeamMembers() {
        return {
            usedSeats: this.teamMembers.length,
            maxSeats: this.planMaxSeats,
            members: this.teamMembers,
        };
    }
    inviteMember(body) {
        if (this.teamMembers.length >= this.planMaxSeats) {
            throw new common_1.ForbiddenException(`Recruiter seat limit reached! Your plan allows a maximum of ${this.planMaxSeats} team seats. Upgrade to Enterprise for more seats.`);
        }
        const newMember = {
            id: `usr-recruiter-${Date.now()}`,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            role: user_entity_1.UserRole.RECRUITER,
            status: 'PENDING_INVITE',
            invitedAt: new Date().toISOString(),
        };
        this.teamMembers.push(newMember);
        return {
            message: `Invitation email sent to ${body.email}`,
            member: newMember,
            usedSeats: this.teamMembers.length,
            maxSeats: this.planMaxSeats,
        };
    }
};
exports.SeatsController = SeatsController;
__decorate([
    (0, common_1.Get)('members'),
    (0, swagger_1.ApiOperation)({ summary: 'List current company recruiter team sub-accounts & seat usage' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SeatsController.prototype, "getTeamMembers", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a new recruiter sub-account to company hiring team (Guarded by PlanMaxSeats)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Recruiter invitation dispatched' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Recruiter seat limit reached for company plan' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SeatsController.prototype, "inviteMember", null);
exports.SeatsController = SeatsController = __decorate([
    (0, swagger_1.ApiTags)('Companies & Team Seats'),
    (0, common_1.Controller)('api/v1/tenants/seats')
], SeatsController);
//# sourceMappingURL=seats.controller.js.map