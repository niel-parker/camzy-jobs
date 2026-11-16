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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const applications_service_1 = require("./applications.service");
const auth_service_1 = require("../auth/auth.service");
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService, authService) {
        this.applicationsService = applicationsService;
        this.authService = authService;
    }
    async findAll(jobId, tenantId, candidateId, userId, authHeader) {
        const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
        const currentUser = token ? await this.authService.getCurrentUser(token).catch(() => null) : null;
        return await this.applicationsService.findAll({
            jobId,
            tenantId,
            candidateId,
            userId,
            currentUser,
        });
    }
    async submitApplication(body, authHeader) {
        const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
        const currentUser = token ? await this.authService.getCurrentUser(token).catch(() => null) : null;
        return await this.applicationsService.submitApplication(body, currentUser);
    }
    async updateStage(id, body, authHeader) {
        const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
        const currentUser = token ? await this.authService.getCurrentUser(token).catch(() => null) : null;
        return await this.applicationsService.updateStage(id, body.stage, body.rating, currentUser);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch applications pipeline for jobs / candidates with strict tenant & candidate isolation' }),
    (0, swagger_1.ApiQuery)({ name: 'jobId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'candidateId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, common_1.Query)('jobId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('candidateId')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Candidate: Submit 1-Click application to a job posting' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "submitApplication", null);
__decorate([
    (0, common_1.Patch)(':id/stage'),
    (0, swagger_1.ApiOperation)({ summary: 'Recruiter ATS: Update applicant Kanban stage & scorecard rating' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateStage", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, swagger_1.ApiTags)('Job Applications & Recruiter ATS Pipeline'),
    (0, common_1.Controller)('api/v1/applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService,
        auth_service_1.AuthService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map