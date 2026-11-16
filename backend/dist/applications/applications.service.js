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
const user_entity_1 = require("../users/entities/user.entity");
let ApplicationsService = class ApplicationsService {
    constructor(appRepo, jobRepo, candidateRepo, userRepo) {
        this.appRepo = appRepo;
        this.jobRepo = jobRepo;
        this.candidateRepo = candidateRepo;
        this.userRepo = userRepo;
    }
    async findAll(options = {}) {
        const { jobId, tenantId, candidateId, userId, currentUser } = options;
        const qb = this.appRepo.createQueryBuilder('app')
            .leftJoinAndSelect('app.job', 'job')
            .leftJoinAndSelect('job.tenant', 'tenant')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .leftJoinAndSelect('candidate.user', 'user');
        if (currentUser?.role === user_entity_1.UserRole.CANDIDATE || currentUser?.role === 'CANDIDATE') {
            const candId = currentUser.candidateId;
            const uId = currentUser.id;
            if (candId) {
                qb.where('(app.candidateId = :candId OR candidate.userId = :uId)', { candId, uId });
            }
            else {
                qb.where('candidate.userId = :uId', { uId });
            }
        }
        else if (currentUser?.role === user_entity_1.UserRole.COMPANY_ADMIN ||
            currentUser?.role === 'COMPANY_ADMIN' ||
            currentUser?.role === user_entity_1.UserRole.RECRUITER ||
            currentUser?.role === 'RECRUITER') {
            const effectiveTenantId = currentUser.tenantId || tenantId;
            if (effectiveTenantId) {
                qb.where('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId: effectiveTenantId });
            }
            else {
                return [];
            }
            if (jobId) {
                qb.andWhere('app.jobId = :jobId', { jobId });
            }
        }
        else if (currentUser?.role === user_entity_1.UserRole.SUPER_ADMIN || currentUser?.role === 'SUPER_ADMIN') {
            if (tenantId) {
                qb.andWhere('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId });
            }
            if (jobId) {
                qb.andWhere('app.jobId = :jobId', { jobId });
            }
            if (candidateId) {
                qb.andWhere('(app.candidateId = :candidateId OR candidate.userId = :candidateId)', { candidateId });
            }
            if (userId) {
                qb.andWhere('candidate.userId = :userId', { userId });
            }
        }
        else {
            let hasFilter = false;
            if (candidateId) {
                qb.andWhere('(app.candidateId = :candidateId OR candidate.userId = :candidateId)', { candidateId });
                hasFilter = true;
            }
            else if (userId) {
                qb.andWhere('candidate.userId = :userId', { userId });
                hasFilter = true;
            }
            if (tenantId) {
                qb.andWhere('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId });
                hasFilter = true;
            }
            if (jobId) {
                qb.andWhere('app.jobId = :jobId', { jobId });
                hasFilter = true;
            }
            if (!hasFilter) {
                return [];
            }
        }
        qb.orderBy('app.createdAt', 'DESC');
        const apps = await qb.getMany();
        return apps.map((a) => this.mapToDto(a));
    }
    async findAllByJob(jobId) {
        return await this.findAll({ jobId });
    }
    async submitApplication(data, currentUser) {
        const jobId = data.jobId;
        if (!jobId) {
            throw new common_1.BadRequestException('Job posting ID is required to apply.');
        }
        const job = await this.jobRepo.findOne({
            where: { id: jobId },
            relations: { tenant: true },
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job posting with ID ${jobId} not found`);
        }
        const isExpired = job.status === job_posting_entity_1.JobStatus.EXPIRED || (job.expiresAt && new Date(job.expiresAt) <= new Date());
        if (isExpired) {
            throw new common_1.BadRequestException('This job posting has expired and is no longer accepting applications.');
        }
        let targetCand = null;
        const candIdentifier = data.candidateId || currentUser?.candidateId || currentUser?.id;
        if (candIdentifier) {
            targetCand = await this.candidateRepo.findOne({
                where: [{ id: candIdentifier }, { userId: candIdentifier }],
                relations: { user: true },
            });
        }
        if (!targetCand && currentUser?.id) {
            targetCand = await this.candidateRepo.findOne({
                where: { userId: currentUser.id },
                relations: { user: true },
            });
            if (!targetCand) {
                const newCand = this.candidateRepo.create({
                    userId: currentUser.id,
                    headline: 'Job Seeker',
                    skills: [],
                });
                targetCand = await this.candidateRepo.save(newCand);
            }
        }
        if (!targetCand) {
            throw new common_1.BadRequestException('A valid candidate profile is required to submit an application.');
        }
        const existing = await this.appRepo.findOne({
            where: { jobId: job.id, candidateId: targetCand.id },
        });
        if (existing) {
            return this.mapToDto(existing);
        }
        const newApp = this.appRepo.create({
            jobId: job.id,
            candidateId: targetCand.id,
            coverLetter: data.coverLetter || '',
            resumeUrlSnapshot: data.resumeUrlSnapshot || 'https://example.com/resumes/resume.pdf',
            answersJson: data.answersJson || {},
            stage: job_application_entity_1.ApplicationStage.APPLIED,
            rating: 0,
        });
        const saved = await this.appRepo.save(newApp);
        const fullApp = await this.appRepo.findOne({
            where: { id: saved.id },
            relations: { job: { tenant: true }, candidate: { user: true } },
        });
        return this.mapToDto(fullApp || saved);
    }
    async updateStage(id, stage, rating, currentUser) {
        const app = await this.appRepo.findOne({
            where: { id },
            relations: { job: { tenant: true }, candidate: { user: true } },
        });
        if (!app) {
            throw new common_1.NotFoundException(`Application ${id} not found`);
        }
        if (currentUser?.role === user_entity_1.UserRole.COMPANY_ADMIN ||
            currentUser?.role === 'COMPANY_ADMIN' ||
            currentUser?.role === user_entity_1.UserRole.RECRUITER ||
            currentUser?.role === 'RECRUITER') {
            if (currentUser.tenantId && app.job?.tenantId !== currentUser.tenantId) {
                throw new common_1.ForbiddenException('You do not have permission to modify applications for another company.');
            }
        }
        app.stage = stage;
        if (rating !== undefined)
            app.rating = rating;
        await this.appRepo.save(app);
        return this.mapToDto(app);
    }
    mapToDto(app) {
        const candidateName = app.candidate?.user
            ? `${app.candidate.user.firstName} ${app.candidate.user.lastName}`.trim()
            : 'Candidate';
        const candidateEmail = app.candidate?.user?.email || '';
        const candidatePhone = app.candidate?.user?.phoneNumber || '';
        const companyName = app.job?.tenant?.name || app.job?.companyName || 'Hiring Company';
        const companyLogo = app.job?.tenant?.logoUrl || '';
        const tenantId = app.job?.tenantId || app.job?.tenant?.id || '';
        const location = [app.job?.locationCity, app.job?.locationState, app.job?.locationCountry]
            .filter(Boolean)
            .join(', ') || 'Remote';
        const employmentType = app.job?.employmentType || 'Full-time';
        const category = app.job?.category || 'General';
        return {
            id: app.id,
            jobId: app.jobId,
            jobTitle: app.job?.title || 'Job Opening',
            companyName,
            companyLogo,
            tenantId,
            location,
            employmentType,
            category,
            candidateId: app.candidateId,
            candidateName,
            candidateEmail,
            candidatePhone,
            candidateHeadline: app.candidate?.headline || 'Candidate',
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
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map