"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_module_1 = require("./admin/admin.module");
const applications_module_1 = require("./applications/applications.module");
const auth_module_1 = require("./auth/auth.module");
const candidates_module_1 = require("./candidates/candidates.module");
const jobs_module_1 = require("./jobs/jobs.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const tenants_module_1 = require("./tenants/tenants.module");
const theme_module_1 = require("./theme/theme.module");
const seeds_module_1 = require("./seeds/seeds.module");
const user_entity_1 = require("./users/entities/user.entity");
const tenant_entity_1 = require("./tenants/entities/tenant.entity");
const subscription_plan_entity_1 = require("./subscriptions/entities/subscription-plan.entity");
const tenant_subscription_entity_1 = require("./subscriptions/entities/tenant-subscription.entity");
const job_posting_entity_1 = require("./jobs/entities/job-posting.entity");
const candidate_entity_1 = require("./candidates/entities/candidate.entity");
const job_application_entity_1 = require("./applications/entities/job-application.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306', 10),
                username: process.env.DB_USER || 'job_user',
                password: process.env.DB_PASS || 'job_password',
                database: process.env.DB_NAME || 'job_portal_db',
                entities: [
                    user_entity_1.User,
                    tenant_entity_1.Tenant,
                    subscription_plan_entity_1.SubscriptionPlan,
                    tenant_subscription_entity_1.TenantSubscription,
                    job_posting_entity_1.JobPosting,
                    candidate_entity_1.Candidate,
                    job_application_entity_1.JobApplication,
                ],
                synchronize: true,
                logging: false,
            }),
            seeds_module_1.SeedsModule,
            tenants_module_1.TenantsModule,
            subscriptions_module_1.SubscriptionsModule,
            jobs_module_1.JobsModule,
            candidates_module_1.CandidatesModule,
            applications_module_1.ApplicationsModule,
            auth_module_1.AuthModule,
            theme_module_1.ThemeModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map