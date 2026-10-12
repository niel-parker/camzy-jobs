import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { BillingTransaction } from '../subscriptions/entities/billing-transaction.entity';
export declare class SeedService implements OnModuleInit {
    private readonly userRepo;
    private readonly tenantRepo;
    private readonly planRepo;
    private readonly subRepo;
    private readonly txnRepo;
    private readonly jobRepo;
    private readonly candidateRepo;
    private readonly appRepo;
    private readonly logger;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>, planRepo: Repository<SubscriptionPlan>, subRepo: Repository<TenantSubscription>, txnRepo: Repository<BillingTransaction>, jobRepo: Repository<JobPosting>, candidateRepo: Repository<Candidate>, appRepo: Repository<JobApplication>);
    onModuleInit(): Promise<void>;
    seedAll(): Promise<void>;
}
