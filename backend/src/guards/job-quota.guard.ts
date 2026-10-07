import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class JobQuotaGuard implements CanActivate {
  constructor(private readonly jobsService: JobsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user || { tenantId: 'tnt-techcorp', role: 'COMPANY_ADMIN' }; // Demo context fallback

    // If user is Super Admin, bypass quota limit
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Retrieve active jobs count for company
    const activeJobs = this.jobsService.getActiveJobsCountForTenant(user.tenantId || 'tnt-techcorp');
    const planMaxJobs = this.jobsService.getPlanJobLimitForTenant(user.tenantId || 'tnt-techcorp');

    if (activeJobs >= planMaxJobs) {
      throw new ForbiddenException(
        `Job posting quota exceeded! Your plan limit is ${planMaxJobs} active jobs. Upgrade your company subscription to post more.`
      );
    }

    return true;
  }
}
