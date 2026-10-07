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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const subscription_plan_entity_1 = require("../subscriptions/entities/subscription-plan.entity");
const tenant_subscription_entity_1 = require("../subscriptions/entities/tenant-subscription.entity");
const job_posting_entity_1 = require("../jobs/entities/job-posting.entity");
const candidate_entity_1 = require("../candidates/entities/candidate.entity");
const job_application_entity_1 = require("../applications/entities/job-application.entity");
let SeedService = SeedService_1 = class SeedService {
    constructor(userRepo, tenantRepo, planRepo, subRepo, jobRepo, candidateRepo, appRepo) {
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
        this.planRepo = planRepo;
        this.subRepo = subRepo;
        this.jobRepo = jobRepo;
        this.candidateRepo = candidateRepo;
        this.appRepo = appRepo;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        this.logger.log('Checking database status for initial seed data...');
        try {
            await this.seedAll();
        }
        catch (err) {
            this.logger.error('Database seeding error:', err);
        }
    }
    async seedAll() {
        const planCount = await this.planRepo.count();
        let freePlan;
        let growthPlan;
        let proPlan;
        let enterprisePlan;
        if (planCount === 0) {
            this.logger.log('Seeding Subscription Plans...');
            freePlan = await this.planRepo.save(this.planRepo.create({
                name: 'Starter Company',
                code: subscription_plan_entity_1.PlanCode.FREE,
                priceMonthly: 0,
                priceYearly: 0,
                maxActiveJobs: 2,
                maxResumeDownloads: 0,
                maxTeamSeats: 1,
                isActive: true,
            }));
            growthPlan = await this.planRepo.save(this.planRepo.create({
                name: 'Growth Employer',
                code: subscription_plan_entity_1.PlanCode.GROWTH,
                priceMonthly: 99,
                priceYearly: 79,
                maxActiveJobs: 5,
                maxResumeDownloads: 50,
                maxTeamSeats: 3,
                isActive: true,
            }));
            proPlan = await this.planRepo.save(this.planRepo.create({
                name: 'Professional Employer',
                code: subscription_plan_entity_1.PlanCode.PRO,
                priceMonthly: 199,
                priceYearly: 159,
                maxActiveJobs: 15,
                maxResumeDownloads: 150,
                maxTeamSeats: 5,
                isActive: true,
            }));
            enterprisePlan = await this.planRepo.save(this.planRepo.create({
                name: 'Enterprise Scale',
                code: subscription_plan_entity_1.PlanCode.ENTERPRISE,
                priceMonthly: 499,
                priceYearly: 399,
                maxActiveJobs: 50,
                maxResumeDownloads: 500,
                maxTeamSeats: 15,
                isActive: true,
            }));
        }
        else {
            freePlan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.FREE } });
            growthPlan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.GROWTH } });
            proPlan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.PRO } });
            enterprisePlan = await this.planRepo.findOne({ where: { code: subscription_plan_entity_1.PlanCode.ENTERPRISE } });
        }
        const tenantCount = await this.tenantRepo.count();
        let techCorp;
        let finTech;
        let designCraft;
        let neuralMind;
        if (tenantCount === 0) {
            this.logger.log('Seeding Tenants...');
            techCorp = await this.tenantRepo.save(this.tenantRepo.create({
                name: 'TechCorp Global',
                slug: 'techcorp-global',
                type: tenant_entity_1.TenantType.COMPANY,
                logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
                industry: 'Software & Technology',
                description: 'Leading global enterprise technology and software innovation group.',
                status: tenant_entity_1.TenantStatus.ACTIVE,
            }));
            finTech = await this.tenantRepo.save(this.tenantRepo.create({
                name: 'FinTech Dynamics Corp',
                slug: 'fintech-dynamics',
                type: tenant_entity_1.TenantType.COMPANY,
                logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120',
                industry: 'Financial Services',
                description: 'High-throughput payment gateway and algorithmic trading systems.',
                status: tenant_entity_1.TenantStatus.ACTIVE,
            }));
            designCraft = await this.tenantRepo.save(this.tenantRepo.create({
                name: 'DesignCraft Studio',
                slug: 'designcraft-studio',
                type: tenant_entity_1.TenantType.COMPANY,
                logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=120',
                industry: 'Design & Creative',
                description: 'Creative design studio crafting enterprise design tokens and web experiences.',
                status: tenant_entity_1.TenantStatus.ACTIVE,
            }));
            neuralMind = await this.tenantRepo.save(this.tenantRepo.create({
                name: 'Neural Mind AI',
                slug: 'neural-mind-ai',
                type: tenant_entity_1.TenantType.COMPANY,
                logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
                industry: 'Artificial Intelligence',
                description: 'Building next-generation generative AI agent systems.',
                status: tenant_entity_1.TenantStatus.ACTIVE,
            }));
            if (proPlan) {
                await this.subRepo.save(this.subRepo.create({
                    tenantId: techCorp.id,
                    planId: proPlan.id,
                    status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE,
                    activeJobsUsed: 1,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
                }));
            }
            if (growthPlan) {
                await this.subRepo.save(this.subRepo.create({
                    tenantId: finTech.id,
                    planId: growthPlan.id,
                    status: tenant_subscription_entity_1.SubscriptionStatus.ACTIVE,
                    activeJobsUsed: 1,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
                }));
            }
        }
        else {
            techCorp = await this.tenantRepo.findOne({ where: { slug: 'techcorp-global' } });
            finTech = await this.tenantRepo.findOne({ where: { slug: 'fintech-dynamics' } });
            designCraft = await this.tenantRepo.findOne({ where: { slug: 'designcraft-studio' } });
            neuralMind = await this.tenantRepo.findOne({ where: { slug: 'neural-mind-ai' } });
        }
        const userCount = await this.userRepo.count();
        let superAdminUser;
        let employerUser;
        let candidateUser;
        if (userCount === 0) {
            this.logger.log('Seeding Users...');
            superAdminUser = await this.userRepo.save(this.userRepo.create({
                email: 'admin@camzyjobs.com',
                passwordHash: 'admin123',
                firstName: 'Super',
                lastName: 'Admin',
                role: user_entity_1.UserRole.SUPER_ADMIN,
                status: user_entity_1.UserStatus.ACTIVE,
                isEmailVerified: true,
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            }));
            employerUser = await this.userRepo.save(this.userRepo.create({
                email: 'recruiter@techcorp.com',
                passwordHash: 'recruiter123',
                firstName: 'Sarah',
                lastName: 'Jenkins',
                role: user_entity_1.UserRole.COMPANY_ADMIN,
                status: user_entity_1.UserStatus.ACTIVE,
                tenantId: techCorp ? techCorp.id : null,
                isEmailVerified: true,
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            }));
            candidateUser = await this.userRepo.save(this.userRepo.create({
                email: 'candidate@example.com',
                passwordHash: 'candidate123',
                firstName: 'John',
                lastName: 'Doe',
                role: user_entity_1.UserRole.CANDIDATE,
                status: user_entity_1.UserStatus.ACTIVE,
                isEmailVerified: true,
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            }));
        }
        else {
            superAdminUser = await this.userRepo.findOne({ where: { email: 'admin@camzyjobs.com' } });
            employerUser = await this.userRepo.findOne({ where: { email: 'recruiter@techcorp.com' } });
            candidateUser = await this.userRepo.findOne({ where: { email: 'candidate@example.com' } });
        }
        const candidateProfileCount = await this.candidateRepo.count();
        let candidateProfile;
        if (candidateProfileCount === 0 && candidateUser) {
            this.logger.log('Seeding Candidate Profiles...');
            candidateProfile = await this.candidateRepo.save(this.candidateRepo.create({
                userId: candidateUser.id,
                headline: 'Senior Full Stack Engineer | Next.js & NestJS Expert',
                summary: 'Passionate developer with 6+ years building enterprise web applications, microservices, and design systems.',
                currentTitle: 'Senior Full Stack Developer',
                experienceYears: 6,
                expectedSalary: 160000,
                resumeUrl: 'https://example.com/resumes/john-doe-resume.pdf',
                skills: ['TypeScript', 'Next.js', 'NestJS', 'React', 'Tailwind CSS', 'TypeORM', 'MySQL', 'Redis'],
                visibility: candidate_entity_1.ProfileVisibility.PUBLIC,
            }));
        }
        else {
            candidateProfile = await this.candidateRepo.findOne({ where: { userId: candidateUser.id } });
        }
        const jobCount = await this.jobRepo.count();
        let job1;
        if (jobCount === 0 && techCorp && employerUser) {
            this.logger.log('Seeding Job Postings...');
            job1 = await this.jobRepo.save(this.jobRepo.create({
                tenantId: techCorp.id,
                postedByUserId: employerUser.id,
                title: 'Senior Full Stack Engineer (Next.js & NestJS)',
                slug: 'senior-full-stack-engineer-nextjs-nestjs',
                description: 'Lead design and development of enterprise multi-tenant web applications using Next.js App Router and NestJS microservices.',
                category: 'Engineering',
                employmentType: job_posting_entity_1.EmploymentType.FULL_TIME,
                experienceLevel: job_posting_entity_1.ExperienceLevel.SENIOR,
                salaryMin: 140000,
                salaryMax: 180000,
                currency: 'USD',
                isSalaryVisible: true,
                locationCountry: 'United States',
                locationCity: 'San Francisco, CA',
                isRemote: true,
                isFeatured: true,
                status: job_posting_entity_1.JobStatus.PUBLISHED,
                expiresAt: new Date(Date.now() + 60 * 86400000),
                screeningQuestions: [
                    {
                        id: 'q1',
                        questionText: 'How many years of commercial experience do you have with Next.js & NestJS?',
                        questionType: 'CHOICE',
                        options: ['1-2 Years', '3-5 Years', '5+ Years'],
                        isRequired: true,
                    },
                    {
                        id: 'q2',
                        questionText: 'Are you legally authorized to work in the US or work remotely?',
                        questionType: 'YES_NO',
                        isRequired: true,
                    },
                ],
            }));
            if (finTech) {
                await this.jobRepo.save(this.jobRepo.create({
                    tenantId: finTech.id,
                    postedByUserId: employerUser.id,
                    title: 'Principal Cloud Architect (AWS & Microservices)',
                    slug: 'principal-cloud-architect-aws',
                    description: 'Architect high-throughput financial transaction infrastructure with zero downtime and sub-millisecond latencies.',
                    category: 'DevOps & Architecture',
                    employmentType: job_posting_entity_1.EmploymentType.FULL_TIME,
                    experienceLevel: job_posting_entity_1.ExperienceLevel.LEAD,
                    salaryMin: 190000,
                    salaryMax: 240000,
                    currency: 'USD',
                    isSalaryVisible: true,
                    locationCountry: 'United States',
                    locationCity: 'New York, NY',
                    isRemote: false,
                    isFeatured: true,
                    status: job_posting_entity_1.JobStatus.PUBLISHED,
                    expiresAt: new Date(Date.now() + 60 * 86400000),
                }));
            }
            if (designCraft) {
                await this.jobRepo.save(this.jobRepo.create({
                    tenantId: designCraft.id,
                    postedByUserId: employerUser.id,
                    title: 'Senior Product Designer (UI/UX & Design Systems)',
                    slug: 'senior-product-designer',
                    description: 'Craft beautiful responsive UI components, design tokens, and dark/light mode themes for scalable SaaS platforms.',
                    category: 'Design & Creative',
                    employmentType: job_posting_entity_1.EmploymentType.CONTRACT,
                    experienceLevel: job_posting_entity_1.ExperienceLevel.MID,
                    salaryMin: 110000,
                    salaryMax: 140000,
                    currency: 'USD',
                    isSalaryVisible: true,
                    locationCountry: 'United States',
                    locationCity: 'Austin, TX',
                    isRemote: true,
                    isFeatured: false,
                    status: job_posting_entity_1.JobStatus.PUBLISHED,
                    expiresAt: new Date(Date.now() + 60 * 86400000),
                }));
            }
            if (neuralMind) {
                await this.jobRepo.save(this.jobRepo.create({
                    tenantId: neuralMind.id,
                    postedByUserId: employerUser.id,
                    title: 'AI / Machine Learning Engineer (LLMs & Agents)',
                    slug: 'ai-machine-learning-engineer',
                    description: 'Build agentic AI workflows, vector search indexes, and custom fine-tuned models for enterprise talent sourcing.',
                    category: 'Artificial Intelligence',
                    employmentType: job_posting_entity_1.EmploymentType.FULL_TIME,
                    experienceLevel: job_posting_entity_1.ExperienceLevel.SENIOR,
                    salaryMin: 160000,
                    salaryMax: 210000,
                    currency: 'USD',
                    isSalaryVisible: true,
                    locationCountry: 'United States',
                    locationCity: 'Boston, MA',
                    isRemote: true,
                    isFeatured: true,
                    status: job_posting_entity_1.JobStatus.PUBLISHED,
                    expiresAt: new Date(Date.now() + 60 * 86400000),
                }));
            }
        }
        else {
            job1 = await this.jobRepo.findOne({ where: { slug: 'senior-full-stack-engineer-nextjs-nestjs' } });
        }
        const appCount = await this.appRepo.count();
        if (appCount === 0 && job1 && candidateProfile) {
            this.logger.log('Seeding Job Applications...');
            await this.appRepo.save(this.appRepo.create({
                jobId: job1.id,
                candidateId: candidateProfile.id,
                coverLetter: 'I have 6 years of hands-on experience building enterprise web applications using Next.js App Router and NestJS microservices.',
                resumeUrlSnapshot: 'https://example.com/resumes/john-doe-resume.pdf',
                stage: job_application_entity_1.ApplicationStage.SHORTLISTED,
                rating: 5,
            }));
        }
        this.logger.log('🎉 Database seeding verified successfully!');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_subscription_entity_1.TenantSubscription)),
    __param(4, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(5, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __param(6, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map