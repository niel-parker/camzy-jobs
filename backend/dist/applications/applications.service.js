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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_application_entity_1 = require("./entities/job-application.entity");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
const candidate_entity_1 = require("../candidates/entities/candidate.entity");
let ApplicationsService = class ApplicationsService {
    constructor(appRepo, jobRepo, candidateRepo) {
        this.appRepo = appRepo;
        this.jobRepo = jobRepo;
        this.candidateRepo = candidateRepo;
    }
    async findAllByJob(jobId) {
        const qb = this.appRepo.createQueryBuilder('app')
            .leftJoinAndSelect('app.job', 'job')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .leftJoinAndSelect('candidate.user', 'user');
        if (jobId) {
            qb.where('app.jobId = :jobId', { jobId });
        }
        qb.orderBy('app.createdAt', 'DESC');
        const apps = await qb.getMany();
        return apps.map((a) => this.mapToDto(a));
    }
    async submitApplication(data) {
        let jobId = data.jobId;
        if (!jobId) {
            const firstJob = await this.jobRepo.findOne({ where: {} });
            if (firstJob)
                jobId = firstJob.id;
        }
        let candidateId = data.candidateId;
        if (candidateId) {
            let cand = await this.candidateRepo.findOne({ where: { id: candidateId } });
            if (!cand) {
                cand = await this.candidateRepo.findOne({ where: { userId: candidateId } });
            }
            if (cand)
                candidateId = cand.id;
            else
                candidateId = undefined;
        }
        if (!candidateId) {
            const firstCand = await this.candidateRepo.findOne({ where: {} });
            if (firstCand)
                candidateId = firstCand.id;
        }
        const newApp = this.appRepo.create({
            jobId: jobId || 'job-101',
            candidateId: candidateId || 'cnd-101',
            coverLetter: data.coverLetter || '',
            resumeUrlSnapshot: data.resumeUrlSnapshot || 'https://example.com/resumes/resume.pdf',
            answersJson: data.answersJson || {},
            stage: job_application_entity_1.ApplicationStage.APPLIED,
            rating: 0,
        });
        const saved = await this.appRepo.save(newApp);
        const fullApp = await this.appRepo.findOne({
            where: { id: saved.id },
            relations: { job: true, candidate: { user: true } },
        });
        return this.mapToDto(fullApp || saved);
    }
    async updateStage(id, stage, rating) {
        const app = await this.appRepo.findOne({
            where: { id },
            relations: { job: true, candidate: { user: true } },
        });
        if (!app) {
            throw new common_1.NotFoundException(`Application ${id} not found`);
        }
        app.stage = stage;
        if (rating !== undefined)
            app.rating = rating;
        await this.appRepo.save(app);
        return this.mapToDto(app);
    }
    mapToDto(app) {
        const candidateName = app.candidate?.user
            ? `${app.candidate.user.firstName} ${app.candidate.user.lastName}`
            : 'Candidate';
        return {
            id: app.id,
            jobId: app.jobId,
            jobTitle: app.job?.title || 'Senior Full Stack Engineer',
            candidateId: app.candidateId,
            candidateName,
            candidateHeadline: app.candidate?.headline || 'Senior Engineer',
            coverLetter: app.coverLetter || '',
            resumeUrlSnapshot: app.resumeUrlSnapshot || '',
            stage: app.stage || job_application_entity_1.ApplicationStage.APPLIED,
            rating: app.rating || 0,
            createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __param(1, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(2, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map