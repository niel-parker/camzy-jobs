import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStage, JobApplication } from './entities/job-application.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Candidate } from '../candidates/entities/candidate.entity';

export interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  coverLetter?: string;
  resumeUrlSnapshot: string;
  stage: ApplicationStage;
  rating: number;
  createdAt: string;
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
  ) {}

  async findAllByJob(jobId?: string): Promise<ApplicationDto[]> {
    const qb = this.appRepo.createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'user');

    if (jobId) {
      qb.where('app.jobId = :jobId', { jobId });
    }

    qb.orderBy('app.createdAt', 'DESC');

    const apps = await qb.getMany();
    return apps.map((a) => this.mapToDto(a));
  }

  async submitApplication(data: Partial<ApplicationDto> & { answersJson?: Record<string, any> }): Promise<ApplicationDto> {
    let jobId = data.jobId;
    if (!jobId) {
      const firstJob = await this.jobRepo.findOne({ where: {} });
      if (firstJob) jobId = firstJob.id;
    }

    let candidateId = data.candidateId;
    if (candidateId) {
      let cand = await this.candidateRepo.findOne({ where: { id: candidateId } });
      if (!cand) {
        cand = await this.candidateRepo.findOne({ where: { userId: candidateId } });
      }
      if (cand) candidateId = cand.id;
      else candidateId = undefined;
    }

    if (!candidateId) {
      const firstCand = await this.candidateRepo.findOne({ where: {} });
      if (firstCand) candidateId = firstCand.id;
    }

    const newApp = this.appRepo.create({
      jobId: jobId || 'job-101',
      candidateId: candidateId || 'cnd-101',
      coverLetter: data.coverLetter || '',
      resumeUrlSnapshot: data.resumeUrlSnapshot || 'https://example.com/resumes/resume.pdf',
      answersJson: data.answersJson || {},
      stage: ApplicationStage.APPLIED,
      rating: 0,
    });

    const saved = await this.appRepo.save(newApp);
    const fullApp = await this.appRepo.findOne({
      where: { id: saved.id },
      relations: { job: true, candidate: { user: true } },
    });

    return this.mapToDto(fullApp || saved);
  }

  async updateStage(id: string, stage: ApplicationStage, rating?: number): Promise<ApplicationDto> {
    const app = await this.appRepo.findOne({
      where: { id },
      relations: { job: true, candidate: { user: true } },
    });

    if (!app) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    app.stage = stage;
    if (rating !== undefined) app.rating = rating;

    await this.appRepo.save(app);
    return this.mapToDto(app);
  }

  private mapToDto(app: JobApplication): ApplicationDto {
    const candidateName = app.candidate?.user
      ? `${app.candidate.user.firstName} ${app.candidate.user.lastName}`
      : 'Candidate';

    return {
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job?.title || 'Senior Full Stack Engineer',
      candidateId: app.candidateId,
      candidateName,
      candidateHeadline: app.candidate?.headline || 'Senior Engineer',
      coverLetter: app.coverLetter || '',
      resumeUrlSnapshot: app.resumeUrlSnapshot || '',
      stage: app.stage || ApplicationStage.APPLIED,
      rating: app.rating || 0,
      createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
