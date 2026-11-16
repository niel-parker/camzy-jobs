import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStage, JobApplication } from './entities/job-application.entity';
import { JobPosting, JobStatus } from '../jobs/entities/job-posting.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { User, UserRole } from '../users/entities/user.entity';

export interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  tenantId?: string;
  location?: string;
  employmentType?: string;
  category?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateHeadline: string;
  coverLetter?: string;
  resumeUrlSnapshot: string;
  stage: ApplicationStage;
  rating: number;
  createdAt: string;
}

export interface FindApplicationsOptions {
  jobId?: string;
  tenantId?: string;
  candidateId?: string;
  userId?: string;
  currentUser?: {
    id: string;
    role: string;
    tenantId?: string;
    candidateId?: string;
  } | null;
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(options: FindApplicationsOptions = {}): Promise<ApplicationDto[]> {
    const { jobId, tenantId, candidateId, userId, currentUser } = options;

    const qb = this.appRepo.createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .leftJoinAndSelect('job.tenant', 'tenant')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'user');

    // 1. Candidate Role: Strictly isolate to current candidate's own applications
    if (currentUser?.role === UserRole.CANDIDATE || currentUser?.role === 'CANDIDATE') {
      const candId = currentUser.candidateId;
      const uId = currentUser.id;
      if (candId) {
        qb.where('(app.candidateId = :candId OR candidate.userId = :uId)', { candId, uId });
      } else {
        qb.where('candidate.userId = :uId', { uId });
      }
    }
    // 2. Employer Role: Strictly isolate to the employer's own company tenant
    else if (
      currentUser?.role === UserRole.COMPANY_ADMIN ||
      currentUser?.role === 'COMPANY_ADMIN' ||
      currentUser?.role === UserRole.RECRUITER ||
      currentUser?.role === 'RECRUITER'
    ) {
      const effectiveTenantId = currentUser.tenantId || tenantId;
      if (effectiveTenantId) {
        qb.where('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId: effectiveTenantId });
      } else {
        return [];
      }

      if (jobId) {
        qb.andWhere('app.jobId = :jobId', { jobId });
      }
    }
    // 3. Super Admin Role: Unrestricted, but respects optional filters
    else if (currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === 'SUPER_ADMIN') {
      if (tenantId) {
        qb.andWhere('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId });
      }
      if (jobId) {
        qb.andWhere('app.jobId = :jobId', { jobId });
      }
      if (candidateId) {
        qb.andWhere('(app.candidateId = :candidateId OR candidate.userId = :candidateId)', { candidateId });
      }
      if (userId) {
        qb.andWhere('candidate.userId = :userId', { userId });
      }
    }
    // 4. Query-param based access (when caller is unauthenticated or SDK passing explicit parameters)
    else {
      let hasFilter = false;

      if (candidateId) {
        qb.andWhere('(app.candidateId = :candidateId OR candidate.userId = :candidateId)', { candidateId });
        hasFilter = true;
      } else if (userId) {
        qb.andWhere('candidate.userId = :userId', { userId });
        hasFilter = true;
      }

      if (tenantId) {
        qb.andWhere('(job.tenantId = :tenantId OR tenant.slug = :tenantId)', { tenantId });
        hasFilter = true;
      }

      if (jobId) {
        qb.andWhere('app.jobId = :jobId', { jobId });
        hasFilter = true;
      }

      // Safety guard: If completely unauthenticated and no filters supplied, NEVER leak all applications
      if (!hasFilter) {
        return [];
      }
    }

    qb.orderBy('app.createdAt', 'DESC');

    const apps = await qb.getMany();
    return apps.map((a) => this.mapToDto(a));
  }

  // Backwards compatibility wrapper
  async findAllByJob(jobId?: string): Promise<ApplicationDto[]> {
    return await this.findAll({ jobId });
  }

  async submitApplication(
    data: Partial<ApplicationDto> & { answersJson?: Record<string, any> },
    currentUser?: { id: string; role: string; candidateId?: string } | null,
  ): Promise<ApplicationDto> {
    const jobId = data.jobId;
    if (!jobId) {
      throw new BadRequestException('Job posting ID is required to apply.');
    }

    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: { tenant: true },
    });
    if (!job) {
      throw new NotFoundException(`Job posting with ID ${jobId} not found`);
    }

    // 1. Expired job should not accept applications
    const isExpired = job.status === JobStatus.EXPIRED || (job.expiresAt && new Date(job.expiresAt) <= new Date());
    if (isExpired) {
      throw new BadRequestException('This job posting has expired and is no longer accepting applications.');
    }

    // 2. Resolve Candidate strictly to the authenticated user or provided candidateId
    let targetCand: Candidate | null = null;
    const candIdentifier = data.candidateId || currentUser?.candidateId || currentUser?.id;

    if (candIdentifier) {
      targetCand = await this.candidateRepo.findOne({
        where: [{ id: candIdentifier }, { userId: candIdentifier }],
        relations: { user: true },
      });
    }

    if (!targetCand && currentUser?.id) {
      targetCand = await this.candidateRepo.findOne({
        where: { userId: currentUser.id },
        relations: { user: true },
      });

      if (!targetCand) {
        // Auto-create Candidate record for authenticated candidate user
        const newCand = this.candidateRepo.create({
          userId: currentUser.id,
          headline: 'Job Seeker',
          skills: [],
        });
        targetCand = await this.candidateRepo.save(newCand);
      }
    }

    if (!targetCand) {
      throw new BadRequestException('A valid candidate profile is required to submit an application.');
    }

    // 3. Prevent duplicate application to the same job by the same candidate
    const existing = await this.appRepo.findOne({
      where: { jobId: job.id, candidateId: targetCand.id },
    });
    if (existing) {
      return this.mapToDto(existing);
    }

    const newApp = this.appRepo.create({
      jobId: job.id,
      candidateId: targetCand.id,
      coverLetter: data.coverLetter || '',
      resumeUrlSnapshot: data.resumeUrlSnapshot || 'https://example.com/resumes/resume.pdf',
      answersJson: data.answersJson || {},
      stage: ApplicationStage.APPLIED,
      rating: 0,
    });

    const saved = await this.appRepo.save(newApp);
    const fullApp = await this.appRepo.findOne({
      where: { id: saved.id },
      relations: { job: { tenant: true }, candidate: { user: true } },
    });

    return this.mapToDto(fullApp || saved);
  }

  async updateStage(
    id: string,
    stage: ApplicationStage,
    rating?: number,
    currentUser?: { id: string; role: string; tenantId?: string } | null,
  ): Promise<ApplicationDto> {
    const app = await this.appRepo.findOne({
      where: { id },
      relations: { job: { tenant: true }, candidate: { user: true } },
    });

    if (!app) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    // Authorization guard: Ensure employer only modifies applications for their own company
    if (
      currentUser?.role === UserRole.COMPANY_ADMIN ||
      currentUser?.role === 'COMPANY_ADMIN' ||
      currentUser?.role === UserRole.RECRUITER ||
      currentUser?.role === 'RECRUITER'
    ) {
      if (currentUser.tenantId && app.job?.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('You do not have permission to modify applications for another company.');
      }
    }

    app.stage = stage;
    if (rating !== undefined) app.rating = rating;

    await this.appRepo.save(app);
    return this.mapToDto(app);
  }

  private mapToDto(app: JobApplication): ApplicationDto {
    const candidateName = app.candidate?.user
      ? `${app.candidate.user.firstName} ${app.candidate.user.lastName}`.trim()
      : 'Candidate';
    const candidateEmail = app.candidate?.user?.email || '';
    const candidatePhone = app.candidate?.user?.phoneNumber || '';

    const companyName = app.job?.tenant?.name || (app.job as any)?.companyName || 'Hiring Company';
    const companyLogo = app.job?.tenant?.logoUrl || '';
    const tenantId = app.job?.tenantId || app.job?.tenant?.id || '';
    const location = [app.job?.locationCity, app.job?.locationState, app.job?.locationCountry]
      .filter(Boolean)
      .join(', ') || 'Remote';
    const employmentType = app.job?.employmentType || 'Full-time';
    const category = app.job?.category || 'General';

    return {
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job?.title || 'Job Opening',
      companyName,
      companyLogo,
      tenantId,
      location,
      employmentType,
      category,
      candidateId: app.candidateId,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidateHeadline: app.candidate?.headline || 'Candidate',
      coverLetter: app.coverLetter || '',
      resumeUrlSnapshot: app.resumeUrlSnapshot || '',
      stage: app.stage || ApplicationStage.APPLIED,
      rating: app.rating || 0,
      createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
