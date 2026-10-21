import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { Tenant, TenantType, TenantStatus } from '../tenants/entities/tenant.entity';
import { SubscriptionPlan, PlanCode } from '../subscriptions/entities/subscription-plan.entity';
import { TenantSubscription, SubscriptionStatus } from '../subscriptions/entities/tenant-subscription.entity';
import { JobPosting, EmploymentType, ExperienceLevel, JobStatus } from '../jobs/entities/job-posting.entity';
import { Candidate, ProfileVisibility } from '../candidates/entities/candidate.entity';
import { JobApplication, ApplicationStage } from '../applications/entities/job-application.entity';
import { BillingTransaction, TransactionType, TransactionStatus } from '../subscriptions/entities/billing-transaction.entity';
import { Location } from '../admin/entities/location.entity';
import { SkillKeyword } from '../admin/entities/skill-keyword.entity';
import { ExperienceRange } from '../admin/entities/experience-range.entity';
import { SystemTaxonomy } from '../admin/entities/system-taxonomy.entity';
import { CmsPage } from '../admin/entities/cms-page.entity';
import { BlogPost, BlogCategory } from '../admin/entities/blog-post.entity';
import { SeoConfig } from '../admin/entities/seo-config.entity';
import { FaqItem } from '../admin/entities/faq-item.entity';
import { EmailBroadcast } from '../admin/entities/email-broadcast.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(TenantSubscription) private readonly subRepo: Repository<TenantSubscription>,
    @InjectRepository(BillingTransaction) private readonly txnRepo: Repository<BillingTransaction>,
    @InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobApplication) private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(Location) private readonly locationRepo: Repository<Location>,
    @InjectRepository(SkillKeyword) private readonly skillRepo: Repository<SkillKeyword>,
    @InjectRepository(ExperienceRange) private readonly expRangeRepo: Repository<ExperienceRange>,
    @InjectRepository(SystemTaxonomy) private readonly taxonomyRepo: Repository<SystemTaxonomy>,
    @InjectRepository(CmsPage) private readonly cmsRepo: Repository<CmsPage>,
    @InjectRepository(BlogPost) private readonly blogPostRepo: Repository<BlogPost>,
    @InjectRepository(BlogCategory) private readonly blogCatRepo: Repository<BlogCategory>,
    @InjectRepository(SeoConfig) private readonly seoRepo: Repository<SeoConfig>,
    @InjectRepository(FaqItem) private readonly faqRepo: Repository<FaqItem>,
    @InjectRepository(EmailBroadcast) private readonly broadcastRepo: Repository<EmailBroadcast>,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking database status for initial seed data...');
    try {
      await this.seedAll();
    } catch (err) {
      this.logger.error('Database seeding error:', err);
    }
  }

  async seedAll() {
    // 1. Seed Subscription Plans
    const planCount = await this.planRepo.count();
    let freePlan: SubscriptionPlan;
    let growthPlan: SubscriptionPlan;
    let proPlan: SubscriptionPlan;
    let enterprisePlan: SubscriptionPlan;

    if (planCount === 0) {
      this.logger.log('Seeding Subscription Plans...');
      freePlan = await this.planRepo.save(
        this.planRepo.create({
          name: 'Starter Company',
          code: PlanCode.FREE,
          priceMonthly: 0,
          priceYearly: 0,
          maxActiveJobs: 2,
          maxResumeDownloads: 0,
          maxTeamSeats: 1,
          isActive: true,
        }),
      );

      growthPlan = await this.planRepo.save(
        this.planRepo.create({
          name: 'Growth Employer',
          code: PlanCode.GROWTH,
          priceMonthly: 99,
          priceYearly: 79,
          maxActiveJobs: 5,
          maxResumeDownloads: 50,
          maxTeamSeats: 3,
          isActive: true,
        }),
      );

      proPlan = await this.planRepo.save(
        this.planRepo.create({
          name: 'Professional Employer',
          code: PlanCode.PRO,
          priceMonthly: 199,
          priceYearly: 159,
          maxActiveJobs: 15,
          maxResumeDownloads: 150,
          maxTeamSeats: 5,
          isActive: true,
        }),
      );

      enterprisePlan = await this.planRepo.save(
        this.planRepo.create({
          name: 'Enterprise Scale',
          code: PlanCode.ENTERPRISE,
          priceMonthly: 499,
          priceYearly: 399,
          maxActiveJobs: 50,
          maxResumeDownloads: 500,
          maxTeamSeats: 15,
          isActive: true,
        }),
      );
    } else {
      freePlan = await this.planRepo.findOne({ where: { code: PlanCode.FREE } });
      growthPlan = await this.planRepo.findOne({ where: { code: PlanCode.GROWTH } });
      proPlan = await this.planRepo.findOne({ where: { code: PlanCode.PRO } });
      enterprisePlan = await this.planRepo.findOne({ where: { code: PlanCode.ENTERPRISE } });
    }

    // 2. Seed Tenants (Companies)
    const tenantCount = await this.tenantRepo.count();
    let techCorp: Tenant;
    let finTech: Tenant;
    let designCraft: Tenant;
    let neuralMind: Tenant;

    if (tenantCount === 0) {
      this.logger.log('Seeding Tenants...');
      techCorp = await this.tenantRepo.save(
        this.tenantRepo.create({
          name: 'TechCorp Global',
          slug: 'techcorp-global',
          type: TenantType.COMPANY,
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
          industry: 'Software & Technology',
          description: 'Leading global enterprise technology and software innovation group.',
          status: TenantStatus.ACTIVE,
        }),
      );

      finTech = await this.tenantRepo.save(
        this.tenantRepo.create({
          name: 'FinTech Dynamics Corp',
          slug: 'fintech-dynamics',
          type: TenantType.COMPANY,
          logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120',
          industry: 'Financial Services',
          description: 'High-throughput payment gateway and algorithmic trading systems.',
          status: TenantStatus.ACTIVE,
        }),
      );

      designCraft = await this.tenantRepo.save(
        this.tenantRepo.create({
          name: 'DesignCraft Studio',
          slug: 'designcraft-studio',
          type: TenantType.COMPANY,
          logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=120',
          industry: 'Design & Creative',
          description: 'Creative design studio crafting enterprise design tokens and web experiences.',
          status: TenantStatus.ACTIVE,
        }),
      );

      neuralMind = await this.tenantRepo.save(
        this.tenantRepo.create({
          name: 'Neural Mind AI',
          slug: 'neural-mind-ai',
          type: TenantType.COMPANY,
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
          industry: 'Artificial Intelligence',
          description: 'Building next-generation generative AI agent systems.',
          status: TenantStatus.ACTIVE,
        }),
      );

      // Seed Subscriptions for Tenants
      if (proPlan) {
        await this.subRepo.save(
          this.subRepo.create({
            tenantId: techCorp.id,
            planId: proPlan.id,
            status: SubscriptionStatus.ACTIVE,
            activeJobsUsed: 1,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
          }),
        );
      }
      if (growthPlan) {
        await this.subRepo.save(
          this.subRepo.create({
            tenantId: finTech.id,
            planId: growthPlan.id,
            status: SubscriptionStatus.ACTIVE,
            activeJobsUsed: 1,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
          }),
        );
      }
    } else {
      techCorp = await this.tenantRepo.findOne({ where: { slug: 'techcorp-global' } });
      finTech = await this.tenantRepo.findOne({ where: { slug: 'fintech-dynamics' } });
      designCraft = await this.tenantRepo.findOne({ where: { slug: 'designcraft-studio' } });
      neuralMind = await this.tenantRepo.findOne({ where: { slug: 'neural-mind-ai' } });
    }

    // 3. Seed Users
    const userCount = await this.userRepo.count();
    let superAdminUser: User;
    let employerUser: User;
    let candidateUser: User;

    if (userCount === 0) {
      this.logger.log('Seeding Users...');
      superAdminUser = await this.userRepo.save(
        this.userRepo.create({
          email: 'admin@camzyjobs.com',
          passwordHash: 'admin123',
          firstName: 'Super',
          lastName: 'Admin',
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        }),
      );

      employerUser = await this.userRepo.save(
        this.userRepo.create({
          email: 'recruiter@techcorp.com',
          passwordHash: 'recruiter123',
          firstName: 'Sarah',
          lastName: 'Jenkins',
          role: UserRole.COMPANY_ADMIN,
          status: UserStatus.ACTIVE,
          tenantId: techCorp ? techCorp.id : null,
          isEmailVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        }),
      );

      await this.userRepo.save(
        this.userRepo.create({
          email: 'employer@techcorp.com',
          passwordHash: 'password123',
          firstName: 'TechCorp',
          lastName: 'Hiring Manager',
          role: UserRole.COMPANY_ADMIN,
          status: UserStatus.ACTIVE,
          tenantId: techCorp ? techCorp.id : null,
          isEmailVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        }),
      );

      candidateUser = await this.userRepo.save(
        this.userRepo.create({
          email: 'candidate@camzyjobs.com',
          passwordHash: 'password123',
          firstName: 'Alex',
          lastName: 'Candidate',
          role: UserRole.CANDIDATE,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        }),
      );

      await this.userRepo.save(
        this.userRepo.create({
          email: 'candidate@example.com',
          passwordHash: 'candidate123',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.CANDIDATE,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        }),
      );
    } else {
      // Ensure candidate@camzyjobs.com and employer@techcorp.com exist even if db was already initialized
      const existingCand = await this.userRepo.findOne({ where: { email: 'candidate@camzyjobs.com' } });
      if (!existingCand) {
        candidateUser = await this.userRepo.save(
          this.userRepo.create({
            email: 'candidate@camzyjobs.com',
            passwordHash: 'password123',
            firstName: 'Alex',
            lastName: 'Candidate',
            role: UserRole.CANDIDATE,
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          }),
        );
      } else {
        candidateUser = existingCand;
      }

      const existingEmp = await this.userRepo.findOne({ where: { email: 'employer@techcorp.com' } });
      if (!existingEmp && techCorp) {
        await this.userRepo.save(
          this.userRepo.create({
            email: 'employer@techcorp.com',
            passwordHash: 'password123',
            firstName: 'TechCorp',
            lastName: 'Hiring Manager',
            role: UserRole.COMPANY_ADMIN,
            status: UserStatus.ACTIVE,
            tenantId: techCorp.id,
            isEmailVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          }),
        );
      }

      superAdminUser = await this.userRepo.findOne({ where: { email: 'admin@camzyjobs.com' } });
      employerUser = await this.userRepo.findOne({ where: { email: 'recruiter@techcorp.com' } });
    }

    // 4. Seed Candidate Profile
    const candidateProfileCount = await this.candidateRepo.count();
    let candidateProfile: Candidate;

    if (candidateProfileCount === 0 && candidateUser) {
      this.logger.log('Seeding Candidate Profiles...');
      candidateProfile = await this.candidateRepo.save(
        this.candidateRepo.create({
          userId: candidateUser.id,
          headline: 'Senior Full Stack Engineer | Next.js & NestJS Expert',
          summary: 'Passionate developer with 6+ years building enterprise web applications, microservices, and design systems.',
          currentTitle: 'Senior Full Stack Developer',
          experienceYears: 6,
          expectedSalary: 160000,
          resumeUrl: 'https://example.com/resumes/john-doe-resume.pdf',
          skills: ['TypeScript', 'Next.js', 'NestJS', 'React', 'Tailwind CSS', 'TypeORM', 'MySQL', 'Redis'],
          visibility: ProfileVisibility.PUBLIC,
        }),
      );
    } else {
      candidateProfile = await this.candidateRepo.findOne({ where: { userId: candidateUser.id } });
    }

    // 5. Seed Job Postings
    const jobCount = await this.jobRepo.count();
    let job1: JobPosting;

    if (jobCount === 0 && techCorp && employerUser) {
      this.logger.log('Seeding Job Postings...');
      job1 = await this.jobRepo.save(
        this.jobRepo.create({
          tenantId: techCorp.id,
          postedByUserId: employerUser.id,
          title: 'Senior Full Stack Engineer (Next.js & NestJS)',
          slug: 'senior-full-stack-engineer-nextjs-nestjs',
          description: 'Lead design and development of enterprise multi-tenant web applications using Next.js App Router and NestJS microservices.',
          category: 'Engineering',
          employmentType: EmploymentType.FULL_TIME,
          experienceLevel: ExperienceLevel.SENIOR,
          salaryMin: 140000,
          salaryMax: 180000,
          currency: 'USD',
          isSalaryVisible: true,
          locationCountry: 'United States',
          locationCity: 'San Francisco, CA',
          isRemote: true,
          isFeatured: true,
          status: JobStatus.PUBLISHED,
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
        }),
      );

      if (finTech) {
        await this.jobRepo.save(
          this.jobRepo.create({
            tenantId: finTech.id,
            postedByUserId: employerUser.id,
            title: 'Principal Cloud Architect (AWS & Microservices)',
            slug: 'principal-cloud-architect-aws',
            description: 'Architect high-throughput financial transaction infrastructure with zero downtime and sub-millisecond latencies.',
            category: 'DevOps & Architecture',
            employmentType: EmploymentType.FULL_TIME,
            experienceLevel: ExperienceLevel.LEAD,
            salaryMin: 190000,
            salaryMax: 240000,
            currency: 'USD',
            isSalaryVisible: true,
            locationCountry: 'United States',
            locationCity: 'New York, NY',
            isRemote: false,
            isFeatured: true,
            status: JobStatus.PUBLISHED,
            expiresAt: new Date(Date.now() + 60 * 86400000),
          }),
        );
      }

      if (designCraft) {
        await this.jobRepo.save(
          this.jobRepo.create({
            tenantId: designCraft.id,
            postedByUserId: employerUser.id,
            title: 'Senior Product Designer (UI/UX & Design Systems)',
            slug: 'senior-product-designer',
            description: 'Craft beautiful responsive UI components, design tokens, and dark/light mode themes for scalable SaaS platforms.',
            category: 'Design & Creative',
            employmentType: EmploymentType.CONTRACT,
            experienceLevel: ExperienceLevel.MID,
            salaryMin: 110000,
            salaryMax: 140000,
            currency: 'USD',
            isSalaryVisible: true,
            locationCountry: 'United States',
            locationCity: 'Austin, TX',
            isRemote: true,
            isFeatured: false,
            status: JobStatus.PUBLISHED,
            expiresAt: new Date(Date.now() + 60 * 86400000),
          }),
        );
      }

      if (neuralMind) {
        await this.jobRepo.save(
          this.jobRepo.create({
            tenantId: neuralMind.id,
            postedByUserId: employerUser.id,
            title: 'AI / Machine Learning Engineer (LLMs & Agents)',
            slug: 'ai-machine-learning-engineer',
            description: 'Build agentic AI workflows, vector search indexes, and custom fine-tuned models for enterprise talent sourcing.',
            category: 'Artificial Intelligence',
            employmentType: EmploymentType.FULL_TIME,
            experienceLevel: ExperienceLevel.SENIOR,
            salaryMin: 160000,
            salaryMax: 210000,
            currency: 'USD',
            isSalaryVisible: true,
            locationCountry: 'United States',
            locationCity: 'Boston, MA',
            isRemote: true,
            isFeatured: true,
            status: JobStatus.PUBLISHED,
            expiresAt: new Date(Date.now() + 60 * 86400000),
          }),
        );
      }
    } else {
      job1 = await this.jobRepo.findOne({ where: { slug: 'senior-full-stack-engineer-nextjs-nestjs' } });
    }

    // 6. Seed Job Applications
    const appCount = await this.appRepo.count();
    if (appCount === 0 && job1 && candidateProfile) {
      this.logger.log('Seeding Job Applications...');
      await this.appRepo.save(
        this.appRepo.create({
          jobId: job1.id,
          candidateId: candidateProfile.id,
          coverLetter: 'I have 6 years of hands-on experience building enterprise web applications using Next.js App Router and NestJS microservices.',
          resumeUrlSnapshot: 'https://example.com/resumes/john-doe-resume.pdf',
          stage: ApplicationStage.SHORTLISTED,
          rating: 5,
        }),
      );
    }

    // 7. Seed Initial Billing Transactions
    const txnCount = await this.txnRepo.count();
    if (txnCount === 0) {
      this.logger.log('Seeding Initial Billing Transactions...');
      const techCorpTenant = await this.tenantRepo.findOne({ where: { slug: 'techcorp-global' } });
      const finTechTenant = await this.tenantRepo.findOne({ where: { slug: 'fintech-dynamics' } });
      const designCraftTenant = await this.tenantRepo.findOne({ where: { slug: 'designcraft-studio' } });
      const neuralMindTenant = await this.tenantRepo.findOne({ where: { slug: 'neural-mind-ai' } });

      const txnsToSeed: BillingTransaction[] = [];

      if (techCorpTenant) {
        txnsToSeed.push(
          this.txnRepo.create({
            invoiceNumber: 'INV-2026-1001',
            tenantId: techCorpTenant.id,
            tenantName: techCorpTenant.name,
            description: 'Professional Employer Tier (Annual Plan)',
            amount: 1908.00,
            currency: 'USD',
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.PAID,
            paymentMethod: 'Stripe Card (•••• 4242)',
            planCode: 'PRO',
            quotaDetails: { activeJobs: 15, resumeDownloads: 150, teamSeats: 5 },
            periodStart: new Date(Date.now() - 5 * 86400000),
            periodEnd: new Date(Date.now() + 360 * 86400000),
            createdAt: new Date(Date.now() - 5 * 86400000),
          }),
          this.txnRepo.create({
            invoiceNumber: 'INV-2026-1045',
            tenantId: techCorpTenant.id,
            tenantName: techCorpTenant.name,
            description: '+50 Candidate Resume Downloads Quota Pack',
            amount: 29.00,
            currency: 'USD',
            type: TransactionType.QUOTA_TOPUP,
            status: TransactionStatus.PAID,
            paymentMethod: 'Stripe Card (•••• 4242)',
            planCode: 'PRO',
            quotaDetails: { resumeDownloads: 50 },
            periodStart: new Date(Date.now() - 3 * 86400000),
            periodEnd: new Date(Date.now() + 27 * 86400000),
            createdAt: new Date(Date.now() - 3 * 86400000),
          }),
          this.txnRepo.create({
            invoiceNumber: 'INV-2026-1089',
            tenantId: techCorpTenant.id,
            tenantName: techCorpTenant.name,
            description: '+2 Extra Team Recruiter Seats Add-on',
            amount: 39.00,
            currency: 'USD',
            type: TransactionType.SEAT_ADDON,
            status: TransactionStatus.PAID,
            paymentMethod: 'Corporate Visa (•••• 8821)',
            planCode: 'PRO',
            quotaDetails: { teamSeats: 2 },
            periodStart: new Date(Date.now() - 1 * 86400000),
            periodEnd: new Date(Date.now() + 29 * 86400000),
            createdAt: new Date(Date.now() - 1 * 86400000),
          }),
        );
      }

      if (finTechTenant) {
        txnsToSeed.push(
          this.txnRepo.create({
            invoiceNumber: 'INV-2026-1002',
            tenantId: finTechTenant.id,
            tenantName: finTechTenant.name,
            description: 'Professional Employer Tier (Monthly Subscription)',
            amount: 199.00,
            currency: 'USD',
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.PAID,
            paymentMethod: 'Corporate Mastercard (•••• 5510)',
            planCode: 'PRO',
            quotaDetails: { activeJobs: 15, resumeDownloads: 150, teamSeats: 5 },
            periodStart: new Date(Date.now() - 4 * 86400000),
            periodEnd: new Date(Date.now() + 26 * 86400000),
            createdAt: new Date(Date.now() - 4 * 86400000),
          }),
        );
      }

      if (neuralMindTenant) {
        txnsToSeed.push(
          this.txnRepo.create({
            invoiceNumber: 'INV-2026-1003',
            tenantId: neuralMindTenant.id,
            tenantName: neuralMindTenant.name,
            description: 'Enterprise Scale Tier (Monthly Subscription)',
            amount: 499.00,
            currency: 'USD',
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.PAID,
            paymentMethod: 'Stripe Corporate (•••• 9940)',
            planCode: 'ENTERPRISE',
            quotaDetails: { activeJobs: 50, resumeDownloads: 500, teamSeats: 15 },
            periodStart: new Date(Date.now() - 6 * 86400000),
            periodEnd: new Date(Date.now() + 24 * 86400000),
            createdAt: new Date(Date.now() - 6 * 86400000),
          }),
        );
      }

      if (designCraftTenant) {
        txnsToSeed.push(
          this.txnRepo.create({
            invoiceNumber: 'INV-2026-1004',
            tenantId: designCraftTenant.id,
            tenantName: designCraftTenant.name,
            description: 'Growth Employer Tier (Monthly Subscription)',
            amount: 99.00,
            currency: 'USD',
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.PAID,
            paymentMethod: 'Stripe Card (•••• 1123)',
            planCode: 'GROWTH',
            quotaDetails: { activeJobs: 5, resumeDownloads: 50, teamSeats: 3 },
            periodStart: new Date(Date.now() - 2 * 86400000),
            periodEnd: new Date(Date.now() + 28 * 86400000),
            createdAt: new Date(Date.now() - 2 * 86400000),
          }),
        );
      }

      if (txnsToSeed.length > 0) {
        await this.txnRepo.save(txnsToSeed);
      }
    }

    // 8. Seed Master Locations (Cities, States, Countries)
    const locationCount = await this.locationRepo.count();
    if (locationCount === 0) {
      this.logger.log('Seeding Master Locations (Cities, States, Countries)...');
      const defaultLocations = [
        // India
        { city: 'Bengaluru', state: 'Karnataka', country: 'India', isPopular: true },
        { city: 'Mumbai', state: 'Maharashtra', country: 'India', isPopular: true },
        { city: 'Gurugram / Delhi NCR', state: 'Haryana', country: 'India', isPopular: true },
        { city: 'Noida', state: 'Uttar Pradesh', country: 'India', isPopular: true },
        { city: 'Hyderabad', state: 'Telangana', country: 'India', isPopular: true },
        { city: 'Pune', state: 'Maharashtra', country: 'India', isPopular: true },
        { city: 'Chennai', state: 'Tamil Nadu', country: 'India', isPopular: true },
        { city: 'Kolkata', state: 'West Bengal', country: 'India', isPopular: false },
        { city: 'Ahmedabad', state: 'Gujarat', country: 'India', isPopular: false },
        { city: 'Kochi', state: 'Kerala', country: 'India', isPopular: false },
        { city: 'Chandigarh', state: 'Punjab', country: 'India', isPopular: false },
        { city: 'Jaipur', state: 'Rajasthan', country: 'India', isPopular: false },
        { city: 'Indore', state: 'Madhya Pradesh', country: 'India', isPopular: false },

        // United States
        { city: 'San Francisco', state: 'California', country: 'United States', isPopular: true },
        { city: 'New York', state: 'New York', country: 'United States', isPopular: true },
        { city: 'Seattle', state: 'Washington', country: 'United States', isPopular: true },
        { city: 'Austin', state: 'Texas', country: 'United States', isPopular: true },
        { city: 'Boston', state: 'Massachusetts', country: 'United States', isPopular: true },
        { city: 'Chicago', state: 'Illinois', country: 'United States', isPopular: false },
        { city: 'Los Angeles', state: 'California', country: 'United States', isPopular: false },
        { city: 'Denver', state: 'Colorado', country: 'United States', isPopular: false },
        { city: 'Atlanta', state: 'Georgia', country: 'United States', isPopular: false },

        // United Kingdom
        { city: 'London', state: 'Greater London', country: 'United Kingdom', isPopular: true },
        { city: 'Manchester', state: 'Greater Manchester', country: 'United Kingdom', isPopular: false },
        { city: 'Edinburgh', state: 'Scotland', country: 'United Kingdom', isPopular: false },
        { city: 'Cambridge', state: 'Cambridgeshire', country: 'United Kingdom', isPopular: false },

        // Canada
        { city: 'Toronto', state: 'Ontario', country: 'Canada', isPopular: true },
        { city: 'Vancouver', state: 'British Columbia', country: 'Canada', isPopular: true },
        { city: 'Montreal', state: 'Quebec', country: 'Canada', isPopular: false },
        { city: 'Ottawa', state: 'Ontario', country: 'Canada', isPopular: false },

        // Europe & Global
        { city: 'Berlin', state: 'Berlin', country: 'Germany', isPopular: true },
        { city: 'Munich', state: 'Bavaria', country: 'Germany', isPopular: false },
        { city: 'Amsterdam', state: 'North Holland', country: 'Netherlands', isPopular: true },
        { city: 'Dublin', state: 'Leinster', country: 'Ireland', isPopular: true },
        { city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', isPopular: true },
        { city: 'Singapore', state: 'Central Region', country: 'Singapore', isPopular: true },
        { city: 'Sydney', state: 'New South Wales', country: 'Australia', isPopular: true },
        { city: 'Melbourne', state: 'Victoria', country: 'Australia', isPopular: false },
        { city: 'Tokyo', state: 'Kanto', country: 'Japan', isPopular: false },
        { city: 'Remote', state: 'Worldwide', country: 'Remote', isPopular: true },
      ];

      const locationEntities = defaultLocations.map((loc) =>
        this.locationRepo.create({
          city: loc.city,
          state: loc.state,
          country: loc.country,
          isPopular: loc.isPopular,
          isActive: true,
        }),
      );
      await this.locationRepo.save(locationEntities);
    }

    // 9. Seed Skills & Keyword Taxonomy (Workday-style Clusters)
    const skillCount = await this.skillRepo.count();
    if (skillCount === 0) {
      this.logger.log('Seeding Skills & Workday-Style Keyword Taxonomy...');
      const defaultSkillClusters = [
        {
          name: 'Java',
          category: 'Backend & Enterprise',
          keywords: [
            'Java',
            'Spring',
            'Spring Boot',
            'Java Backend',
            'Java Microservices',
            'Hibernate',
            'JPA',
            'JVM',
            'Core Java',
            'J2EE',
            'Maven',
            'Gradle',
            'Kafka',
          ],
        },
        {
          name: 'Python',
          category: 'Backend & AI',
          keywords: [
            'Python',
            'Django',
            'FastAPI',
            'Flask',
            'Pandas',
            'NumPy',
            'Data Engineering',
            'Machine Learning',
            'PyTorch',
            'TensorFlow',
            'Celery',
          ],
        },
        {
          name: 'JavaScript & TypeScript',
          category: 'Full Stack & Frontend',
          keywords: [
            'JavaScript',
            'TypeScript',
            'Node.js',
            'Express.js',
            'NestJS',
            'React',
            'Next.js',
            'Vue.js',
            'Angular',
            'Redux',
            'Tailwind CSS',
          ],
        },
        {
          name: 'Cloud & DevOps',
          category: 'Infrastructure & Cloud',
          keywords: [
            'DevOps',
            'AWS',
            'Amazon Web Services',
            'Kubernetes',
            'Docker',
            'Terraform',
            'CI/CD',
            'Azure',
            'GCP',
            'Google Cloud',
            'Linux',
            'Ansible',
            'Helm',
          ],
        },
        {
          name: 'Data Engineering & Analytics',
          category: 'Data & Analytics',
          keywords: [
            'Data Engineering',
            'SQL',
            'PostgreSQL',
            'Snowflake',
            'Apache Spark',
            'Databricks',
            'Airflow',
            'BigQuery',
            'Kafka',
            'ETL',
            'PowerBI',
            'Tableau',
          ],
        },
        {
          name: 'Artificial Intelligence & ML',
          category: 'AI & Data Science',
          keywords: [
            'Artificial Intelligence',
            'Machine Learning',
            'Deep Learning',
            'LLMs',
            'Generative AI',
            'NLP',
            'Computer Vision',
            'LangChain',
            'OpenAI',
            'Hugging Face',
          ],
        },
        {
          name: 'C# & .NET',
          category: 'Backend & Enterprise',
          keywords: [
            'C#',
            '.NET Core',
            'ASP.NET',
            'Entity Framework',
            'Azure',
            'Microservices',
            'WPF',
            'Web API',
          ],
        },
        {
          name: 'Mobile App Development',
          category: 'Mobile',
          keywords: [
            'React Native',
            'Flutter',
            'iOS',
            'Swift',
            'Android',
            'Kotlin',
            'Mobile Engineering',
          ],
        },
        {
          name: 'Database Systems',
          category: 'Database & Storage',
          keywords: [
            'MySQL',
            'PostgreSQL',
            'MongoDB',
            'Redis',
            'Elasticsearch',
            'DynamoDB',
            'Cassandra',
            'Database Architecture',
          ],
        },
        {
          name: 'Product & Project Management',
          category: 'Product & Leadership',
          keywords: [
            'Product Management',
            'Product Strategy',
            'Agile',
            'Scrum',
            'Jira',
            'Sprint Planning',
            'Roadmapping',
            'User Stories',
            'KPIs',
          ],
        },
        {
          name: 'UI/UX Design',
          category: 'Design & Creative',
          keywords: [
            'UI/UX Design',
            'Figma',
            'Wireframing',
            'User Research',
            'Prototyping',
            'Design Systems',
            'Adobe XD',
            'Mobile UI',
            'Web Design',
          ],
        },
        {
          name: 'Cybersecurity',
          category: 'Security & Compliance',
          keywords: [
            'Cybersecurity',
            'SOC 2',
            'Penetration Testing',
            'SIEM',
            'Network Security',
            'Identity & Access Management (IAM)',
            'ISO 27001',
            'Ethical Hacking',
          ],
        },
      ];

      const skillEntities = defaultSkillClusters.map((cluster) =>
        this.skillRepo.create({
          name: cluster.name,
          category: cluster.category,
          keywords: cluster.keywords,
          isActive: true,
        }),
      );
      await this.skillRepo.save(skillEntities);
    }

    // 10. Seed Experience Ranges
    const expCount = await this.expRangeRepo.count();
    if (expCount === 0) {
      this.logger.log('Seeding Experience Ranges...');
      const defaultRanges = [
        { label: '0 - 1 Yrs (Entry / Fresher)', minYears: 0, maxYears: 1, sortOrder: 1 },
        { label: '1 - 3 Yrs (Associate / Junior)', minYears: 1, maxYears: 3, sortOrder: 2 },
        { label: '3 - 5 Yrs (Mid-Level)', minYears: 3, maxYears: 5, sortOrder: 3 },
        { label: '5 - 8 Yrs (Senior)', minYears: 5, maxYears: 8, sortOrder: 4 },
        { label: '8 - 12 Yrs (Staff / Lead)', minYears: 8, maxYears: 12, sortOrder: 5 },
        { label: '12+ Yrs (Principal / Executive)', minYears: 12, maxYears: 30, sortOrder: 6 },
      ];

      const rangeEntities = defaultRanges.map((rng) =>
        this.expRangeRepo.create({
          label: rng.label,
          minYears: rng.minYears,
          maxYears: rng.maxYears,
          sortOrder: rng.sortOrder,
          isActive: true,
        }),
      );
      await this.expRangeRepo.save(rangeEntities);
    }

    // 11. Enrich Existing Job Postings with Structured Location, Experience & Skills
    const allJobs = await this.jobRepo.find();
    for (const j of allJobs) {
      let needsSave = false;
      if (!j.skills || j.skills.length === 0) {
        if (j.title.toLowerCase().includes('full stack') || j.title.toLowerCase().includes('engineer')) {
          j.skills = ['Next.js', 'NestJS', 'TypeScript', 'Node.js', 'Tailwind CSS'];
        } else if (j.title.toLowerCase().includes('cloud') || j.title.toLowerCase().includes('architect')) {
          j.skills = ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Microservices'];
        } else if (j.title.toLowerCase().includes('designer')) {
          j.skills = ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing'];
        } else if (j.title.toLowerCase().includes('machine learning') || j.title.toLowerCase().includes('ai')) {
          j.skills = ['Python', 'PyTorch', 'LLMs', 'Machine Learning', 'LangChain'];
        } else {
          j.skills = ['Java', 'Spring Boot', 'SQL', 'Microservices'];
        }
        needsSave = true;
      }

      if (!j.minExperience && j.minExperience !== 0) {
        j.minExperience = j.experienceLevel === ExperienceLevel.SENIOR ? 5 : j.experienceLevel === ExperienceLevel.LEAD ? 8 : 2;
        j.maxExperience = j.minExperience + 3;
        needsSave = true;
      }

      if (!j.locationCountry) {
        j.locationCountry = 'United States';
        j.locationState = 'California';
        j.locationCity = j.locationCity || 'San Francisco';
        needsSave = true;
      }

      if (needsSave) {
        await this.jobRepo.save(j);
      }
    }

    // 12. Seed System Taxonomies, CMS, Blogs, SEO & FAQs
    await this.seedTaxonomiesAndCms();

    this.logger.log('🎉 Database seeding verified successfully!');
  }

  async seedTaxonomiesAndCms() {
    // A. Seed Master System Taxonomies (16 categories)
    const taxCount = await this.taxonomyRepo.count();
    if (taxCount === 0) {
      this.logger.log('Seeding Master System Taxonomies (16 types)...');

      const items: Array<{ type: string; name: string; code: string; order: number; desc?: string }> = [
        // 1. Language Level
        { type: 'LANGUAGE_LEVEL', name: 'Basic', code: 'basic', order: 1, desc: 'Basic conversational and reading understanding' },
        { type: 'LANGUAGE_LEVEL', name: 'Conversational', code: 'conversational', order: 2, desc: 'Can speak and understand standard workplace dialogue' },
        { type: 'LANGUAGE_LEVEL', name: 'Intermediate', code: 'intermediate', order: 3, desc: 'Comfortable conducting business and writing emails' },
        { type: 'LANGUAGE_LEVEL', name: 'Fluent / Advanced', code: 'fluent', order: 4, desc: 'Fluent technical discussion and presentation skills' },
        { type: 'LANGUAGE_LEVEL', name: 'Native / Bilingual', code: 'native', order: 5, desc: 'Native or mother tongue proficiency' },

        // 2. Career Levels
        { type: 'CAREER_LEVEL', name: 'Student / Intern', code: 'intern', order: 1 },
        { type: 'CAREER_LEVEL', name: 'Entry Level / Associate', code: 'entry', order: 2 },
        { type: 'CAREER_LEVEL', name: 'Mid Level', code: 'mid', order: 3 },
        { type: 'CAREER_LEVEL', name: 'Senior Level', code: 'senior', order: 4 },
        { type: 'CAREER_LEVEL', name: 'Lead / Staff / Manager', code: 'lead', order: 5 },
        { type: 'CAREER_LEVEL', name: 'Director / Executive (VP, C-Level)', code: 'executive', order: 6 },

        // 3. Functional Areas
        { type: 'FUNCTIONAL_AREA', name: 'Software Development & Architecture', code: 'software_dev', order: 1 },
        { type: 'FUNCTIONAL_AREA', name: 'Cloud, Infrastructure & DevOps', code: 'devops', order: 2 },
        { type: 'FUNCTIONAL_AREA', name: 'Data Engineering, AI & Machine Learning', code: 'data_ai', order: 3 },
        { type: 'FUNCTIONAL_AREA', name: 'Quality Assurance & Testing (SDET)', code: 'qa_testing', order: 4 },
        { type: 'FUNCTIONAL_AREA', name: 'Product Management', code: 'product_mgmt', order: 5 },
        { type: 'FUNCTIONAL_AREA', name: 'UI/UX & Product Design', code: 'design_uiux', order: 6 },
        { type: 'FUNCTIONAL_AREA', name: 'Human Resources & Talent Acquisition', code: 'hr_recruitment', order: 7 },
        { type: 'FUNCTIONAL_AREA', name: 'Sales & Business Development', code: 'sales_bizdev', order: 8 },
        { type: 'FUNCTIONAL_AREA', name: 'Marketing, Growth & SEO', code: 'marketing_growth', order: 9 },
        { type: 'FUNCTIONAL_AREA', name: 'Finance, Tax & Accounting', code: 'finance_accounting', order: 10 },
        { type: 'FUNCTIONAL_AREA', name: 'Customer Success & Operations', code: 'customer_success', order: 11 },
        { type: 'FUNCTIONAL_AREA', name: 'Cybersecurity & InfoSec', code: 'cybersecurity', order: 12 },

        // 4. Genders
        { type: 'GENDER', name: 'Any / Equal Opportunity', code: 'any', order: 1 },
        { type: 'GENDER', name: 'Male', code: 'male', order: 2 },
        { type: 'GENDER', name: 'Female', code: 'female', order: 3 },
        { type: 'GENDER', name: 'Non-Binary', code: 'non_binary', order: 4 },
        { type: 'GENDER', name: 'Prefer not to say', code: 'not_specified', order: 5 },

        // 5. Industries
        { type: 'INDUSTRY', name: 'Information Technology & Cloud Services', code: 'it_services', order: 1 },
        { type: 'INDUSTRY', name: 'Software Products (SaaS / Enterprise)', code: 'software_saas', order: 2 },
        { type: 'INDUSTRY', name: 'Banking, Financial Services & FinTech', code: 'fintech_banking', order: 3 },
        { type: 'INDUSTRY', name: 'Healthcare, MedTech & Pharmaceuticals', code: 'healthcare_pharma', order: 4 },
        { type: 'INDUSTRY', name: 'E-Commerce, Marketplace & D2C', code: 'ecommerce', order: 5 },
        { type: 'INDUSTRY', name: 'Telecommunications & 5G Networking', code: 'telecom', order: 6 },
        { type: 'INDUSTRY', name: 'Automotive, EV & Smart Mobility', code: 'automotive_ev', order: 7 },
        { type: 'INDUSTRY', name: 'Manufacturing & Heavy Engineering', code: 'manufacturing', order: 8 },
        { type: 'INDUSTRY', name: 'Education, EdTech & Academic Research', code: 'edtech', order: 9 },
        { type: 'INDUSTRY', name: 'Media, Streaming & Gaming', code: 'media_gaming', order: 10 },
        { type: 'INDUSTRY', name: 'Real Estate, PropTech & Construction', code: 'real_estate', order: 11 },
        { type: 'INDUSTRY', name: 'Consulting, Audit & Advisory', code: 'consulting', order: 12 },

        // 6. Job Experiences
        { type: 'JOB_EXPERIENCE', name: 'Fresher (0 - 1 Years)', code: 'exp_0_1', order: 1 },
        { type: 'JOB_EXPERIENCE', name: 'Junior Associate (1 - 3 Years)', code: 'exp_1_3', order: 2 },
        { type: 'JOB_EXPERIENCE', name: 'Mid-Level Specialist (3 - 5 Years)', code: 'exp_3_5', order: 3 },
        { type: 'JOB_EXPERIENCE', name: 'Senior Engineer / Specialist (5 - 8 Years)', code: 'exp_5_8', order: 4 },
        { type: 'JOB_EXPERIENCE', name: 'Lead / Principal Specialist (8 - 12 Years)', code: 'exp_8_12', order: 5 },
        { type: 'JOB_EXPERIENCE', name: 'Director / Executive (12+ Years)', code: 'exp_12_plus', order: 6 },

        // 7. Job Skills
        { type: 'JOB_SKILL', name: 'Java', code: 'java', order: 1 },
        { type: 'JOB_SKILL', name: 'Spring Boot', code: 'spring_boot', order: 2 },
        { type: 'JOB_SKILL', name: 'Microservices', code: 'microservices', order: 3 },
        { type: 'JOB_SKILL', name: 'Python', code: 'python', order: 4 },
        { type: 'JOB_SKILL', name: 'React', code: 'react', order: 5 },
        { type: 'JOB_SKILL', name: 'Next.js', code: 'nextjs', order: 6 },
        { type: 'JOB_SKILL', name: 'TypeScript', code: 'typescript', order: 7 },
        { type: 'JOB_SKILL', name: 'Node.js', code: 'nodejs', order: 8 },
        { type: 'JOB_SKILL', name: 'NestJS', code: 'nestjs', order: 9 },
        { type: 'JOB_SKILL', name: 'AWS Cloud', code: 'aws', order: 10 },
        { type: 'JOB_SKILL', name: 'Docker Containers', code: 'docker', order: 11 },
        { type: 'JOB_SKILL', name: 'Kubernetes', code: 'kubernetes', order: 12 },
        { type: 'JOB_SKILL', name: 'SQL & Database Architecture', code: 'sql', order: 13 },
        { type: 'JOB_SKILL', name: 'Tailwind CSS', code: 'tailwind', order: 14 },
        { type: 'JOB_SKILL', name: 'Machine Learning & LLMs', code: 'ml_llm', order: 15 },

        // 8. Job Types
        { type: 'JOB_TYPE', name: 'Full-Time Employment', code: 'full_time', order: 1 },
        { type: 'JOB_TYPE', name: 'Part-Time Position', code: 'part_time', order: 2 },
        { type: 'JOB_TYPE', name: 'Contract / C2C', code: 'contract', order: 3 },
        { type: 'JOB_TYPE', name: 'Internship / Apprenticeship', code: 'internship', order: 4 },
        { type: 'JOB_TYPE', name: 'Freelance / Consultant', code: 'freelance', order: 5 },
        { type: 'JOB_TYPE', name: 'Remote Work Only', code: 'remote', order: 6 },

        // 9. Job Shifts
        { type: 'JOB_SHIFT', name: 'Morning / Day Shift', code: 'day_shift', order: 1 },
        { type: 'JOB_SHIFT', name: 'Night / Graveyard Shift', code: 'night_shift', order: 2 },
        { type: 'JOB_SHIFT', name: 'Rotational 24x7 Shift', code: 'rotational_shift', order: 3 },
        { type: 'JOB_SHIFT', name: 'Flexible Working Hours', code: 'flexible_shift', order: 4 },

        // 10. Degree Levels
        { type: 'DEGREE_LEVEL', name: 'High School / Secondary Education', code: 'high_school', order: 1 },
        { type: 'DEGREE_LEVEL', name: 'Polytechnic / Diploma Certificate', code: 'diploma', order: 2 },
        { type: 'DEGREE_LEVEL', name: "Bachelor's Degree", code: 'bachelors', order: 3 },
        { type: 'DEGREE_LEVEL', name: "Master's Degree", code: 'masters', order: 4 },
        { type: 'DEGREE_LEVEL', name: 'Doctorate / Ph.D.', code: 'doctorate', order: 5 },

        // 11. Degree Types
        { type: 'DEGREE_TYPE', name: 'B.Tech / B.E. (Bachelor of Technology / Engineering)', code: 'btech', order: 1 },
        { type: 'DEGREE_TYPE', name: 'B.Sc (Bachelor of Science)', code: 'bsc', order: 2 },
        { type: 'DEGREE_TYPE', name: 'B.Com (Bachelor of Commerce)', code: 'bcom', order: 3 },
        { type: 'DEGREE_TYPE', name: 'BBA (Bachelor of Business Administration)', code: 'bba', order: 4 },
        { type: 'DEGREE_TYPE', name: 'BCA (Bachelor of Computer Applications)', code: 'bca', order: 5 },
        { type: 'DEGREE_TYPE', name: 'M.Tech / M.E. (Master of Technology / Engineering)', code: 'mtech', order: 6 },
        { type: 'DEGREE_TYPE', name: 'M.Sc (Master of Science)', code: 'msc', order: 7 },
        { type: 'DEGREE_TYPE', name: 'MBA (Master of Business Administration)', code: 'mba', order: 8 },
        { type: 'DEGREE_TYPE', name: 'MCA (Master of Computer Applications)', code: 'mca', order: 9 },
        { type: 'DEGREE_TYPE', name: 'Ph.D. / Doctorate', code: 'phd', order: 10 },

        // 12. Major Subjects
        { type: 'MAJOR_SUBJECT', name: 'Computer Science & Engineering', code: 'cse', order: 1 },
        { type: 'MAJOR_SUBJECT', name: 'Information Technology', code: 'it', order: 2 },
        { type: 'MAJOR_SUBJECT', name: 'Electronics & Communication', code: 'ece', order: 3 },
        { type: 'MAJOR_SUBJECT', name: 'Electrical Engineering', code: 'eee', order: 4 },
        { type: 'MAJOR_SUBJECT', name: 'Mechanical & Automation', code: 'mech', order: 5 },
        { type: 'MAJOR_SUBJECT', name: 'Data Science & Artificial Intelligence', code: 'ds_ai', order: 6 },
        { type: 'MAJOR_SUBJECT', name: 'Finance, Corporate Accounting & Tax', code: 'finance', order: 7 },
        { type: 'MAJOR_SUBJECT', name: 'Marketing, Digital Brand & Advertising', code: 'marketing', order: 8 },
        { type: 'MAJOR_SUBJECT', name: 'Human Resource Management', code: 'hrm', order: 9 },
        { type: 'MAJOR_SUBJECT', name: 'General Business Administration', code: 'business_admin', order: 10 },

        // 13. Result Types
        { type: 'RESULT_TYPE', name: 'Percentage (%)', code: 'percentage', order: 1 },
        { type: 'RESULT_TYPE', name: 'CGPA (Scale of 10.0)', code: 'cgpa_10', order: 2 },
        { type: 'RESULT_TYPE', name: 'GPA (Scale of 4.0)', code: 'gpa_4', order: 3 },
        { type: 'RESULT_TYPE', name: 'Letter Grade (A+, A, B, C)', code: 'letter_grade', order: 4 },
        { type: 'RESULT_TYPE', name: 'Pass / Completed', code: 'pass_fail', order: 5 },

        // 14. Marital Status
        { type: 'MARITAL_STATUS', name: 'Single / Unmarried', code: 'single', order: 1 },
        { type: 'MARITAL_STATUS', name: 'Married', code: 'married', order: 2 },
        { type: 'MARITAL_STATUS', name: 'Divorced', code: 'divorced', order: 3 },
        { type: 'MARITAL_STATUS', name: 'Widowed', code: 'widowed', order: 4 },

        // 15. Ownership Types
        { type: 'OWNERSHIP_TYPE', name: 'Private Limited Company (Pvt Ltd)', code: 'pvt_ltd', order: 1 },
        { type: 'OWNERSHIP_TYPE', name: 'Public Limited / Listed Enterprise', code: 'public_ltd', order: 2 },
        { type: 'OWNERSHIP_TYPE', name: 'Government / Public Sector Undertaking (PSU)', code: 'govt_psu', order: 3 },
        { type: 'OWNERSHIP_TYPE', name: 'Sole Proprietorship', code: 'sole_proprietorship', order: 4 },
        { type: 'OWNERSHIP_TYPE', name: 'Partnership / Limited Liability Partnership (LLP)', code: 'llp', order: 5 },
        { type: 'OWNERSHIP_TYPE', name: 'Non-Profit Organization / NGO', code: 'ngo', order: 6 },

        // 16. Salary Periods
        { type: 'SALARY_PERIOD', name: 'Per Annum (Yearly CTC)', code: 'per_annum', order: 1 },
        { type: 'SALARY_PERIOD', name: 'Per Month', code: 'per_month', order: 2 },
        { type: 'SALARY_PERIOD', name: 'Per Week', code: 'per_week', order: 3 },
        { type: 'SALARY_PERIOD', name: 'Per Hour', code: 'per_hour', order: 4 },
      ];

      const entities = items.map((it) =>
        this.taxonomyRepo.create({
          type: it.type,
          name: it.name,
          code: it.code,
          description: it.desc,
          orderIndex: it.order,
          isActive: true,
        }),
      );
      await this.taxonomyRepo.save(entities);
      this.logger.log(`✅ Seeded ${entities.length} master taxonomy items!`);
    }

    // B. Seed CMS Pages
    const cmsCount = await this.cmsRepo.count();
    if (cmsCount === 0) {
      this.logger.log('Seeding default CMS Pages...');
      const pages = [
        {
          title: 'About Camzy Jobs',
          slug: 'about-us',
          locale: 'en',
          contentHtml: '<h1>About Camzy Jobs</h1><p>Camzy Jobs is the next-generation multi-tenant enterprise recruitment ecosystem empowering companies and recruitment agencies.</p>',
          seoTitle: 'About Us | Camzy Jobs Enterprise Ecosystem',
          seoDescription: 'Learn about the mission, infrastructure, and hiring solutions provided by Camzy Jobs.',
        },
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          locale: 'en',
          contentHtml: '<h1>Terms of Service</h1><p>Please review our terms governing employer subscriptions, job postings, candidate resume access, and quotas.</p>',
          seoTitle: 'Terms of Service | Camzy Jobs',
          seoDescription: 'Official terms and conditions for employers and candidates using the Camzy Jobs portal.',
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          locale: 'en',
          contentHtml: '<h1>Privacy Policy</h1><p>Your privacy is paramount. We safeguard resume data and ensure strict multi-tenant isolation across all organizations.</p>',
          seoTitle: 'Privacy Policy | Camzy Jobs',
          seoDescription: 'Data protection policies, privacy standards, and candidate confidentiality guidelines.',
        },
        {
          title: 'Refund & Cancellation Policy',
          slug: 'refund-policy',
          locale: 'en',
          contentHtml: '<h1>Refund & Cancellation Policy</h1><p>Our transparent refund rules ensure fair credit usage and subscription renewals for all corporate tenants.</p>',
          seoTitle: 'Refund Policy | Camzy Jobs',
          seoDescription: 'Refund and billing cancellation rules for subscription plans.',
        },
      ];
      await this.cmsRepo.save(pages.map((p) => this.cmsRepo.create(p)));
      this.logger.log('✅ Seeded default CMS Pages!');
    }

    // C. Seed Blog Categories & Posts
    const blogCount = await this.blogPostRepo.count();
    if (blogCount === 0) {
      this.logger.log('Seeding Blog Categories and Posts...');
      const cat1 = await this.blogCatRepo.save(
        this.blogCatRepo.create({ name: 'Career Growth', slug: 'career-growth', description: 'Strategies to level up your engineering career' }),
      );
      const cat2 = await this.blogCatRepo.save(
        this.blogCatRepo.create({ name: 'Hiring Insights', slug: 'hiring-insights', description: 'Trends in tech recruitment and ATS systems' }),
      );

      await this.blogPostRepo.save([
        this.blogPostRepo.create({
          title: 'Mastering Full-Stack & Microservices Architecture in 2026',
          slug: 'mastering-fullstack-microservices-2026',
          category: cat1.name,
          authorName: 'Camzy Tech Editorial',
          summary: 'A deep dive into distributed systems, Next.js 14 App Router, and scalable NestJS backend services.',
          content: 'Full stack development has evolved drastically. Microservices orchestrated with Kubernetes and asynchronous message brokers provide ultra-high resiliency.',
          coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
          isPublished: true,
          publishedAt: new Date(),
        }),
        this.blogPostRepo.create({
          title: 'How Multi-Tenant Recruitment Portals Streamline Agency ATS',
          slug: 'multi-tenant-recruitment-portals-agency-ats',
          category: cat2.name,
          authorName: 'Talent Acquisition Team',
          summary: 'Why modern recruitment agencies need multi-client job management and automated resume parsing pipelines.',
          content: 'Recruitment consultancies often manage dozens of hiring clients simultaneously. Multi-tenant quota governance ensures seamless billing and compliance.',
          coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
          isPublished: true,
          publishedAt: new Date(),
        }),
      ]);
      this.logger.log('✅ Seeded default Blog categories and articles!');
    }

    // D. Seed SEO Configs for Core Pages
    const seoCount = await this.seoRepo.count();
    if (seoCount === 0) {
      this.logger.log('Seeding SEO Configurations...');
      const seoPages = [
        {
          pageKey: 'home',
          pageName: 'Public Homepage',
          metaTitle: 'Camzy Jobs | Enterprise Job Portal & Recruitment Ecosystem',
          metaDescription: 'Find top tech jobs, explore verified companies, and access placement agency talent pools.',
          metaKeywords: 'jobs, recruitment, careers, full stack, tech hiring, placement agencies',
          canonicalUrl: 'https://camzyjobs.com',
        },
        {
          pageKey: 'jobs',
          pageName: 'Job Search & Directory',
          metaTitle: 'Explore Tech & Corporate Jobs | Camzy Jobs Directory',
          metaDescription: 'Search thousands of verified jobs with Workday-style skill suggestions, location and experience filters.',
          metaKeywords: 'software engineer jobs, devops jobs, remote jobs, tech careers',
          canonicalUrl: 'https://camzyjobs.com/jobs',
        },
        {
          pageKey: 'companies',
          pageName: 'Companies & Employers Directory',
          metaTitle: 'Top Verified Employers & Recruitment Agencies | Camzy Jobs',
          metaDescription: 'Browse profiles of top product companies, MNCs, and placement consultancies hiring now.',
          metaKeywords: 'companies hiring, top employers, tech startups, placement consultants',
          canonicalUrl: 'https://camzyjobs.com/companies',
        },
        {
          pageKey: 'blogs',
          pageName: 'Career & Industry Blogs',
          metaTitle: 'Career Insights, Engineering & Hiring Trends | Camzy Blog',
          metaDescription: 'Actionable tips on interview preparation, resume building, and tech recruiting.',
          metaKeywords: 'career advice, engineering blog, tech recruiting tips',
          canonicalUrl: 'https://camzyjobs.com/blogs',
        },
      ];
      await this.seoRepo.save(seoPages.map((s) => this.seoRepo.create(s)));
      this.logger.log('✅ Seeded default SEO Configurations!');
    }

    // E. Seed FAQs
    const faqCount = await this.faqRepo.count();
    if (faqCount === 0) {
      this.logger.log('Seeding FAQs...');
      const faqs = [
        {
          question: 'How do employers post jobs on Camzy Jobs?',
          answer: 'Employers can register, choose a subscription package tailored to their hiring volume, and instantly publish job listings with screening questions.',
          category: 'Employers',
          targetAudience: 'EMPLOYERS',
          orderIndex: 1,
          isActive: true,
        },
        {
          question: 'Can recruitment consultancies manage multiple client companies?',
          answer: 'Yes! Placement agency subscriptions allow consultancies to register external client companies and post jobs on their behalf under one quota-controlled plan.',
          category: 'Consultancies',
          targetAudience: 'EMPLOYERS',
          orderIndex: 2,
          isActive: true,
        },
        {
          question: 'Is creating a candidate profile free?',
          answer: 'Yes, candidates can register, upload their resumes, configure equal opportunity demographics, and apply directly to published jobs completely free.',
          category: 'Candidates',
          targetAudience: 'CANDIDATES',
          orderIndex: 3,
          isActive: true,
        },
        {
          question: 'What is the Workday-style skill suggestion feature?',
          answer: 'When typing in the search bar or posting a job, our system suggests connected skill clusters (e.g. typing "Java" suggests Spring Boot, Microservices, and Core Java).',
          category: 'General',
          targetAudience: 'ALL',
          orderIndex: 4,
          isActive: true,
        },
      ];
      await this.faqRepo.save(faqs.map((f) => this.faqRepo.create(f)));
      this.logger.log('✅ Seeded default FAQs!');
    }

    // F. Seed Broadcast Demo Users
    await this.seedBroadcastUsers();
  }

  async seedBroadcastUsers() {
    this.logger.log('Checking & seeding Broadcast demo users...');

    const BROADCAST_DEMO_USERS = [
      {
        email: 'tanishabajaj765@gmail.com',
        firstName: 'Tanisha',
        lastName: 'Bajaj',
        headline: 'Senior Java & Spring Boot Engineer',
        title: 'Java Developer',
        skills: ['Java', 'Spring', 'Spring Boot', 'Microservices', 'Hibernate', 'REST API'],
        monthsAgo: 2,
      },
      {
        email: 'omkarpekhale03@gmail.com',
        firstName: 'OMKAR',
        lastName: 'PEKHALE',
        headline: 'Full Stack Python & Django Developer',
        title: 'Python Backend Engineer',
        skills: ['Python', 'Django', 'FastAPI', 'AWS', 'Docker', 'PostgreSQL'],
        monthsAgo: 3,
      },
      {
        email: 'harithpatel72@gmail.com',
        firstName: 'HARITH KUMAR',
        lastName: 'DARISHETTI',
        headline: 'Frontend Architect | React & Next.js',
        title: 'Lead Frontend Developer',
        skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind CSS', 'GraphQL'],
        monthsAgo: 2,
      },
      {
        email: 'santhoshkumarss640@gmail.com',
        firstName: 'SANTHOSH Kumar',
        lastName: 'E',
        headline: 'Distributed Systems & Kafka Architect',
        title: 'Senior Backend Engineer',
        skills: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'Microservices'],
        monthsAgo: 6,
      },
      {
        email: 'kanna17priya@gmail.com',
        firstName: 'PRIYANKA',
        lastName: 'K P',
        headline: 'Full Stack MERN Developer',
        title: 'Full Stack Engineer',
        skills: ['Node.js', 'Express', 'React', 'MongoDB', 'PostgreSQL'],
        monthsAgo: 2,
      },
      {
        email: 'tasmiyabagwan2@gmail.com',
        firstName: 'Tasmiya Faiyaj',
        lastName: 'Bagwan',
        headline: 'Frontend Engineer | Angular & RxJS',
        title: 'Angular Developer',
        skills: ['Angular', 'TypeScript', 'RxJS', 'HTML5', 'CSS3', 'REST API'],
        monthsAgo: 1,
      },
      {
        email: 'triguledhanraj@gmail.com',
        firstName: 'Dhanraj',
        lastName: 'Trigule',
        headline: 'DevOps & Site Reliability Engineer',
        title: 'Cloud DevOps Engineer',
        skills: ['DevOps', 'Terraform', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        monthsAgo: 2,
      },
      {
        email: 'abi030796@gmail.com',
        firstName: 'Abinaya',
        lastName: 'Ponnusamy',
        headline: 'Lead QA Automation Engineer',
        title: 'QA Automation Lead',
        skills: ['QA Automation', 'Selenium', 'Cypress', 'Java', 'TestNG', 'Jira'],
        monthsAgo: 3,
      },
      {
        email: 'harshalnimje245@gmail.com',
        firstName: 'Harshal',
        lastName: 'Nimje',
        headline: 'Big Data & Spark Data Engineer',
        title: 'Senior Data Engineer',
        skills: ['Data Engineering', 'Python', 'Apache Spark', 'SQL', 'Airflow'],
        monthsAgo: 2,
      },
      {
        email: 'vasanth2818@gmail.com',
        firstName: 'Vasanth',
        lastName: 'Murugan',
        headline: 'Cross-Platform Mobile Engineer',
        title: 'Mobile Engineer',
        skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile Apps'],
        monthsAgo: 12,
      },
      {
        email: 'sneha.kulkarni@example.com',
        firstName: 'Sneha',
        lastName: 'Kulkarni',
        headline: 'Lead UX/UI Designer',
        title: 'Product Designer',
        skills: ['UI/UX', 'Figma', 'Product Design', 'User Research', 'Prototyping'],
        monthsAgo: 4,
      },
      {
        email: 'amit.verma@example.com',
        firstName: 'Amit',
        lastName: 'Verma',
        headline: 'Golang Microservices Engineer',
        title: 'Golang Engineer',
        skills: ['Go', 'Golang', 'Microservices', 'gRPC', 'Docker', 'Kubernetes'],
        monthsAgo: 2,
      },
    ];

    for (const demo of BROADCAST_DEMO_USERS) {
      let user = await this.userRepo.findOne({ where: { email: demo.email } });
      const lastLogin = new Date(Date.now() - demo.monthsAgo * 30 * 86400000);
      const created = new Date(Date.now() - (demo.monthsAgo * 30 + 5) * 86400000);

      if (!user) {
        user = await this.userRepo.save(
          this.userRepo.create({
            email: demo.email,
            passwordHash: 'password123',
            firstName: demo.firstName,
            lastName: demo.lastName,
            role: UserRole.CANDIDATE,
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            lastLoginAt: lastLogin,
            createdAt: created,
            avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
          }),
        );
      } else {
        user.lastLoginAt = lastLogin;
        await this.userRepo.save(user);
      }

      let cand = await this.candidateRepo.findOne({ where: { userId: user.id } });
      if (!cand) {
        await this.candidateRepo.save(
          this.candidateRepo.create({
            userId: user.id,
            headline: demo.headline,
            currentTitle: demo.title,
            experienceYears: 4,
            skills: demo.skills,
            visibility: ProfileVisibility.PUBLIC,
          }),
        );
      } else {
        cand.skills = demo.skills;
        await this.candidateRepo.save(cand);
      }
    }

    // Seed Expired Companies if not present
    let expiredTenant = await this.tenantRepo.findOne({ where: { slug: 'cloudscale-systems' } });
    if (!expiredTenant) {
      expiredTenant = await this.tenantRepo.save(
        this.tenantRepo.create({
          name: 'CloudScale Systems Inc',
          slug: 'cloudscale-systems',
          type: TenantType.COMPANY,
          logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120',
          industry: 'Cloud Infrastructure',
          description: 'Specialists in multi-cloud migration and serverless scale.',
          status: TenantStatus.ACTIVE,
        }),
      );

      const freePlan = await this.planRepo.findOne({ where: { code: PlanCode.FREE } });
      if (freePlan) {
        await this.subRepo.save(
          this.subRepo.create({
            tenantId: expiredTenant.id,
            planId: freePlan.id,
            status: SubscriptionStatus.EXPIRED,
            activeJobsUsed: 0,
            currentPeriodStart: new Date(Date.now() - 90 * 86400000),
            currentPeriodEnd: new Date(Date.now() - 30 * 86400000),
          }),
        );
      }

      await this.userRepo.save(
        this.userRepo.create({
          email: 'sameer@cloudscale.io',
          passwordHash: 'password123',
          firstName: 'Sameer',
          lastName: 'Patel',
          role: UserRole.COMPANY_ADMIN,
          status: UserStatus.ACTIVE,
          tenantId: expiredTenant.id,
          isEmailVerified: true,
          lastLoginAt: new Date(Date.now() - 45 * 86400000),
        }),
      );
    }

    this.logger.log('✅ Seeded Broadcast demo candidates & expired companies!');
  }
}

