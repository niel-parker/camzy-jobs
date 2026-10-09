import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AppConfigService } from './app-config.service';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPosting,
      Tenant,
      Candidate,
      JobApplication,
      TenantSubscription,
      SubscriptionPlan,
    ]),
  ],
  controllers: [AdminController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AdminModule {}
