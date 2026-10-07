"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
let AppConfigService = class AppConfigService {
    constructor() {
        this.config = {
            id: 'cfg-default-1',
            siteName: 'Camzy Jobs',
            siteTagline: 'Enterprise Multi-Tenant Job Portal for Companies & Employers',
            siteDescription: 'Enterprise talent acquisition platform built for companies to post jobs, manage applicants, and source top talent.',
            supportEmail: 'support@camzyjobs.com',
            defaultCurrency: 'USD',
            enableConsultancies: false,
            enableFreeJobPosting: true,
            enableResumeDownloads: true,
            requireEmailVerification: false,
            requireCompanyTaxVerification: true,
            maintenanceMode: false,
            defaultPlanId: 'starter',
            updatedAt: new Date().toISOString(),
        };
    }
    getAppConfig() {
        return this.config;
    }
    updateAppConfig(partial) {
        this.config = {
            ...this.config,
            ...partial,
            updatedAt: new Date().toISOString(),
        };
        return this.config;
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)()
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map