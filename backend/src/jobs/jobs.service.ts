import { Injectable, NotFoundException } from '@nestjs/common';
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
  isRemote: boolean;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  isSalaryVisible: boolean;
  category: string;
  experienceLevel: string;
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
  createdAt: string;
}

@Injectable()
export class JobsService {
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

  async findAll(category?: string, query?: string): Promise<JobListingDto[]> {
    const qb = this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.tenant', 'tenant')
      .where('job.status = :status', { status: JobStatus.PUBLISHED });

    if (category && category !== 'All') {
      qb.andWhere('LOWER(job.category) LIKE LOWER(:category)', { category: `%${category}%` });
    }

    if (query) {
      qb.andWhere(
        '(LOWER(job.title) LIKE LOWER(:q) OR LOWER(job.description) LIKE LOWER(:q) OR LOWER(tenant.name) LIKE LOWER(:q))',
        { q: `%${query}%` },
      );
    }

    qb.orderBy('job.createdAt', 'DESC');

    const jobs = await qb.getMany();
    return jobs.map((job) => this.mapToDto(job));
  }

  async findOne(id: string): Promise<JobListingDto> {
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

  async createJob(jobData: Partial<JobListingDto>): Promise<JobListingDto> {
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

    const newJob = this.jobRepo.create({
      tenantId: tenantId || 'tnt-techcorp',
      postedByUserId: postedByUserId,
      title: jobData.title || 'Untitled Role',
      slug: (jobData.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: jobData.description || 'Job description details.',
      category: jobData.category || 'Engineering',
      employmentType: (jobData.employmentType as EmploymentType) || EmploymentType.FULL_TIME,
      experienceLevel: (jobData.experienceLevel as ExperienceLevel) || ExperienceLevel.MID,
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
      status: JobStatus.PUBLISHED,
      expiresAt: new Date(Date.now() + 60 * 86400000),
      screeningQuestions: jobData.screeningQuestions || [],
    });

    const saved = await this.jobRepo.save(newJob);
    return this.findOne(saved.id);
  }

  async updateJob(id: string, updateData: Partial<JobListingDto>): Promise<JobListingDto> {
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
    if (updateData.employmentType !== undefined) job.employmentType = updateData.employmentType as EmploymentType;
    if (updateData.experienceLevel !== undefined) job.experienceLevel = updateData.experienceLevel as ExperienceLevel;
    if (updateData.salaryMin !== undefined) job.salaryMin = updateData.salaryMin;
    if (updateData.salaryMax !== undefined) job.salaryMax = updateData.salaryMax;
    if (updateData.currency !== undefined) job.currency = updateData.currency;
    if (updateData.isSalaryVisible !== undefined) job.isSalaryVisible = updateData.isSalaryVisible;
    if (updateData.location !== undefined) job.locationCity = updateData.location;
    if (updateData.isRemote !== undefined) job.isRemote = updateData.isRemote;
    if (updateData.isFeatured !== undefined) job.isFeatured = updateData.isFeatured;
    if (updateData.applyType !== undefined) job.applyType = updateData.applyType;
    if (updateData.applyUrl !== undefined) job.applyUrl = updateData.applyUrl;
    if (updateData.screeningQuestions !== undefined) job.screeningQuestions = updateData.screeningQuestions;

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
}
