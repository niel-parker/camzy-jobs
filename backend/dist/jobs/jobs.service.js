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
const user_entity_1 = require("../users/entities/user.entity");
const tenant_subscription_entity_1 = require("../subscriptions/entities/tenant-subscription.entity");
let JobsService = class JobsService {
    constructor(jobRepo, tenantRepo, userRepo, subRepo) {
        this.jobRepo = jobRepo;
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
        this.subRepo = subRepo;
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
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        const effectiveTenantId = tenant ? tenant.id : (await this.tenantRepo.findOne({ where: {} }))?.id;
        if (!effectiveTenantId)
            return 0;
        return await this.jobRepo.count({
            where: { tenantId: effectiveTenantId, status: job_posting_entity_1.JobStatus.PUBLISHED },
        });
    }
    async getPlanJobLimitForTenant(tenantId) {
        let targetTenantId = tenantId;
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) {
            const firstTenant = await this.tenantRepo.findOne({ where: {} });
            if (firstTenant)
                targetTenantId = firstTenant.id;
        }
        const sub = await this.subRepo.findOne({
            where: { tenantId: targetTenantId },
            relations: { plan: true },
        });
        return sub?.plan?.maxActiveJobs || 15;
    }
    async createJob(jobData) {
        let tenantId = jobData.tenantId;
        if (!tenantId) {
            const firstTenant = await this.tenantRepo.findOne({ where: {} });
            if (firstTenant)
                tenantId = firstTenant.id;
        }
        let postedByUserId = jobData.postedByUserId;
        if (postedByUserId) {
            const existingUser = await this.userRepo.findOne({ where: { id: postedByUserId } });
            if (!existingUser)
                postedByUserId = undefined;
        }
        if (!postedByUserId && tenantId) {
            const companyUser = await this.userRepo.findOne({ where: { tenantId } });
            if (companyUser)
                postedByUserId = companyUser.id;
        }
        if (!postedByUserId) {
            const anyUser = await this.userRepo.findOne({ where: {} });
            if (anyUser)
                postedByUserId = anyUser.id;
        }
        const newJob = this.jobRepo.create({
            tenantId: tenantId || 'tnt-techcorp',
            postedByUserId: postedByUserId,
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
            applyType: jobData.applyType || 'INTERNAL',
            applyUrl: jobData.applyUrl || '',
            status: job_posting_entity_1.JobStatus.PUBLISHED,
            expiresAt: new Date(Date.now() + 60 * 86400000),
            screeningQuestions: jobData.screeningQuestions || [],
        });
        const saved = await this.jobRepo.save(newJob);
        return this.findOne(saved.id);
    }
    async updateJob(id, updateData) {
        const job = await this.jobRepo.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Job ${id} not found`);
        }
        if (updateData.title) {
            job.title = updateData.title;
            job.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        if (updateData.description !== undefined)
            job.description = updateData.description;
        if (updateData.category !== undefined)
            job.category = updateData.category;
        if (updateData.employmentType !== undefined)
            job.employmentType = updateData.employmentType;
        if (updateData.experienceLevel !== undefined)
            job.experienceLevel = updateData.experienceLevel;
        if (updateData.salaryMin !== undefined)
            job.salaryMin = updateData.salaryMin;
        if (updateData.salaryMax !== undefined)
            job.salaryMax = updateData.salaryMax;
        if (updateData.currency !== undefined)
            job.currency = updateData.currency;
        if (updateData.isSalaryVisible !== undefined)
            job.isSalaryVisible = updateData.isSalaryVisible;
        if (updateData.location !== undefined)
            job.locationCity = updateData.location;
        if (updateData.isRemote !== undefined)
            job.isRemote = updateData.isRemote;
        if (updateData.isFeatured !== undefined)
            job.isFeatured = updateData.isFeatured;
        if (updateData.applyType !== undefined)
            job.applyType = updateData.applyType;
        if (updateData.applyUrl !== undefined)
            job.applyUrl = updateData.applyUrl;
        if (updateData.screeningQuestions !== undefined)
            job.screeningQuestions = updateData.screeningQuestions;
        await this.jobRepo.save(job);
        return this.findOne(id);
    }
    async deleteJob(id) {
        const job = await this.jobRepo.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Job ${id} not found`);
        }
        await this.jobRepo.remove(job);
        return { success: true };
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
            applyType: job.applyType || 'INTERNAL',
            applyUrl: job.applyUrl || undefined,
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
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map