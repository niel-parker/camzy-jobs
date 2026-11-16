import { ApplicationDto, ApplicationsService } from './applications.service';
import { ApplicationStage } from './entities/job-application.entity';
import { AuthService } from '../auth/auth.service';
export declare class ApplicationsController {
    private readonly applicationsService;
    private readonly authService;
    constructor(applicationsService: ApplicationsService, authService: AuthService);
    findAll(jobId?: string, tenantId?: string, candidateId?: string, userId?: string, authHeader?: string): Promise<ApplicationDto[]>;
    submitApplication(body: Partial<ApplicationDto> & {
        answersJson?: Record<string, any>;
    }, authHeader?: string): Promise<ApplicationDto>;
    updateStage(id: string, body: {
        stage: ApplicationStage;
        rating?: number;
    }, authHeader?: string): Promise<ApplicationDto>;
}
