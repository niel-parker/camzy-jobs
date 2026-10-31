import { Response } from 'express';
import { CandidatesService, CandidateProfileDto } from './candidates.service';
export declare class CandidatesController {
    private readonly candidatesService;
    constructor(candidatesService: CandidatesService);
    uploadResume(file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        filename: string;
        originalName: string;
        size: number;
        mimeType: string;
        url: string;
        fullUrl: string;
    }>;
    getResumeFile(filename: string, res: Response): Promise<void>;
    uploadAvatar(file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        filename: string;
        originalName: string;
        size: number;
        mimeType: string;
        url: string;
        fullUrl: string;
    }>;
    getAvatarFile(filename: string, res: Response): Promise<void>;
    findAll(skill?: string, query?: string, excludeKeywords?: string, searchIn?: string, noticePeriod?: string, city?: string, location?: string, minExp?: string, maxExp?: string, minSalary?: string, maxSalary?: string, company?: string, designation?: string, activeIn?: string, page?: string, limit?: string, sortBy?: string): Promise<{
        candidates: CandidateProfileDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<CandidateProfileDto>;
    updateProfile(id: string, body: any): Promise<CandidateProfileDto>;
    toggleSaveJob(id: string, jobId: string): Promise<{
        saved: boolean;
        savedJobIds: string[];
    }>;
    getSavedJobs(id: string): Promise<any[]>;
}
