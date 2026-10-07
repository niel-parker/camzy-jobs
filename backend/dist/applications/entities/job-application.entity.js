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
exports.JobApplication = exports.ApplicationStage = void 0;
const typeorm_1 = require("typeorm");
const job_posting_entity_1 = require("../../jobs/entities/job-posting.entity");
const candidate_entity_1 = require("../../candidates/entities/candidate.entity");
var ApplicationStage;
(function (ApplicationStage) {
    ApplicationStage["APPLIED"] = "APPLIED";
    ApplicationStage["UNDER_REVIEW"] = "UNDER_REVIEW";
    ApplicationStage["SHORTLISTED"] = "SHORTLISTED";
    ApplicationStage["INTERVIEW"] = "INTERVIEW";
    ApplicationStage["OFFERED"] = "OFFERED";
    ApplicationStage["REJECTED"] = "REJECTED";
})(ApplicationStage || (exports.ApplicationStage = ApplicationStage = {}));
let JobApplication = class JobApplication {
};
exports.JobApplication = JobApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_posting_entity_1.JobPosting, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", job_posting_entity_1.JobPosting)
], JobApplication.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_id' }),
    __metadata("design:type", String)
], JobApplication.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => candidate_entity_1.Candidate, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'candidate_id' }),
    __metadata("design:type", candidate_entity_1.Candidate)
], JobApplication.prototype, "candidate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'candidate_id' }),
    __metadata("design:type", String)
], JobApplication.prototype, "candidateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "coverLetter", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], JobApplication.prototype, "resumeUrlSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], JobApplication.prototype, "answersJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ApplicationStage, default: ApplicationStage.APPLIED }),
    __metadata("design:type", String)
], JobApplication.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], JobApplication.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], JobApplication.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], JobApplication.prototype, "updatedAt", void 0);
exports.JobApplication = JobApplication = __decorate([
    (0, typeorm_1.Entity)('job_applications')
], JobApplication);
//# sourceMappingURL=job-application.entity.js.map