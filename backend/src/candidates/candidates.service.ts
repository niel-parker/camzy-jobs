import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, ProfileVisibility } from './entities/candidate.entity';

export interface CandidateProfileDto {
  id: string;
  userId: string;
  headline: string;
  summary: string;
  currentTitle: string;
  experienceYears: number;
  expectedSalary: number;
  resumeUrl?: string;
  skills: string[];
  experience?: Array<{
    id?: string;
    designation: string;
    companyName: string;
    isCurrentJob?: boolean;
    startDate?: string;
    endDate?: string;
    noticePeriod?: string;
    location?: string;
    jobSummary?: string;
  }>;
  education?: Array<{
    id?: string;
    degree: string;
    fieldOfStudy?: string;
    institution: string;
    startYear?: string;
    endYear?: string;
    grade?: string;
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
  ) {}

  async findAll(skill?: string): Promise<CandidateProfileDto[]> {
    const candidates = await this.candidateRepo.find({
      relations: { user: true },
    });

    let result = candidates.map((c) => this.mapToDto(c));

    if (skill) {
      result = result.filter((c) =>
        c.skills && c.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
      );
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
          resumeUrl: 'https://example.com/resumes/candidate-resume-2026.pdf',
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

    if (partial.headline !== undefined) candidate.headline = partial.headline;
    if (partial.summary !== undefined) candidate.summary = partial.summary;
    if (partial.currentTitle !== undefined) candidate.currentTitle = partial.currentTitle;
    if (partial.experienceYears !== undefined) candidate.experienceYears = partial.experienceYears;
    if (partial.expectedSalary !== undefined) candidate.expectedSalary = partial.expectedSalary;
    if (partial.resumeUrl !== undefined) candidate.resumeUrl = partial.resumeUrl;
    if (partial.skills !== undefined) candidate.skills = partial.skills;
    if (partial.experience !== undefined) candidate.experience = partial.experience;
    if (partial.education !== undefined) candidate.education = partial.education;
    if (partial.certifications !== undefined) candidate.certifications = partial.certifications;
    if (partial.projects !== undefined) candidate.projects = partial.projects;
    if (partial.languages !== undefined) candidate.languages = partial.languages;
    if (partial.socialLinks !== undefined) candidate.socialLinks = partial.socialLinks;
    if (partial.visibility !== undefined) candidate.visibility = partial.visibility;

    const saved = await this.candidateRepo.save(candidate);
    return this.findOne(saved.id);
  }

  private mapToDto(c: Candidate): CandidateProfileDto {
    return {
      id: c.id,
      userId: c.userId,
      headline: c.headline || 'Software Engineer',
      summary: c.summary || '',
      currentTitle: c.currentTitle || 'Engineer',
      experienceYears: c.experienceYears || 0,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : 0,
      resumeUrl: c.resumeUrl || undefined,
      skills: c.skills || [],
      experience: c.experience || [],
      education: c.education || [],
      certifications: c.certifications || [],
      projects: c.projects || [],
      languages: c.languages || [],
      socialLinks: c.socialLinks || {},
      visibility: c.visibility || ProfileVisibility.PUBLIC,
    };
  }
}
