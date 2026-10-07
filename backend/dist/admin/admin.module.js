"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const app_config_service_1 = require("./app-config.service");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const candidate_entity_1 = require("../candidates/entities/candidate.entity");
const job_application_entity_1 = require("../applications/entities/job-application.entity");
const tenant_subscription_entity_1 = require("../subscriptions/entities/tenant-subscription.entity");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                job_posting_entity_1.JobPosting,
                tenant_entity_1.Tenant,
                candidate_entity_1.Candidate,
                job_application_entity_1.JobApplication,
                tenant_subscription_entity_1.TenantSubscription,
            ]),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [app_config_service_1.AppConfigService],
        exports: [app_config_service_1.AppConfigService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map