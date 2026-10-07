import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, JobStatus, EmploymentType, ExperienceLevel } from './entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

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
    return await this.jobRepo.count({
      where: { tenantId, status: JobStatus.PUBLISHED },
    });
  }

  async getPlanJobLimitForTenant(tenantId: string): Promise<number> {
    return 15;
  }

  async createJob(jobData: Partial<JobListingDto>): Promise<JobListingDto> {
    let tenantId = jobData.tenantId;
    if (!tenantId) {
      const firstTenant = await this.tenantRepo.findOne({ where: {} });
      if (firstTenant) tenantId = firstTenant.id;
    }

    const newJob = this.jobRepo.create({
      tenantId: tenantId || 'tnt-techcorp',
      postedByUserId: 'usr-company-1',
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
      status: JobStatus.PUBLISHED,
      expiresAt: new Date(Date.now() + 60 * 86400000),
      screeningQuestions: jobData.screeningQuestions || [],
    });

    const saved = await this.jobRepo.save(newJob);
    return this.findOne(saved.id);
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
      screeningQuestions: job.screeningQuestions,
      createdAt: job.createdAt ? job.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
