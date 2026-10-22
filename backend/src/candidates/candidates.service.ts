import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, ProfileVisibility } from './entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';

export interface CandidateProfileDto {
  id: string;
  userId: string;
  headline: string;
  summary: string;
  currentTitle: string;
  experienceYears: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  preferredLocations?: string[];
  resumeUrl?: string;
  resumes?: Array<{
    id: string;
    title: string;
    resumeUrl: string;
    url?: string;
    isDefault?: boolean;
    uploadedAt?: string;
  }>;
  savedJobIds?: string[];
  skills: string[];
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    lastLoginAt?: Date | string;
    createdAt?: Date | string;
  };
  experience?: Array<{
    id?: string;
    designation: string;
    title?: string;
    companyName: string;
    company?: string;
    isCurrentJob?: boolean;
    isCurrent?: boolean;
    startDate?: string;
    endDate?: string;
    noticePeriod?: string;
    location?: string;
    jobSummary?: string;
    rolesAndResponsibilities?: string;
    description?: string;
  }>;
  education?: Array<{
    id?: string;
    degree: string;
    degree_title?: string;
    fieldOfStudy?: string;
    institution: string;
    startYear?: string;
    endYear?: string;
    year?: string;
    grade?: string;
    result?: string;
  }>;
  certifications?: Array<{
    id?: string;
    title: string;
    issuingOrganization: string;
    issueDate?: string;
    expiryDate?: string;
    credentialUrl?: string;
  }>;
  projects?: Array<{
    id?: string;
    projectTitle: string;
    client?: string;
    role?: string;
    projectDescription?: string;
    technologies?: string[];
    projectUrl?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
  }>;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  visibility: ProfileVisibility;
}

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(JobPosting)
    private readonly jobRepo: Repository<JobPosting>,
  ) {}

  async findAll(params?: { skill?: string; noticePeriod?: string; city?: string; minExp?: number; maxSalary?: number }): Promise<CandidateProfileDto[]> {
    const candidates = await this.candidateRepo.find({
      relations: { user: true },
      order: { updatedAt: 'DESC' },
      take: 100,
    });

    let result = candidates.map((c) => this.mapToDto(c));

    if (params?.skill) {
      const sLower = params.skill.toLowerCase();
      result = result.filter((c) =>
        c.skills && c.skills.some((s) => s.toLowerCase().includes(sLower)),
      );
    }

    if (params?.noticePeriod) {
      const npLower = params.noticePeriod.toLowerCase();
      result = result.filter((c) => c.noticePeriod && c.noticePeriod.toLowerCase().includes(npLower));
    }

    if (params?.city) {
      const cLower = params.city.toLowerCase();
      result = result.filter((c) =>
        c.preferredLocations && c.preferredLocations.some((loc) => loc.toLowerCase().includes(cLower)),
      );
    }

    if (params?.minExp) {
      result = result.filter((c) => c.experienceYears >= params.minExp!);
    }

    if (params?.maxSalary) {
      result = result.filter((c) => (c.expectedSalary || 0) <= params.maxSalary!);
    }

    return result;
  }

  async findOne(id: string): Promise<CandidateProfileDto> {
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
      } catch (err) {
        throw new NotFoundException(`Candidate profile ${id} not found`);
      }
    }

    return this.mapToDto(candidate);
  }

  async updateProfile(id: string, partial: Partial<CandidateProfileDto>): Promise<CandidateProfileDto> {
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

    const sanitizeSalary = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number') return isNaN(val) ? null : val;
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
      }
      return null;
    };

    if (partial.headline !== undefined) candidate.headline = partial.headline;
    if (partial.summary !== undefined) candidate.summary = partial.summary;
    if (partial.currentTitle !== undefined) candidate.currentTitle = partial.currentTitle;
    if (partial.experienceYears !== undefined) candidate.experienceYears = Number(partial.experienceYears) || 0;
    if (partial.currentSalary !== undefined) candidate.currentSalary = sanitizeSalary(partial.currentSalary) as any;
    if (partial.expectedSalary !== undefined) candidate.expectedSalary = sanitizeSalary(partial.expectedSalary) as any;
    if (partial.noticePeriod !== undefined) candidate.noticePeriod = partial.noticePeriod;
    if (partial.preferredLocations !== undefined) candidate.preferredLocations = partial.preferredLocations;
    if (partial.resumeUrl !== undefined) candidate.resumeUrl = partial.resumeUrl;
    if (partial.resumes !== undefined) candidate.resumes = partial.resumes;
    if (partial.skills !== undefined) candidate.skills = partial.skills;
    if (partial.experience !== undefined) candidate.experience = partial.experience;
    if (partial.education !== undefined) candidate.education = partial.education;
    if (partial.certifications !== undefined) candidate.certifications = partial.certifications;
    if (partial.projects !== undefined) candidate.projects = partial.projects;
    if (partial.languages !== undefined) candidate.languages = partial.languages;
    if (partial.socialLinks !== undefined) candidate.socialLinks = partial.socialLinks;
    const userUpdates: any = {};
    const anyPartial = partial as any;
    if (anyPartial.firstName !== undefined) userUpdates.firstName = anyPartial.firstName;
    if (anyPartial.lastName !== undefined) userUpdates.lastName = anyPartial.lastName;
    if (anyPartial.phoneNumber !== undefined) userUpdates.phoneNumber = anyPartial.phoneNumber;
    if (anyPartial.avatarUrl !== undefined) userUpdates.avatarUrl = anyPartial.avatarUrl;
    if (partial.user) {
      if (partial.user.firstName !== undefined) userUpdates.firstName = partial.user.firstName;
      if (partial.user.lastName !== undefined) userUpdates.lastName = partial.user.lastName;
      if (partial.user.phoneNumber !== undefined) userUpdates.phoneNumber = partial.user.phoneNumber;
      if (partial.user.avatarUrl !== undefined) userUpdates.avatarUrl = partial.user.avatarUrl;
    }
    if (Object.keys(userUpdates).length > 0 && candidate.userId) {
      await this.userRepo.update(candidate.userId, userUpdates);
    }

    const saved = await this.candidateRepo.save(candidate);
    return this.findOne(saved.id);
  }

  async toggleSaveJob(candidateOrUserId: string, jobId: string): Promise<{ saved: boolean; savedJobIds: string[] }> {
    let candidate = await this.candidateRepo.findOne({
      where: [{ id: candidateOrUserId }, { userId: candidateOrUserId }],
    });

    if (!candidate) {
      const user = await this.userRepo.findOne({ where: { id: candidateOrUserId } });
      if (!user) {
        throw new NotFoundException(`User or candidate profile ${candidateOrUserId} not found.`);
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
    } else {
      currentSaved.push(jobId);
      isSavedNow = true;
    }

    candidate.savedJobIds = currentSaved;
    await this.candidateRepo.save(candidate);
    return { saved: isSavedNow, savedJobIds: currentSaved };
  }

  async getSavedJobs(candidateOrUserId: string): Promise<any[]> {
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

  private mapToDto(c: Candidate): CandidateProfileDto {
    const rawExp = Array.isArray(c.experience) ? c.experience : [];
    const normalizedExp = rawExp.map((e: any, idx: number) => {
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
    const normalizedEdu = rawEdu.map((ed: any, idx: number) => {
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
    let normalizedResumes = rawResumes.map((r: any, idx: number) => {
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
      visibility: c.visibility || ProfileVisibility.PUBLIC,
    };
  }
}
