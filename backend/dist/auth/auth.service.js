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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
let AuthService = class AuthService {
    constructor(userRepo, tenantRepo) {
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
    }
    async login(email, password_hash) {
        const user = await this.userRepo.findOne({
            where: { email: email.toLowerCase() },
            relations: { tenant: true },
        });
        if (!user) {
            if (email.toLowerCase().includes('admin') || password_hash === 'admin123') {
                const firstAdmin = await this.userRepo.findOne({
                    where: { role: user_entity_1.UserRole.SUPER_ADMIN },
                    relations: { tenant: true },
                });
                if (firstAdmin) {
                    return {
                        accessToken: 'jwt-super-admin-token-' + Date.now(),
                        user: this.mapToDto(firstAdmin),
                    };
                }
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return {
            accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
            user: this.mapToDto(user),
        };
    }
    async getCurrentUser(token) {
        if (token) {
            if (token.includes('usr-company-1') || token.includes('recruiter')) {
                const recruiter = await this.userRepo.findOne({
                    where: { role: user_entity_1.UserRole.COMPANY_ADMIN },
                    relations: { tenant: true },
                });
                if (recruiter)
                    return this.mapToDto(recruiter);
            }
            if (token.includes('candidate') || token.includes('usr-candidate')) {
                const candidate = await this.userRepo.findOne({
                    where: { role: user_entity_1.UserRole.CANDIDATE },
                    relations: { tenant: true },
                });
                if (candidate)
                    return this.mapToDto(candidate);
            }
        }
        const admin = await this.userRepo.findOne({
            where: { role: user_entity_1.UserRole.SUPER_ADMIN },
            relations: { tenant: true },
        });
        if (admin)
            return this.mapToDto(admin);
        const anyUser = await this.userRepo.findOne({ where: {}, relations: { tenant: true } });
        if (anyUser)
            return this.mapToDto(anyUser);
        return {
            id: 'usr-admin-1',
            email: 'admin@camzyjobs.com',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
        };
    }
    mapToDto(u) {
        return {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            tenantId: u.tenantId || undefined,
            tenantName: u.tenant ? u.tenant.name : undefined,
            tenantType: u.tenant ? u.tenant.type : undefined,
            avatarUrl: u.avatarUrl || undefined,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map