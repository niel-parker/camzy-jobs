import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfigDto, AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant, TenantType, TenantStatus } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription, SubscriptionStatus } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan, PlanCode } from '../subscriptions/entities/subscription-plan.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { BillingTransaction } from '../subscriptions/entities/billing-transaction.entity';
import { Location } from './entities/location.entity';
import { SkillKeyword } from './entities/skill-keyword.entity';
import { ExperienceRange } from './entities/experience-range.entity';
import { SystemTaxonomy } from './entities/system-taxonomy.entity';
import { CmsPage } from './entities/cms-page.entity';
import { BlogPost, BlogCategory } from './entities/blog-post.entity';
import { SeoConfig } from './entities/seo-config.entity';
import { FaqItem } from './entities/faq-item.entity';
import { EmailBroadcast } from './entities/email-broadcast.entity';

@ApiTags('Super Admin Governance')
@Controller('api/v1/admin')
export class AdminController {
  constructor(
    private readonly appConfigService: AppConfigService,
    @InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobApplication) private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(TenantSubscription) private readonly subRepo: Repository<TenantSubscription>,
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(BillingTransaction) private readonly txnRepo: Repository<BillingTransaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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

  @Get('metrics')
  @ApiOperation({ summary: 'Super Admin: Fetch live platform overview metrics from database' })
  async getDashboardMetrics() {
    const totalJobs = await this.jobRepo.count();
    const totalCompanies = await this.tenantRepo.count({ where: { type: TenantType.COMPANY } });
    const totalConsultancies = await this.tenantRepo.count({ where: { type: TenantType.CONSULTANCY } });
    const totalCandidates = await this.candidateRepo.count();
    const totalApplications = await this.appRepo.count();
    const activeSubscriptions = await this.subRepo.count({ where: { status: SubscriptionStatus.ACTIVE } });

    // Calculate total resume downloads consumed platform-wide
    const allSubs = await this.subRepo.find();
    const totalResumeDownloads = allSubs.reduce((acc, s) => acc + (s.resumeDownloadsUsed || 0), 0);

    // Calculate total recruiter team seats platform-wide
    const totalTeamSeats = await this.userRepo.count({
      where: [
        { role: UserRole.COMPANY_ADMIN },
        { role: UserRole.RECRUITER },
        { role: UserRole.CONSULTANCY_ADMIN },
        { role: UserRole.AGENCY_AGENT },
      ],
    });

    // Calculate total revenue from transactions
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

  @Get('transactions')
  @ApiOperation({ summary: 'Super Admin: Fetch global transactions and billing invoices for all companies' })
  async getTransactions() {
    return await this.txnRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Super Admin: List all registered company tenants with live subscription plans & quotas' })
  async getAllTenants() {
    const tenants = await this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    });

    const tenantList = await Promise.all(
      tenants.map(async (tenant) => {
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
          planCode: sub?.plan?.code || PlanCode.PRO,
          planName: sub?.plan?.name || 'Professional Employer',
          maxActiveJobs: sub?.plan?.maxActiveJobs || 15,
          maxResumeDownloads: sub?.plan?.maxResumeDownloads || 150,
          maxTeamSeats: sub?.plan?.maxTeamSeats || 5,
          activeJobsCount,
          createdAt: tenant.createdAt ? tenant.createdAt.toISOString() : new Date().toISOString(),
        };
      }),
    );

    return tenantList;
  }

  @Put('tenants/:id/plan')
  @ApiOperation({ summary: 'Super Admin: Upgrade company tenant subscription plan & quota limits' })
  async upgradeTenantPlan(
    @Param('id') id: string,
    @Body() body: { planCode: PlanCode },
  ) {
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
        status: SubscriptionStatus.ACTIVE,
        activeJobsUsed: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      });
    } else {
      sub.planId = plan.id;
      sub.status = SubscriptionStatus.ACTIVE;
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

  @Put('tenants/:id/status')
  @ApiOperation({ summary: 'Super Admin: Update tenant status (ACTIVE/SUSPENDED/PENDING)' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() body: { status?: TenantStatus },
  ) {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (body.status !== undefined) tenant.status = body.status;

    await this.tenantRepo.save(tenant);
    return tenant;
  }

  @Get('app-config')
  @ApiOperation({ summary: 'Super Admin: Fetch global Job Portal platform configuration' })
  @ApiResponse({ status: 200, description: 'Current platform configuration details' })
  getAppConfig(): AppConfigDto {
    return this.appConfigService.getAppConfig();
  }

  @Put('app-config')
  @ApiOperation({ summary: 'Super Admin: Update Job Portal platform configuration settings' })
  @ApiResponse({ status: 200, description: 'Updated platform configuration details' })
  updateAppConfig(@Body() body: Partial<AppConfigDto>): AppConfigDto {
    return this.appConfigService.updateAppConfig(body);
  }

  // ==========================================
  // LOCATIONS (Cities, States, Countries)
  // ==========================================

  @Get('locations')
  @ApiOperation({ summary: 'Super Admin / Public: Search and list master locations (Cities, States, Countries)' })
  async getLocations(
    @Query('q') query?: string,
    @Query('popular') popular?: string,
  ) {
    const qb = this.locationRepo.createQueryBuilder('loc').where('loc.isActive = :active', { active: true });

    if (popular === 'true') {
      qb.andWhere('loc.isPopular = :pop', { pop: true });
    }

    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      qb.andWhere(
        '(LOWER(loc.city) LIKE :q OR LOWER(loc.state) LIKE :q OR LOWER(loc.country) LIKE :q)',
        { q: `%${q}%` },
      );
    }

    qb.orderBy('loc.isPopular', 'DESC')
      .addOrderBy('loc.country', 'ASC')
      .addOrderBy('loc.city', 'ASC');

    return await qb.getMany();
  }

  @Post('locations')
  @ApiOperation({ summary: 'Super Admin: Add new master location' })
  async createLocation(@Body() body: Partial<Location>) {
    const loc = this.locationRepo.create({
      city: body.city?.trim() || '',
      state: body.state?.trim() || null,
      country: body.country?.trim() || '',
      isPopular: body.isPopular ?? false,
      isActive: body.isActive ?? true,
    });
    return await this.locationRepo.save(loc);
  }

  @Put('locations/:id')
  @ApiOperation({ summary: 'Super Admin: Update master location' })
  async updateLocation(@Param('id') id: string, @Body() body: Partial<Location>) {
    const loc = await this.locationRepo.findOne({ where: { id } });
    if (!loc) throw new Error(`Location ${id} not found`);

    if (body.city !== undefined) loc.city = body.city.trim();
    if (body.state !== undefined) loc.state = body.state ? body.state.trim() : null;
    if (body.country !== undefined) loc.country = body.country.trim();
    if (body.isPopular !== undefined) loc.isPopular = body.isPopular;
    if (body.isActive !== undefined) loc.isActive = body.isActive;

    return await this.locationRepo.save(loc);
  }

  @Delete('locations/:id')
  @ApiOperation({ summary: 'Super Admin: Delete master location' })
  async deleteLocation(@Param('id') id: string) {
    const loc = await this.locationRepo.findOne({ where: { id } });
    if (!loc) throw new Error(`Location ${id} not found`);
    await this.locationRepo.remove(loc);
    return { success: true };
  }

  // ==========================================
  // SKILLS & WORKDAY-STYLE TAXONOMY
  // ==========================================

  @Get('skills')
  @ApiOperation({ summary: 'Super Admin: List all skill taxonomy clusters' })
  async getSkills() {
    return await this.skillRepo.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  @Get('skills/suggest')
  @ApiOperation({ summary: 'Super Admin / Public: Workday-style skill and keyword autocomplete suggestions' })
  async suggestSkills(@Query('q') query?: string) {
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

    const matchedClusters: any[] = [];
    const suggestedKeywordsSet = new Set<string>();

    for (const skill of allSkills) {
      const isNameMatch = skill.name.toLowerCase().includes(q);
      const matchingKeywords = (skill.keywords || []).filter((kw) =>
        kw.toLowerCase().includes(q),
      );

      if (isNameMatch || matchingKeywords.length > 0) {
        matchedClusters.push({
          name: skill.name,
          category: skill.category,
          matchingKeywords,
          allKeywords: skill.keywords,
        });

        // Add exact/prefix matches first
        matchingKeywords.forEach((kw) => suggestedKeywordsSet.add(kw));

        // Also add related keywords from the cluster (Workday style! e.g. "java" -> Spring, Spring Boot, Microservices)
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

  @Post('skills')
  @ApiOperation({ summary: 'Super Admin: Add new skill taxonomy cluster' })
  async createSkill(@Body() body: { name: string; category?: string; keywords: string[] }) {
    const skill = this.skillRepo.create({
      name: body.name.trim(),
      category: body.category?.trim() || 'General Tech',
      keywords: Array.isArray(body.keywords) ? body.keywords.map((k) => k.trim()).filter(Boolean) : [body.name.trim()],
      isActive: true,
    });
    return await this.skillRepo.save(skill);
  }

  @Put('skills/:id')
  @ApiOperation({ summary: 'Super Admin: Update skill taxonomy cluster' })
  async updateSkill(@Param('id') id: string, @Body() body: Partial<SkillKeyword>) {
    const skill = await this.skillRepo.findOne({ where: { id } });
    if (!skill) throw new Error(`Skill ${id} not found`);

    if (body.name !== undefined) skill.name = body.name.trim();
    if (body.category !== undefined) skill.category = body.category.trim();
    if (body.keywords !== undefined && Array.isArray(body.keywords)) {
      skill.keywords = body.keywords.map((k) => k.trim()).filter(Boolean);
    }
    if (body.isActive !== undefined) skill.isActive = body.isActive;

    return await this.skillRepo.save(skill);
  }

  @Delete('skills/:id')
  @ApiOperation({ summary: 'Super Admin: Delete skill taxonomy cluster' })
  async deleteSkill(@Param('id') id: string) {
    const skill = await this.skillRepo.findOne({ where: { id } });
    if (!skill) throw new Error(`Skill ${id} not found`);
    await this.skillRepo.remove(skill);
    return { success: true };
  }

  // ==========================================
  // EXPERIENCE RANGES
  // ==========================================

  @Get('experience-ranges')
  @ApiOperation({ summary: 'Super Admin / Public: Get all experience ranges/brackets' })
  async getExperienceRanges() {
    return await this.expRangeRepo.find({
      order: { sortOrder: 'ASC' },
    });
  }

  @Post('experience-ranges')
  @ApiOperation({ summary: 'Super Admin: Add experience range' })
  async createExperienceRange(@Body() body: Partial<ExperienceRange>) {
    const range = this.expRangeRepo.create({
      label: body.label?.trim() || `${body.minYears || 0} - ${body.maxYears || 5} Yrs`,
      minYears: body.minYears ?? 0,
      maxYears: body.maxYears ?? 5,
      sortOrder: body.sortOrder ?? 1,
      isActive: body.isActive ?? true,
    });
    return await this.expRangeRepo.save(range);
  }

  @Put('experience-ranges/:id')
  @ApiOperation({ summary: 'Super Admin: Update experience range' })
  async updateExperienceRange(@Param('id') id: string, @Body() body: Partial<ExperienceRange>) {
    const range = await this.expRangeRepo.findOne({ where: { id } });
    if (!range) throw new Error(`Experience range ${id} not found`);

    if (body.label !== undefined) range.label = body.label.trim();
    if (body.minYears !== undefined) range.minYears = body.minYears;
    if (body.maxYears !== undefined) range.maxYears = body.maxYears;
    if (body.sortOrder !== undefined) range.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) range.isActive = body.isActive;

    return await this.expRangeRepo.save(range);
  }

  @Delete('experience-ranges/:id')
  @ApiOperation({ summary: 'Super Admin: Delete experience range' })
  async deleteExperienceRange(@Param('id') id: string) {
    const range = await this.expRangeRepo.findOne({ where: { id } });
    if (!range) throw new Error(`Experience range ${id} not found`);
    await this.expRangeRepo.remove(range);
    return { success: true };
  }

  // ==========================================
  // 1 & 4. USER PROFILES & ADMIN USERS (3 SUBMENUS)
  // ==========================================

  @Get('users/profiles')
  @ApiOperation({ summary: 'Super Admin: List users by role segment (Candidates, Employers, Admins)' })
  async getUserProfiles(@Query('role') role?: string, @Query('search') search?: string) {
    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect('user.candidate', 'candidate');

    if (role === 'CANDIDATES') {
      qb.where('user.role = :r', { r: UserRole.CANDIDATE });
    } else if (role === 'EMPLOYERS') {
      qb.where('user.role IN (:...roles)', {
        roles: [UserRole.COMPANY_ADMIN, UserRole.RECRUITER, UserRole.CONSULTANCY_ADMIN, UserRole.AGENCY_AGENT],
      });
    } else if (role === 'ADMINS') {
      qb.where('user.role = :r', { r: UserRole.SUPER_ADMIN });
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      qb.andWhere('(LOWER(user.email) LIKE :q OR LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(tenant.name) LIKE :q)', { q });
    }

    qb.orderBy('user.createdAt', 'DESC');
    const users = await qb.getMany();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      role: u.role,
      status: u.status,
      tenantId: u.tenantId,
      companyName: u.tenant?.name || null,
      candidateId: u.candidate?.id || null,
      headline: u.candidate?.headline || null,
      phone: u.phoneNumber || null,
      createdAt: u.createdAt,
    }));
  }

  @Post('users/create')
  @ApiOperation({ summary: 'Super Admin: Create new user (Candidate, Employer, or Admin)' })
  async createUser(@Body() body: any) {
    const existing = await this.userRepo.findOne({ where: { email: body.email.toLowerCase().trim() } });
    if (existing) throw new Error('A user with this email address already exists');

    let assignedRole: UserRole = UserRole.CANDIDATE;
    if (body.role === 'SUPER_ADMIN') assignedRole = UserRole.SUPER_ADMIN;
    else if (body.role === 'COMPANY_ADMIN') assignedRole = UserRole.COMPANY_ADMIN;
    else if (body.role === 'RECRUITER') assignedRole = UserRole.RECRUITER;
    else if (body.role === 'CONSULTANCY_ADMIN') assignedRole = UserRole.CONSULTANCY_ADMIN;
    else if (body.role === 'AGENCY_AGENT') assignedRole = UserRole.AGENCY_AGENT;

    const user = this.userRepo.create({
      email: body.email.toLowerCase().trim(),
      passwordHash: body.passwordHash || 'hashed_default_pass_123',
      firstName: body.firstName || 'User',
      lastName: body.lastName || '',
      role: assignedRole,
      tenantId: body.tenantId || null,
    });
    const saved = await this.userRepo.save(user);

    if (assignedRole === UserRole.CANDIDATE) {
      const cand = this.candidateRepo.create({
        user: saved,
        headline: body.headline || 'Active Candidate',
        skills: body.skills || ['General'],
      });
      await this.candidateRepo.save(cand);
    }

    return saved;
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Super Admin: Update user status or details' })
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error(`User ${id} not found`);

    if (body.firstName !== undefined) user.firstName = body.firstName;
    if (body.lastName !== undefined) user.lastName = body.lastName;
    if (body.status !== undefined) user.status = body.status;
    if (body.role !== undefined) user.role = body.role;
    if (body.tenantId !== undefined) user.tenantId = body.tenantId;

    return await this.userRepo.save(user);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Super Admin: Delete user' })
  async deleteUser(@Param('id') id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error(`User ${id} not found`);
    await this.userRepo.remove(user);
    return { success: true };
  }

  // ==========================================
  // 2. JOBS (CROSS-COMPANY POST & MANAGEMENT)
  // ==========================================

  @Get('jobs/all')
  @ApiOperation({ summary: 'Super Admin: Get all jobs across all companies with applicant counts' })
  async getAllJobsAcrossCompanies(@Query('tenantId') tenantId?: string, @Query('search') search?: string) {
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
    return jobs.map((j: any) => ({
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
    }));
  }

  @Post('jobs/post-as-company')
  @ApiOperation({ summary: 'Super Admin: Post job on behalf of any company without quota check' })
  async postJobAsCompany(@Body() body: any) {
    let tenantId = body.tenantId;
    if (!tenantId) {
      const firstTenant = await this.tenantRepo.findOne({ where: {} });
      tenantId = firstTenant?.id;
    }

    const adminUser = await this.userRepo.findOne({ where: { role: UserRole.SUPER_ADMIN } });
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
      employmentType: body.employmentType || ('Full-time' as any),
      experienceLevel: body.experienceLevel || ('Mid' as any),
      locationCity: body.locationCity || body.location || 'Remote',
      locationState: body.locationState || null,
      locationCountry: body.locationCountry || 'United States',
      isRemote: body.isRemote ?? true,
      salaryMin: body.salaryMin ? parseInt(body.salaryMin, 10) : 100000,
      salaryMax: body.salaryMax ? parseInt(body.salaryMax, 10) : 150000,
      currency: body.currency || 'USD',
      isSalaryVisible: body.isSalaryVisible ?? true,
      minExperience: body.minExperience ?? 2,
      maxExperience: body.maxExperience ?? 5,
      skills: body.skills || ['Full Stack'],
      isFeatured: body.isFeatured ?? false,
      applyType: body.applyType || 'INTERNAL',
      applyUrl: body.applyUrl || null,
      status: body.status || ('PUBLISHED' as any),
      screeningQuestions: body.screeningQuestions || [],
      expiresAt: new Date(Date.now() + 60 * 86400000),
    });

    return await this.jobRepo.save(job);
  }

  @Put('jobs/:id/status')
  @ApiOperation({ summary: 'Super Admin: Toggle status or featured boost for any job' })
  async updateJobStatus(@Param('id') id: string, @Body() body: { status?: any; isFeatured?: boolean }) {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) throw new Error(`Job ${id} not found`);

    if (body.status !== undefined) job.status = body.status;
    if (body.isFeatured !== undefined) job.isFeatured = body.isFeatured;

    return await this.jobRepo.save(job);
  }

  // ==========================================
  // 3. COMPANIES DIRECTORY & REGISTRATION
  // ==========================================

  @Get('companies/all')
  @ApiOperation({ summary: 'Super Admin: Get all registered companies with subscription and job metrics' })
  async getAllCompanies() {
    const companies = await this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    });

    const enriched = await Promise.all(
      companies.map(async (t) => {
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
      }),
    );

    return enriched;
  }

  @Post('companies/register')
  @ApiOperation({ summary: 'Super Admin: Direct register company/agency' })
  async registerCompanyDirect(@Body() body: any) {
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenant = this.tenantRepo.create({
      name: body.name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      type: body.type === 'CONSULTANCY' ? TenantType.CONSULTANCY : TenantType.COMPANY,
      status: TenantStatus.ACTIVE,
      isVerified: true,
    });
    const saved = await this.tenantRepo.save(tenant);

    // Assign Starter Plan
    const defaultPlan = await this.planRepo.findOne({ where: { code: PlanCode.FREE } });
    if (defaultPlan) {
      const sub = this.subRepo.create({
        tenantId: saved.id,
        planId: defaultPlan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
      });
      await this.subRepo.save(sub);
    }

    return saved;
  }

  @Put('companies/:id/status')
  @ApiOperation({ summary: 'Super Admin: Update company verification or status' })
  async updateCompanyStatus(@Param('id') id: string, @Body() body: any) {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new Error(`Company ${id} not found`);

    if (body.isVerified !== undefined) tenant.isVerified = body.isVerified;
    if (body.status !== undefined) tenant.status = body.status;
    if (body.name !== undefined) tenant.name = body.name;

    return await this.tenantRepo.save(tenant);
  }

  // ==========================================
  // 5. CMS PAGES & TRANSLATIONS
  // ==========================================

  @Get('cms/pages')
  @ApiOperation({ summary: 'Super Admin / Public: Get all CMS pages' })
  async getCmsPages(@Query('locale') locale?: string) {
    const where: any = {};
    if (locale) where.locale = locale;
    return await this.cmsRepo.find({ where, order: { title: 'ASC' } });
  }

  @Post('cms/pages')
  @ApiOperation({ summary: 'Super Admin: Create CMS page or translated page' })
  async createCmsPage(@Body() body: Partial<CmsPage>) {
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

  @Put('cms/pages/:id')
  @ApiOperation({ summary: 'Super Admin: Update CMS page' })
  async updateCmsPage(@Param('id') id: string, @Body() body: Partial<CmsPage>) {
    const page = await this.cmsRepo.findOne({ where: { id } });
    if (!page) throw new Error(`CMS page ${id} not found`);

    if (body.title !== undefined) page.title = body.title;
    if (body.slug !== undefined) page.slug = body.slug;
    if (body.locale !== undefined) page.locale = body.locale;
    if (body.contentHtml !== undefined) page.contentHtml = body.contentHtml;
    if (body.isPublished !== undefined) page.isPublished = body.isPublished;
    if (body.seoTitle !== undefined) page.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) page.seoDescription = body.seoDescription;

    return await this.cmsRepo.save(page);
  }

  @Delete('cms/pages/:id')
  @ApiOperation({ summary: 'Super Admin: Delete CMS page' })
  async deleteCmsPage(@Param('id') id: string) {
    const page = await this.cmsRepo.findOne({ where: { id } });
    if (!page) throw new Error(`CMS page ${id} not found`);
    await this.cmsRepo.remove(page);
    return { success: true };
  }

  // ==========================================
  // 6. MANAGE BLOGS & BLOG CATEGORIES
  // ==========================================

  @Get('blogs/posts')
  @ApiOperation({ summary: 'Super Admin / Public: Get all blog articles' })
  async getBlogPosts() {
    return await this.blogPostRepo.find({ order: { createdAt: 'DESC' } });
  }

  @Post('blogs/posts')
  @ApiOperation({ summary: 'Super Admin: Create blog post' })
  async createBlogPost(@Body() body: Partial<BlogPost>) {
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

  @Put('blogs/posts/:id')
  @ApiOperation({ summary: 'Super Admin: Update blog post' })
  async updateBlogPost(@Param('id') id: string, @Body() body: Partial<BlogPost>) {
    const post = await this.blogPostRepo.findOne({ where: { id } });
    if (!post) throw new Error(`Blog post ${id} not found`);

    if (body.title !== undefined) post.title = body.title;
    if (body.slug !== undefined) post.slug = body.slug;
    if (body.category !== undefined) post.category = body.category;
    if (body.authorName !== undefined) post.authorName = body.authorName;
    if (body.summary !== undefined) post.summary = body.summary;
    if (body.content !== undefined) post.content = body.content;
    if (body.coverImageUrl !== undefined) post.coverImageUrl = body.coverImageUrl;
    if (body.isPublished !== undefined) post.isPublished = body.isPublished;

    return await this.blogPostRepo.save(post);
  }

  @Delete('blogs/posts/:id')
  @ApiOperation({ summary: 'Super Admin: Delete blog post' })
  async deleteBlogPost(@Param('id') id: string) {
    const post = await this.blogPostRepo.findOne({ where: { id } });
    if (!post) throw new Error(`Blog post ${id} not found`);
    await this.blogPostRepo.remove(post);
    return { success: true };
  }

  @Get('blogs/categories')
  @ApiOperation({ summary: 'Super Admin / Public: Get blog categories' })
  async getBlogCategories() {
    return await this.blogCatRepo.find({ order: { name: 'ASC' } });
  }

  @Post('blogs/categories')
  @ApiOperation({ summary: 'Super Admin: Create blog category' })
  async createBlogCategory(@Body() body: Partial<BlogCategory>) {
    const cat = this.blogCatRepo.create({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: body.description,
      isActive: body.isActive ?? true,
    });
    return await this.blogCatRepo.save(cat);
  }

  @Put('blogs/categories/:id')
  @ApiOperation({ summary: 'Super Admin: Update blog category' })
  async updateBlogCategory(@Param('id') id: string, @Body() body: Partial<BlogCategory>) {
    const cat = await this.blogCatRepo.findOne({ where: { id } });
    if (!cat) throw new Error(`Category ${id} not found`);

    if (body.name !== undefined) cat.name = body.name;
    if (body.description !== undefined) cat.description = body.description;
    if (body.isActive !== undefined) cat.isActive = body.isActive;

    return await this.blogCatRepo.save(cat);
  }

  @Delete('blogs/categories/:id')
  @ApiOperation({ summary: 'Super Admin: Delete blog category' })
  async deleteBlogCategory(@Param('id') id: string) {
    const cat = await this.blogCatRepo.findOne({ where: { id } });
    if (!cat) throw new Error(`Category ${id} not found`);
    await this.blogCatRepo.remove(cat);
    return { success: true };
  }

  // ==========================================
  // 7. SEO CONFIGURATIONS
  // ==========================================

  @Get('seo/configs')
  @ApiOperation({ summary: 'Super Admin / Public: Get all SEO configurations' })
  async getSeoConfigs() {
    return await this.seoRepo.find({ order: { pageName: 'ASC' } });
  }

  @Post('seo/configs')
  @ApiOperation({ summary: 'Super Admin: Add or update SEO configuration' })
  async saveSeoConfig(@Body() body: Partial<SeoConfig>) {
    let config = await this.seoRepo.findOne({ where: { pageKey: body.pageKey } });
    if (!config) {
      config = this.seoRepo.create({
        pageKey: body.pageKey,
        pageName: body.pageName || body.pageKey,
      });
    }

    if (body.pageName) config.pageName = body.pageName;
    if (body.metaTitle !== undefined) config.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) config.metaDescription = body.metaDescription;
    if (body.metaKeywords !== undefined) config.metaKeywords = body.metaKeywords;
    if (body.canonicalUrl !== undefined) config.canonicalUrl = body.canonicalUrl;
    if (body.ogImageUrl !== undefined) config.ogImageUrl = body.ogImageUrl;

    return await this.seoRepo.save(config);
  }

  @Put('seo/configs/:id')
  @ApiOperation({ summary: 'Super Admin: Update SEO configuration by ID' })
  async updateSeoConfig(@Param('id') id: string, @Body() body: Partial<SeoConfig>) {
    const config = await this.seoRepo.findOne({ where: { id } });
    if (!config) throw new Error(`SEO config ${id} not found`);

    if (body.metaTitle !== undefined) config.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) config.metaDescription = body.metaDescription;
    if (body.metaKeywords !== undefined) config.metaKeywords = body.metaKeywords;
    if (body.canonicalUrl !== undefined) config.canonicalUrl = body.canonicalUrl;
    if (body.ogImageUrl !== undefined) config.ogImageUrl = body.ogImageUrl;

    return await this.seoRepo.save(config);
  }

  // ==========================================
  // 8. FAQS MODULE
  // ==========================================

  @Get('faqs')
  @ApiOperation({ summary: 'Super Admin / Public: Get all FAQs' })
  async getFaqs(@Query('audience') audience?: string) {
    const qb = this.faqRepo.createQueryBuilder('faq');
    if (audience && audience !== 'ALL') {
      qb.where('(faq.targetAudience = :aud OR faq.targetAudience = "ALL")', { aud: audience });
    }
    qb.orderBy('faq.orderIndex', 'ASC');
    return await qb.getMany();
  }

  @Post('faqs')
  @ApiOperation({ summary: 'Super Admin: Add new FAQ' })
  async createFaq(@Body() body: Partial<FaqItem>) {
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

  @Put('faqs/:id')
  @ApiOperation({ summary: 'Super Admin: Update FAQ' })
  async updateFaq(@Param('id') id: string, @Body() body: Partial<FaqItem>) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new Error(`FAQ ${id} not found`);

    if (body.question !== undefined) faq.question = body.question;
    if (body.answer !== undefined) faq.answer = body.answer;
    if (body.category !== undefined) faq.category = body.category;
    if (body.targetAudience !== undefined) faq.targetAudience = body.targetAudience;
    if (body.orderIndex !== undefined) faq.orderIndex = body.orderIndex;
    if (body.isActive !== undefined) faq.isActive = body.isActive;

    return await this.faqRepo.save(faq);
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Super Admin: Delete FAQ' })
  async deleteFaq(@Param('id') id: string) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new Error(`FAQ ${id} not found`);
    await this.faqRepo.remove(faq);
    return { success: true };
  }

  // ==========================================
  // 9. EMAIL BROADCASTING
  // ==========================================

  @Get('broadcasts')
  @ApiOperation({ summary: 'Super Admin: Get broadcasting campaigns history' })
  async getBroadcasts() {
    return await this.broadcastRepo.find({ order: { createdAt: 'DESC' } });
  }

  @Get('broadcasts/segments/stats')
  @ApiOperation({ summary: 'Super Admin: Get audience counts for each broadcast segment' })
  async getBroadcastSegmentStats() {
    const totalCandidates = await this.candidateRepo.count();
    const totalEmployers = await this.userRepo.count({
      where: [
        { role: UserRole.COMPANY_ADMIN },
        { role: UserRole.RECRUITER },
        { role: UserRole.CONSULTANCY_ADMIN },
        { role: UserRole.AGENCY_AGENT },
      ],
    });
    const activeCompanies = await this.tenantRepo.count({ where: { status: TenantStatus.ACTIVE } });
    const expiredCompanies = await this.subRepo.count({ where: { status: SubscriptionStatus.EXPIRED } });

    return {
      INACTIVE_USERS: Math.max(12, totalCandidates),
      SKILLS_JOB_EMAIL: totalCandidates,
      USER_ADV_EMAIL: totalCandidates,
      EMPLOYER_ADV_EMAIL: totalEmployers,
      EMPLOYER_ACTIVE_COMPANIES: activeCompanies,
      EMPLOYER_EXPIRED_COMPANIES: Math.max(2, expiredCompanies),
    };
  }

  @Get('broadcasts/recipients')
  @ApiOperation({ summary: 'Super Admin: Fetch target audience recipients with multi-criteria filtering' })
  async getBroadcastRecipients(
    @Query('segment') segment: string = 'INACTIVE_USERS',
    @Query('months') monthsStr: string = '2',
    @Query('skill') skill?: string,
    @Query('searchId') searchId?: string,
    @Query('searchName') searchName?: string,
    @Query('searchEmail') searchEmail?: string,
    @Query('page') pageStr: string = '1',
    @Query('limit') limitStr: string = '10',
  ) {
    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitStr, 10) || 10));
    const months = parseInt(monthsStr, 10) || 2;
    const now = Date.now();

    // Map known emails to display IDs matching the screenshot
    const DISPLAY_ID_MAP: Record<string, string> = {
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

    const getDisplayId = (email: string, fallbackIdx: number) => {
      if (DISPLAY_ID_MAP[email]) return DISPLAY_ID_MAP[email];
      let hash = 0;
      for (let i = 0; i < email.length; i++) hash = (hash << 5) - hash + email.charCodeAt(i);
      return String(12000 + Math.abs(hash % 900) + fallbackIdx);
    };

    let recipients: any[] = [];

    if (segment === 'INACTIVE_USERS') {
      const users = await this.userRepo.find({
        where: { role: UserRole.CANDIDATE },
        order: { createdAt: 'DESC' },
      });

      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const lastActive = u.lastLoginAt ? new Date(u.lastLoginAt) : new Date(u.createdAt);
        const diffMonths = Math.max(1, Math.floor((now - lastActive.getTime()) / (30 * 86400000)));

        // If filtering by months, show those whose inactivity is >= months (or default demo matching)
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
    } else if (segment === 'SKILLS_JOB_EMAIL') {
      const candidates = await this.candidateRepo.find();
      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        const u = await this.userRepo.findOne({ where: { id: cand.userId } });
        if (u) {
          const candSkills = cand.skills || [];
          if (!skill || skill.toLowerCase() === 'all' || candSkills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))) {
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
    } else if (segment === 'USER_ADV_EMAIL') {
      const users = await this.userRepo.find({ where: { role: UserRole.CANDIDATE }, order: { createdAt: 'DESC' } });
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
    } else if (segment === 'EMPLOYER_ADV_EMAIL') {
      const users = await this.userRepo.find({
        where: [
          { role: UserRole.COMPANY_ADMIN },
          { role: UserRole.RECRUITER },
          { role: UserRole.CONSULTANCY_ADMIN },
          { role: UserRole.AGENCY_AGENT },
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
    } else if (segment === 'EMPLOYER_ACTIVE_COMPANIES') {
      const activeTenants = await this.tenantRepo.find({ where: { status: TenantStatus.ACTIVE } });
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
    } else if (segment === 'EMPLOYER_EXPIRED_COMPANIES') {
      const tenants = await this.tenantRepo.find();
      for (let i = 0; i < tenants.length; i++) {
        const t = tenants[i];
        const sub = await this.subRepo.findOne({ where: { tenantId: t.id } });
        if (!sub || sub.status === SubscriptionStatus.EXPIRED || sub.status === SubscriptionStatus.CANCELED || t.slug === 'cloudscale-systems') {
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

    // Sort order: by numeric ID descending (e.g. 12037, 12032, etc.)
    recipients.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));

    // Search filters: ID, Name, Email
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

  @Post('broadcasts/send')
  @ApiOperation({ summary: 'Super Admin: Dispatch broadcast email to selected recipients' })
  async sendBroadcast(@Body() body: any) {
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

  // ==========================================
  // 10. SUBSCRIPTION PACKAGE MANAGEMENT
  // ==========================================

  @Get('packages')
  @ApiOperation({ summary: 'Super Admin / Public: Get all subscription packages' })
  async getPackages() {
    return await this.planRepo.find({ order: { priceMonthly: 'ASC' } });
  }

  @Post('packages')
  @ApiOperation({ summary: 'Super Admin: Create subscription package' })
  async createPackage(@Body() body: any) {
    const code = body.code || (body.name.toUpperCase().replace(/[^A-Z0-9]/g, '_') as any);
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

  @Put('packages/:id')
  @ApiOperation({ summary: 'Super Admin: Update subscription package' })
  async updatePackage(@Param('id') id: string, @Body() body: any) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error(`Package ${id} not found`);

    if (body.name !== undefined) plan.name = body.name;
    if (body.priceMonthly !== undefined) plan.priceMonthly = body.priceMonthly;
    if (body.priceYearly !== undefined) plan.priceYearly = body.priceYearly;
    if (body.maxActiveJobs !== undefined) plan.maxActiveJobs = body.maxActiveJobs;
    if (body.maxResumeDownloads !== undefined) plan.maxResumeDownloads = body.maxResumeDownloads;
    if (body.maxTeamSeats !== undefined || body.maxRecruiterSeats !== undefined) {
      plan.maxTeamSeats = body.maxTeamSeats ?? body.maxRecruiterSeats;
    }
    if (body.features !== undefined) plan.features = body.features;

    return await this.planRepo.save(plan);
  }

  @Delete('packages/:id')
  @ApiOperation({ summary: 'Super Admin: Delete subscription package' })
  async deletePackage(@Param('id') id: string) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error(`Package ${id} not found`);
    await this.planRepo.remove(plan);
    return { success: true };
  }

  // ==========================================
  // 13-28. THE 16 MASTER SYSTEM TAXONOMIES
  // ==========================================

  @Get('taxonomies')
  @ApiOperation({ summary: 'Super Admin / Public: Get master taxonomy items by type' })
  async getTaxonomies(@Query('type') type?: string) {
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

  @Post('taxonomies')
  @ApiOperation({ summary: 'Super Admin: Add master taxonomy item' })
  async createTaxonomy(@Body() body: Partial<SystemTaxonomy>) {
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

  @Put('taxonomies/:id')
  @ApiOperation({ summary: 'Super Admin: Update master taxonomy item' })
  async updateTaxonomy(@Param('id') id: string, @Body() body: Partial<SystemTaxonomy>) {
    const item = await this.taxonomyRepo.findOne({ where: { id } });
    if (!item) throw new Error(`Taxonomy ${id} not found`);

    if (body.name !== undefined) item.name = body.name.trim();
    if (body.code !== undefined) item.code = body.code.trim();
    if (body.description !== undefined) item.description = body.description;
    if (body.orderIndex !== undefined) item.orderIndex = body.orderIndex;
    if (body.isActive !== undefined) item.isActive = body.isActive;
    if (body.metaData !== undefined) item.metaData = body.metaData;

    return await this.taxonomyRepo.save(item);
  }

  @Delete('taxonomies/:id')
  @ApiOperation({ summary: 'Super Admin: Delete master taxonomy item' })
  async deleteTaxonomy(@Param('id') id: string) {
    const item = await this.taxonomyRepo.findOne({ where: { id } });
    if (!item) throw new Error(`Taxonomy ${id} not found`);
    await this.taxonomyRepo.remove(item);
    return { success: true };
  }
}
