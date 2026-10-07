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

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(TenantSubscription) private readonly subRepo: Repository<TenantSubscription>,
    @InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobApplication) private readonly appRepo: Repository<JobApplication>,
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

      candidateUser = await this.userRepo.save(
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
      superAdminUser = await this.userRepo.findOne({ where: { email: 'admin@camzyjobs.com' } });
      employerUser = await this.userRepo.findOne({ where: { email: 'recruiter@techcorp.com' } });
      candidateUser = await this.userRepo.findOne({ where: { email: 'candidate@example.com' } });
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

    this.logger.log('🎉 Database seeding verified successfully!');
  }
}
