import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan, PlanCode } from './entities/subscription-plan.entity';
import { TenantSubscription, SubscriptionStatus } from './entities/tenant-subscription.entity';
import { BillingTransaction, TransactionType, TransactionStatus } from './entities/billing-transaction.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { JobPosting, JobStatus } from '../jobs/entities/job-posting.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(TenantSubscription)
    private readonly subRepo: Repository<TenantSubscription>,
    @InjectRepository(BillingTransaction)
    private readonly txnRepo: Repository<BillingTransaction>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(JobPosting)
    private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return await this.planRepo.find({
      where: { isActive: true },
      order: { priceMonthly: 'ASC' },
    });
  }

  // Resolve target tenant ID with fallback to TechCorp if not provided or slug used
  async resolveTenant(tenantIdOrSlug?: string): Promise<Tenant> {
    if (tenantIdOrSlug && tenantIdOrSlug !== 'undefined' && tenantIdOrSlug !== 'null') {
      const byId = await this.tenantRepo.findOne({ where: { id: tenantIdOrSlug } });
      if (byId) return byId;

      const bySlug = await this.tenantRepo.findOne({ where: { slug: tenantIdOrSlug } });
      if (bySlug) return bySlug;

      const byName = await this.tenantRepo.createQueryBuilder('t')
        .where('LOWER(t.name) LIKE LOWER(:name)', { name: `%${tenantIdOrSlug}%` })
        .getOne();
      if (byName) return byName;
    }

    // Default fallback to first active company tenant (TechCorp Global)
    const defaultTenant = await this.tenantRepo.findOne({ where: { slug: 'techcorp-global' } });
    if (defaultTenant) return defaultTenant;

    const firstTenant = await this.tenantRepo.findOne({ where: {} });
    if (!firstTenant) throw new NotFoundException('No tenants found in system');
    return firstTenant;
  }

  async getCurrentSubscription(tenantIdOrSlug?: string) {
    const tenant = await this.resolveTenant(tenantIdOrSlug);

    let sub = await this.subRepo.findOne({
      where: { tenantId: tenant.id },
      relations: { plan: true },
    });

    if (!sub) {
      // Find PRO plan or FREE plan to assign
      let plan = await this.planRepo.findOne({ where: { code: PlanCode.PRO } });
      if (!plan) plan = await this.planRepo.findOne({ where: { code: PlanCode.FREE } });
      if (!plan) {
        plan = await this.planRepo.save({
          name: 'Professional Employer',
          code: PlanCode.PRO,
          priceMonthly: 199,
          priceYearly: 159,
          maxActiveJobs: 15,
          maxResumeDownloads: 150,
          maxFeaturedJobs: 0,
          maxTeamSeats: 5,
          isActive: true,
        });
      }

      const now = new Date();
      const monthLater = new Date(now.getTime() + 30 * 86400000);
      sub = await this.subRepo.save({
        tenantId: tenant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        activeJobsUsed: 0,
        resumeDownloadsUsed: 0,
        featuredJobsUsed: 0,
        currentPeriodStart: now,
        currentPeriodEnd: monthLater,
      });
      sub.plan = plan;
    }

    // Compute live active jobs count
    const liveActiveJobs = await this.jobRepo.count({
      where: { tenantId: tenant.id, status: JobStatus.PUBLISHED },
    });

    // Compute live team recruiter seats used
    const liveTeamSeats = await this.userRepo.count({
      where: { tenantId: tenant.id },
    });

    // Ensure activeJobsUsed is synced
    if (sub.activeJobsUsed !== liveActiveJobs) {
      sub.activeJobsUsed = liveActiveJobs;
      await this.subRepo.save(sub);
    }

    const plan = sub.plan;
    return {
      id: sub.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      plan: {
        id: plan.id,
        name: plan.name,
        code: plan.code,
        priceMonthly: Number(plan.priceMonthly),
        priceYearly: Number(plan.priceYearly),
        maxActiveJobs: plan.maxActiveJobs,
        maxResumeDownloads: plan.maxResumeDownloads,
        maxTeamSeats: plan.maxTeamSeats,
      },
      quotas: {
        activeJobs: {
          used: liveActiveJobs,
          limit: plan.maxActiveJobs,
          remaining: Math.max(0, plan.maxActiveJobs - liveActiveJobs),
          percentUsed: Math.min(100, Math.round((liveActiveJobs / (plan.maxActiveJobs || 1)) * 100)),
        },
        resumeDownloads: {
          used: sub.resumeDownloadsUsed,
          limit: plan.maxResumeDownloads,
          remaining: Math.max(0, plan.maxResumeDownloads - sub.resumeDownloadsUsed),
          percentUsed: Math.min(100, Math.round((sub.resumeDownloadsUsed / (plan.maxResumeDownloads || 1)) * 100)),
        },
        teamSeats: {
          used: Math.max(1, liveTeamSeats),
          limit: plan.maxTeamSeats,
          remaining: Math.max(0, plan.maxTeamSeats - Math.max(1, liveTeamSeats)),
          percentUsed: Math.min(100, Math.round((Math.max(1, liveTeamSeats) / (plan.maxTeamSeats || 1)) * 100)),
        },
      },
    };
  }

  async getTransactions(tenantIdOrSlug?: string): Promise<BillingTransaction[]> {
    if (tenantIdOrSlug && tenantIdOrSlug !== 'all') {
      const tenant = await this.resolveTenant(tenantIdOrSlug);
      return await this.txnRepo.find({
        where: { tenantId: tenant.id },
        order: { createdAt: 'DESC' },
      });
    }

    return await this.txnRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async trackResumeDownload(tenantIdOrSlug?: string, candidateId?: string) {
    const tenant = await this.resolveTenant(tenantIdOrSlug);
    let sub = await this.subRepo.findOne({
      where: { tenantId: tenant.id },
      relations: { plan: true },
    });

    if (!sub) {
      await this.getCurrentSubscription(tenant.id);
      sub = await this.subRepo.findOne({
        where: { tenantId: tenant.id },
        relations: { plan: true },
      });
    }

    const limit = sub?.plan?.maxResumeDownloads || 150;
    const currentUsed = sub?.resumeDownloadsUsed || 0;

    if (currentUsed >= limit) {
      return {
        success: false,
        quotaExceeded: true,
        used: currentUsed,
        limit,
        remaining: 0,
        message: `Resume download quota limit reached (${currentUsed}/${limit}). Please upgrade your plan or top up quota in Billing.`,
      };
    }

    if (sub) {
      sub.resumeDownloadsUsed = currentUsed + 1;
      await this.subRepo.save(sub);
    }

    return {
      success: true,
      quotaExceeded: false,
      used: currentUsed + 1,
      limit,
      remaining: Math.max(0, limit - (currentUsed + 1)),
      message: 'Resume download successfully recorded against monthly quota.',
    };
  }

  async upgradePlan(tenantIdOrSlug: string, planCode: PlanCode, billingCycle: 'monthly' | 'yearly' = 'monthly') {
    const tenant = await this.resolveTenant(tenantIdOrSlug);
    const plan = await this.planRepo.findOne({ where: { code: planCode } });
    if (!plan) throw new NotFoundException(`Subscription plan ${planCode} not found`);

    let sub = await this.subRepo.findOne({ where: { tenantId: tenant.id } });
    const now = new Date();
    const periodEnd = new Date(now.getTime() + (billingCycle === 'yearly' ? 365 : 30) * 86400000);

    if (sub) {
      sub.planId = plan.id;
      sub.status = SubscriptionStatus.ACTIVE;
      sub.currentPeriodStart = now;
      sub.currentPeriodEnd = periodEnd;
      await this.subRepo.save(sub);
    } else {
      sub = await this.subRepo.save({
        tenantId: tenant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        activeJobsUsed: 0,
        resumeDownloadsUsed: 0,
        featuredJobsUsed: 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    }

    const price = billingCycle === 'yearly' ? Number(plan.priceYearly) * 12 : Number(plan.priceMonthly);
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const txn = await this.txnRepo.save({
      invoiceNumber: invoiceNum,
      tenantId: tenant.id,
      tenantName: tenant.name,
      description: `${plan.name} (${billingCycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'})`,
      amount: price,
      currency: 'USD',
      type: TransactionType.SUBSCRIPTION,
      status: TransactionStatus.PAID,
      paymentMethod: 'Stripe Card (•••• 4242)',
      planCode: plan.code,
      quotaDetails: {
        activeJobs: plan.maxActiveJobs,
        resumeDownloads: plan.maxResumeDownloads,
        teamSeats: plan.maxTeamSeats,
      },
      periodStart: now,
      periodEnd,
    });

    return {
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      subscription: await this.getCurrentSubscription(tenant.id),
      transaction: txn,
    };
  }

  async purchaseTopup(
    tenantIdOrSlug: string,
    topupType: 'RESUME_50' | 'RESUME_150' | 'JOBS_5' | 'SEATS_2',
  ) {
    const tenant = await this.resolveTenant(tenantIdOrSlug);
    let sub = await this.subRepo.findOne({
      where: { tenantId: tenant.id },
      relations: { plan: true },
    });

    if (!sub) {
      await this.getCurrentSubscription(tenant.id);
      sub = await this.subRepo.findOne({
        where: { tenantId: tenant.id },
        relations: { plan: true },
      });
    }

    let description = '';
    let amount = 0;
    let type = TransactionType.QUOTA_TOPUP;
    let quotaDetails: any = {};

    switch (topupType) {
      case 'RESUME_50':
        description = '+50 Candidate Resume Downloads Pack';
        amount = 29.00;
        quotaDetails = { resumeDownloads: 50 };
        if (sub) {
          sub.resumeDownloadsUsed = Math.max(0, sub.resumeDownloadsUsed - 50);
          await this.subRepo.save(sub);
        }
        break;
      case 'RESUME_150':
        description = '+150 Candidate Resume Downloads Pack';
        amount = 69.00;
        quotaDetails = { resumeDownloads: 150 };
        if (sub) {
          sub.resumeDownloadsUsed = Math.max(0, sub.resumeDownloadsUsed - 150);
          await this.subRepo.save(sub);
        }
        break;
      case 'JOBS_5':
        description = '+5 Active Job Posting Slots';
        amount = 49.00;
        quotaDetails = { activeJobs: 5 };
        break;
      case 'SEATS_2':
        description = '+2 Team Recruiter Seats Add-on';
        amount = 39.00;
        type = TransactionType.SEAT_ADDON;
        quotaDetails = { teamSeats: 2 };
        break;
      default:
        throw new BadRequestException('Invalid quota top-up type');
    }

    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const txn = await this.txnRepo.save({
      invoiceNumber: invoiceNum,
      tenantId: tenant.id,
      tenantName: tenant.name,
      description,
      amount,
      currency: 'USD',
      type,
      status: TransactionStatus.PAID,
      paymentMethod: 'Stripe Card (•••• 4242)',
      planCode: sub?.plan?.code || 'PRO',
      quotaDetails,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400000),
    });

    return {
      success: true,
      message: `Successfully purchased ${description}`,
      transaction: txn,
      subscription: await this.getCurrentSubscription(tenant.id),
    };
  }
}
