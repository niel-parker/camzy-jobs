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
export declare class CandidatesService {
    private readonly candidateRepo;
    constructor(candidateRepo: Repository<Candidate>);
    findAll(skill?: string): Promise<CandidateProfileDto[]>;
    findOne(id: string): Promise<CandidateProfileDto>;
    updateProfile(id: string, partial: Partial<CandidateProfileDto>): Promise<CandidateProfileDto>;
    private mapToDto;
}
