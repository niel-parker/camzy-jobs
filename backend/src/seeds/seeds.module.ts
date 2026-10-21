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
import { BillingTransaction } from '../subscriptions/entities/billing-transaction.entity';
import { Location } from '../admin/entities/location.entity';
import { SkillKeyword } from '../admin/entities/skill-keyword.entity';
import { ExperienceRange } from '../admin/entities/experience-range.entity';
import { SystemTaxonomy } from '../admin/entities/system-taxonomy.entity';
import { CmsPage } from '../admin/entities/cms-page.entity';
import { BlogPost, BlogCategory } from '../admin/entities/blog-post.entity';
import { SeoConfig } from '../admin/entities/seo-config.entity';
import { FaqItem } from '../admin/entities/faq-item.entity';
import { EmailBroadcast } from '../admin/entities/email-broadcast.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}
