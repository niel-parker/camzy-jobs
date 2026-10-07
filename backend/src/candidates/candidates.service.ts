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
    const candidate = await this.candidateRepo.findOne({
      where: [{ id }, { userId: id }],
      relations: { user: true },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate profile ${id} not found`);
    }

    return this.mapToDto(candidate);
  }

  async updateProfile(id: string, partial: Partial<CandidateProfileDto>): Promise<CandidateProfileDto> {
    const candidate = await this.candidateRepo.findOne({
      where: [{ id }, { userId: id }],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate profile ${id} not found`);
    }

    if (partial.headline !== undefined) candidate.headline = partial.headline;
    if (partial.summary !== undefined) candidate.summary = partial.summary;
    if (partial.currentTitle !== undefined) candidate.currentTitle = partial.currentTitle;
    if (partial.experienceYears !== undefined) candidate.experienceYears = partial.experienceYears;
    if (partial.expectedSalary !== undefined) candidate.expectedSalary = partial.expectedSalary;
    if (partial.resumeUrl !== undefined) candidate.resumeUrl = partial.resumeUrl;
    if (partial.skills !== undefined) candidate.skills = partial.skills;
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
      visibility: c.visibility || ProfileVisibility.PUBLIC,
    };
  }
}
