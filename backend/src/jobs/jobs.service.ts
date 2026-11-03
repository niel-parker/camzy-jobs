import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, JobStatus, EmploymentType, ExperienceLevel } from './entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';

export interface JobListingDto {
  id: string;
  tenantId?: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  isConsultancy: boolean;
  consultancyName?: string;
  clientCompanyName?: string;
  location: string;
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  isRemote: boolean;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  isSalaryVisible: boolean;
  category: string;
  experienceLevel: string;
  minExperience?: number;
  maxExperience?: number;
  skills?: string[];
  description: string;
  isFeatured: boolean;
  applyType?: 'INTERNAL' | 'EXTERNAL';
  applyUrl?: string;
  screeningQuestions?: Array<{
    id: string;
    questionText: string;
    questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
    options?: string[];
    isRequired?: boolean;
  }>;
  status: string;
  expiresAt?: string;
  isExpired: boolean;
  createdAt: string;
}

export function normalizeEmploymentType(input?: any): EmploymentType {
  if (!input) return EmploymentType.FULL_TIME;
  const s = String(input).trim().toLowerCase();
  if (s.includes('part')) return EmploymentType.PART_TIME;
  if (s.includes('contract') || s.includes('freelance') || s.includes('consult')) return EmploymentType.CONTRACT;
  if (s.includes('intern') || s.includes('trainee') || s.includes('student')) return EmploymentType.INTERNSHIP;
  if (s.includes('remote')) return EmploymentType.REMOTE;
  if (s.includes('full') || s.includes('perm')) return EmploymentType.FULL_TIME;

  const match = Object.values(EmploymentType).find(
    (v) => v.toLowerCase() === s || v.toLowerCase().replace('-', ' ') === s.replace('-', ' ')
  );
  if (match) return match;

  return EmploymentType.FULL_TIME;
}

export function normalizeExperienceLevel(input?: any): ExperienceLevel {
  if (!input) return ExperienceLevel.MID;
  const s = String(input).trim().toLowerCase();
  if (s.includes('entry') || s.includes('fresher') || s.includes('trainee') || s.includes('student') || s.includes('intern')) {
    return ExperienceLevel.ENTRY;
  }
  if (s.includes('senior') || s.includes('sr')) {
    return ExperienceLevel.SENIOR;
  }
  if (s.includes('lead') || s.includes('head') || s.includes('principal') || s.includes('manager')) {
    return ExperienceLevel.LEAD;
  }
  if (s.includes('exec') || s.includes('director') || s.includes('president') || s.includes('ceo') || s.includes('gm') || s.includes('vp')) {
    return ExperienceLevel.EXECUTIVE;
  }
  if (s.includes('mid') || s.includes('experien') || s.includes('prof')) {
    return ExperienceLevel.MID;
  }

  const match = Object.values(ExperienceLevel).find((v) => v.toLowerCase() === s);
  if (match) return match;

  return ExperienceLevel.MID;
}

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TenantSubscription)
    private readonly subRepo: Repository<TenantSubscription>,
  ) {}

  async onModuleInit() {
    // 1. Job will auto expire after 30 days: check on startup and schedule periodic check
    await this.expireOverdueJobs();
    setInterval(async () => {
      try {
        await this.expireOverdueJobs();
      } catch (err) {
        console.error('Error in automatic job expiry background check:', err);
      }
    }, 10 * 60 * 1000); // Check every 10 minutes
  }

  /**
   * Automatically transition jobs to EXPIRED when expiresAt <= NOW()
   */
  async expireOverdueJobs(): Promise<number> {
    const now = new Date();
    const result = await this.jobRepo.createQueryBuilder()
      .update(JobPosting)
      .set({ status: JobStatus.EXPIRED })
      .where('status = :status AND expiresAt <= :now', { status: JobStatus.PUBLISHED, now })
      .execute();
    return result.affected || 0;
  }

  async findAll(
    category?: string,
    query?: string,
    tenantId?: string,
    location?: string,
    experienceLevel?: string,
    minExp?: number,
    maxExp?: number,
    includeExpired?: boolean,
    skills?: string,
  ): Promise<JobListingDto[]> {
    await this.expireOverdueJobs();

    const qb = this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.tenant', 'tenant');

    const isCompanyView = Boolean(tenantId && tenantId !== 'undefined' && tenantId !== 'null');

    if (isCompanyView || includeExpired) {
      // Company or employer view: show their jobs across statuses (PUBLISHED, EXPIRED, ARCHIVED)
      if (isCompanyView) {
        qb.where('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId });
      }
    } else {
      // Public search: strictly show active, non-expired jobs
      const now = new Date();
      qb.where('job.status = :status AND job.expiresAt > :now', { status: JobStatus.PUBLISHED, now });
    }

    if (category && category !== 'All') {
      qb.andWhere('LOWER(job.category) LIKE LOWER(:category)', { category: `%${category}%` });
    }

    if (location && location !== 'All') {
      qb.andWhere(
        '(LOWER(job.locationCity) LIKE LOWER(:loc) OR LOWER(job.locationCountry) LIKE LOWER(:loc) OR LOWER(COALESCE(job.locationState, \'\')) LIKE LOWER(:loc))',
        { loc: `%${location}%` },
      );
    }

    if (experienceLevel && experienceLevel !== 'All') {
      qb.andWhere('job.experienceLevel = :experienceLevel', { experienceLevel });
    }

    if (minExp !== undefined && !isNaN(minExp)) {
      qb.andWhere('job.maxExperience >= :minExp', { minExp });
    }

    if (maxExp !== undefined && !isNaN(maxExp)) {
      qb.andWhere('job.minExperience <= :maxExp', { maxExp });
    }

    if (query && query.trim()) {
      const terms = query.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (terms.length > 1) {
        const orClauses: string[] = [];
        const orParams: Record<string, string> = {};
        terms.forEach((term, idx) => {
          const pName = `q_term_${idx}`;
          orParams[pName] = `%${term}%`;
          orClauses.push(
            `(LOWER(job.title) LIKE :${pName} OR LOWER(job.description) LIKE :${pName} OR LOWER(tenant.name) LIKE :${pName} OR LOWER(job.category) LIKE :${pName} OR LOWER(CAST(job.skills AS CHAR)) LIKE :${pName})`
          );
        });
        qb.andWhere(`(${orClauses.join(' OR ')})`, orParams);
      } else {
        const q = query.trim().toLowerCase();
        qb.andWhere(
          '(LOWER(job.title) LIKE :q OR LOWER(job.description) LIKE :q OR LOWER(tenant.name) LIKE :q OR LOWER(job.category) LIKE :q OR LOWER(CAST(job.skills AS CHAR)) LIKE :q)',
          { q: `%${q}%` },
        );
      }
    }

    if (skills && skills.trim()) {
      const skillTerms = skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (skillTerms.length > 0) {
        const orClauses: string[] = [];
        const orParams: Record<string, string> = {};
        skillTerms.forEach((skill, idx) => {
          const pName = `sk_term_${idx}`;
          orParams[pName] = `%${skill}%`;
          orClauses.push(
            `(LOWER(job.title) LIKE :${pName} OR LOWER(job.description) LIKE :${pName} OR LOWER(CAST(job.skills AS CHAR)) LIKE :${pName})`
          );
        });
        qb.andWhere(`(${orClauses.join(' OR ')})`, orParams);
      }
    }

    qb.orderBy('job.createdAt', 'DESC');

    const jobs = await qb.getMany();
    return jobs.map((job) => this.mapToDto(job));
  }

  async findOne(id: string): Promise<JobListingDto> {
    await this.expireOverdueJobs();
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: { tenant: true },
    });

    if (!job) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }

    return this.mapToDto(job);
  }

  async getActiveJobsCountForTenant(tenantId: string): Promise<number> {
    await this.expireOverdueJobs();
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    const effectiveTenantId = tenant ? tenant.id : (await this.tenantRepo.findOne({ where: {} }))?.id;
    if (!effectiveTenantId) return 0;
    return await this.jobRepo.count({
      where: { tenantId: effectiveTenantId, status: JobStatus.PUBLISHED },
    });
  }

  async getPlanJobLimitForTenant(tenantId: string): Promise<number> {
    let targetTenantId = tenantId;
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      const firstTenant = await this.tenantRepo.findOne({ where: {} });
      if (firstTenant) targetTenantId = firstTenant.id;
    }

    const sub = await this.subRepo.findOne({
      where: { tenantId: targetTenantId },
      relations: { plan: true },
    });

    return sub?.plan?.maxActiveJobs || 15;
  }

  /**
   * Create new job posting:
   * 1. Auto expires after 30 days.
   * 3. Only superadmin can override expiry date.
   */
  async createJob(jobData: Partial<JobListingDto>, isSuperAdmin: boolean = false): Promise<JobListingDto> {
    let tenantId = jobData.tenantId;
    if (!tenantId) {
      const firstTenant = await this.tenantRepo.findOne({ where: {} });
      if (firstTenant) tenantId = firstTenant.id;
    }

    let postedByUserId = (jobData as any).postedByUserId;
    if (postedByUserId) {
      const existingUser = await this.userRepo.findOne({ where: { id: postedByUserId } });
      if (!existingUser) postedByUserId = undefined;
    }
    if (!postedByUserId && tenantId) {
      const companyUser = await this.userRepo.findOne({ where: { tenantId } });
      if (companyUser) postedByUserId = companyUser.id;
    }
    if (!postedByUserId) {
      const anyUser = await this.userRepo.findOne({ where: {} });
      if (anyUser) postedByUserId = anyUser.id;
    }

    // 1. Auto expire after 30 days.
    // 3. Only superadmin can change expiry date.
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    let expiresAt: Date;
    if (isSuperAdmin && (jobData as any).expiresAt) {
      const parsed = new Date((jobData as any).expiresAt);
      expiresAt = isNaN(parsed.getTime()) ? new Date(Date.now() + THIRTY_DAYS_MS) : parsed;
    } else {
      expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);
    }

    const slugBase = (jobData.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const newJob = this.jobRepo.create({
      tenantId: tenantId || 'tnt-techcorp',
      postedByUserId: postedByUserId,
      title: jobData.title || 'Untitled Role',
      slug: slug,
      description: jobData.description || 'Job description details.',
      category: jobData.category || 'Engineering',
      employmentType: normalizeEmploymentType(jobData.employmentType || (jobData as any).jobType),
      experienceLevel: normalizeExperienceLevel(jobData.experienceLevel),
      salaryMin: jobData.salaryMin || 500000,
      salaryMax: jobData.salaryMax || 1500000,
      currency: jobData.currency || 'INR',
      isSalaryVisible: jobData.isSalaryVisible ?? true,
      locationCountry: (jobData as any).locationCountry || 'India',
      locationState: (jobData as any).locationState || null,
      locationCity: (jobData as any).locationCity || jobData.location || 'Remote',
      minExperience: (jobData as any).minExperience ?? 0,
      maxExperience: (jobData as any).maxExperience ?? 5,
      skills: (jobData as any).skills || [],
      isRemote: jobData.isRemote ?? true,
      isFeatured: jobData.isFeatured ?? false,
      applyType: jobData.applyType || 'INTERNAL',
      applyUrl: jobData.applyUrl || '',
      status: JobStatus.PUBLISHED,
      expiresAt: expiresAt,
      screeningQuestions: jobData.screeningQuestions || [],
    });

    const saved = await this.jobRepo.save(newJob);
    return this.findOne(saved.id);
  }

  /**
   * 2. Job repost:
   * - Consumes 1 job from plan quota.
   * - Creates new job posting with edits applied.
   * - Applies fresh 30-day expiry timeline.
   */
  async repostJob(
    originalJobId: string,
    editedData: Partial<JobListingDto>,
    user?: any,
  ): Promise<JobListingDto> {
    const originalJob = await this.jobRepo.findOne({
      where: { id: originalJobId },
      relations: { tenant: true },
    });
    if (!originalJob) {
      throw new NotFoundException(`Original job posting with ID ${originalJobId} not found`);
    }

    const tenantId = user?.tenantId || originalJob.tenantId;

    // Check active jobs quota for company (unless Super Admin)
    if (user?.role !== 'SUPER_ADMIN') {
      const activeJobs = await this.getActiveJobsCountForTenant(tenantId);
      const planMaxJobs = await this.getPlanJobLimitForTenant(tenantId);

      // If original job is active (PUBLISHED), archiving it frees 1 slot.
      // If original job was already EXPIRED, activeJobs + 1 must be <= planMaxJobs.
      const slotsOccupied = originalJob.status === JobStatus.PUBLISHED ? activeJobs - 1 : activeJobs;
      if (slotsOccupied + 1 > planMaxJobs) {
        throw new ForbiddenException(
          `Job posting quota exceeded! Your plan limit is ${planMaxJobs} active jobs. Upgrade your company subscription to repost.`
        );
      }
    }

    // If original job was still PUBLISHED, archive it so there are no duplicate active jobs
    if (originalJob.status === JobStatus.PUBLISHED) {
      originalJob.status = JobStatus.ARCHIVED;
      await this.jobRepo.save(originalJob);
    }

    // New 30-day timeline
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

    const title = editedData.title?.trim() || originalJob.title;
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

    const newJob = this.jobRepo.create({
      tenantId: tenantId,
      postedByUserId: user?.id || originalJob.postedByUserId,
      title: title,
      slug: slug,
      description: editedData.description !== undefined ? editedData.description : originalJob.description,
      category: editedData.category || originalJob.category,
      employmentType: normalizeEmploymentType(editedData.employmentType || (editedData as any).jobType || originalJob.employmentType),
      experienceLevel: normalizeExperienceLevel(editedData.experienceLevel || originalJob.experienceLevel),
      salaryMin: editedData.salaryMin !== undefined ? editedData.salaryMin : originalJob.salaryMin,
      salaryMax: editedData.salaryMax !== undefined ? editedData.salaryMax : originalJob.salaryMax,
      currency: editedData.currency || originalJob.currency,
      isSalaryVisible: editedData.isSalaryVisible !== undefined ? editedData.isSalaryVisible : originalJob.isSalaryVisible,
      locationCountry: (editedData as any).locationCountry || originalJob.locationCountry,
      locationState: (editedData as any).locationState !== undefined ? (editedData as any).locationState : originalJob.locationState,
      locationCity: (editedData as any).locationCity || editedData.location || originalJob.locationCity,
      minExperience: (editedData as any).minExperience !== undefined ? (editedData as any).minExperience : originalJob.minExperience,
      maxExperience: (editedData as any).maxExperience !== undefined ? (editedData as any).maxExperience : originalJob.maxExperience,
      skills: (editedData as any).skills || originalJob.skills || [],
      isRemote: editedData.isRemote !== undefined ? editedData.isRemote : originalJob.isRemote,
      isFeatured: editedData.isFeatured !== undefined ? editedData.isFeatured : false,
      applyType: editedData.applyType || originalJob.applyType,
      applyUrl: editedData.applyUrl !== undefined ? editedData.applyUrl : originalJob.applyUrl,
      screeningQuestions: editedData.screeningQuestions || originalJob.screeningQuestions || [],
      status: JobStatus.PUBLISHED,
      expiresAt: expiresAt,
      viewsCount: 0,
      applicationsCount: 0,
    });

    const saved = await this.jobRepo.save(newJob);
    return this.findOne(saved.id);
  }

  /**
   * Update existing job:
   * 3. Only superadmin can change expiry date.
   */
  async updateJob(id: string, updateData: Partial<JobListingDto>, isSuperAdmin: boolean = false): Promise<JobListingDto> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    if (updateData.title) {
      job.title = updateData.title;
      job.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (updateData.description !== undefined) job.description = updateData.description;
    if (updateData.category !== undefined) job.category = updateData.category;
    if (updateData.employmentType !== undefined) {
      job.employmentType = normalizeEmploymentType(updateData.employmentType || (updateData as any).jobType);
    }
    if (updateData.experienceLevel !== undefined) {
      job.experienceLevel = normalizeExperienceLevel(updateData.experienceLevel);
    }
    if (updateData.salaryMin !== undefined) job.salaryMin = updateData.salaryMin;
    if (updateData.salaryMax !== undefined) job.salaryMax = updateData.salaryMax;
    if (updateData.currency !== undefined) job.currency = updateData.currency;
    if (updateData.isSalaryVisible !== undefined) job.isSalaryVisible = updateData.isSalaryVisible;
    if (updateData.location !== undefined) job.locationCity = updateData.location;
    if ((updateData as any).locationCity !== undefined) job.locationCity = (updateData as any).locationCity;
    if ((updateData as any).locationState !== undefined) job.locationState = (updateData as any).locationState;
    if ((updateData as any).locationCountry !== undefined) job.locationCountry = (updateData as any).locationCountry;
    if ((updateData as any).minExperience !== undefined) job.minExperience = (updateData as any).minExperience;
    if ((updateData as any).maxExperience !== undefined) job.maxExperience = (updateData as any).maxExperience;
    if ((updateData as any).skills !== undefined) job.skills = (updateData as any).skills;
    if (updateData.isRemote !== undefined) job.isRemote = updateData.isRemote;
    if (updateData.isFeatured !== undefined) job.isFeatured = updateData.isFeatured;
    if (updateData.applyType !== undefined) job.applyType = updateData.applyType;
    if (updateData.applyUrl !== undefined) job.applyUrl = updateData.applyUrl;
    if (updateData.screeningQuestions !== undefined) job.screeningQuestions = updateData.screeningQuestions;

    // 3. Only superadmin can change expiry date.
    if (isSuperAdmin && (updateData as any).expiresAt !== undefined) {
      const newExp = new Date((updateData as any).expiresAt);
      if (!isNaN(newExp.getTime())) {
        job.expiresAt = newExp;
        if (newExp > new Date() && job.status === JobStatus.EXPIRED) {
          job.status = JobStatus.PUBLISHED;
        } else if (newExp <= new Date() && job.status === JobStatus.PUBLISHED) {
          job.status = JobStatus.EXPIRED;
        }
      }
    }

    await this.jobRepo.save(job);
    return this.findOne(id);
  }

  async deleteJob(id: string): Promise<{ success: boolean }> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    await this.jobRepo.remove(job);
    return { success: true };
  }

  async featureJob(id: string): Promise<JobListingDto> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    job.isFeatured = true;
    await this.jobRepo.save(job);
    return this.findOne(id);
  }

  private mapToDto(job: JobPosting): JobListingDto {
    const isExpired = job.status === JobStatus.EXPIRED || (job.expiresAt ? new Date(job.expiresAt) <= new Date() : false);
    return {
      id: job.id,
      tenantId: job.tenantId,
      title: job.title,
      companyName: job.tenant ? job.tenant.name : 'TechCorp Global',
      companyLogoUrl: job.tenant ? job.tenant.logoUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
      isConsultancy: false,
      location: job.locationCity || 'Remote',
      locationCountry: job.locationCountry || 'India',
      locationState: job.locationState || undefined,
      locationCity: job.locationCity || 'Remote',
      isRemote: job.isRemote,
      employmentType: job.employmentType || 'Full-time',
      salaryMin: job.salaryMin ? Number(job.salaryMin) : undefined,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : undefined,
      currency: job.currency || 'INR',
      isSalaryVisible: job.isSalaryVisible,
      category: job.category,
      experienceLevel: job.experienceLevel || 'Mid',
      minExperience: job.minExperience ?? 0,
      maxExperience: job.maxExperience ?? 5,
      skills: job.skills || [],
      description: job.description,
      isFeatured: job.isFeatured,
      applyType: job.applyType || 'INTERNAL',
      applyUrl: job.applyUrl || undefined,
      screeningQuestions: job.screeningQuestions,
      status: isExpired ? JobStatus.EXPIRED : job.status,
      expiresAt: job.expiresAt ? job.expiresAt.toISOString() : undefined,
      isExpired: isExpired,
      createdAt: job.createdAt ? job.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
