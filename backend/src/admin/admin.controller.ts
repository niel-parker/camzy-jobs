import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfigDto, AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant, TenantType, TenantStatus } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription, SubscriptionStatus } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan, PlanCode } from '../subscriptions/entities/subscription-plan.entity';

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
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
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

  @Get('tenants')
  @ApiOperation({ summary: 'Super Admin: List all registered company tenants with live subscription plans & quotas' })
  async getAllTenants() {
    const tenants = await this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    });

    const tenantList = await Promise.all(
      tenants.map(async (tenant) => {
        const activeJobsCount = await this.jobRepo.count({ where: { tenantId: tenant.id } });
        const sub = await this.subRepo.findOne({
          where: { tenantId: tenant.id },
          relations: { plan: true },
        });

        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          industry: tenant.industry || 'Software & Technology',
          status: tenant.status,
          planCode: sub?.plan?.code || PlanCode.PRO,
          planName: sub?.plan?.name || 'Professional Employer',
          maxActiveJobs: sub?.plan?.maxActiveJobs || 15,
          maxResumeDownloads: sub?.plan?.maxResumeDownloads || 150,
          maxTeamSeats: sub?.plan?.maxTeamSeats || 5,
          activeJobsCount,
          createdAt: tenant.createdAt ? tenant.createdAt.toISOString() : new Date().toISOString(),
        };
      }),
    );

    return tenantList;
  }

  @Put('tenants/:id/plan')
  @ApiOperation({ summary: 'Super Admin: Upgrade company tenant subscription plan & quota limits' })
  async upgradeTenantPlan(
    @Param('id') id: string,
    @Body() body: { planCode: PlanCode },
  ) {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const plan = await this.planRepo.findOne({ where: { code: body.planCode } });
    if (!plan) {
      throw new Error(`Plan code ${body.planCode} not found`);
    }

    let sub = await this.subRepo.findOne({ where: { tenantId: id } });
    if (!sub) {
      sub = this.subRepo.create({
        tenantId: id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        activeJobsUsed: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      });
    } else {
      sub.planId = plan.id;
      sub.status = SubscriptionStatus.ACTIVE;
    }

    await this.subRepo.save(sub);

    return {
      message: `Tenant ${tenant.name} plan upgraded to ${plan.name} (${plan.code})`,
      tenantId: tenant.id,
      planCode: plan.code,
      maxActiveJobs: plan.maxActiveJobs,
      maxResumeDownloads: plan.maxResumeDownloads,
      maxTeamSeats: plan.maxTeamSeats,
    };
  }

  @Put('tenants/:id/status')
  @ApiOperation({ summary: 'Super Admin: Update tenant status (ACTIVE/SUSPENDED/PENDING)' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() body: { status?: TenantStatus },
  ) {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (body.status !== undefined) tenant.status = body.status;

    await this.tenantRepo.save(tenant);
    return tenant;
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
