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
import { Location } from './admin/entities/location.entity';
import { SkillKeyword } from './admin/entities/skill-keyword.entity';
import { ExperienceRange } from './admin/entities/experience-range.entity';
import { SystemTaxonomy } from './admin/entities/system-taxonomy.entity';
import { CmsPage } from './admin/entities/cms-page.entity';
import { BlogPost, BlogCategory } from './admin/entities/blog-post.entity';
import { SeoConfig } from './admin/entities/seo-config.entity';
import { FaqItem } from './admin/entities/faq-item.entity';
import { EmailBroadcast } from './admin/entities/email-broadcast.entity';
import { RestrictedDomain } from './admin/entities/restricted-domain.entity';
import { LoginActivity } from './admin/entities/login-activity.entity';

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
        Location,
        SkillKeyword,
        ExperienceRange,
        SystemTaxonomy,
        CmsPage,
        BlogPost,
        BlogCategory,
        SeoConfig,
        FaqItem,
        EmailBroadcast,
        RestrictedDomain,
        LoginActivity,
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
