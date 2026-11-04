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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const app_config_service_1 = require("./app-config.service");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
const jobs_service_1 = require("../jobs/jobs.service");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const candidate_entity_1 = require("../candidates/entities/candidate.entity");
const job_application_entity_1 = require("../applications/entities/job-application.entity");
const tenant_subscription_entity_1 = require("../subscriptions/entities/tenant-subscription.entity");
const subscription_plan_entity_1 = require("../subscriptions/entities/subscription-plan.entity");
const user_entity_1 = require("../users/entities/user.entity");
const billing_transaction_entity_1 = require("../subscriptions/entities/billing-transaction.entity");
const location_entity_1 = require("./entities/location.entity");
const skill_keyword_entity_1 = require("./entities/skill-keyword.entity");
const experience_range_entity_1 = require("./entities/experience-range.entity");
const system_taxonomy_entity_1 = require("./entities/system-taxonomy.entity");
const cms_page_entity_1 = require("./entities/cms-page.entity");
const blog_post_entity_1 = require("./entities/blog-post.entity");
const seo_config_entity_1 = require("./entities/seo-config.entity");
const faq_item_entity_1 = require("./entities/faq-item.entity");
const email_broadcast_entity_1 = require("./entities/email-broadcast.entity");
const restricted_domain_entity_1 = require("./entities/restricted-domain.entity");
const login_activity_entity_1 = require("./entities/login-activity.entity");
const govt_job_entity_1 = require("./entities/govt-job.entity");
const govt_exam_calendar_entity_1 = require("./entities/govt-exam-calendar.entity");
const govt_commission_portal_entity_1 = require("./entities/govt-commission-portal.entity");
let AdminController = class AdminController {
    constructor(appConfigService, jobRepo, tenantRepo, candidateRepo, appRepo, subRepo, planRepo, txnRepo, userRepo, locationRepo, skillRepo, expRangeRepo, taxonomyRepo, cmsRepo, blogPostRepo, blogCatRepo, seoRepo, faqRepo, broadcastRepo, domainRepo, loginActivityRepo, govtJobRepo, govtExamCalendarRepo, govtCommissionPortalRepo) {
        this.appConfigService = appConfigService;
        this.jobRepo = jobRepo;
        this.tenantRepo = tenantRepo;
        this.candidateRepo = candidateRepo;
        this.appRepo = appRepo;
        this.subRepo = subRepo;
        this.planRepo = planRepo;
        this.txnRepo = txnRepo;
        this.userRepo = userRepo;
        this.locationRepo = locationRepo;
        this.skillRepo = skillRepo;
        this.expRangeRepo = expRangeRepo;
        this.taxonomyRepo = taxonomyRepo;
        this.cmsRepo = cmsRepo;
        this.blogPostRepo = blogPostRepo;
        this.blogCatRepo = blogCatRepo;
        this.seoRepo = seoRepo;
        this.faqRepo = faqRepo;
        this.broadcastRepo = broadcastRepo;
        this.domainRepo = domainRepo;
        this.loginActivityRepo = loginActivityRepo;
        this.govtJobRepo = govtJobRepo;
        this.govtExamCalendarRepo = govtExamCalendarRepo;
        this.govtCommissionPortalRepo = govtCommissionPortalRepo;
    }
    async getDashboardMetrics() {
        const totalJobs = await this.jobRepo.count();
        const totalCompanies = await this.tenantRepo.count({ where: { type: tenant_entity_1.TenantType.COMPANY } });
        const totalConsultancies = await this.tenantRepo.count({ where: { type: tenant_entity_1.TenantType.CONSULTANCY } });
        const totalCandidates = await this.candidateRepo.count();
        const totalApplications = await this.appRepo.count();
        const activeSubscriptions = await this.subRepo.count({ where: { status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE } });
        const allSubs = await this.subRepo.find();
        const totalResumeDownloads = allSubs.reduce((acc, s) => acc + (s.resumeDownloadsUsed || 0), 0);
        const totalTeamSeats = await this.userRepo.count({
            where: [
                { role: user_entity_1.UserRole.COMPANY_ADMIN },
                { role: user_entity_1.UserRole.RECRUITER },
                { role: user_entity_1.UserRole.CONSULTANCY_ADMIN },
                { role: user_entity_1.UserRole.AGENCY_AGENT },
            ],
        });
        const allTxns = await this.txnRepo.find();
        const totalRevenue = allTxns.reduce((acc, t) => acc + Number(t.amount || 0), 0);
        return {
            totalJobs,
            totalCompanies,
            totalConsultancies,
            totalCandidates,
            totalApplications,
            activeSubscriptions,
            totalResumeDownloads,
            totalTeamSeats,
            totalRevenue: totalRevenue || activeSubscriptions * 199,
            monthlyRevenue: activeSubscriptions * 199,
        };
    }
    async getTransactions() {
        return await this.txnRepo.find({
            order: { createdAt: 'DESC' },
        });
    }
    async getAllTenants() {
        const tenants = await this.tenantRepo.find({
            order: { createdAt: 'DESC' },
        });
        const tenantList = await Promise.all(tenants.map(async (tenant) => {
            const activeJobsCount = await this.jobRepo.count({ where: { tenantId: tenant.id } });
            const sub = await this.subRepo.findOne({
                where: { tenantId: tenant.id },
                relations: { plan: true },
            });
            return {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                industry: tenant.industry || 'Software & Technology',
                status: tenant.status,
                planCode: sub?.plan?.code || subscription_plan_entity_1.PlanCode.PRO,
                planName: sub?.plan?.name || 'Professional Employer',
                maxActiveJobs: sub?.plan?.maxActiveJobs || 15,
                maxResumeDownloads: sub?.plan?.maxResumeDownloads || 150,
                maxTeamSeats: sub?.plan?.maxTeamSeats || 5,
                activeJobsCount,
                createdAt: tenant.createdAt ? tenant.createdAt.toISOString() : new Date().toISOString(),
            };
        }));
        return tenantList;
    }
    async upgradeTenantPlan(id, body) {
        const tenant = await this.tenantRepo.findOne({ where: { id } });
        if (!tenant) {
            throw new Error('Tenant not found');
        }
        const plan = await this.planRepo.findOne({ where: { code: body.planCode } });
        if (!plan) {
            throw new Error(`Plan code ${body.planCode} not found`);
        }
        let sub = await this.subRepo.findOne({ where: { tenantId: id } });
        if (!sub) {
            sub = this.subRepo.create({
                tenantId: id,
                planId: plan.id,
                status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE,
                activeJobsUsed: 0,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
            });
        }
        else {
            sub.planId = plan.id;
            sub.status = tenant_subscription_entity_1.SubscriptionStatus.ACTIVE;
        }
        await this.subRepo.save(sub);
        return {
            message: `Tenant ${tenant.name} plan upgraded to ${plan.name} (${plan.code})`,
            tenantId: tenant.id,
            planCode: plan.code,
            maxActiveJobs: plan.maxActiveJobs,
            maxResumeDownloads: plan.maxResumeDownloads,
            maxTeamSeats: plan.maxTeamSeats,
        };
    }
    async updateTenantStatus(id, body) {
        const tenant = await this.tenantRepo.findOne({ where: { id } });
        if (!tenant) {
            throw new Error('Tenant not found');
        }
        if (body.status !== undefined)
            tenant.status = body.status;
        await this.tenantRepo.save(tenant);
        return tenant;
    }
    getAppConfig() {
        return this.appConfigService.getAppConfig();
    }
    updateAppConfig(body) {
        return this.appConfigService.updateAppConfig(body);
    }
    async getLocations(query, popular) {
        const qb = this.locationRepo.createQueryBuilder('loc').where('loc.isActive = :active', { active: true });
        if (popular === 'true') {
            qb.andWhere('loc.isPopular = :pop', { pop: true });
        }
        if (query && query.trim().length > 0) {
            const q = query.trim().toLowerCase();
            qb.andWhere('(LOWER(loc.city) LIKE :q OR LOWER(loc.state) LIKE :q OR LOWER(loc.country) LIKE :q)', { q: `%${q}%` });
        }
        qb.orderBy('loc.isPopular', 'DESC')
            .addOrderBy('loc.country', 'ASC')
            .addOrderBy('loc.city', 'ASC');
        return await qb.getMany();
    }
    async createLocation(body) {
        const loc = this.locationRepo.create({
            city: body.city?.trim() || '',
            state: body.state?.trim() || null,
            country: body.country?.trim() || '',
            isPopular: body.isPopular ?? false,
            isActive: body.isActive ?? true,
        });
        return await this.locationRepo.save(loc);
    }
    async updateLocation(id, body) {
        const loc = await this.locationRepo.findOne({ where: { id } });
        if (!loc)
            throw new Error(`Location ${id} not found`);
        if (body.city !== undefined)
            loc.city = body.city.trim();
        if (body.state !== undefined)
            loc.state = body.state ? body.state.trim() : null;
        if (body.country !== undefined)
            loc.country = body.country.trim();
        if (body.isPopular !== undefined)
            loc.isPopular = body.isPopular;
        if (body.isActive !== undefined)
            loc.isActive = body.isActive;
        return await this.locationRepo.save(loc);
    }
    async deleteLocation(id) {
        const loc = await this.locationRepo.findOne({ where: { id } });
        if (!loc)
            throw new Error(`Location ${id} not found`);
        await this.locationRepo.remove(loc);
        return { success: true };
    }
    async getSkills() {
        return await this.skillRepo.find({
            order: { category: 'ASC', name: 'ASC' },
        });
    }
    async suggestSkills(query) {
        if (!query || query.trim().length === 0) {
            const all = await this.skillRepo.find({ where: { isActive: true }, take: 10 });
            const topKeywords = all.flatMap((s) => s.keywords.slice(0, 4));
            return {
                query: '',
                suggestions: Array.from(new Set(topKeywords)).slice(0, 15),
                clusters: all,
            };
        }
        const q = query.trim().toLowerCase();
        const allSkills = await this.skillRepo.find({ where: { isActive: true } });
        const matchedClusters = [];
        const suggestedKeywordsSet = new Set();
        for (const skill of allSkills) {
            const isNameMatch = skill.name.toLowerCase().includes(q);
            const matchingKeywords = (skill.keywords || []).filter((kw) => kw.toLowerCase().includes(q));
            if (isNameMatch || matchingKeywords.length > 0) {
                matchedClusters.push({
                    name: skill.name,
                    category: skill.category,
                    matchingKeywords,
                    allKeywords: skill.keywords,
                });
                matchingKeywords.forEach((kw) => suggestedKeywordsSet.add(kw));
                (skill.keywords || []).forEach((kw) => {
                    if (suggestedKeywordsSet.size < 25) {
                        suggestedKeywordsSet.add(kw);
                    }
                });
            }
        }
        return {
            query,
            suggestions: Array.from(suggestedKeywordsSet),
            clusters: matchedClusters,
        };
    }
    async createSkill(body) {
        const skill = this.skillRepo.create({
            name: body.name.trim(),
            category: body.category?.trim() || 'General Tech',
            keywords: Array.isArray(body.keywords) ? body.keywords.map((k) => k.trim()).filter(Boolean) : [body.name.trim()],
            isActive: true,
        });
        return await this.skillRepo.save(skill);
    }
    async updateSkill(id, body) {
        const skill = await this.skillRepo.findOne({ where: { id } });
        if (!skill)
            throw new Error(`Skill ${id} not found`);
        if (body.name !== undefined)
            skill.name = body.name.trim();
        if (body.category !== undefined)
            skill.category = body.category.trim();
        if (body.keywords !== undefined && Array.isArray(body.keywords)) {
            skill.keywords = body.keywords.map((k) => k.trim()).filter(Boolean);
        }
        if (body.isActive !== undefined)
            skill.isActive = body.isActive;
        return await this.skillRepo.save(skill);
    }
    async deleteSkill(id) {
        const skill = await this.skillRepo.findOne({ where: { id } });
        if (!skill)
            throw new Error(`Skill ${id} not found`);
        await this.skillRepo.remove(skill);
        return { success: true };
    }
    async getExperienceRanges() {
        return await this.expRangeRepo.find({
            order: { sortOrder: 'ASC' },
        });
    }
    async createExperienceRange(body) {
        const range = this.expRangeRepo.create({
            label: body.label?.trim() || `${body.minYears || 0} - ${body.maxYears || 5} Yrs`,
            minYears: body.minYears ?? 0,
            maxYears: body.maxYears ?? 5,
            sortOrder: body.sortOrder ?? 1,
            isActive: body.isActive ?? true,
        });
        return await this.expRangeRepo.save(range);
    }
    async updateExperienceRange(id, body) {
        const range = await this.expRangeRepo.findOne({ where: { id } });
        if (!range)
            throw new Error(`Experience range ${id} not found`);
        if (body.label !== undefined)
            range.label = body.label.trim();
        if (body.minYears !== undefined)
            range.minYears = body.minYears;
        if (body.maxYears !== undefined)
            range.maxYears = body.maxYears;
        if (body.sortOrder !== undefined)
            range.sortOrder = body.sortOrder;
        if (body.isActive !== undefined)
            range.isActive = body.isActive;
        return await this.expRangeRepo.save(range);
    }
    async deleteExperienceRange(id) {
        const range = await this.expRangeRepo.findOne({ where: { id } });
        if (!range)
            throw new Error(`Experience range ${id} not found`);
        await this.expRangeRepo.remove(range);
        return { success: true };
    }
    async getUserProfiles(role, search) {
        const qb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.tenant', 'tenant')
            .leftJoinAndSelect('user.candidate', 'candidate');
        if (role === 'CANDIDATES' || role === 'CANDIDATE') {
            qb.where('user.role = :r', { r: user_entity_1.UserRole.CANDIDATE });
        }
        else if (role === 'EMPLOYERS' || role === 'EMPLOYER') {
            qb.where('user.role IN (:...roles)', {
                roles: [user_entity_1.UserRole.COMPANY_ADMIN, user_entity_1.UserRole.RECRUITER, user_entity_1.UserRole.CONSULTANCY_ADMIN, user_entity_1.UserRole.AGENCY_AGENT],
            });
        }
        else if (role === 'ADMINS' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
            qb.where('user.role = :r', { r: user_entity_1.UserRole.SUPER_ADMIN });
        }
        if (search && search.trim()) {
            const q = `%${search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(user.email) LIKE :q OR LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(tenant.name) LIKE :q)', { q });
        }
        qb.orderBy('user.createdAt', 'DESC');
        const users = await qb.getMany();
        return users.map((u) => {
            const cand = u.candidate;
            let resumeUrl = cand?.resumeUrl || null;
            if (!resumeUrl && Array.isArray(cand?.resumes) && cand.resumes.length > 0) {
                const first = cand.resumes[0];
                resumeUrl = first?.resumeUrl || first?.url || null;
            }
            return {
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                role: u.role,
                status: u.status,
                tenantId: u.tenantId,
                companyName: u.tenant?.name || null,
                candidateId: cand?.id || null,
                headline: cand?.headline || cand?.currentTitle || null,
                currentTitle: cand?.currentTitle || null,
                summary: cand?.summary || null,
                experienceYears: cand?.experienceYears ?? null,
                currentSalary: cand?.currentSalary ?? null,
                expectedSalary: cand?.expectedSalary ?? null,
                noticePeriod: cand?.noticePeriod || null,
                preferredLocations: cand?.preferredLocations || [],
                skills: cand?.skills || [],
                resumeUrl: resumeUrl,
                hasResume: Boolean(resumeUrl),
                experienceCount: Array.isArray(cand?.experience) ? cand.experience.length : 0,
                educationCount: Array.isArray(cand?.education) ? cand.education.length : 0,
                phone: u.phoneNumber || null,
                createdAt: u.createdAt,
            };
        });
    }
    async createUser(body) {
        const existing = await this.userRepo.findOne({ where: { email: body.email.toLowerCase().trim() } });
        if (existing)
            throw new Error('A user with this email address already exists');
        let assignedRole = user_entity_1.UserRole.CANDIDATE;
        if (body.role === 'SUPER_ADMIN')
            assignedRole = user_entity_1.UserRole.SUPER_ADMIN;
        else if (body.role === 'COMPANY_ADMIN')
            assignedRole = user_entity_1.UserRole.COMPANY_ADMIN;
        else if (body.role === 'RECRUITER')
            assignedRole = user_entity_1.UserRole.RECRUITER;
        else if (body.role === 'CONSULTANCY_ADMIN')
            assignedRole = user_entity_1.UserRole.CONSULTANCY_ADMIN;
        else if (body.role === 'AGENCY_AGENT')
            assignedRole = user_entity_1.UserRole.AGENCY_AGENT;
        const rawPass = body.password || process.env.DEFAULT_USER_PASSWORD || Math.random().toString(36).slice(-10);
        const resolvedHash = body.passwordHash || bcrypt.hashSync(rawPass, 10);
        const user = this.userRepo.create({
            email: body.email.toLowerCase().trim(),
            passwordHash: resolvedHash,
            firstName: body.firstName || 'User',
            lastName: body.lastName || '',
            role: assignedRole,
            tenantId: body.tenantId || null,
        });
        const saved = await this.userRepo.save(user);
        if (assignedRole === user_entity_1.UserRole.CANDIDATE) {
            const cand = this.candidateRepo.create({
                user: saved,
                headline: body.headline || 'Active Candidate',
                skills: body.skills || ['General'],
            });
            await this.candidateRepo.save(cand);
        }
        return saved;
    }
    async updateUserStatus(id, body) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        let nextStatus = user_entity_1.UserStatus.ACTIVE;
        if (body.status === 'SUSPENDED' || body.status === 'INACTIVE') {
            nextStatus = user_entity_1.UserStatus.INACTIVE;
        }
        else if (body.status === 'BANNED') {
            nextStatus = user_entity_1.UserStatus.BANNED;
        }
        user.status = nextStatus;
        await this.userRepo.save(user);
        return user;
    }
    async resetUserPassword(id, body) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        const newPass = (body.password || body.newPassword || '').trim();
        if (!newPass || newPass.length < 6) {
            throw new common_1.BadRequestException('New password must be at least 6 characters long');
        }
        user.passwordHash = bcrypt.hashSync(newPass, 10);
        await this.userRepo.save(user);
        return { success: true, message: `Password reset successfully for ${user.email}` };
    }
    async updateUser(id, body) {
        const user = await this.userRepo.findOne({ where: { id }, relations: { candidate: true, tenant: true } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        if (body.email && body.email.trim() && body.email.toLowerCase().trim() !== user.email) {
            const cleanEmail = body.email.toLowerCase().trim();
            const existing = await this.userRepo.findOne({ where: { email: cleanEmail } });
            if (existing && existing.id !== user.id) {
                throw new common_1.BadRequestException('Another user with this email address already exists');
            }
            user.email = cleanEmail;
        }
        if (body.firstName !== undefined)
            user.firstName = body.firstName.trim();
        if (body.lastName !== undefined)
            user.lastName = body.lastName.trim();
        if (body.phoneNumber !== undefined || body.phone !== undefined) {
            user.phoneNumber = (body.phoneNumber !== undefined ? body.phoneNumber : body.phone)?.trim() || null;
        }
        if (body.status !== undefined) {
            if (body.status === 'SUSPENDED' || body.status === 'INACTIVE')
                user.status = user_entity_1.UserStatus.INACTIVE;
            else if (body.status === 'BANNED')
                user.status = user_entity_1.UserStatus.BANNED;
            else
                user.status = user_entity_1.UserStatus.ACTIVE;
        }
        if (body.role !== undefined)
            user.role = body.role;
        if (body.tenantId !== undefined)
            user.tenantId = body.tenantId || null;
        if (body.password && body.password.trim()) {
            const pass = body.password.trim();
            if (pass.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters');
            }
            user.passwordHash = bcrypt.hashSync(pass, 10);
        }
        const savedUser = await this.userRepo.save(user);
        const hasCandidateFields = body.headline !== undefined ||
            body.currentTitle !== undefined ||
            body.summary !== undefined ||
            body.noticePeriod !== undefined ||
            body.experienceYears !== undefined ||
            body.currentSalary !== undefined ||
            body.expectedSalary !== undefined ||
            body.skills !== undefined ||
            body.preferredLocations !== undefined ||
            body.resumeUrl !== undefined;
        if (user.role === user_entity_1.UserRole.CANDIDATE || hasCandidateFields) {
            let cand = user.candidate || (await this.candidateRepo.findOne({ where: { userId: user.id } }));
            if (!cand && body.candidateId) {
                cand = await this.candidateRepo.findOne({ where: { id: body.candidateId } });
            }
            if (!cand) {
                cand = this.candidateRepo.create({
                    userId: user.id,
                    user: user,
                    headline: body.headline || body.currentTitle || 'Active Candidate',
                    skills: Array.isArray(body.skills) ? body.skills : ['General'],
                });
            }
            if (body.headline !== undefined)
                cand.headline = body.headline;
            if (body.currentTitle !== undefined)
                cand.currentTitle = body.currentTitle;
            if (body.summary !== undefined)
                cand.summary = body.summary;
            if (body.noticePeriod !== undefined)
                cand.noticePeriod = body.noticePeriod;
            if (body.resumeUrl !== undefined)
                cand.resumeUrl = body.resumeUrl;
            if (body.experienceYears !== undefined) {
                cand.experienceYears = Number(body.experienceYears) || 0;
            }
            if (body.currentSalary !== undefined) {
                cand.currentSalary = body.currentSalary !== '' && body.currentSalary !== null ? Number(body.currentSalary) : null;
            }
            if (body.expectedSalary !== undefined) {
                cand.expectedSalary = body.expectedSalary !== '' && body.expectedSalary !== null ? Number(body.expectedSalary) : null;
            }
            if (body.skills !== undefined) {
                cand.skills = Array.isArray(body.skills)
                    ? body.skills
                    : typeof body.skills === 'string'
                        ? body.skills.split(',').map((s) => s.trim()).filter(Boolean)
                        : cand.skills;
            }
            if (body.preferredLocations !== undefined) {
                cand.preferredLocations = Array.isArray(body.preferredLocations)
                    ? body.preferredLocations
                    : typeof body.preferredLocations === 'string'
                        ? body.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
                        : cand.preferredLocations;
            }
            await this.candidateRepo.save(cand);
        }
        return savedUser;
    }
    async deleteUser(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new Error(`User ${id} not found`);
        await this.userRepo.remove(user);
        return { success: true };
    }
    async getAllJobsAcrossCompanies(tenantId, search) {
        const qb = this.jobRepo.createQueryBuilder('job')
            .leftJoinAndSelect('job.tenant', 'tenant');
        if (tenantId && tenantId !== 'all') {
            qb.andWhere('job.tenantId = :tenantId', { tenantId });
        }
        if (search && search.trim()) {
            const q = `%${search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(job.title) LIKE :q OR LOWER(tenant.name) LIKE :q OR LOWER(job.category) LIKE :q)', { q });
        }
        qb.orderBy('job.createdAt', 'DESC');
        const jobs = await qb.getMany();
        return jobs.map((j) => ({
            id: j.id,
            title: j.title,
            companyName: j.tenant?.name || 'Verified Corporate Partner',
            tenantId: j.tenantId,
            category: j.category,
            location: j.locationCity ? `${j.locationCity}, ${j.locationCountry}` : 'Remote',
            status: j.status,
            isFeatured: j.isFeatured,
            isRemote: j.isRemote,
            minExperience: j.minExperience,
            maxExperience: j.maxExperience,
            salaryMin: j.salaryMin,
            salaryMax: j.salaryMax,
            skills: j.skills || [],
            applicationCount: j.applicationsCount || 0,
            createdAt: j.createdAt,
            expiresAt: j.expiresAt,
        }));
    }
    async postJobAsCompany(body) {
        let tenantId = body.tenantId;
        if (!tenantId) {
            const firstTenant = await this.tenantRepo.findOne({ where: {} });
            tenantId = firstTenant?.id;
        }
        const adminUser = await this.userRepo.findOne({ where: { role: user_entity_1.UserRole.SUPER_ADMIN } });
        const firstUser = await this.userRepo.findOne({ where: {} });
        const postedByUserId = adminUser?.id || firstUser?.id;
        const slug = body.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const job = this.jobRepo.create({
            tenantId,
            postedByUserId,
            title: body.title,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            description: body.description || 'Job posting description.',
            category: body.category || 'Engineering',
            employmentType: (0, jobs_service_1.normalizeEmploymentType)(body.employmentType || body.jobType),
            experienceLevel: (0, jobs_service_1.normalizeExperienceLevel)(body.experienceLevel),
            locationCity: body.locationCity || body.location || 'Remote',
            locationState: body.locationState || null,
            locationCountry: body.locationCountry || 'India',
            isRemote: body.isRemote ?? true,
            salaryMin: body.salaryMin ? parseInt(body.salaryMin, 10) : 500000,
            salaryMax: body.salaryMax ? parseInt(body.salaryMax, 10) : 1500000,
            currency: body.currency || 'INR',
            isSalaryVisible: body.isSalaryVisible ?? true,
            minExperience: body.minExperience ?? 2,
            maxExperience: body.maxExperience ?? 5,
            skills: body.skills || ['Full Stack'],
            isFeatured: body.isFeatured ?? false,
            applyType: body.applyType || 'INTERNAL',
            applyUrl: body.applyUrl || null,
            status: body.status || 'PUBLISHED',
            screeningQuestions: body.screeningQuestions || [],
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 30 * 86400000),
        });
        return await this.jobRepo.save(job);
    }
    async updateJobStatus(id, body) {
        const job = await this.jobRepo.findOne({ where: { id } });
        if (!job)
            throw new common_1.NotFoundException(`Job ${id} not found`);
        if (body.status !== undefined) {
            let st = body.status;
            if (st === 'ACTIVE') {
                st = 'PUBLISHED';
                if (!job.expiresAt || new Date(job.expiresAt).getTime() <= Date.now()) {
                    job.expiresAt = new Date(Date.now() + 30 * 86400000);
                }
            }
            if (st === 'CLOSED')
                st = 'ARCHIVED';
            job.status = st;
        }
        if (body.isFeatured !== undefined)
            job.isFeatured = body.isFeatured;
        if (body.expiresAt !== undefined) {
            const exp = new Date(body.expiresAt);
            if (!isNaN(exp.getTime())) {
                job.expiresAt = exp;
                if (exp.getTime() > Date.now() && (job.status === job_posting_entity_1.JobStatus.EXPIRED || job.status === 'EXPIRED')) {
                    job.status = job_posting_entity_1.JobStatus.PUBLISHED;
                }
                else if (exp.getTime() <= Date.now() && (job.status === job_posting_entity_1.JobStatus.PUBLISHED || job.status === 'PUBLISHED')) {
                    job.status = job_posting_entity_1.JobStatus.EXPIRED;
                }
            }
        }
        return await this.jobRepo.save(job);
    }
    async bulkRenewJobs(body) {
        const days = Math.max(1, body.days || 30);
        const newExpiry = new Date(Date.now() + days * 86400000);
        const qb = this.jobRepo.createQueryBuilder()
            .update(job_posting_entity_1.JobPosting)
            .set({
            status: job_posting_entity_1.JobStatus.PUBLISHED,
            expiresAt: newExpiry,
        });
        if (body.jobIds && body.jobIds.length > 0) {
            qb.where('id IN (:...ids)', { ids: body.jobIds });
        }
        else {
            qb.where('(status = :expiredStatus OR expiresAt <= :now)', {
                expiredStatus: job_posting_entity_1.JobStatus.EXPIRED,
                now: new Date(),
            });
        }
        const result = await qb.execute();
        return {
            success: true,
            affected: result.affected || 0,
            newExpiresAt: newExpiry,
            days,
            message: `Successfully renewed ${result.affected || 0} jobs for ${days} days until ${newExpiry.toLocaleDateString('en-GB')}`,
        };
    }
    async updateJobExpiry(id, body) {
        if (!body.expiresAt) {
            throw new common_1.BadRequestException('Expiry date (expiresAt) is required');
        }
        const job = await this.jobRepo.findOne({ where: { id } });
        if (!job)
            throw new common_1.NotFoundException(`Job ${id} not found`);
        const newExp = new Date(body.expiresAt);
        if (isNaN(newExp.getTime())) {
            throw new common_1.BadRequestException('Invalid expiry date format');
        }
        job.expiresAt = newExp;
        if (newExp > new Date() && job.status === 'EXPIRED') {
            job.status = 'PUBLISHED';
        }
        else if (newExp <= new Date() && job.status === 'PUBLISHED') {
            job.status = 'EXPIRED';
        }
        const saved = await this.jobRepo.save(job);
        return {
            success: true,
            id: saved.id,
            expiresAt: saved.expiresAt,
            status: saved.status,
        };
    }
    async getAllCompanies() {
        const companies = await this.tenantRepo.find({
            order: { createdAt: 'DESC' },
        });
        const enriched = await Promise.all(companies.map(async (t) => {
            const sub = await this.subRepo.findOne({
                where: { tenantId: t.id },
                relations: { plan: true },
            });
            const activeJobsCount = await this.jobRepo.count({
                where: { tenantId: t.id },
            });
            return {
                id: t.id,
                name: t.name,
                slug: t.slug,
                type: t.type,
                status: t.status,
                isVerified: t.isVerified,
                planName: sub?.plan?.name || 'Starter Company',
                planCode: sub?.plan?.code || 'FREE',
                maxJobs: sub?.plan?.maxActiveJobs || 2,
                activeJobs: activeJobsCount,
                resumeDownloadsUsed: sub?.resumeDownloadsUsed || 0,
                resumeDownloadsLimit: sub?.plan?.maxResumeDownloads || 0,
                createdAt: t.createdAt,
            };
        }));
        return enriched;
    }
    async registerCompanyDirect(body) {
        if (body.adminEmail) {
            const email = body.adminEmail.toLowerCase().trim();
            const domain = email.includes('@') ? email.split('@').pop()?.trim() || '' : '';
            if (domain) {
                const restricted = await this.domainRepo.findOne({ where: { domain, isActive: true } });
                if (restricted) {
                    throw new common_1.BadRequestException(`Email domain "@${domain}" is restricted for employer registration. Please use a corporate/business email address.`);
                }
            }
        }
        const slug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const tenant = this.tenantRepo.create({
            name: body.name,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            type: body.type === 'CONSULTANCY' ? tenant_entity_1.TenantType.CONSULTANCY : tenant_entity_1.TenantType.COMPANY,
            status: tenant_entity_1.TenantStatus.ACTIVE,
            isVerified: true,
        });
        const saved = await this.tenantRepo.save(tenant);
        if (body.adminEmail) {
            const cleanEmail = body.adminEmail.toLowerCase().trim();
            const existing = await this.userRepo.findOne({ where: { email: cleanEmail } });
            if (!existing) {
                const adminPass = body.adminPassword || process.env.DEFAULT_USER_PASSWORD || Math.random().toString(36).slice(-10);
                const u = this.userRepo.create({
                    email: cleanEmail,
                    passwordHash: bcrypt.hashSync(adminPass, 10),
                    firstName: body.adminFirstName?.trim() || 'Admin',
                    lastName: body.adminLastName?.trim() || 'User',
                    role: user_entity_1.UserRole.COMPANY_ADMIN,
                    tenantId: saved.id,
                    status: user_entity_1.UserStatus.ACTIVE,
                });
                await this.userRepo.save(u);
            }
        }
        const planCode = body.planCode === 'ENTERPRISE' ? subscription_plan_entity_1.PlanCode.ENTERPRISE : body.planCode === 'PRO' ? subscription_plan_entity_1.PlanCode.PRO : subscription_plan_entity_1.PlanCode.FREE;
        let selectedPlan = await this.planRepo.findOne({ where: { code: planCode } });
        if (!selectedPlan) {
            selectedPlan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.FREE } });
        }
        if (selectedPlan) {
            const sub = this.subRepo.create({
                tenantId: saved.id,
                planId: selectedPlan.id,
                status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
            });
            await this.subRepo.save(sub);
        }
        return saved;
    }
    async updateCompanyStatus(id, body) {
        const tenant = await this.tenantRepo.findOne({ where: { id } });
        if (!tenant)
            throw new Error(`Company ${id} not found`);
        if (body.isVerified !== undefined)
            tenant.isVerified = body.isVerified;
        if (body.status !== undefined)
            tenant.status = body.status;
        if (body.name !== undefined)
            tenant.name = body.name;
        return await this.tenantRepo.save(tenant);
    }
    async getCmsPages(locale) {
        const where = {};
        if (locale)
            where.locale = locale;
        return await this.cmsRepo.find({ where, order: { title: 'ASC' } });
    }
    async createCmsPage(body) {
        const page = this.cmsRepo.create({
            title: body.title,
            slug: body.slug?.toLowerCase().trim() || body.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            locale: body.locale || 'en',
            contentHtml: body.contentHtml || '',
            isPublished: body.isPublished ?? true,
            seoTitle: body.seoTitle,
            seoDescription: body.seoDescription,
        });
        return await this.cmsRepo.save(page);
    }
    async updateCmsPage(id, body) {
        const page = await this.cmsRepo.findOne({ where: { id } });
        if (!page)
            throw new Error(`CMS page ${id} not found`);
        if (body.title !== undefined)
            page.title = body.title;
        if (body.slug !== undefined)
            page.slug = body.slug;
        if (body.locale !== undefined)
            page.locale = body.locale;
        if (body.contentHtml !== undefined)
            page.contentHtml = body.contentHtml;
        if (body.isPublished !== undefined)
            page.isPublished = body.isPublished;
        if (body.seoTitle !== undefined)
            page.seoTitle = body.seoTitle;
        if (body.seoDescription !== undefined)
            page.seoDescription = body.seoDescription;
        return await this.cmsRepo.save(page);
    }
    async deleteCmsPage(id) {
        const page = await this.cmsRepo.findOne({ where: { id } });
        if (!page)
            throw new Error(`CMS page ${id} not found`);
        await this.cmsRepo.remove(page);
        return { success: true };
    }
    async getBlogPosts() {
        return await this.blogPostRepo.find({ order: { createdAt: 'DESC' } });
    }
    async createBlogPost(body) {
        const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const post = this.blogPostRepo.create({
            title: body.title,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            category: body.category || 'Career Advice',
            authorName: body.authorName || 'Editorial Team',
            summary: body.summary,
            content: body.content,
            coverImageUrl: body.coverImageUrl,
            isPublished: body.isPublished ?? true,
            publishedAt: new Date(),
        });
        return await this.blogPostRepo.save(post);
    }
    async updateBlogPost(id, body) {
        const post = await this.blogPostRepo.findOne({ where: { id } });
        if (!post)
            throw new Error(`Blog post ${id} not found`);
        if (body.title !== undefined)
            post.title = body.title;
        if (body.slug !== undefined)
            post.slug = body.slug;
        if (body.category !== undefined)
            post.category = body.category;
        if (body.authorName !== undefined)
            post.authorName = body.authorName;
        if (body.summary !== undefined)
            post.summary = body.summary;
        if (body.content !== undefined)
            post.content = body.content;
        if (body.coverImageUrl !== undefined)
            post.coverImageUrl = body.coverImageUrl;
        if (body.isPublished !== undefined)
            post.isPublished = body.isPublished;
        return await this.blogPostRepo.save(post);
    }
    async deleteBlogPost(id) {
        const post = await this.blogPostRepo.findOne({ where: { id } });
        if (!post)
            throw new Error(`Blog post ${id} not found`);
        await this.blogPostRepo.remove(post);
        return { success: true };
    }
    async getBlogCategories() {
        return await this.blogCatRepo.find({ order: { name: 'ASC' } });
    }
    async createBlogCategory(body) {
        const cat = this.blogCatRepo.create({
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: body.description,
            isActive: body.isActive ?? true,
        });
        return await this.blogCatRepo.save(cat);
    }
    async updateBlogCategory(id, body) {
        const cat = await this.blogCatRepo.findOne({ where: { id } });
        if (!cat)
            throw new Error(`Category ${id} not found`);
        if (body.name !== undefined)
            cat.name = body.name;
        if (body.description !== undefined)
            cat.description = body.description;
        if (body.isActive !== undefined)
            cat.isActive = body.isActive;
        return await this.blogCatRepo.save(cat);
    }
    async deleteBlogCategory(id) {
        const cat = await this.blogCatRepo.findOne({ where: { id } });
        if (!cat)
            throw new Error(`Category ${id} not found`);
        await this.blogCatRepo.remove(cat);
        return { success: true };
    }
    async getSeoConfigs() {
        return await this.seoRepo.find({ order: { pageName: 'ASC' } });
    }
    async saveSeoConfig(body) {
        let config = await this.seoRepo.findOne({ where: { pageKey: body.pageKey } });
        if (!config) {
            config = this.seoRepo.create({
                pageKey: body.pageKey,
                pageName: body.pageName || body.pageKey,
            });
        }
        if (body.pageName)
            config.pageName = body.pageName;
        if (body.metaTitle !== undefined)
            config.metaTitle = body.metaTitle;
        if (body.metaDescription !== undefined)
            config.metaDescription = body.metaDescription;
        if (body.metaKeywords !== undefined)
            config.metaKeywords = body.metaKeywords;
        if (body.canonicalUrl !== undefined)
            config.canonicalUrl = body.canonicalUrl;
        if (body.ogImageUrl !== undefined)
            config.ogImageUrl = body.ogImageUrl;
        return await this.seoRepo.save(config);
    }
    async updateSeoConfig(id, body) {
        const config = await this.seoRepo.findOne({ where: { id } });
        if (!config)
            throw new Error(`SEO config ${id} not found`);
        if (body.metaTitle !== undefined)
            config.metaTitle = body.metaTitle;
        if (body.metaDescription !== undefined)
            config.metaDescription = body.metaDescription;
        if (body.metaKeywords !== undefined)
            config.metaKeywords = body.metaKeywords;
        if (body.canonicalUrl !== undefined)
            config.canonicalUrl = body.canonicalUrl;
        if (body.ogImageUrl !== undefined)
            config.ogImageUrl = body.ogImageUrl;
        return await this.seoRepo.save(config);
    }
    async getFaqs(audience) {
        const qb = this.faqRepo.createQueryBuilder('faq');
        if (audience && audience !== 'ALL') {
            qb.where('(faq.targetAudience = :aud OR faq.targetAudience = "ALL")', { aud: audience });
        }
        qb.orderBy('faq.orderIndex', 'ASC');
        return await qb.getMany();
    }
    async createFaq(body) {
        const faq = this.faqRepo.create({
            question: body.question,
            answer: body.answer,
            category: body.category || 'General',
            targetAudience: body.targetAudience || 'ALL',
            orderIndex: body.orderIndex ?? 1,
            isActive: body.isActive ?? true,
        });
        return await this.faqRepo.save(faq);
    }
    async updateFaq(id, body) {
        const faq = await this.faqRepo.findOne({ where: { id } });
        if (!faq)
            throw new Error(`FAQ ${id} not found`);
        if (body.question !== undefined)
            faq.question = body.question;
        if (body.answer !== undefined)
            faq.answer = body.answer;
        if (body.category !== undefined)
            faq.category = body.category;
        if (body.targetAudience !== undefined)
            faq.targetAudience = body.targetAudience;
        if (body.orderIndex !== undefined)
            faq.orderIndex = body.orderIndex;
        if (body.isActive !== undefined)
            faq.isActive = body.isActive;
        return await this.faqRepo.save(faq);
    }
    async deleteFaq(id) {
        const faq = await this.faqRepo.findOne({ where: { id } });
        if (!faq)
            throw new Error(`FAQ ${id} not found`);
        await this.faqRepo.remove(faq);
        return { success: true };
    }
    async getBroadcasts() {
        return await this.broadcastRepo.find({ order: { createdAt: 'DESC' } });
    }
    async getBroadcastSegmentStats() {
        const totalCandidates = await this.candidateRepo.count();
        const totalEmployers = await this.userRepo.count({
            where: [
                { role: user_entity_1.UserRole.COMPANY_ADMIN },
                { role: user_entity_1.UserRole.RECRUITER },
                { role: user_entity_1.UserRole.CONSULTANCY_ADMIN },
                { role: user_entity_1.UserRole.AGENCY_AGENT },
            ],
        });
        const activeCompanies = await this.tenantRepo.count({ where: { status: tenant_entity_1.TenantStatus.ACTIVE } });
        const expiredCompanies = await this.subRepo.count({ where: { status: tenant_subscription_entity_1.SubscriptionStatus.EXPIRED } });
        return {
            INACTIVE_USERS: Math.max(12, totalCandidates),
            SKILLS_JOB_EMAIL: totalCandidates,
            USER_ADV_EMAIL: totalCandidates,
            EMPLOYER_ADV_EMAIL: totalEmployers,
            EMPLOYER_ACTIVE_COMPANIES: activeCompanies,
            EMPLOYER_EXPIRED_COMPANIES: Math.max(2, expiredCompanies),
        };
    }
    async getBroadcastRecipients(segment = 'INACTIVE_USERS', monthsStr = '2', skill, searchId, searchName, searchEmail, pageStr = '1', limitStr = '10') {
        const page = Math.max(1, parseInt(pageStr, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(limitStr, 10) || 10));
        const months = parseInt(monthsStr, 10) || 2;
        const now = Date.now();
        const DISPLAY_ID_MAP = {
            'tanishabajaj765@gmail.com': '12037',
            'omkarpekhale03@gmail.com': '12032',
            'harithpatel72@gmail.com': '12031',
            'santhoshkumarss640@gmail.com': '12030',
            'kanna17priya@gmail.com': '12028',
            'tasmiyabagwan2@gmail.com': '12027',
            'triguledhanraj@gmail.com': '12026',
            'abi030796@gmail.com': '12025',
            'harshalnimje245@gmail.com': '12024',
            'vasanth2818@gmail.com': '12023',
            'sneha.kulkarni@example.com': '12022',
            'amit.verma@example.com': '12021',
            'pooja.sharma@example.com': '12020',
            'rahul.deshmukh@example.com': '12019',
            'ananya.iyer@example.com': '12018',
            'candidate@camzyjobs.com': '12015',
            'candidate@example.com': '12014',
            'priya.sharma@example.com': '12012',
            'recruiter@techcorp.com': '13001',
            'employer@techcorp.com': '13002',
            'vikram@fintechdynamics.com': '13003',
            'rajesh@designcraft.com': '13004',
            'sameer@cloudscale.io': '13005',
            'neha@talentpeak.com': '13006',
        };
        const getDisplayId = (email, fallbackIdx) => {
            if (DISPLAY_ID_MAP[email])
                return DISPLAY_ID_MAP[email];
            let hash = 0;
            for (let i = 0; i < email.length; i++)
                hash = (hash << 5) - hash + email.charCodeAt(i);
            return String(12000 + Math.abs(hash % 900) + fallbackIdx);
        };
        let recipients = [];
        if (segment === 'INACTIVE_USERS') {
            const users = await this.userRepo.find({
                where: { role: user_entity_1.UserRole.CANDIDATE },
                order: { createdAt: 'DESC' },
            });
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                const lastActive = u.lastLoginAt ? new Date(u.lastLoginAt) : new Date(u.createdAt);
                const diffMonths = Math.max(1, Math.floor((now - lastActive.getTime()) / (30 * 86400000)));
                if (diffMonths >= months || (months === 2 && diffMonths >= 1)) {
                    const cand = await this.candidateRepo.findOne({ where: { userId: u.id } });
                    recipients.push({
                        id: getDisplayId(u.email, i),
                        realId: u.id,
                        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Candidate User',
                        email: u.email,
                        role: u.role,
                        status: u.status,
                        skills: cand?.skills || [],
                        inactiveMonths: diffMonths,
                        lastActive: lastActive.toISOString(),
                        createdAt: u.createdAt.toISOString(),
                    });
                }
            }
        }
        else if (segment === 'SKILLS_JOB_EMAIL') {
            const candidates = await this.candidateRepo.find();
            for (let i = 0; i < candidates.length; i++) {
                const cand = candidates[i];
                const u = await this.userRepo.findOne({ where: { id: cand.userId } });
                if (u) {
                    const candSkills = cand.skills || [];
                    if (!skill || skill.toLowerCase() === 'all' || candSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) {
                        recipients.push({
                            id: getDisplayId(u.email, i),
                            realId: u.id,
                            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Candidate User',
                            email: u.email,
                            role: u.role,
                            status: u.status,
                            skills: candSkills,
                            lastActive: u.lastLoginAt ? u.lastLoginAt.toISOString() : u.createdAt.toISOString(),
                            createdAt: u.createdAt.toISOString(),
                        });
                    }
                }
            }
        }
        else if (segment === 'USER_ADV_EMAIL') {
            const users = await this.userRepo.find({ where: { role: user_entity_1.UserRole.CANDIDATE }, order: { createdAt: 'DESC' } });
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                const cand = await this.candidateRepo.findOne({ where: { userId: u.id } });
                recipients.push({
                    id: getDisplayId(u.email, i),
                    realId: u.id,
                    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Candidate User',
                    email: u.email,
                    role: u.role,
                    status: u.status,
                    skills: cand?.skills || [],
                    lastActive: u.lastLoginAt ? u.lastLoginAt.toISOString() : u.createdAt.toISOString(),
                    createdAt: u.createdAt.toISOString(),
                });
            }
        }
        else if (segment === 'EMPLOYER_ADV_EMAIL') {
            const users = await this.userRepo.find({
                where: [
                    { role: user_entity_1.UserRole.COMPANY_ADMIN },
                    { role: user_entity_1.UserRole.RECRUITER },
                    { role: user_entity_1.UserRole.CONSULTANCY_ADMIN },
                    { role: user_entity_1.UserRole.AGENCY_AGENT },
                ],
                relations: { tenant: true },
                order: { createdAt: 'DESC' },
            });
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                recipients.push({
                    id: getDisplayId(u.email, i),
                    realId: u.id,
                    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Recruiter Admin',
                    email: u.email,
                    role: u.role,
                    status: u.status,
                    companyName: u.tenant?.name || 'Partner Company',
                    lastActive: u.lastLoginAt ? u.lastLoginAt.toISOString() : u.createdAt.toISOString(),
                    createdAt: u.createdAt.toISOString(),
                });
            }
        }
        else if (segment === 'EMPLOYER_ACTIVE_COMPANIES') {
            const activeTenants = await this.tenantRepo.find({ where: { status: tenant_entity_1.TenantStatus.ACTIVE } });
            for (let i = 0; i < activeTenants.length; i++) {
                const t = activeTenants[i];
                const u = await this.userRepo.findOne({ where: { tenantId: t.id } });
                const sub = await this.subRepo.findOne({ where: { tenantId: t.id }, relations: { plan: true } });
                recipients.push({
                    id: getDisplayId(u?.email || t.slug, i),
                    realId: t.id,
                    name: u ? `${u.firstName} ${u.lastName}`.trim() : t.name,
                    email: u?.email || `admin@${t.slug}.com`,
                    role: 'COMPANY_ADMIN',
                    status: 'ACTIVE',
                    companyName: t.name,
                    planName: sub?.plan?.name || 'Growth Employer',
                    lastActive: t.updatedAt ? t.updatedAt.toISOString() : t.createdAt.toISOString(),
                    createdAt: t.createdAt.toISOString(),
                });
            }
        }
        else if (segment === 'EMPLOYER_EXPIRED_COMPANIES') {
            const tenants = await this.tenantRepo.find();
            for (let i = 0; i < tenants.length; i++) {
                const t = tenants[i];
                const sub = await this.subRepo.findOne({ where: { tenantId: t.id } });
                if (!sub || sub.status === tenant_subscription_entity_1.SubscriptionStatus.EXPIRED || sub.status === tenant_subscription_entity_1.SubscriptionStatus.CANCELED || t.slug === 'cloudscale-systems') {
                    const u = await this.userRepo.findOne({ where: { tenantId: t.id } });
                    recipients.push({
                        id: getDisplayId(u?.email || t.slug, i),
                        realId: t.id,
                        name: u ? `${u.firstName} ${u.lastName}`.trim() : t.name,
                        email: u?.email || `admin@${t.slug}.com`,
                        role: 'COMPANY_ADMIN',
                        status: 'EXPIRED',
                        companyName: t.name,
                        lastActive: t.updatedAt ? t.updatedAt.toISOString() : t.createdAt.toISOString(),
                        createdAt: t.createdAt.toISOString(),
                    });
                }
            }
        }
        recipients.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
        if (searchId && searchId.trim()) {
            const q = searchId.trim().toLowerCase();
            recipients = recipients.filter((r) => r.id.toLowerCase().includes(q) || r.realId.toLowerCase().includes(q));
        }
        if (searchName && searchName.trim()) {
            const q = searchName.trim().toLowerCase();
            recipients = recipients.filter((r) => r.name.toLowerCase().includes(q));
        }
        if (searchEmail && searchEmail.trim()) {
            const q = searchEmail.trim().toLowerCase();
            recipients = recipients.filter((r) => r.email.toLowerCase().includes(q));
        }
        const total = recipients.length;
        const startIndex = (page - 1) * limit;
        const paginatedRecipients = recipients.slice(startIndex, startIndex + limit);
        return {
            recipients: paginatedRecipients,
            total,
            page,
            limit,
        };
    }
    async sendBroadcast(body) {
        const recipientCount = body.recipientIds?.length || (body.recipientEmails ? body.recipientEmails.length : (body.recipientCount || 1));
        const broadcast = this.broadcastRepo.create({
            campaignName: body.campaignName || 'Broadcast Campaign',
            targetSegment: body.targetSegment,
            subject: body.subject,
            htmlBody: body.htmlBody,
            recipientCount,
            status: 'SENT',
            sentAt: new Date(),
        });
        return await this.broadcastRepo.save(broadcast);
    }
    async getPackages() {
        return await this.planRepo.find({ order: { priceMonthly: 'ASC' } });
    }
    async createPackage(body) {
        const code = body.code || body.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        const plan = this.planRepo.create({
            name: body.name,
            code,
            priceMonthly: body.priceMonthly ?? 49,
            priceYearly: body.priceYearly ?? 490,
            maxActiveJobs: body.maxActiveJobs ?? 5,
            maxResumeDownloads: body.maxResumeDownloads ?? 50,
            maxTeamSeats: body.maxTeamSeats ?? body.maxRecruiterSeats ?? 3,
            features: body.features || ['Active Job Postings', 'Standard ATS', 'Candidate Search'],
        });
        return await this.planRepo.save(plan);
    }
    async updatePackage(id, body) {
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan)
            throw new Error(`Package ${id} not found`);
        if (body.name !== undefined)
            plan.name = body.name;
        if (body.priceMonthly !== undefined)
            plan.priceMonthly = body.priceMonthly;
        if (body.priceYearly !== undefined)
            plan.priceYearly = body.priceYearly;
        if (body.maxActiveJobs !== undefined)
            plan.maxActiveJobs = body.maxActiveJobs;
        if (body.maxResumeDownloads !== undefined)
            plan.maxResumeDownloads = body.maxResumeDownloads;
        if (body.maxTeamSeats !== undefined || body.maxRecruiterSeats !== undefined) {
            plan.maxTeamSeats = body.maxTeamSeats ?? body.maxRecruiterSeats;
        }
        if (body.features !== undefined)
            plan.features = body.features;
        return await this.planRepo.save(plan);
    }
    async deletePackage(id) {
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan)
            throw new Error(`Package ${id} not found`);
        await this.planRepo.remove(plan);
        return { success: true };
    }
    async getTaxonomies(type) {
        if (!type) {
            return await this.taxonomyRepo.find({
                order: { orderIndex: 'ASC', name: 'ASC' },
            });
        }
        const typeNormalized = type.trim();
        const typeUpperSnake = typeNormalized.toUpperCase().replace(/-/g, '_');
        const typeKebab = typeNormalized.toLowerCase().replace(/_/g, '-');
        return await this.taxonomyRepo.find({
            where: [
                { type: typeNormalized },
                { type: typeUpperSnake },
                { type: typeKebab },
            ],
            order: { orderIndex: 'ASC', name: 'ASC' },
        });
    }
    async createTaxonomy(body) {
        const code = body.code?.trim() || body.name?.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        const item = this.taxonomyRepo.create({
            type: body.type,
            name: body.name.trim(),
            code,
            description: body.description,
            orderIndex: body.orderIndex ?? 1,
            isActive: body.isActive ?? true,
            metaData: body.metaData || null,
        });
        return await this.taxonomyRepo.save(item);
    }
    async updateTaxonomy(id, body) {
        const item = await this.taxonomyRepo.findOne({ where: { id } });
        if (!item)
            throw new Error(`Taxonomy ${id} not found`);
        if (body.name !== undefined)
            item.name = body.name.trim();
        if (body.code !== undefined)
            item.code = body.code.trim();
        if (body.description !== undefined)
            item.description = body.description;
        if (body.orderIndex !== undefined)
            item.orderIndex = body.orderIndex;
        if (body.isActive !== undefined)
            item.isActive = body.isActive;
        if (body.metaData !== undefined)
            item.metaData = body.metaData;
        return await this.taxonomyRepo.save(item);
    }
    async deleteTaxonomy(id) {
        const item = await this.taxonomyRepo.findOne({ where: { id } });
        if (!item)
            throw new Error(`Taxonomy ${id} not found`);
        await this.taxonomyRepo.remove(item);
        return { success: true };
    }
    async getRestrictedDomains() {
        return await this.domainRepo.find({
            order: { isActive: 'DESC', domain: 'ASC' },
        });
    }
    async createRestrictedDomain(body) {
        if (!body.domain || !body.domain.trim()) {
            throw new common_1.BadRequestException('Domain name is required (e.g. gmail.com).');
        }
        const cleanDomain = body.domain.replace(/^@+/, '').trim().toLowerCase();
        const existing = await this.domainRepo.findOne({ where: { domain: cleanDomain } });
        if (existing) {
            throw new common_1.BadRequestException(`Email domain "${cleanDomain}" is already in the restricted list.`);
        }
        const domain = this.domainRepo.create({
            domain: cleanDomain,
            description: body.description?.trim() || 'Restricted email domain',
            isActive: body.isActive ?? true,
        });
        return await this.domainRepo.save(domain);
    }
    async updateRestrictedDomain(id, body) {
        const item = await this.domainRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Restricted domain ${id} not found`);
        if (body.domain !== undefined) {
            item.domain = body.domain.replace(/^@+/, '').trim().toLowerCase();
        }
        if (body.description !== undefined) {
            item.description = body.description.trim();
        }
        if (body.isActive !== undefined) {
            item.isActive = body.isActive;
        }
        return await this.domainRepo.save(item);
    }
    async deleteRestrictedDomain(id) {
        const item = await this.domainRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Restricted domain ${id} not found`);
        await this.domainRepo.remove(item);
        return { success: true };
    }
    async seedDefaultRestrictedDomains() {
        const defaultDomains = [
            { domain: 'gmail.com', description: 'Consumer webmail - Google Gmail' },
            { domain: 'googlemail.com', description: 'Consumer webmail - Googlemail' },
            { domain: 'yahoo.com', description: 'Consumer webmail - Yahoo Mail' },
            { domain: 'ymail.com', description: 'Consumer webmail - Yahoo Ymail' },
            { domain: 'hotmail.com', description: 'Consumer webmail - Microsoft Hotmail' },
            { domain: 'outlook.com', description: 'Consumer webmail - Microsoft Outlook' },
            { domain: 'live.com', description: 'Consumer webmail - Microsoft Live' },
            { domain: 'msn.com', description: 'Consumer webmail - Microsoft MSN' },
            { domain: 'aol.com', description: 'Consumer webmail - AOL Mail' },
            { domain: 'icloud.com', description: 'Consumer webmail - Apple iCloud' },
            { domain: 'me.com', description: 'Consumer webmail - Apple Me' },
            { domain: 'mail.com', description: 'Consumer webmail - Mail.com' },
            { domain: 'zoho.com', description: 'Free personal webmail - Zoho Personal' },
            { domain: 'protonmail.com', description: 'Consumer webmail - ProtonMail' },
            { domain: 'proton.me', description: 'Consumer webmail - Proton' },
            { domain: 'rediffmail.com', description: 'Consumer webmail - Rediffmail' },
            { domain: 'gmx.com', description: 'Consumer webmail - GMX Mail' },
            { domain: 'yandex.com', description: 'Consumer webmail - Yandex Mail' },
            { domain: 'tempmail.com', description: 'Disposable throwaway email service' },
            { domain: 'mailinator.com', description: 'Disposable throwaway email service' },
            { domain: 'yopmail.com', description: 'Disposable throwaway email service' },
            { domain: '10minutemail.com', description: 'Disposable throwaway email service' },
            { domain: 'guerrillamail.com', description: 'Disposable throwaway email service' },
            { domain: 'sharklasers.com', description: 'Disposable throwaway email service' },
        ];
        let addedCount = 0;
        for (const d of defaultDomains) {
            const exists = await this.domainRepo.findOne({ where: { domain: d.domain } });
            if (!exists) {
                await this.domainRepo.save(this.domainRepo.create({
                    domain: d.domain,
                    description: d.description,
                    isActive: true,
                }));
                addedCount++;
            }
        }
        const all = await this.domainRepo.find({ order: { isActive: 'DESC', domain: 'ASC' } });
        return {
            message: `Seeded ${addedCount} standard public email provider domains`,
            addedCount,
            totalCount: all.length,
            domains: all,
        };
    }
    async getLoginActivities(page, limit, status, role, method, search, startDate, endDate) {
        const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit || '25', 10) || 25));
        const skip = (pageNum - 1) * limitNum;
        const currentCount = await this.loginActivityRepo.count();
        if (currentCount === 0) {
            await this.seedDemoLoginActivities();
        }
        const qb = this.loginActivityRepo.createQueryBuilder('log');
        if (status && status !== 'ALL') {
            qb.andWhere('log.status = :status', { status: status.toUpperCase() });
        }
        if (role && role !== 'ALL') {
            qb.andWhere('log.role = :role', { role });
        }
        if (method && method !== 'ALL') {
            qb.andWhere('log.loginMethod = :method', { method: method.toUpperCase() });
        }
        if (search && search.trim()) {
            const q = `%${search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(log.email) LIKE :q OR LOWER(log.userName) LIKE :q OR LOWER(log.ipAddress) LIKE :q OR LOWER(log.browser) LIKE :q OR LOWER(log.failureReason) LIKE :q)', { q });
        }
        if (startDate) {
            qb.andWhere('log.createdAt >= :startDate', { startDate: new Date(startDate) });
        }
        if (endDate) {
            qb.andWhere('log.createdAt <= :endDate', { endDate: new Date(endDate) });
        }
        qb.orderBy('log.createdAt', 'DESC');
        qb.skip(skip).take(limitNum);
        const [items, total] = await qb.getManyAndCount();
        return {
            items,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
        };
    }
    async getLoginActivityStats() {
        const currentCount = await this.loginActivityRepo.count();
        if (currentCount === 0) {
            await this.seedDemoLoginActivities();
        }
        const totalAllTime = await this.loginActivityRepo.count();
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const total24h = await this.loginActivityRepo.createQueryBuilder('log')
            .where('log.createdAt >= :since24h', { since24h })
            .getCount();
        const success24h = await this.loginActivityRepo.createQueryBuilder('log')
            .where('log.createdAt >= :since24h AND log.status = :st', { since24h, st: login_activity_entity_1.LoginStatus.SUCCESS })
            .getCount();
        const failed24h = await this.loginActivityRepo.createQueryBuilder('log')
            .where('log.createdAt >= :since24h AND log.status = :st', { since24h, st: login_activity_entity_1.LoginStatus.FAILED })
            .getCount();
        const uniqueUsers24hRaw = await this.loginActivityRepo.createQueryBuilder('log')
            .select('COUNT(DISTINCT log.email)', 'cnt')
            .where('log.createdAt >= :since24h', { since24h })
            .getRawOne();
        const uniqueUsers24h = parseInt(uniqueUsers24hRaw?.cnt || '0', 10);
        const uniqueUsersAllTimeRaw = await this.loginActivityRepo.createQueryBuilder('log')
            .select('COUNT(DISTINCT log.email)', 'cnt')
            .getRawOne();
        const uniqueUsersAllTime = parseInt(uniqueUsersAllTimeRaw?.cnt || '0', 10);
        const recentFailures = await this.loginActivityRepo.find({
            where: { status: login_activity_entity_1.LoginStatus.FAILED },
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const desktopCount = await this.loginActivityRepo.count({ where: { deviceType: 'Desktop' } });
        const mobileCount = await this.loginActivityRepo.count({ where: { deviceType: 'Mobile' } });
        const tabletCount = await this.loginActivityRepo.count({ where: { deviceType: 'Tablet' } });
        const successAllTime = await this.loginActivityRepo.count({ where: { status: login_activity_entity_1.LoginStatus.SUCCESS } });
        const successRate = totalAllTime > 0 ? Math.round((successAllTime / totalAllTime) * 1000) / 10 : 100;
        return {
            totalAllTime,
            total24h,
            success24h,
            failed24h,
            uniqueUsers24h,
            uniqueUsersAllTime,
            successRate,
            recentFailures,
            deviceBreakdown: {
                desktop: desktopCount,
                mobile: mobileCount,
                tablet: tabletCount,
            },
        };
    }
    async seedDemoLoginActivities() {
        const demoLogs = [
            {
                email: 'superadmin@camzyjobs.com',
                userName: 'Platform Superadmin',
                role: user_entity_1.UserRole.SUPER_ADMIN,
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                deviceType: 'Desktop',
                browser: 'Chrome',
                os: 'macOS',
                status: login_activity_entity_1.LoginStatus.SUCCESS,
                loginMethod: login_activity_entity_1.LoginMethod.PASSWORD,
                location: 'Local Network / Dev',
                createdAt: new Date(Date.now() - 5 * 60 * 1000),
            },
            {
                email: 'techcorp@camzyjobs.com',
                userName: 'TechCorp Admin',
                role: user_entity_1.UserRole.COMPANY_ADMIN,
                ipAddress: '142.250.190.46',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                deviceType: 'Desktop',
                browser: 'Chrome',
                os: 'Windows 10/11',
                status: login_activity_entity_1.LoginStatus.SUCCESS,
                loginMethod: login_activity_entity_1.LoginMethod.PASSWORD,
                location: 'San Jose, US',
                createdAt: new Date(Date.now() - 28 * 60 * 1000),
            },
            {
                email: 'candidate@camzyjobs.com',
                userName: 'Alex Johnson',
                role: user_entity_1.UserRole.CANDIDATE,
                ipAddress: '172.56.21.89',
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
                deviceType: 'Mobile',
                browser: 'Safari',
                os: 'iOS',
                status: login_activity_entity_1.LoginStatus.SUCCESS,
                loginMethod: login_activity_entity_1.LoginMethod.OTP,
                location: 'New York, US',
                createdAt: new Date(Date.now() - 65 * 60 * 1000),
            },
            {
                email: 'attacker@untrusted-network.ru',
                userName: null,
                role: null,
                ipAddress: '185.220.101.5',
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
                deviceType: 'Desktop',
                browser: 'Firefox',
                os: 'Linux',
                status: login_activity_entity_1.LoginStatus.FAILED,
                failureReason: 'Account not found with this email',
                loginMethod: login_activity_entity_1.LoginMethod.PASSWORD,
                location: 'Tor Exit Node / External',
                createdAt: new Date(Date.now() - 110 * 60 * 1000),
            },
            {
                email: 'superadmin@camzyjobs.com',
                userName: 'Platform Superadmin',
                role: user_entity_1.UserRole.SUPER_ADMIN,
                ipAddress: '198.51.100.22',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
                deviceType: 'Desktop',
                browser: 'Safari',
                os: 'macOS',
                status: login_activity_entity_1.LoginStatus.FAILED,
                failureReason: 'Invalid password provided',
                loginMethod: login_activity_entity_1.LoginMethod.PASSWORD,
                location: 'Chicago, US',
                createdAt: new Date(Date.now() - 180 * 60 * 1000),
            },
            {
                email: 'recruiter@apex.io',
                userName: 'Sarah Jenkins',
                role: user_entity_1.UserRole.RECRUITER,
                ipAddress: '194.26.29.112',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/125.0.0.0 Safari/537.36',
                deviceType: 'Desktop',
                browser: 'Edge',
                os: 'Windows 10/11',
                status: login_activity_entity_1.LoginStatus.SUCCESS,
                loginMethod: login_activity_entity_1.LoginMethod.PASSWORD,
                location: 'London, UK',
                createdAt: new Date(Date.now() - 4 * 3600 * 1000),
            },
            {
                email: 'priya.dev@camzyjobs.com',
                userName: 'Priya Sharma',
                role: user_entity_1.UserRole.CANDIDATE,
                ipAddress: '103.21.124.5',
                userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36',
                deviceType: 'Mobile',
                browser: 'Chrome',
                os: 'Android',
                status: login_activity_entity_1.LoginStatus.SUCCESS,
                loginMethod: login_activity_entity_1.LoginMethod.OTP,
                location: 'Bengaluru, IN',
                createdAt: new Date(Date.now() - 6 * 3600 * 1000),
            },
            {
                email: 'bot_scanner@darkprobe.io',
                userName: null,
                role: null,
                ipAddress: '45.154.255.80',
                userAgent: 'python-requests/2.31.0',
                deviceType: 'Desktop',
                browser: 'Bot / Script',
                os: 'Linux',
                status: login_activity_entity_1.LoginStatus.FAILED,
                failureReason: 'Email address and password are required',
                loginMethod: login_activity_entity_1.LoginMethod.PASSWORD,
                location: 'Frankfurt, DE',
                createdAt: new Date(Date.now() - 9 * 3600 * 1000),
            },
        ];
        let inserted = 0;
        for (const log of demoLogs) {
            await this.loginActivityRepo.save(this.loginActivityRepo.create(log));
            inserted++;
        }
        return {
            message: `Seeded ${inserted} demo login activity records`,
            count: inserted,
        };
    }
    async clearLoginActivities(days) {
        if (days && parseInt(days, 10) > 0) {
            const cutoff = new Date(Date.now() - parseInt(days, 10) * 86400000);
            await this.loginActivityRepo.createQueryBuilder()
                .delete()
                .from(login_activity_entity_1.LoginActivity)
                .where('createdAt < :cutoff', { cutoff })
                .execute();
            return { message: `Cleared login activities older than ${days} days` };
        }
        const recent = await this.loginActivityRepo.find({
            select: { id: true },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        if (recent.length === 50) {
            const keepIds = recent.map((a) => a.id);
            await this.loginActivityRepo.createQueryBuilder()
                .delete()
                .from(login_activity_entity_1.LoginActivity)
                .where('id NOT IN (:...keepIds)', { keepIds })
                .execute();
        }
        return { message: 'Pruned historical login activities, retaining recent 50 records.' };
    }
    getOfficialDefaultGovtJobs() {
        return [
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'SSC / Staff Selection',
                titleEn: 'Declaration of result of PET/PST to shortlist candidates for appearing in Paper-II.',
                titleHi: 'पेपर-II में उपस्थित होने के लिए उम्मीदवारों को शॉर्टलिस्ट करने हेतु पीईटी/पीएसटी परिणाम की घोषणा।',
                departmentEn: 'Staff Selection Commission (SSC)',
                departmentHi: 'कर्मचारी चयन आयोग (एसएससी)',
                totalVacancies: 'Shortlisting Notice',
                qualificationEn: 'PET/PST Qualified Candidates',
                qualificationHi: 'पीईटी/पीएसटी उत्तीर्ण उम्मीदवार',
                ageLimit: 'As per Notification',
                salaryScale: 'As per SSC Scale',
                startDate: '2026-10-29',
                lastDate: '2026-12-15',
                applyUrl: 'https://ssc.gov.in',
                notificationUrl: 'https://ssc.gov.in',
                officialWebsiteUrl: 'https://ssc.gov.in',
                descriptionEn: 'Official declaration of Physical Efficiency Test (PET) and Physical Standard Test (PST) result to shortlist candidates for Paper-II examination.',
                descriptionHi: 'पेपर-II परीक्षा हेतु उम्मीदवारों की सूची जारी करने के संबंध में आधिकारिक परिणाम घोषणा।',
                isActive: true,
                isFeatured: false,
                orderIndex: 1,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'SSC / Staff Selection',
                titleEn: 'Important Notice - Revised dates for Junior Engineer Examination, 2026 and Sub-Inspector in Delhi Police and Central Armed Police Forces Examination, 2026.',
                titleHi: 'महत्वपूर्ण सूचना - जूनियर इंजीनियर परीक्षा 2026 एवं दिल्ली पुलिस व सीएपीएफ उप-निरीक्षक परीक्षा 2026 की संशोधित तिथियां।',
                departmentEn: 'SSC Examination Cell',
                departmentHi: 'कर्मचारी चयन आयोग (एसएससी)',
                totalVacancies: '3,840 Posts',
                qualificationEn: 'Degree / Diploma in Civil, Electrical, Mechanical Engineering',
                qualificationHi: 'संबंधित इंजीनियरिंग शाखा में डिग्री अथवा डिप्लोमा',
                ageLimit: '18 - 30 Years',
                salaryScale: 'Pay Level 6 (₹35,400 - ₹1,12,400)',
                startDate: '2026-10-26',
                lastDate: '2026-11-30',
                applyUrl: 'https://ssc.gov.in',
                notificationUrl: 'https://ssc.gov.in',
                officialWebsiteUrl: 'https://ssc.gov.in',
                descriptionEn: 'Important notice regarding revised schedule and examination window for Junior Engineer (Civil, Mechanical, Electrical) and Sub-Inspector in Delhi Police & CAPFs.',
                descriptionHi: 'जूनियर इंजीनियर एवं दिल्ली पुलिस व सीएपीएफ में उप-निरीक्षक परीक्षा हेतु संशोधित परीक्षा कार्यक्रम।',
                isActive: true,
                isFeatured: true,
                orderIndex: 2,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'SSC / Staff Selection',
                titleEn: 'Information regarding the city of examination and Admission Certificate for the candidates of Junior Engineer Examination, 2026 (Computer Based Examination) Paper-I',
                titleHi: 'जूनियर इंजीनियर परीक्षा 2026 (कंप्यूटर आधारित परीक्षा) पेपर-I के उम्मीदवारों हेतु परीक्षा शहर एवं प्रवेश पत्र संबंधी सूचना।',
                departmentEn: 'Staff Selection Commission (SSC)',
                departmentHi: 'कर्मचारी चयन आयोग (एसएससी)',
                totalVacancies: 'Paper-I City Intimation',
                qualificationEn: 'Registered Candidates for JE Paper-I',
                qualificationHi: 'पंजीकृत उम्मीदवार',
                ageLimit: '18 - 30 Years',
                salaryScale: 'Pay Level 6',
                startDate: '2026-10-23',
                lastDate: '2026-11-20',
                applyUrl: 'https://ssc.gov.in',
                notificationUrl: 'https://ssc.gov.in',
                officialWebsiteUrl: 'https://ssc.gov.in',
                descriptionEn: 'Exam city intimation slip and admission certificate instructions for candidates appearing in Junior Engineer Paper-I CBT examination.',
                descriptionHi: 'कंप्यूटर आधारित परीक्षा पेपर-I हेतु परीक्षा केंद्र शहर एवं प्रवेश पत्र डाउनलोड करने के संबंध में महत्वपूर्ण निर्देश।',
                isActive: true,
                isFeatured: false,
                orderIndex: 3,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'UPSC / Civil Services',
                titleEn: 'UPSC Civil Services (Preliminary) Examination 2026 (IAS / IPS / IFS)',
                titleHi: 'संघ लोक सेवा आयोग सिविल सेवा (प्रारंभिक) परीक्षा 2026 (आईएएस / आईपीएस)',
                departmentEn: 'Union Public Service Commission (UPSC)',
                departmentHi: 'संघ लोक सेवा आयोग (यूपीएससी), भारत सरकार',
                totalVacancies: '1,056 Posts',
                qualificationEn: "Graduation Degree in any discipline from a recognized University",
                qualificationHi: 'मान्यता प्राप्त विश्वविद्यालय से किसी भी विषय में स्नातक डिग्री',
                ageLimit: '21 - 32 Years',
                salaryScale: 'Pay Level 10 (₹56,100 - ₹1,77,500)',
                startDate: '2026-10-15',
                lastDate: '2026-12-05',
                applyUrl: 'https://upsconline.nic.in',
                notificationUrl: 'https://upsc.gov.in',
                officialWebsiteUrl: 'https://upsc.gov.in',
                descriptionEn: 'Official national competitive exam for appointment to Indian Administrative Service (IAS), Indian Police Service (IPS), and Indian Foreign Service (IFS).',
                descriptionHi: 'भारतीय प्रशासनिक सेवा (आईएएस), भारतीय पुलिस सेवा (आईपीएस) एवं भारतीय विदेश सेवा (आईएफएस) हेतु अखिल भारतीय चयन परीक्षा।',
                isActive: true,
                isFeatured: true,
                orderIndex: 1,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'SSC / Staff Selection',
                titleEn: 'SSC Combined Graduate Level (CGL) 2026 Recruitment for Group B & C Officers',
                titleHi: 'कर्मचारी चयन आयोग संयुक्त स्नातक स्तरीय (CGL) 2026 अधिकारी भर्ती',
                departmentEn: 'Staff Selection Commission (SSC), Govt of India',
                departmentHi: 'कर्मचारी चयन आयोग (एसएससी), भारत सरकार',
                totalVacancies: '17,727 Posts',
                qualificationEn: "Bachelor's Degree from a recognized University or Institute",
                qualificationHi: 'किसी भी मान्यता प्राप्त विश्वविद्यालय से स्नातक डिग्री',
                ageLimit: '18 - 30 Years',
                salaryScale: 'Pay Level 4 to 8 (₹25,500 - ₹1,51,100)',
                startDate: '2026-10-01',
                lastDate: '2026-11-28',
                applyUrl: 'https://ssc.gov.in',
                notificationUrl: 'https://ssc.gov.in',
                officialWebsiteUrl: 'https://ssc.gov.in',
                descriptionEn: 'Recruitment of Assistant Section Officers, Income Tax Inspectors, Central Excise Inspectors, and Sub-Inspectors across Union Ministries.',
                descriptionHi: 'केंद्रीय मंत्रालयों एवं विभागों में सहायक अनुभाग अधिकारी, आयकर निरीक्षक, उत्पाद शुल्क निरीक्षक व उपनिरीक्षक पदों पर भर्ती।',
                isActive: true,
                isFeatured: true,
                orderIndex: 2,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'Railways / RRB',
                titleEn: 'Railway RRB Assistant Loco Pilot (ALP) & Technicians Recruitment 2026',
                titleHi: 'रेलवे भर्ती बोर्ड सहायक लोको पायलट (ALP) एवं तकनीशियन भर्ती 2026',
                departmentEn: 'Ministry of Railways (Railway Recruitment Boards)',
                departmentHi: 'रेल मंत्रालय (रेलवे भर्ती बोर्ड - आरआरबी)',
                totalVacancies: '18,799 Posts',
                qualificationEn: 'Matriculation / 10th Pass plus ITI in specified trades OR Diploma in Engineering',
                qualificationHi: '10वीं उत्तीर्ण साथ में संबंधित ट्रेड में आईटीआई अथवा इंजीनियरिंग डिप्लोमा',
                ageLimit: '18 - 30 Years',
                salaryScale: 'Pay Level 2 (₹19,900 - ₹63,200)',
                startDate: '2026-09-20',
                lastDate: '2026-11-25',
                applyUrl: 'https://www.rrbapply.gov.in',
                notificationUrl: 'https://indianrailways.gov.in',
                officialWebsiteUrl: 'https://indianrailways.gov.in',
                descriptionEn: 'Direct recruitment for Assistant Loco Pilots and Technician Grade III across 21 Railway Recruitment Board zones.',
                descriptionHi: '21 रेलवे भर्ती बोर्ड जोनों में सहायक लोको पायलट एवं तकनीशियन ग्रेड 3 के पदों पर राष्ट्रव्यापी सीधी भर्ती।',
                isActive: true,
                isFeatured: true,
                orderIndex: 3,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'Banking / IBPS',
                titleEn: 'IBPS Probationary Officers (PO/MT XIV) Recruitment in Public Sector Banks',
                titleHi: 'आईबीपीएस राष्ट्रीयकृत बैंकों में प्रोबेशनरी ऑफिसर (पीओ) भर्ती 2026',
                departmentEn: 'Institute of Banking Personnel Selection (IBPS)',
                departmentHi: 'बैंकिंग कार्मिक चयन संस्थान (आईबीपीएस)',
                totalVacancies: '4,455 Posts',
                qualificationEn: 'Graduation in any discipline from a recognized University',
                qualificationHi: 'किसी भी मान्यता प्राप्त विश्वविद्यालय से किसी भी संकाय में स्नातक',
                ageLimit: '20 - 30 Years',
                salaryScale: '₹36,000 - ₹63,840 + DA, HRA, CCA',
                startDate: '2026-10-10',
                lastDate: '2026-11-30',
                applyUrl: 'https://www.ibps.in',
                notificationUrl: 'https://www.ibps.in',
                officialWebsiteUrl: 'https://www.ibps.in',
                descriptionEn: 'Common Recruitment Process for Probationary Officers and Management Trainees in participating 11 public sector banks.',
                descriptionHi: '11 प्रमुख सार्वजनिक क्षेत्र के राष्ट्रीयकृत बैंकों में प्रोबेशनरी ऑफिसर पदों पर नियुक्ति हेतु सामान्य भर्ती प्रक्रिया।',
                isActive: true,
                isFeatured: false,
                orderIndex: 4,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.CENTRAL,
                sector: 'Defence / Armed Forces',
                titleEn: 'Indian Armed Forces Combined Defence Services (CDS) & Agniveer Entry 2026',
                titleHi: 'भारतीय सेना, नौसेना एवं वायुसेना संयुक्त रक्षा सेवा (CDS / अग्निवीर) 2026',
                departmentEn: 'Ministry of Defence, Government of India',
                departmentHi: 'रक्षा मंत्रालय, भारत सरकार',
                totalVacancies: '3,500 Posts',
                qualificationEn: '12th Pass / Graduate Degree depending on army or air force branch',
                qualificationHi: '12वीं अथवा स्नातक डिग्री संबंधित सेना शाखा एवं कैडर अनुसार',
                ageLimit: '17.5 - 24 Years',
                salaryScale: '₹30,000 - ₹56,100 + Military Allowances',
                startDate: '2026-10-05',
                lastDate: '2026-12-10',
                applyUrl: 'https://joinindianarmy.nic.in',
                notificationUrl: 'https://mod.gov.in',
                officialWebsiteUrl: 'https://mod.gov.in',
                descriptionEn: 'Commissioned officers and technical specialists entry into Indian Army, Navy, and Air Force academies.',
                descriptionHi: 'भारतीय थलसेना, नौसेना एवं वायुसेना अकादमियों में अधिकारी एवं तकनीकी पदों पर भर्ती।',
                isActive: true,
                isFeatured: false,
                orderIndex: 5,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.STATE,
                state: 'Uttar Pradesh',
                sector: 'Police / Law Enforcement',
                titleEn: 'UP Police Sub Inspector (SI) & Reserve Civil Constable Recruitment 2026',
                titleHi: 'उत्तर प्रदेश पुलिस उपनिरीक्षक (एसआई) एवं नागरिक आरक्षी भर्ती 2026',
                departmentEn: 'Uttar Pradesh Police Recruitment & Promotion Board (UPPRPB)',
                departmentHi: 'उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड (यूपीपीआरपीबी)',
                totalVacancies: '60,244 Posts',
                qualificationEn: '12th Pass for Constable / Bachelor Degree for Sub Inspector',
                qualificationHi: 'कांस्टेबल पद हेतु 12वीं / उपनिरीक्षक पद हेतु किसी भी विषय में स्नातक',
                ageLimit: '18 - 25 Years',
                salaryScale: 'Pay Level 3 & Level 6 (₹21,700 - ₹1,12,400)',
                startDate: '2026-10-01',
                lastDate: '2026-12-15',
                applyUrl: 'https://uppbpb.gov.in',
                notificationUrl: 'https://uppbpb.gov.in',
                officialWebsiteUrl: 'https://uppbpb.gov.in',
                descriptionEn: 'Historic mega recruitment drive for Civil Police Constables, Firemen, and Sub-Inspectors across Uttar Pradesh.',
                descriptionHi: 'उत्तर प्रदेश के विभिन्न जनपदों में नागरिक पुलिस, पीएसी एवं अग्निशमन सेवा में ऐतिहासिक सिपाही एवं दरोगा भर्ती।',
                isActive: true,
                isFeatured: true,
                orderIndex: 6,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.STATE,
                state: 'Bihar',
                sector: 'State PSC / Civil Services',
                titleEn: 'BPSC 70th Integrated Combined Competitive Examination (CCE) 2026',
                titleHi: 'बिहार लोक सेवा आयोग (बीपीएससी) 70वीं संयुक्त प्रतियोगी परीक्षा 2026',
                departmentEn: 'Bihar Public Service Commission (BPSC), Patna',
                departmentHi: 'बिहार लोक सेवा आयोग (बीपीएससी), पटना',
                totalVacancies: '1,957 Posts',
                qualificationEn: 'Graduation in any discipline from a recognized University',
                qualificationHi: 'किसी भी मान्यता प्राप्त विश्वविद्यालय से स्नातक डिग्री',
                ageLimit: '20 - 37 Years',
                salaryScale: 'Pay Level 7 to Level 9 (₹44,900 - ₹1,67,800)',
                startDate: '2026-09-28',
                lastDate: '2026-11-25',
                applyUrl: 'https://bpsc.bih.nic.in',
                notificationUrl: 'https://bpsc.bih.nic.in',
                officialWebsiteUrl: 'https://bpsc.bih.nic.in',
                descriptionEn: 'State administrative executive recruitment for SDM, DSP, Revenue Officers, and Block Development Officers in Bihar.',
                descriptionHi: 'बिहार प्रशासनिक सेवा, बिहार पुलिस सेवा (डीएसपी), राजस्व अधिकारी एवं प्रखंड विकास पदाधिकारी हेतु संयुक्त परीक्षा।',
                isActive: true,
                isFeatured: true,
                orderIndex: 7,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.STATE,
                state: 'Maharashtra',
                sector: 'State PSC / Administration',
                titleEn: 'Maharashtra State Services Gazetted Combined Preliminary Examination 2026',
                titleHi: 'महाराष्ट्र राज्य सेवा संयुक्त पूर्व परीक्षा 2026 (एमपीएससी राजपत्रित)',
                departmentEn: 'Maharashtra Public Service Commission (MPSC)',
                departmentHi: 'महाराष्ट्र लोक सेवा आयोग (एमपीएससी), मुंबई',
                totalVacancies: '1,030 Posts',
                qualificationEn: 'Degree from a statutory University with working knowledge of Marathi',
                qualificationHi: 'मान्यता प्राप्त विद्यापीठाची पदवी व मराठी भाषेचे परिपूर्ण ज्ञान',
                ageLimit: '19 - 38 Years',
                salaryScale: 'Pay Matrix S-14 to S-20 (₹38,600 - ₹1,22,800)',
                startDate: '2026-10-05',
                lastDate: '2026-12-01',
                applyUrl: 'https://mpsconline.gov.in',
                notificationUrl: 'https://mpsc.gov.in',
                officialWebsiteUrl: 'https://mpsc.gov.in',
                descriptionEn: 'Class A and Class B gazetted administrative posts under Govt of Maharashtra.',
                descriptionHi: 'महाराष्ट्र शासनाच्या विविध विभागांमधील वर्ग १ आणि वर्ग २ च्या राजपत्रित पदांसाठी परीक्षा।',
                isActive: true,
                isFeatured: false,
                orderIndex: 8,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.STATE,
                state: 'Rajasthan',
                sector: 'Revenue & Accounts',
                titleEn: 'RSMSSB Rajasthan Patwari & Junior Accountant Recruitment 2026',
                titleHi: 'राजस्थान कर्मचारी चयन बोर्ड (RSMSSB) पटवारी एवं कनिष्ठ लेखाकार 2026',
                departmentEn: 'Rajasthan Staff Selection Board, Jaipur (RSMSSB)',
                departmentHi: 'राजस्थान कर्मचारी चयन बोर्ड, जयपुर (आरएसएमएसएसबी)',
                totalVacancies: '2,998 Posts',
                qualificationEn: 'Graduation + RSCIT or equivalent recognized computer qualification',
                qualificationHi: 'स्नातक उपाधि एवं आरएससीआईटी अथवा समकक्ष कंप्यूटर दक्षता प्रमाण पत्र',
                ageLimit: '18 - 40 Years',
                salaryScale: 'Pay Matrix L-5 & L-10 (₹20,800 - ₹1,05,500)',
                startDate: '2026-10-12',
                lastDate: '2026-11-20',
                applyUrl: 'https://sso.rajasthan.gov.in',
                notificationUrl: 'https://rsmssb.rajasthan.gov.in',
                officialWebsiteUrl: 'https://rsmssb.rajasthan.gov.in',
                descriptionEn: 'Revenue department patwari, land records inspectors, and junior accountants in Rajasthan Govt.',
                descriptionHi: 'राजस्थान राजस्व विभाग में पटवारी, भू-अभिलेख निरीक्षक एवं अधीनस्थ लेखा सेवा में भर्ती।',
                isActive: true,
                isFeatured: false,
                orderIndex: 9,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.STATE,
                state: 'Delhi',
                sector: 'Teaching / Education',
                titleEn: 'Delhi DSSSB TGT, PGT & Primary Teachers Recruitment 2026',
                titleHi: 'दिल्ली अधीनस्थ सेवा चयन बोर्ड (DSSSB) शिक्षक भर्ती 2026',
                departmentEn: 'Delhi Subordinate Services Selection Board (DSSSB), Govt of NCT Delhi',
                departmentHi: 'दिल्ली अधीनस्थ सेवा चयन बोर्ड (डीएसएसएसबी), दिल्ली सरकार',
                totalVacancies: '4,214 Posts',
                qualificationEn: 'B.Ed / CTET Qualified with relevant Bachelor or Master Degree',
                qualificationHi: 'संबंधित विषय में स्नातक / स्नातकोत्तर साथ में बीएड एवं सीटीईटी उत्तीर्ण',
                ageLimit: 'Up to 30 / 36 Years',
                salaryScale: 'Pay Level 7 to Level 8 (₹44,900 - ₹1,51,100)',
                startDate: '2026-10-18',
                lastDate: '2026-12-10',
                applyUrl: 'https://dsssbonline.nic.in',
                notificationUrl: 'https://dsssb.delhi.gov.in',
                officialWebsiteUrl: 'https://dsssb.delhi.gov.in',
                descriptionEn: 'Teaching faculties recruitment for Directorate of Education and Municipal Corporation of Delhi.',
                descriptionHi: 'दिल्ली सरकार शिक्षा निदेशालय एवं दिल्ली नगर निगम स्कूलों में प्रशिक्षित स्नातक शिक्षक भर्ती।',
                isActive: true,
                isFeatured: true,
                orderIndex: 10,
            },
            {
                category: govt_job_entity_1.GovtJobCategory.STATE,
                state: 'Madhya Pradesh',
                sector: 'Police & Security',
                titleEn: 'MPESB Madhya Pradesh Police Constable & Sub Inspector Recruitment 2026',
                titleHi: 'मध्य प्रदेश कर्मचारी चयन मंडल (MPESB) पुलिस आरक्षक एवं एसआई भर्ती 2026',
                departmentEn: 'Madhya Pradesh Employees Selection Board (MPESB), Bhopal',
                departmentHi: 'मध्य प्रदेश कर्मचारी चयन मंडल (एमपीईएसबी), भोपाल',
                totalVacancies: '7,500 Posts',
                qualificationEn: '10th / 12th Pass for Constable, Graduate for Sub Inspector',
                qualificationHi: 'कांस्टेबल हेतु 10वीं/12वीं, उपनिरीक्षक हेतु किसी भी संकाय में स्नातक',
                ageLimit: '18 - 36 Years',
                salaryScale: '₹19,500 - ₹62,000',
                startDate: '2026-10-08',
                lastDate: '2026-11-26',
                applyUrl: 'https://esb.mp.gov.in',
                notificationUrl: 'https://esb.mp.gov.in',
                officialWebsiteUrl: 'https://esb.mp.gov.in',
                descriptionEn: 'Statewide recruitment for Special Armed Force (SAF) and District Police Force in MP.',
                descriptionHi: 'मध्य प्रदेश विशेष सशस्त्र बल (एसएएफ) एवं जिला पुलिस बल में आरक्षक एवं उपनिरीक्षक भर्ती।',
                isActive: true,
                isFeatured: false,
                orderIndex: 11,
            },
        ];
    }
    async getGovtJobs(category, state, sector, search, status) {
        const count = await this.govtJobRepo.count();
        if (count === 0) {
            const defaults = this.getOfficialDefaultGovtJobs();
            for (const item of defaults) {
                await this.govtJobRepo.save(this.govtJobRepo.create(item));
            }
        }
        const qb = this.govtJobRepo.createQueryBuilder('job');
        if (category && category !== 'ALL') {
            qb.andWhere('job.category = :category', { category });
        }
        if (state && state !== 'ALL') {
            qb.andWhere('job.state = :state', { state });
        }
        if (sector && sector !== 'ALL') {
            qb.andWhere('job.sector = :sector', { sector });
        }
        if (status === 'active') {
            qb.andWhere('job.isActive = :isActive', { isActive: true });
        }
        else if (status === 'inactive') {
            qb.andWhere('job.isActive = :isActive', { isActive: false });
        }
        if (search && search.trim()) {
            const term = `%${search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(job.titleEn) LIKE :term OR LOWER(job.titleHi) LIKE :term OR LOWER(job.departmentEn) LIKE :term OR LOWER(job.departmentHi) LIKE :term OR LOWER(job.sector) LIKE :term OR LOWER(job.state) LIKE :term)', { term });
        }
        qb.orderBy('job.orderIndex', 'ASC').addOrderBy('job.createdAt', 'DESC');
        return await qb.getMany();
    }
    async getGovtJob(id) {
        const job = await this.govtJobRepo.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Govt job notice with ID '${id}' not found`);
        }
        return job;
    }
    async createGovtJob(body) {
        if (!body.titleEn || !body.departmentEn || !body.lastDate || !body.applyUrl) {
            throw new common_1.BadRequestException('English title, department, last date, and official apply URL are required');
        }
        const job = this.govtJobRepo.create({
            category: body.category === 'STATE' ? govt_job_entity_1.GovtJobCategory.STATE : govt_job_entity_1.GovtJobCategory.CENTRAL,
            state: body.category === 'STATE' ? (body.state || 'General') : null,
            sector: body.sector || 'General',
            titleEn: body.titleEn,
            titleHi: body.titleHi || body.titleEn,
            departmentEn: body.departmentEn,
            departmentHi: body.departmentHi || body.departmentEn,
            totalVacancies: body.totalVacancies || 'Multiple Posts',
            qualificationEn: body.qualificationEn || '',
            qualificationHi: body.qualificationHi || body.qualificationEn || '',
            ageLimit: body.ageLimit || '',
            salaryScale: body.salaryScale || '',
            startDate: body.startDate || '',
            lastDate: body.lastDate,
            applyUrl: body.applyUrl,
            notificationUrl: body.notificationUrl || '',
            officialWebsiteUrl: body.officialWebsiteUrl || '',
            descriptionEn: body.descriptionEn || '',
            descriptionHi: body.descriptionHi || '',
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
            isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
            orderIndex: Number(body.orderIndex) || 0,
        });
        return await this.govtJobRepo.save(job);
    }
    async updateGovtJob(id, body) {
        const job = await this.govtJobRepo.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Govt job with ID '${id}' not found`);
        }
        if (body.category !== undefined) {
            job.category = body.category === 'STATE' ? govt_job_entity_1.GovtJobCategory.STATE : govt_job_entity_1.GovtJobCategory.CENTRAL;
        }
        if (body.state !== undefined)
            job.state = body.state;
        if (body.sector !== undefined)
            job.sector = body.sector;
        if (body.titleEn !== undefined)
            job.titleEn = body.titleEn;
        if (body.titleHi !== undefined)
            job.titleHi = body.titleHi;
        if (body.departmentEn !== undefined)
            job.departmentEn = body.departmentEn;
        if (body.departmentHi !== undefined)
            job.departmentHi = body.departmentHi;
        if (body.totalVacancies !== undefined)
            job.totalVacancies = body.totalVacancies;
        if (body.qualificationEn !== undefined)
            job.qualificationEn = body.qualificationEn;
        if (body.qualificationHi !== undefined)
            job.qualificationHi = body.qualificationHi;
        if (body.ageLimit !== undefined)
            job.ageLimit = body.ageLimit;
        if (body.salaryScale !== undefined)
            job.salaryScale = body.salaryScale;
        if (body.startDate !== undefined)
            job.startDate = body.startDate;
        if (body.lastDate !== undefined)
            job.lastDate = body.lastDate;
        if (body.applyUrl !== undefined)
            job.applyUrl = body.applyUrl;
        if (body.notificationUrl !== undefined)
            job.notificationUrl = body.notificationUrl;
        if (body.officialWebsiteUrl !== undefined)
            job.officialWebsiteUrl = body.officialWebsiteUrl;
        if (body.descriptionEn !== undefined)
            job.descriptionEn = body.descriptionEn;
        if (body.descriptionHi !== undefined)
            job.descriptionHi = body.descriptionHi;
        if (body.isActive !== undefined)
            job.isActive = Boolean(body.isActive);
        if (body.isFeatured !== undefined)
            job.isFeatured = Boolean(body.isFeatured);
        if (body.orderIndex !== undefined)
            job.orderIndex = Number(body.orderIndex);
        return await this.govtJobRepo.save(job);
    }
    async deleteGovtJob(id) {
        const job = await this.govtJobRepo.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Govt job with ID '${id}' not found`);
        }
        await this.govtJobRepo.remove(job);
        return { success: true, message: `Govt job notice '${job.titleEn}' removed successfully.` };
    }
    async seedGovtJobDefaults() {
        const defaults = this.getOfficialDefaultGovtJobs();
        let created = 0;
        for (const item of defaults) {
            const existing = await this.govtJobRepo.findOne({ where: { titleEn: item.titleEn } });
            if (!existing) {
                await this.govtJobRepo.save(this.govtJobRepo.create(item));
                created++;
            }
        }
        return { success: true, message: `Seeded ${created} government job notifications`, count: created };
    }
    getDefaultExamCalendarItems() {
        return [
            {
                day: '14',
                month: 'MAR',
                year: '2026',
                titleEn: 'Indian Navy Entrance Test (INET) - [Agniveer (MR as SSR ) and SSR (Medical)]',
                titleHi: 'भारतीय नौसेना प्रवेश परीक्षा (INET) - [अग्निवीर (MR as SSR) एवं SSR (मेडिकल)]',
                board: 'Indian Navy',
                stage: 'Computer Based Exam',
                link: 'https://joinindiannavy.gov.in',
                orderIndex: 1,
                isActive: true,
            },
            {
                day: '16',
                month: 'MAR',
                year: '2026',
                titleEn: 'JSA / LDC Grade Limited Departmental Competitive Examination, 2025 (for DoPT only)',
                titleHi: 'जेएसए / एलडीसी ग्रेड सीमित विभागीय प्रतियोगी परीक्षा, 2025 (केवल डीओपीटी हेतु)',
                board: 'SSC Portal',
                stage: 'Paper-I Written',
                link: 'https://ssc.gov.in',
                orderIndex: 2,
                isActive: true,
            },
            {
                day: '16',
                month: 'MAR',
                year: '2026',
                titleEn: 'ASO Grade Limited Departmental Competitive Examination, 2025',
                titleHi: 'एएसओ ग्रेड सीमित विभागीय प्रतियोगी परीक्षा, 2025',
                board: 'SSC Portal',
                stage: 'Paper-I / II Exam',
                link: 'https://ssc.gov.in',
                orderIndex: 3,
                isActive: true,
            },
            {
                day: '22',
                month: 'NOV',
                year: '2026',
                titleEn: 'UPSC Civil Services (Preliminary) Examination, 2026 Registration Deadline',
                titleHi: 'यूपीएससी सिविल सेवा (प्रारंभिक) परीक्षा, 2026 पंजीकरण अंतिम तिथि',
                board: 'UPSC Online',
                stage: 'Online Registration',
                link: 'https://upsconline.nic.in',
                orderIndex: 4,
                isActive: true,
            },
            {
                day: '28',
                month: 'NOV',
                year: '2026',
                titleEn: 'SSC Combined Graduate Level (CGL) 2026 Tier-I Notification & Scrutiny',
                titleHi: 'एसएससी सीजीएल 2026 टियर-1 परीक्षा अधिसूचना एवं जांच',
                board: 'Staff Selection',
                stage: 'Tier-I CBT Exam',
                link: 'https://ssc.gov.in',
                orderIndex: 5,
                isActive: true,
            },
            {
                day: '05',
                month: 'DEC',
                year: '2026',
                titleEn: 'Railway Recruitment Board (RRB) Assistant Loco Pilot (ALP) CBT-1',
                titleHi: 'आरआरबी रेलवे सहायक लोको पायलट (ALP) सीबीटी-1 परीक्षा',
                board: 'Indian Railways',
                stage: 'Phase-1 CBT',
                link: 'https://www.rrbapply.gov.in',
                orderIndex: 6,
                isActive: true,
            },
            {
                day: '12',
                month: 'DEC',
                year: '2026',
                titleEn: 'IBPS Probationary Officers (PO) / Management Trainee Mains Examination',
                titleHi: 'आईबीपीएस बैंक पीओ / मैनेजमेंट ट्रेनी मुख्य परीक्षा',
                board: 'IBPS Institute',
                stage: 'Mains Examination',
                link: 'https://www.ibps.in',
                orderIndex: 7,
                isActive: true,
            },
        ];
    }
    async getGovtExamCalendar(status) {
        const count = await this.govtExamCalendarRepo.count();
        if (count === 0) {
            const defaults = this.getDefaultExamCalendarItems();
            for (const item of defaults) {
                await this.govtExamCalendarRepo.save(this.govtExamCalendarRepo.create(item));
            }
        }
        const qb = this.govtExamCalendarRepo.createQueryBuilder('item');
        if (status === 'active') {
            qb.where('item.isActive = :isActive', { isActive: true });
        }
        qb.orderBy('item.orderIndex', 'ASC').addOrderBy('item.createdAt', 'ASC');
        return await qb.getMany();
    }
    async createGovtExamCalendarItem(body) {
        if (!body.day || !body.month || !body.titleEn || !body.board) {
            throw new common_1.BadRequestException('Day, Month, English title, and Board name are required');
        }
        const item = this.govtExamCalendarRepo.create({
            day: String(body.day).trim(),
            month: String(body.month).trim().toUpperCase(),
            year: body.year ? String(body.year).trim() : '2026',
            titleEn: String(body.titleEn).trim(),
            titleHi: body.titleHi ? String(body.titleHi).trim() : String(body.titleEn).trim(),
            board: String(body.board).trim(),
            stage: body.stage ? String(body.stage).trim() : 'Computer Based Exam',
            link: body.link ? String(body.link).trim() : 'https://ssc.gov.in',
            orderIndex: Number(body.orderIndex) || 0,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        });
        return await this.govtExamCalendarRepo.save(item);
    }
    async updateGovtExamCalendarItem(id, body) {
        const item = await this.govtExamCalendarRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Calendar item ${id} not found`);
        if (body.day !== undefined)
            item.day = String(body.day).trim();
        if (body.month !== undefined)
            item.month = String(body.month).trim().toUpperCase();
        if (body.year !== undefined)
            item.year = String(body.year).trim();
        if (body.titleEn !== undefined)
            item.titleEn = String(body.titleEn).trim();
        if (body.titleHi !== undefined)
            item.titleHi = String(body.titleHi).trim();
        if (body.board !== undefined)
            item.board = String(body.board).trim();
        if (body.stage !== undefined)
            item.stage = String(body.stage).trim();
        if (body.link !== undefined)
            item.link = String(body.link).trim();
        if (body.orderIndex !== undefined)
            item.orderIndex = Number(body.orderIndex);
        if (body.isActive !== undefined)
            item.isActive = Boolean(body.isActive);
        return await this.govtExamCalendarRepo.save(item);
    }
    async deleteGovtExamCalendarItem(id) {
        const item = await this.govtExamCalendarRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Calendar item ${id} not found`);
        await this.govtExamCalendarRepo.remove(item);
        return { success: true, message: `Exam calendar item '${item.titleEn}' removed.` };
    }
    async seedGovtExamCalendarDefaults() {
        const defaults = this.getDefaultExamCalendarItems();
        let created = 0;
        for (const item of defaults) {
            const existing = await this.govtExamCalendarRepo.findOne({ where: { titleEn: item.titleEn } });
            if (!existing) {
                await this.govtExamCalendarRepo.save(this.govtExamCalendarRepo.create(item));
                created++;
            }
        }
        return { success: true, message: `Seeded ${created} exam calendar items`, count: created };
    }
    getDefaultCommissionPortals() {
        return [
            {
                name: 'UPSC Online',
                nameHi: 'संघ लोक सेवा आयोग (UPSC)',
                url: 'https://upsconline.nic.in',
                desc: 'Civil Services & NDA',
                descHi: 'सिविल सेवा, एनडीए एवं सीडीएस',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 1,
                isActive: true,
            },
            {
                name: 'SSC Portal',
                nameHi: 'कर्मचारी चयन आयोग (SSC)',
                url: 'https://ssc.gov.in',
                desc: 'CGL, CHSL, MTS & GD',
                descHi: 'सीजीएल, सीएचएसएल, एमटीएस एवं जीडी',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 2,
                isActive: true,
            },
            {
                name: 'Indian Railways',
                nameHi: 'भारतीय रेलवे भर्ती बोर्ड (RRB)',
                url: 'https://www.rrbapply.gov.in',
                desc: 'RRB ALP, NTPC, Group D',
                descHi: 'आरआरबी एएलपी, एनटीपीसी, ग्रुप डी',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 3,
                isActive: true,
            },
            {
                name: 'IBPS Banking',
                nameHi: 'आईबीपीएस बैंकिंग संस्थान',
                url: 'https://www.ibps.in',
                desc: 'Bank PO, Clerk, SO',
                descHi: 'बैंक पीओ, क्लर्क एवं विशेषज्ञ अधिकारी',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 4,
                isActive: true,
            },
            {
                name: 'National Career (NCS)',
                nameHi: 'राष्ट्रीय करियर सेवा (NCS)',
                url: 'https://www.ncs.gov.in',
                desc: 'Ministry of Labour',
                descHi: 'श्रम एवं रोजगार मंत्रालय पोर्टल',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 5,
                isActive: true,
            },
            {
                name: 'Join Indian Army',
                nameHi: 'भारतीय थलसेना भर्ती',
                url: 'https://joinindianarmy.nic.in',
                desc: 'Officer & Agniveer',
                descHi: 'अधिकारी एवं अग्निवीर भर्ती',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 6,
                isActive: true,
            },
            {
                name: 'State PSCs Directory',
                nameHi: 'राज्य लोक सेवा आयोग निर्देशिका',
                url: 'https://upsc.gov.in',
                desc: 'All State Service Commissions',
                descHi: 'समस्त राज्य लोक सेवा आयोग लिंक',
                badgeText: '.gov.in / .nic.in',
                orderIndex: 7,
                isActive: true,
            },
        ];
    }
    async getGovtCommissionPortals(status) {
        const count = await this.govtCommissionPortalRepo.count();
        if (count === 0) {
            const defaults = this.getDefaultCommissionPortals();
            for (const item of defaults) {
                await this.govtCommissionPortalRepo.save(this.govtCommissionPortalRepo.create(item));
            }
        }
        const qb = this.govtCommissionPortalRepo.createQueryBuilder('p');
        if (status === 'active') {
            qb.where('p.isActive = :isActive', { isActive: true });
        }
        qb.orderBy('p.orderIndex', 'ASC').addOrderBy('p.createdAt', 'ASC');
        return await qb.getMany();
    }
    async createGovtCommissionPortal(body) {
        if (!body.name || !body.url || !body.desc) {
            throw new common_1.BadRequestException('Portal name, URL, and description are required');
        }
        const item = this.govtCommissionPortalRepo.create({
            name: String(body.name).trim(),
            nameHi: body.nameHi ? String(body.nameHi).trim() : String(body.name).trim(),
            url: String(body.url).trim(),
            desc: String(body.desc).trim(),
            descHi: body.descHi ? String(body.descHi).trim() : String(body.desc).trim(),
            badgeText: body.badgeText ? String(body.badgeText).trim() : '.gov.in / .nic.in',
            orderIndex: Number(body.orderIndex) || 0,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        });
        return await this.govtCommissionPortalRepo.save(item);
    }
    async updateGovtCommissionPortal(id, body) {
        const item = await this.govtCommissionPortalRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Portal ${id} not found`);
        if (body.name !== undefined)
            item.name = String(body.name).trim();
        if (body.nameHi !== undefined)
            item.nameHi = String(body.nameHi).trim();
        if (body.url !== undefined)
            item.url = String(body.url).trim();
        if (body.desc !== undefined)
            item.desc = String(body.desc).trim();
        if (body.descHi !== undefined)
            item.descHi = String(body.descHi).trim();
        if (body.badgeText !== undefined)
            item.badgeText = String(body.badgeText).trim();
        if (body.orderIndex !== undefined)
            item.orderIndex = Number(body.orderIndex);
        if (body.isActive !== undefined)
            item.isActive = Boolean(body.isActive);
        return await this.govtCommissionPortalRepo.save(item);
    }
    async deleteGovtCommissionPortal(id) {
        const item = await this.govtCommissionPortalRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Portal ${id} not found`);
        await this.govtCommissionPortalRepo.remove(item);
        return { success: true, message: `Commission portal '${item.name}' removed.` };
    }
    async seedGovtCommissionPortalDefaults() {
        const defaults = this.getDefaultCommissionPortals();
        let created = 0;
        for (const item of defaults) {
            const existing = await this.govtCommissionPortalRepo.findOne({ where: { name: item.name } });
            if (!existing) {
                await this.govtCommissionPortalRepo.save(this.govtCommissionPortalRepo.create(item));
                created++;
            }
        }
        return { success: true, message: `Seeded ${created} commission portals`, count: created };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch live platform overview metrics from database' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch global transactions and billing invoices for all companies' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: List all registered company tenants with live subscription plans & quotas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllTenants", null);
__decorate([
    (0, common_1.Put)('tenants/:id/plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Upgrade company tenant subscription plan & quota limits' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "upgradeTenantPlan", null);
__decorate([
    (0, common_1.Put)('tenants/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update tenant status (ACTIVE/SUSPENDED/PENDING)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTenantStatus", null);
__decorate([
    (0, common_1.Get)('app-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch global Job Portal platform configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current platform configuration details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AdminController.prototype, "getAppConfig", null);
__decorate([
    (0, common_1.Put)('app-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update Job Portal platform configuration settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated platform configuration details' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AdminController.prototype, "updateAppConfig", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Search and list master locations (Cities, States, Countries)' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('popular')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add new master location' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Put)('locations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update master location' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete master location' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteLocation", null);
__decorate([
    (0, common_1.Get)('skills'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: List all skill taxonomy clusters' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSkills", null);
__decorate([
    (0, common_1.Get)('skills/suggest'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Workday-style skill and keyword autocomplete suggestions' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suggestSkills", null);
__decorate([
    (0, common_1.Post)('skills'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add new skill taxonomy cluster' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSkill", null);
__decorate([
    (0, common_1.Put)('skills/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update skill taxonomy cluster' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSkill", null);
__decorate([
    (0, common_1.Delete)('skills/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete skill taxonomy cluster' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSkill", null);
__decorate([
    (0, common_1.Get)('experience-ranges'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get all experience ranges/brackets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getExperienceRanges", null);
__decorate([
    (0, common_1.Post)('experience-ranges'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add experience range' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createExperienceRange", null);
__decorate([
    (0, common_1.Put)('experience-ranges/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update experience range' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateExperienceRange", null);
__decorate([
    (0, common_1.Delete)('experience-ranges/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete experience range' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteExperienceRange", null);
__decorate([
    (0, common_1.Get)('users/profiles'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: List users by role segment (Candidates, Employers, Admins)' }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserProfiles", null);
__decorate([
    (0, common_1.Post)('users/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Create new user (Candidate, Employer, or Admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update user status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Put)('users/:id/reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Reset user password' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update user profile and details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('jobs/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Get all jobs across all companies with applicant counts' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllJobsAcrossCompanies", null);
__decorate([
    (0, common_1.Post)('jobs/post-as-company'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Post job on behalf of any company without quota check' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "postJobAsCompany", null);
__decorate([
    (0, common_1.Put)('jobs/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Toggle status, featured boost, or expiry date for any job' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateJobStatus", null);
__decorate([
    (0, common_1.Post)('jobs/bulk-renew'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Bulk renew/reactivate expired jobs by extending their expiry date' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkRenewJobs", null);
__decorate([
    (0, common_1.Put)('jobs/:id/expiry'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update job expiry date (Super Admin Exclusive)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateJobExpiry", null);
__decorate([
    (0, common_1.Get)('companies/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Get all registered companies with subscription and job metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllCompanies", null);
__decorate([
    (0, common_1.Post)('companies/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Direct register company/agency' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "registerCompanyDirect", null);
__decorate([
    (0, common_1.Put)('companies/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update company verification or status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCompanyStatus", null);
__decorate([
    (0, common_1.Get)('cms/pages'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get all CMS pages' }),
    __param(0, (0, common_1.Query)('locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCmsPages", null);
__decorate([
    (0, common_1.Post)('cms/pages'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Create CMS page or translated page' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCmsPage", null);
__decorate([
    (0, common_1.Put)('cms/pages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update CMS page' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCmsPage", null);
__decorate([
    (0, common_1.Delete)('cms/pages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete CMS page' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCmsPage", null);
__decorate([
    (0, common_1.Get)('blogs/posts'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get all blog articles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlogPosts", null);
__decorate([
    (0, common_1.Post)('blogs/posts'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Create blog post' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBlogPost", null);
__decorate([
    (0, common_1.Put)('blogs/posts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update blog post' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBlogPost", null);
__decorate([
    (0, common_1.Delete)('blogs/posts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete blog post' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBlogPost", null);
__decorate([
    (0, common_1.Get)('blogs/categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get blog categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlogCategories", null);
__decorate([
    (0, common_1.Post)('blogs/categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Create blog category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBlogCategory", null);
__decorate([
    (0, common_1.Put)('blogs/categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update blog category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBlogCategory", null);
__decorate([
    (0, common_1.Delete)('blogs/categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete blog category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBlogCategory", null);
__decorate([
    (0, common_1.Get)('seo/configs'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get all SEO configurations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSeoConfigs", null);
__decorate([
    (0, common_1.Post)('seo/configs'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add or update SEO configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "saveSeoConfig", null);
__decorate([
    (0, common_1.Put)('seo/configs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update SEO configuration by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSeoConfig", null);
__decorate([
    (0, common_1.Get)('faqs'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get all FAQs' }),
    __param(0, (0, common_1.Query)('audience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFaqs", null);
__decorate([
    (0, common_1.Post)('faqs'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add new FAQ' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createFaq", null);
__decorate([
    (0, common_1.Put)('faqs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update FAQ' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateFaq", null);
__decorate([
    (0, common_1.Delete)('faqs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete FAQ' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteFaq", null);
__decorate([
    (0, common_1.Get)('broadcasts'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Get broadcasting campaigns history' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBroadcasts", null);
__decorate([
    (0, common_1.Get)('broadcasts/segments/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Get audience counts for each broadcast segment' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBroadcastSegmentStats", null);
__decorate([
    (0, common_1.Get)('broadcasts/recipients'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch target audience recipients with multi-criteria filtering' }),
    __param(0, (0, common_1.Query)('segment')),
    __param(1, (0, common_1.Query)('months')),
    __param(2, (0, common_1.Query)('skill')),
    __param(3, (0, common_1.Query)('searchId')),
    __param(4, (0, common_1.Query)('searchName')),
    __param(5, (0, common_1.Query)('searchEmail')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBroadcastRecipients", null);
__decorate([
    (0, common_1.Post)('broadcasts/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Dispatch broadcast email to selected recipients' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendBroadcast", null);
__decorate([
    (0, common_1.Get)('packages'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get all subscription packages' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPackages", null);
__decorate([
    (0, common_1.Post)('packages'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Create subscription package' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Put)('packages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update subscription package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)('packages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete subscription package' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePackage", null);
__decorate([
    (0, common_1.Get)('taxonomies'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin / Public: Get master taxonomy items by type' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTaxonomies", null);
__decorate([
    (0, common_1.Post)('taxonomies'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add master taxonomy item' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createTaxonomy", null);
__decorate([
    (0, common_1.Put)('taxonomies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update master taxonomy item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTaxonomy", null);
__decorate([
    (0, common_1.Delete)('taxonomies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete master taxonomy item' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteTaxonomy", null);
__decorate([
    (0, common_1.Get)('restricted-domains'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: List all restricted employer email domains' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRestrictedDomains", null);
__decorate([
    (0, common_1.Post)('restricted-domains'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add new restricted employer email domain' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createRestrictedDomain", null);
__decorate([
    (0, common_1.Put)('restricted-domains/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update restricted email domain' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRestrictedDomain", null);
__decorate([
    (0, common_1.Delete)('restricted-domains/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete restricted email domain' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteRestrictedDomain", null);
__decorate([
    (0, common_1.Post)('restricted-domains/seed-defaults'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Populate standard public email provider domains' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "seedDefaultRestrictedDomains", null);
__decorate([
    (0, common_1.Get)('login-activities'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: List historical login and authentication activity logs with pagination and filters' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('method')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLoginActivities", null);
__decorate([
    (0, common_1.Get)('login-activities/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Fetch key metrics & analytics for login and authentication activities' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLoginActivityStats", null);
__decorate([
    (0, common_1.Post)('login-activities/seed-demo'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Seed realistic historical login activities for testing and audit visualization' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "seedDemoLoginActivities", null);
__decorate([
    (0, common_1.Delete)('login-activities/clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Clear old login activity records' }),
    __param(0, (0, common_1.Query)('olderThanDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "clearLoginActivities", null);
__decorate([
    (0, common_1.Get)('govt-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of Government job postings (Central & State, Bilingual)' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Query)('sector')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGovtJobs", null);
__decorate([
    (0, common_1.Get)('govt-jobs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single Government job posting details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGovtJob", null);
__decorate([
    (0, common_1.Post)('govt-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Create a new Government job notice' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createGovtJob", null);
__decorate([
    (0, common_1.Put)('govt-jobs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update an existing Government job notice' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateGovtJob", null);
__decorate([
    (0, common_1.Delete)('govt-jobs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete a Government job notice' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteGovtJob", null);
__decorate([
    (0, common_1.Post)('govt-jobs/seed-defaults'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Reset and reseed official Government jobs demo notices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "seedGovtJobDefaults", null);
__decorate([
    (0, common_1.Get)('govt-exam-calendar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Government Examination Calendar events' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGovtExamCalendar", null);
__decorate([
    (0, common_1.Post)('govt-exam-calendar'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add new Government examination calendar notice' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createGovtExamCalendarItem", null);
__decorate([
    (0, common_1.Put)('govt-exam-calendar/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update Government examination calendar notice' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateGovtExamCalendarItem", null);
__decorate([
    (0, common_1.Delete)('govt-exam-calendar/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete Government examination calendar notice' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteGovtExamCalendarItem", null);
__decorate([
    (0, common_1.Post)('govt-exam-calendar/seed-defaults'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Reset and reseed examination calendar demo items' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "seedGovtExamCalendarDefaults", null);
__decorate([
    (0, common_1.Get)('govt-commission-portals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get official Government Commission Portals directory' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGovtCommissionPortals", null);
__decorate([
    (0, common_1.Post)('govt-commission-portals'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Add new Government Commission Portal' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createGovtCommissionPortal", null);
__decorate([
    (0, common_1.Put)('govt-commission-portals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update Government Commission Portal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateGovtCommissionPortal", null);
__decorate([
    (0, common_1.Delete)('govt-commission-portals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Delete Government Commission Portal' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteGovtCommissionPortal", null);
__decorate([
    (0, common_1.Post)('govt-commission-portals/seed-defaults'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Reset and reseed commission portals demo items' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "seedGovtCommissionPortalDefaults", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin Governance'),
    (0, common_1.Controller)('api/v1/admin'),
    __param(1, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(3, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __param(4, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __param(5, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __param(6, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(7, (0, typeorm_1.InjectRepository)(billing_transaction_entity_1.BillingTransaction)),
    __param(8, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(9, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __param(10, (0, typeorm_1.InjectRepository)(skill_keyword_entity_1.SkillKeyword)),
    __param(11, (0, typeorm_1.InjectRepository)(experience_range_entity_1.ExperienceRange)),
    __param(12, (0, typeorm_1.InjectRepository)(system_taxonomy_entity_1.SystemTaxonomy)),
    __param(13, (0, typeorm_1.InjectRepository)(cms_page_entity_1.CmsPage)),
    __param(14, (0, typeorm_1.InjectRepository)(blog_post_entity_1.BlogPost)),
    __param(15, (0, typeorm_1.InjectRepository)(blog_post_entity_1.BlogCategory)),
    __param(16, (0, typeorm_1.InjectRepository)(seo_config_entity_1.SeoConfig)),
    __param(17, (0, typeorm_1.InjectRepository)(faq_item_entity_1.FaqItem)),
    __param(18, (0, typeorm_1.InjectRepository)(email_broadcast_entity_1.EmailBroadcast)),
    __param(19, (0, typeorm_1.InjectRepository)(restricted_domain_entity_1.RestrictedDomain)),
    __param(20, (0, typeorm_1.InjectRepository)(login_activity_entity_1.LoginActivity)),
    __param(21, (0, typeorm_1.InjectRepository)(govt_job_entity_1.GovtJob)),
    __param(22, (0, typeorm_1.InjectRepository)(govt_exam_calendar_entity_1.GovtExamCalendarItem)),
    __param(23, (0, typeorm_1.InjectRepository)(govt_commission_portal_entity_1.GovtCommissionPortal)),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminController);
//# sourceMappingURL=admin.controller.js.map