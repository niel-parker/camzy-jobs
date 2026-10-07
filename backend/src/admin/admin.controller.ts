import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfigDto, AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant, TenantType } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription, SubscriptionStatus } from '../subscriptions/entities/tenant-subscription.entity';

@ApiTags('Super Admin Governance')
@Controller('api/v1/admin')
export class AdminController {
  constructor(
    private readonly appConfigService: AppConfigService,
    @InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobApplication) private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(TenantSubscription) private readonly subRepo: Repository<TenantSubscription>,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Super Admin: Fetch live platform overview metrics from database' })
  async getDashboardMetrics() {
    const totalJobs = await this.jobRepo.count();
    const totalCompanies = await this.tenantRepo.count({ where: { type: TenantType.COMPANY } });
    const totalConsultancies = await this.tenantRepo.count({ where: { type: TenantType.CONSULTANCY } });
    const totalCandidates = await this.candidateRepo.count();
    const totalApplications = await this.appRepo.count();
    const activeSubscriptions = await this.subRepo.count({ where: { status: SubscriptionStatus.ACTIVE } });

    return {
      totalJobs,
      totalCompanies,
      totalConsultancies,
      totalCandidates,
      totalApplications,
      activeSubscriptions,
      monthlyRevenue: activeSubscriptions * 199,
    };
  }

  @Get('app-config')
  @ApiOperation({ summary: 'Super Admin: Fetch global Job Portal platform configuration' })
  @ApiResponse({ status: 200, description: 'Current platform configuration details' })
  getAppConfig(): AppConfigDto {
    return this.appConfigService.getAppConfig();
  }

  @Put('app-config')
  @ApiOperation({ summary: 'Super Admin: Update Job Portal platform configuration settings' })
  @ApiResponse({ status: 200, description: 'Updated platform configuration details' })
  updateAppConfig(@Body() body: Partial<AppConfigDto>): AppConfigDto {
    return this.appConfigService.updateAppConfig(body);
  }
}
