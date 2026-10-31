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
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const candidate_entity_1 = require("./entities/candidate.entity");
const user_entity_1 = require("../users/entities/user.entity");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
let CandidatesService = class CandidatesService {
    constructor(candidateRepo, userRepo, jobRepo) {
        this.candidateRepo = candidateRepo;
        this.userRepo = userRepo;
        this.jobRepo = jobRepo;
    }
    async findAll(params) {
        const qb = this.candidateRepo.createQueryBuilder('candidate')
            .leftJoinAndSelect('candidate.user', 'user');
        const searchKeyword = (params?.query || params?.skill || '').trim();
        if (searchKeyword) {
            const isBoolean = /\b(AND|OR|NOT)\b/i.test(searchKeyword);
            if (isBoolean) {
                const terms = searchKeyword.replace(/[()]/g, ' ').split(/\s+(?:AND|OR)\s+/i).map((t) => t.trim()).filter(Boolean);
                const conditions = [];
                const qParams = {};
                terms.forEach((term, idx) => {
                    const pName = `term_${idx}`;
                    qParams[pName] = `%${term.toLowerCase()}%`;
                    conditions.push(`(LOWER(candidate.headline) LIKE :${pName} OR LOWER(candidate.currentTitle) LIKE :${pName} OR LOWER(candidate.skills) LIKE :${pName} OR LOWER(candidate.summary) LIKE :${pName} OR LOWER(candidate.resumeParsedText) LIKE :${pName})`);
                });
                if (conditions.length > 0) {
                    qb.andWhere(`(${conditions.join(' OR ')})`, qParams);
                }
            }
            else {
                const terms = searchKeyword.split(',').map((s) => s.trim()).filter(Boolean);
                const conditions = [];
                const qParams = {};
                terms.forEach((term, idx) => {
                    const pName = `term_${idx}`;
                    qParams[pName] = `%${term.toLowerCase()}%`;
                    conditions.push(`(LOWER(candidate.headline) LIKE :${pName} OR LOWER(candidate.currentTitle) LIKE :${pName} OR LOWER(candidate.skills) LIKE :${pName} OR LOWER(candidate.summary) LIKE :${pName} OR LOWER(candidate.resumeParsedText) LIKE :${pName})`);
                });
                if (conditions.length > 0) {
                    qb.andWhere(`(${conditions.join(' OR ')})`, qParams);
                }
            }
        }
        if (params?.excludeKeywords && params.excludeKeywords.trim()) {
            const exTerms = params.excludeKeywords.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
            exTerms.forEach((exTerm, idx) => {
                const pName = `exTerm_${idx}`;
                qb.andWhere(`NOT (LOWER(candidate.headline) LIKE :${pName} OR LOWER(candidate.currentTitle) LIKE :${pName} OR LOWER(candidate.skills) LIKE :${pName} OR LOWER(candidate.summary) LIKE :${pName})`, { [pName]: `%${exTerm}%` });
            });
        }
        const loc = (params?.city || params?.location || '').trim();
        if (loc) {
            qb.andWhere('(LOWER(candidate.preferredLocations) LIKE :loc OR LOWER(candidate.summary) LIKE :loc)', { loc: `%${loc.toLowerCase()}%` });
        }
        if (params?.noticePeriod && params.noticePeriod !== 'Any' && params.noticePeriod !== 'all') {
            const np = params.noticePeriod.toLowerCase();
            if (np.includes('immediate') || np.includes('0-15')) {
                qb.andWhere('(LOWER(candidate.noticePeriod) LIKE :np1 OR LOWER(candidate.noticePeriod) LIKE :np2)', { np1: '%immediate%', np2: '%15%' });
            }
            else if (np.includes('30') || np.includes('1 month')) {
                qb.andWhere('(LOWER(candidate.noticePeriod) LIKE :np1 OR LOWER(candidate.noticePeriod) LIKE :np2)', { np1: '%30%', np2: '%1 month%' });
            }
            else if (np.includes('60') || np.includes('2 month')) {
                qb.andWhere('(LOWER(candidate.noticePeriod) LIKE :np1 OR LOWER(candidate.noticePeriod) LIKE :np2)', { np1: '%60%', np2: '%2 month%' });
            }
            else if (np.includes('90') || np.includes('3 month')) {
                qb.andWhere('(LOWER(candidate.noticePeriod) LIKE :np1 OR LOWER(candidate.noticePeriod) LIKE :np2)', { np1: '%90%', np2: '%3 month%' });
            }
            else if (np.includes('serving')) {
                qb.andWhere('(LOWER(candidate.noticePeriod) LIKE :np1 OR LOWER(candidate.headline) LIKE :np1)', { np1: '%serving%' });
            }
            else {
                qb.andWhere('LOWER(candidate.noticePeriod) LIKE :np', { np: `%${np}%` });
            }
        }
        if (params?.company && params.company.trim()) {
            qb.andWhere('LOWER(candidate.experience) LIKE :comp', { comp: `%${params.company.toLowerCase().trim()}%` });
        }
        if (params?.designation && params.designation.trim()) {
            qb.andWhere('(LOWER(candidate.currentTitle) LIKE :desig OR LOWER(candidate.headline) LIKE :desig OR LOWER(candidate.experience) LIKE :desig)', { desig: `%${params.designation.toLowerCase().trim()}%` });
        }
        if (params?.minExp !== undefined && !isNaN(Number(params.minExp))) {
            qb.andWhere('candidate.experienceYears >= :minExp', { minExp: Number(params.minExp) });
        }
        if (params?.maxExp !== undefined && !isNaN(Number(params.maxExp))) {
            qb.andWhere('candidate.experienceYears <= :maxExp', { maxExp: Number(params.maxExp) });
        }
        if (params?.minSalary !== undefined && !isNaN(Number(params.minSalary))) {
            qb.andWhere('candidate.expectedSalary >= :minSalary', { minSalary: Number(params.minSalary) });
        }
        if (params?.maxSalary !== undefined && !isNaN(Number(params.maxSalary))) {
            qb.andWhere('(candidate.expectedSalary IS NULL OR candidate.expectedSalary <= :maxSalary)', { maxSalary: Number(params.maxSalary) });
        }
        if (params?.activeIn) {
            let days = 365;
            if (params.activeIn === '15d')
                days = 15;
            else if (params.activeIn === '30d')
                days = 30;
            else if (params.activeIn === '3m')
                days = 90;
            else if (params.activeIn === '6m')
                days = 180;
            else if (params.activeIn === '1y')
                days = 365;
            const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            qb.andWhere('(user.lastLoginAt >= :sinceDate OR candidate.updatedAt >= :sinceDate)', { sinceDate });
        }
        if (params?.sortBy === 'exp_desc') {
            qb.orderBy('candidate.experienceYears', 'DESC');
        }
        else if (params?.sortBy === 'exp_asc') {
            qb.orderBy('candidate.experienceYears', 'ASC');
        }
        else if (params?.sortBy === 'salary_desc') {
            qb.orderBy('candidate.expectedSalary', 'DESC');
        }
        else if (params?.sortBy === 'salary_asc') {
            qb.orderBy('candidate.expectedSalary', 'ASC');
        }
        else if (params?.sortBy === 'active') {
            qb.orderBy('user.lastLoginAt', 'DESC');
        }
        else {
            qb.orderBy('candidate.updatedAt', 'DESC');
        }
        const limit = Math.min(Math.max(params?.limit || 20, 1), 100);
        const page = Math.max(params?.page || 1, 1);
        const offset = (page - 1) * limit;
        qb.skip(offset).take(limit);
        const [items, total] = await qb.getManyAndCount();
        const dtos = items.map((c) => this.mapToDto(c));
        return {
            candidates: dtos,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        let candidate = await this.candidateRepo.findOne({
            where: [{ id }, { userId: id }],
            relations: { user: true },
        });
        if (!candidate) {
            try {
                const newCand = this.candidateRepo.create({
                    userId: id,
                    headline: 'Software Engineer',
                    currentTitle: 'Engineer',
                    experienceYears: 2,
                    currentSalary: 75000,
                    expectedSalary: 100000,
                    noticePeriod: '30 Days',
                    preferredLocations: ['Bangalore', 'Remote'],
                    resumeUrl: 'https://example.com/resumes/candidate-resume-2026.pdf',
                    resumes: [
                        {
                            id: 'res-default-1',
                            title: 'Primary Technical Resume.pdf',
                            resumeUrl: 'https://example.com/resumes/candidate-resume-2026.pdf',
                            isDefault: true,
                            uploadedAt: new Date().toISOString(),
                        },
                    ],
                    skills: ['TypeScript', 'React', 'Node.js'],
                });
                candidate = await this.candidateRepo.save(newCand);
                candidate = await this.candidateRepo.findOne({
                    where: { id: candidate.id },
                    relations: { user: true },
                });
            }
            catch (err) {
                throw new common_1.NotFoundException(`Candidate profile ${id} not found`);
            }
        }
        return this.mapToDto(candidate);
    }
    async updateProfile(id, partial) {
        let candidate = await this.candidateRepo.findOne({
            where: [{ id }, { userId: id }],
        });
        if (!candidate) {
            candidate = this.candidateRepo.create({
                userId: id,
                headline: partial.headline || 'Software Engineer',
                summary: partial.summary || '',
                currentTitle: partial.currentTitle || 'Engineer',
                experienceYears: partial.experienceYears || 0,
                expectedSalary: partial.expectedSalary || 0,
                resumeUrl: partial.resumeUrl || '',
                skills: partial.skills || [],
            });
        }
        const sanitizeSalary = (val) => {
            if (val === null || val === undefined || val === '')
                return null;
            if (typeof val === 'number')
                return isNaN(val) ? null : val;
            if (typeof val === 'string') {
                const cleaned = val.replace(/[^0-9.]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            }
            return null;
        };
        if (partial.headline !== undefined)
            candidate.headline = partial.headline;
        if (partial.summary !== undefined)
            candidate.summary = partial.summary;
        if (partial.currentTitle !== undefined)
            candidate.currentTitle = partial.currentTitle;
        if (partial.experienceYears !== undefined)
            candidate.experienceYears = Number(partial.experienceYears) || 0;
        if (partial.currentSalary !== undefined)
            candidate.currentSalary = sanitizeSalary(partial.currentSalary);
        if (partial.expectedSalary !== undefined)
            candidate.expectedSalary = sanitizeSalary(partial.expectedSalary);
        if (partial.noticePeriod !== undefined)
            candidate.noticePeriod = partial.noticePeriod;
        if (partial.preferredLocations !== undefined)
            candidate.preferredLocations = partial.preferredLocations;
        if (partial.resumeUrl !== undefined)
            candidate.resumeUrl = partial.resumeUrl;
        if (partial.resumes !== undefined)
            candidate.resumes = partial.resumes;
        if (partial.skills !== undefined)
            candidate.skills = partial.skills;
        if (partial.experience !== undefined)
            candidate.experience = partial.experience;
        if (partial.education !== undefined)
            candidate.education = partial.education;
        if (partial.certifications !== undefined)
            candidate.certifications = partial.certifications;
        if (partial.projects !== undefined)
            candidate.projects = partial.projects;
        if (partial.languages !== undefined)
            candidate.languages = partial.languages;
        if (partial.socialLinks !== undefined)
            candidate.socialLinks = partial.socialLinks;
        const userUpdates = {};
        const anyPartial = partial;
        if (anyPartial.firstName !== undefined)
            userUpdates.firstName = anyPartial.firstName;
        if (anyPartial.lastName !== undefined)
            userUpdates.lastName = anyPartial.lastName;
        if (anyPartial.phoneNumber !== undefined)
            userUpdates.phoneNumber = anyPartial.phoneNumber;
        if (anyPartial.avatarUrl !== undefined)
            userUpdates.avatarUrl = anyPartial.avatarUrl;
        if (partial.user) {
            if (partial.user.firstName !== undefined)
                userUpdates.firstName = partial.user.firstName;
            if (partial.user.lastName !== undefined)
                userUpdates.lastName = partial.user.lastName;
            if (partial.user.phoneNumber !== undefined)
                userUpdates.phoneNumber = partial.user.phoneNumber;
            if (partial.user.avatarUrl !== undefined)
                userUpdates.avatarUrl = partial.user.avatarUrl;
        }
        if (Object.keys(userUpdates).length > 0 && candidate.userId) {
            await this.userRepo.update(candidate.userId, userUpdates);
        }
        const saved = await this.candidateRepo.save(candidate);
        return this.findOne(saved.id);
    }
    async toggleSaveJob(candidateOrUserId, jobId) {
        let candidate = await this.candidateRepo.findOne({
            where: [{ id: candidateOrUserId }, { userId: candidateOrUserId }],
        });
        if (!candidate) {
            const user = await this.userRepo.findOne({ where: { id: candidateOrUserId } });
            if (!user) {
                throw new common_1.NotFoundException(`User or candidate profile ${candidateOrUserId} not found.`);
            }
            const newCand = this.candidateRepo.create({
                userId: user.id,
                headline: 'Candidate',
                savedJobIds: [jobId],
            });
            candidate = await this.candidateRepo.save(newCand);
            return { saved: true, savedJobIds: candidate.savedJobIds || [jobId] };
        }
        const currentSaved = Array.isArray(candidate.savedJobIds) ? [...candidate.savedJobIds] : [];
        const index = currentSaved.indexOf(jobId);
        let isSavedNow = false;
        if (index >= 0) {
            currentSaved.splice(index, 1);
            isSavedNow = false;
        }
        else {
            currentSaved.push(jobId);
            isSavedNow = true;
        }
        candidate.savedJobIds = currentSaved;
        await this.candidateRepo.save(candidate);
        return { saved: isSavedNow, savedJobIds: currentSaved };
    }
    async getSavedJobs(candidateOrUserId) {
        const candidate = await this.candidateRepo.findOne({
            where: [{ id: candidateOrUserId }, { userId: candidateOrUserId }],
        });
        if (!candidate || !candidate.savedJobIds || candidate.savedJobIds.length === 0) {
            return [];
        }
        const jobs = await this.jobRepo.createQueryBuilder('job')
            .leftJoinAndSelect('job.tenant', 'tenant')
            .where('job.id IN (:...ids)', { ids: candidate.savedJobIds })
            .getMany();
        return jobs.map((job) => ({
            id: job.id,
            tenantId: job.tenantId,
            title: job.title,
            companyName: job.tenant ? job.tenant.name : 'Camzy Enterprise',
            companyLogoUrl: job.tenant?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
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
            createdAt: job.createdAt ? job.createdAt.toISOString() : new Date().toISOString(),
        }));
    }
    mapToDto(c) {
        const rawExp = Array.isArray(c.experience) ? c.experience : [];
        const normalizedExp = rawExp.map((e, idx) => {
            const designation = e.designation || e.title || '';
            const companyName = e.companyName || e.company || '';
            const rolesAndResponsibilities = e.rolesAndResponsibilities || e.description || '';
            const jobSummary = e.jobSummary || '';
            return {
                id: e.id || `exp_${idx}`,
                designation,
                title: designation,
                companyName,
                company: companyName,
                startDate: e.startDate ? String(e.startDate).substring(0, 10) : '',
                endDate: e.endDate ? String(e.endDate).substring(0, 10) : '',
                isCurrentJob: Boolean(e.isCurrentJob ?? e.isCurrent),
                isCurrent: Boolean(e.isCurrent ?? e.isCurrentJob),
                location: e.location || '',
                noticePeriod: e.noticePeriod || '',
                jobSummary,
                rolesAndResponsibilities,
                description: rolesAndResponsibilities || jobSummary,
            };
        });
        const rawEdu = Array.isArray(c.education) ? c.education : [];
        const normalizedEdu = rawEdu.map((ed, idx) => {
            const degree = ed.degree || ed.degree_title || '';
            const institution = ed.institution || '';
            const endYear = ed.endYear || ed.year || '';
            const grade = ed.grade || ed.result || '';
            return {
                id: ed.id || `edu_${idx}`,
                degree,
                degree_title: degree,
                institution,
                fieldOfStudy: ed.fieldOfStudy || '',
                startYear: ed.startYear || '',
                endYear,
                year: endYear,
                grade,
                result: grade,
            };
        });
        const rawResumes = Array.isArray(c.resumes) ? c.resumes : [];
        let normalizedResumes = rawResumes.map((r, idx) => {
            const url = r.resumeUrl || r.url || c.resumeUrl || '';
            const defaultTitle = url ? url.split('/').pop() : `Resume_${idx + 1}.pdf`;
            return {
                id: r.id || `res_${idx}`,
                title: r.title || defaultTitle || 'Resume.pdf',
                resumeUrl: url,
                url: url,
                isDefault: Boolean(r.isDefault ?? (idx === 0)),
                uploadedAt: r.uploadedAt || r.created_at || new Date().toISOString(),
            };
        });
        if (normalizedResumes.length === 0 && c.resumeUrl) {
            const parts = c.resumeUrl.split('/');
            const title = parts[parts.length - 1] || 'Primary Resume.pdf';
            normalizedResumes.push({
                id: 'res_default',
                title,
                resumeUrl: c.resumeUrl,
                url: c.resumeUrl,
                isDefault: true,
                uploadedAt: new Date().toISOString(),
            });
        }
        const defaultResume = normalizedResumes.find((r) => r.isDefault) || normalizedResumes[0];
        const effectiveResumeUrl = c.resumeUrl || (defaultResume ? defaultResume.resumeUrl : undefined);
        return {
            id: c.id,
            userId: c.userId,
            headline: c.headline || 'Software Engineer',
            summary: c.summary || '',
            currentTitle: c.currentTitle || 'Engineer',
            experienceYears: c.experienceYears || (normalizedExp.length > 0 ? Math.min(25, normalizedExp.length * 2) : 0),
            currentSalary: c.currentSalary ? Number(c.currentSalary) : undefined,
            expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
            noticePeriod: c.noticePeriod || 'Immediate',
            preferredLocations: c.preferredLocations || [],
            resumeUrl: effectiveResumeUrl,
            resumes: normalizedResumes,
            savedJobIds: c.savedJobIds || [],
            skills: c.skills || [],
            user: c.user
                ? {
                    email: c.user.email,
                    firstName: c.user.firstName,
                    lastName: c.user.lastName,
                    phoneNumber: c.user.phoneNumber || undefined,
                    avatarUrl: c.user.avatarUrl || undefined,
                    isEmailVerified: c.user.isEmailVerified,
                    isPhoneVerified: c.user.isPhoneVerified,
                    lastLoginAt: c.user.lastLoginAt,
                    createdAt: c.user.createdAt,
                }
                : undefined,
            experience: normalizedExp,
            education: normalizedEdu,
            certifications: c.certifications || [],
            projects: c.projects || [],
            languages: c.languages || [],
            socialLinks: c.socialLinks || {},
            visibility: c.visibility || candidate_entity_1.ProfileVisibility.PUBLIC,
        };
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map