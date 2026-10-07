import { CandidatesService, CandidateProfileDto } from './candidates.service';
export declare class CandidatesController {
    private readonly candidatesService;
    constructor(candidatesService: CandidatesService);
    findAll(skill?: string): Promise<CandidateProfileDto[]>;
    findOne(id: string): Promise<CandidateProfileDto>;
    updateProfile(id: string, body: Partial<CandidateProfileDto>): Promise<CandidateProfileDto>;
}
