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
import { BillingTransaction } from '../subscriptions/entities/billing-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Location } from './entities/location.entity';
import { SkillKeyword } from './entities/skill-keyword.entity';
import { ExperienceRange } from './entities/experience-range.entity';
import { SystemTaxonomy } from './entities/system-taxonomy.entity';
import { CmsPage } from './entities/cms-page.entity';
import { BlogPost, BlogCategory } from './entities/blog-post.entity';
import { SeoConfig } from './entities/seo-config.entity';
import { FaqItem } from './entities/faq-item.entity';
import { EmailBroadcast } from './entities/email-broadcast.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPosting,
      Tenant,
      Candidate,
      JobApplication,
      TenantSubscription,
      SubscriptionPlan,
      BillingTransaction,
      User,
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
    ]),
  ],
  controllers: [AdminController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AdminModule {}
