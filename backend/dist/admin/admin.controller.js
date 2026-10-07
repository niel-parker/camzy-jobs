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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_config_service_1 = require("./app-config.service");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const candidate_entity_1 = require("../candidates/entities/candidate.entity");
const job_application_entity_1 = require("../applications/entities/job-application.entity");
const tenant_subscription_entity_1 = require("../subscriptions/entities/tenant-subscription.entity");
let AdminController = class AdminController {
    constructor(appConfigService, jobRepo, tenantRepo, candidateRepo, appRepo, subRepo) {
        this.appConfigService = appConfigService;
        this.jobRepo = jobRepo;
        this.tenantRepo = tenantRepo;
        this.candidateRepo = candidateRepo;
        this.appRepo = appRepo;
        this.subRepo = subRepo;
    }
    async getDashboardMetrics() {
        const totalJobs = await this.jobRepo.count();
        const totalCompanies = await this.tenantRepo.count({ where: { type: tenant_entity_1.TenantType.COMPANY } });
        const totalConsultancies = await this.tenantRepo.count({ where: { type: tenant_entity_1.TenantType.CONSULTANCY } });
        const totalCandidates = await this.candidateRepo.count();
        const totalApplications = await this.appRepo.count();
        const activeSubscriptions = await this.subRepo.count({ where: { status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE } });
        return {
            totalJobs,
            totalCompanies,
            totalConsultancies,
            totalCandidates,
            totalApplications,
            activeSubscriptions,
            monthlyRevenue: activeSubscriptions * 199,
        };
    }
    getAppConfig() {
        return this.appConfigService.getAppConfig();
    }
    updateAppConfig(body) {
        return this.appConfigService.updateAppConfig(body);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch live platform overview metrics from database' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('app-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch global Job Portal platform configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current platform configuration details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AdminController.prototype, "getAppConfig", null);
__decorate([
    (0, common_1.Put)('app-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update Job Portal platform configuration settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated platform configuration details' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AdminController.prototype, "updateAppConfig", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin Governance'),
    (0, common_1.Controller)('api/v1/admin'),
    __param(1, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(3, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __param(4, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __param(5, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminController);
//# sourceMappingURL=admin.controller.js.map