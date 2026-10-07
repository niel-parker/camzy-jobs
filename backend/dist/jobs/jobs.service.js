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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_posting_entity_1 = require("./entities/job-posting.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
let JobsService = class JobsService {
    constructor(jobRepo, tenantRepo) {
        this.jobRepo = jobRepo;
        this.tenantRepo = tenantRepo;
    }
    async findAll(category, query) {
        const qb = this.jobRepo.createQueryBuilder('job')
            .leftJoinAndSelect('job.tenant', 'tenant')
            .where('job.status = :status', { status: job_posting_entity_1.JobStatus.PUBLISHED });
        if (category && category !== 'All') {
            qb.andWhere('LOWER(job.category) LIKE LOWER(:category)', { category: `%${category}%` });
        }
        if (query) {
            qb.andWhere('(LOWER(job.title) LIKE LOWER(:q) OR LOWER(job.description) LIKE LOWER(:q) OR LOWER(tenant.name) LIKE LOWER(:q))', { q: `%${query}%` });
        }
        qb.orderBy('job.createdAt', 'DESC');
        const jobs = await qb.getMany();
        return jobs.map((job) => this.mapToDto(job));
    }
    async findOne(id) {
        const job = await this.jobRepo.findOne({
            where: { id },
            relations: { tenant: true },
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job posting with ID ${id} not found`);
        }
        return this.mapToDto(job);
    }
    async getActiveJobsCountForTenant(tenantId) {
        return await this.jobRepo.count({
            where: { tenantId, status: job_posting_entity_1.JobStatus.PUBLISHED },
        });
    }
    async getPlanJobLimitForTenant(tenantId) {
        return 15;
    }
    async createJob(jobData) {
        let tenantId = jobData.tenantId;
        if (!tenantId) {
            const firstTenant = await this.tenantRepo.findOne({ where: {} });
            if (firstTenant)
                tenantId = firstTenant.id;
        }
        const newJob = this.jobRepo.create({
            tenantId: tenantId || 'tnt-techcorp',
            postedByUserId: 'usr-company-1',
            title: jobData.title || 'Untitled Role',
            slug: (jobData.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: jobData.description || 'Job description details.',
            category: jobData.category || 'Engineering',
            employmentType: jobData.employmentType || job_posting_entity_1.EmploymentType.FULL_TIME,
            experienceLevel: jobData.experienceLevel || job_posting_entity_1.ExperienceLevel.MID,
            salaryMin: jobData.salaryMin || 120000,
            salaryMax: jobData.salaryMax || 160000,
            currency: jobData.currency || 'USD',
            isSalaryVisible: jobData.isSalaryVisible ?? true,
            locationCountry: 'United States',
            locationCity: jobData.location || 'Remote',
            isRemote: jobData.isRemote ?? true,
            isFeatured: jobData.isFeatured ?? false,
            status: job_posting_entity_1.JobStatus.PUBLISHED,
            expiresAt: new Date(Date.now() + 60 * 86400000),
            screeningQuestions: jobData.screeningQuestions || [],
        });
        const saved = await this.jobRepo.save(newJob);
        return this.findOne(saved.id);
    }
    async featureJob(id) {
        const job = await this.jobRepo.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Job ${id} not found`);
        }
        job.isFeatured = true;
        await this.jobRepo.save(job);
        return this.findOne(id);
    }
    mapToDto(job) {
        return {
            id: job.id,
            tenantId: job.tenantId,
            title: job.title,
            companyName: job.tenant ? job.tenant.name : 'TechCorp Global',
            companyLogoUrl: job.tenant ? job.tenant.logoUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
            isConsultancy: false,
            location: job.locationCity || 'Remote',
            isRemote: job.isRemote,
            employmentType: job.employmentType || 'Full-time',
            salaryMin: job.salaryMin ? Number(job.salaryMin) : undefined,
            salaryMax: job.salaryMax ? Number(job.salaryMax) : undefined,
            currency: job.currency || 'USD',
            isSalaryVisible: job.isSalaryVisible,
            category: job.category,
            experienceLevel: job.experienceLevel || 'Mid',
            description: job.description,
            isFeatured: job.isFeatured,
            screeningQuestions: job.screeningQuestions,
            createdAt: job.createdAt ? job.createdAt.toISOString() : new Date().toISOString(),
        };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map