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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQuotaGuard = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("../jobs/jobs.service");
let JobQuotaGuard = class JobQuotaGuard {
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user || { tenantId: 'tnt-techcorp', role: 'COMPANY_ADMIN' };
        if (user.role === 'SUPER_ADMIN') {
            return true;
        }
        const activeJobs = this.jobsService.getActiveJobsCountForTenant(user.tenantId || 'tnt-techcorp');
        const planMaxJobs = this.jobsService.getPlanJobLimitForTenant(user.tenantId || 'tnt-techcorp');
        if (activeJobs >= planMaxJobs) {
            throw new common_1.ForbiddenException(`Job posting quota exceeded! Your plan limit is ${planMaxJobs} active jobs. Upgrade your company subscription to post more.`);
        }
        return true;
    }
};
exports.JobQuotaGuard = JobQuotaGuard;
exports.JobQuotaGuard = JobQuotaGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobQuotaGuard);
//# sourceMappingURL=job-quota.guard.js.map