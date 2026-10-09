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
exports.JobPosting = exports.JobStatus = exports.ExperienceLevel = exports.EmploymentType = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var EmploymentType;
(function (EmploymentType) {
    EmploymentType["FULL_TIME"] = "Full-time";
    EmploymentType["PART_TIME"] = "Part-time";
    EmploymentType["CONTRACT"] = "Contract";
    EmploymentType["INTERNSHIP"] = "Internship";
    EmploymentType["REMOTE"] = "Remote";
})(EmploymentType || (exports.EmploymentType = EmploymentType = {}));
var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["ENTRY"] = "Entry";
    ExperienceLevel["MID"] = "Mid";
    ExperienceLevel["SENIOR"] = "Senior";
    ExperienceLevel["LEAD"] = "Lead";
    ExperienceLevel["EXECUTIVE"] = "Executive";
})(ExperienceLevel || (exports.ExperienceLevel = ExperienceLevel = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["DRAFT"] = "DRAFT";
    JobStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    JobStatus["PUBLISHED"] = "PUBLISHED";
    JobStatus["EXPIRED"] = "EXPIRED";
    JobStatus["ARCHIVED"] = "ARCHIVED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
let JobPosting = class JobPosting {
};
exports.JobPosting = JobPosting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobPosting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (tenant) => tenant.jobs, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], JobPosting.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], JobPosting.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'posted_by_user_id' }),
    __metadata("design:type", user_entity_1.User)
], JobPosting.prototype, "postedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_by_user_id' }),
    __metadata("design:type", String)
], JobPosting.prototype, "postedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], JobPosting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], JobPosting.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], JobPosting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], JobPosting.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME }),
    __metadata("design:type", String)
], JobPosting.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ExperienceLevel, default: ExperienceLevel.MID }),
    __metadata("design:type", String)
], JobPosting.prototype, "experienceLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], JobPosting.prototype, "salaryMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], JobPosting.prototype, "salaryMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: 'USD' }),
    __metadata("design:type", String)
], JobPosting.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], JobPosting.prototype, "isSalaryVisible", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], JobPosting.prototype, "locationCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], JobPosting.prototype, "locationCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], JobPosting.prototype, "isRemote", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], JobPosting.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'INTERNAL' }),
    __metadata("design:type", String)
], JobPosting.prototype, "applyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], JobPosting.prototype, "applyUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], JobPosting.prototype, "screeningQuestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: JobStatus, default: JobStatus.PUBLISHED }),
    __metadata("design:type", String)
], JobPosting.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], JobPosting.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], JobPosting.prototype, "viewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], JobPosting.prototype, "applicationsCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], JobPosting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], JobPosting.prototype, "updatedAt", void 0);
exports.JobPosting = JobPosting = __decorate([
    (0, typeorm_1.Entity)('job_postings')
], JobPosting);
//# sourceMappingURL=job-posting.entity.js.map