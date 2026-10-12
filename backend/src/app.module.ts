import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './candidates/candidates.module';
import { JobsModule } from './jobs/jobs.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TenantsModule } from './tenants/tenants.module';
import { ThemeModule } from './theme/theme.module';
import { SeedsModule } from './seeds/seeds.module';

import { User } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { SubscriptionPlan } from './subscriptions/entities/subscription-plan.entity';
import { TenantSubscription } from './subscriptions/entities/tenant-subscription.entity';
import { JobPosting } from './jobs/entities/job-posting.entity';
import { Candidate } from './candidates/entities/candidate.entity';
import { JobApplication } from './applications/entities/job-application.entity';
import { BillingTransaction } from './subscriptions/entities/billing-transaction.entity';

import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'job_user',
      password: process.env.DB_PASS || 'job_password',
      database: process.env.DB_NAME || 'job_portal_db',
      entities: [
        User,
        Tenant,
        SubscriptionPlan,
        TenantSubscription,
        BillingTransaction,
        JobPosting,
        Candidate,
        JobApplication,
      ],
      synchronize: true,
      logging: false,
    }),
    SeedsModule,
    TenantsModule,
    SubscriptionsModule,
    JobsModule,
    CandidatesModule,
    ApplicationsModule,
    AuthModule,
    ThemeModule,
    AdminModule,
    MailModule,
  ],
})
export class AppModule {}
