import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
export declare class JobQuotaGuard implements CanActivate {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
