import { ApplicationDto, ApplicationsService } from './applications.service';
import { ApplicationStage } from './entities/job-application.entity';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    findAllByJob(jobId?: string): Promise<ApplicationDto[]>;
    submitApplication(body: Partial<ApplicationDto>): Promise<ApplicationDto>;
    updateStage(id: string, body: {
        stage: ApplicationStage;
        rating?: number;
    }): Promise<ApplicationDto>;
}
