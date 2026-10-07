import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Tenant,
      SubscriptionPlan,
      TenantSubscription,
      JobPosting,
      Candidate,
      JobApplication,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}
