import { Injectable, Logger, Inject, forwardRef, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { BillingTransaction } from './entities/billing-transaction.entity';
import { TenantSubscription } from './entities/tenant-subscription.entity';
import { SubscriptionsService } from './subscriptions.service';

export interface CreateCheckoutDto {
  tenantId?: string;
  planCodeOrId?: string;
  billingCycle?: 'monthly' | 'yearly';
  topupType?: 'RESUME_50' | 'RESUME_150' | 'JOBS_5' | 'SEATS_2';
  successUrl?: string;
  cancelUrl?: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly apiKey = process.env.STRIPE_SECRET_KEY || '';

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(BillingTransaction)
    private readonly txnRepo: Repository<BillingTransaction>,
    @InjectRepository(TenantSubscription)
    private readonly subRepo: Repository<TenantSubscription>,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutDto): Promise<{ checkoutUrl: string; sessionId: string }> {
    if (!this.apiKey) {
      throw new Error('Stripe API key (STRIPE_SECRET_KEY) is not configured in backend environment.');
    }

    let tenantId = dto.tenantId;
    try {
      const resolvedTenant = await this.subscriptionsService.resolveTenant(tenantId);
      if (resolvedTenant?.id) {
        tenantId = resolvedTenant.id;
      }
    } catch {
      tenantId = '895c2926-0596-4115-a3e5-03a9d8fe042d';
    }

    const billingCycle = dto.billingCycle || 'monthly';

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = dto.successUrl || `${baseUrl}/employer/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl || `${baseUrl}/employer/billing?canceled=true`;

    const params = new URLSearchParams();
    params.append('client_reference_id', tenantId);
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);

    if (dto.topupType) {
      // One-time Quota Top-Up
      params.append('mode', 'payment');

      let name = '';
      let amountPaise = 0;
      switch (dto.topupType) {
        case 'RESUME_50':
          name = '+50 Candidate Resume Downloads Pack';
          amountPaise = 2900; // ₹29
          break;
        case 'RESUME_150':
          name = '+150 Candidate Resume Downloads Pack';
          amountPaise = 6900; // ₹69
          break;
        case 'JOBS_5':
          name = '+5 Active Job Posting Slots';
          amountPaise = 4900; // ₹49
          break;
        case 'SEATS_2':
          name = '+2 Team Recruiter Seats Add-on';
          amountPaise = 3900; // ₹39
          break;
        default:
          throw new BadRequestException('Invalid topup type');
      }

      params.append('line_items[0][price_data][currency]', 'inr');
      params.append('line_items[0][price_data][product_data][name]', name);
      params.append('line_items[0][price_data][unit_amount]', String(amountPaise));
      params.append('line_items[0][quantity]', '1');

      params.append('metadata[tenantId]', tenantId);
      params.append('metadata[type]', 'QUOTA_TOPUP');
      params.append('metadata[topupType]', dto.topupType);
    } else {
      // Subscription Plan Upgrade / Subscribe
      const planCodeOrId = dto.planCodeOrId || 'PRO';
      let plan = await this.planRepo.findOne({ where: { code: planCodeOrId } });
      if (!plan) {
        plan = await this.planRepo.findOne({ where: { id: planCodeOrId } });
      }
      if (!plan) {
        plan = await this.planRepo.findOne({ where: { isActive: true }, order: { priceMonthly: 'ASC' } });
      }
      if (!plan) {
        throw new NotFoundException(`Subscription plan ${planCodeOrId} not found`);
      }

      const priceMonthly = Number(plan.priceMonthly);
      const priceYearly = Number(plan.priceYearly || Math.round(priceMonthly * 0.8));

      // Calculate unit amount in paise (1 INR = 100 paise)
      const unitAmountPaise = billingCycle === 'yearly'
        ? Math.max(100, Math.round(priceYearly * 12 * 100))
        : Math.max(100, Math.round(priceMonthly * 100));

      params.append('mode', 'subscription');
      params.append('line_items[0][price_data][currency]', 'inr');
      params.append(
        'line_items[0][price_data][product_data][name]',
        `${plan.name} (${billingCycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'})`,
      );
      params.append('line_items[0][price_data][unit_amount]', String(unitAmountPaise));
      params.append('line_items[0][price_data][recurring][interval]', billingCycle === 'yearly' ? 'year' : 'month');
      params.append('line_items[0][quantity]', '1');

      params.append('metadata[tenantId]', tenantId);
      params.append('metadata[type]', 'SUBSCRIPTION');
      params.append('metadata[planId]', plan.id);
      params.append('metadata[planCode]', plan.code);
      params.append('metadata[billingCycle]', billingCycle);
    }

    try {
      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const errJson = await res.json();
        this.logger.error('Stripe API error response:', errJson);
        throw new Error(errJson?.error?.message || 'Failed to create Stripe Checkout Session');
      }

      const session: any = await res.json();
      this.logger.log(`Created Stripe Checkout Session: ${session.id}, URL: ${session.url}`);
      return {
        sessionId: session.id,
        checkoutUrl: session.url,
      };
    } catch (err: any) {
      this.logger.error(`Stripe session creation error: ${err.message}`);
      throw err;
    }
  }

  async verifyAndFulfillSession(sessionId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Stripe API key (STRIPE_SECRET_KEY) not configured.');
    }
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    // 1. Fetch Session from Stripe API
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'Failed to retrieve Stripe session');
    }

    const session: any = await res.json();
    this.logger.log(`Verifying Stripe Session: ${session.id}, status: ${session.status}, payment_status: ${session.payment_status}`);

    // Check payment status
    const isPaid = session.payment_status === 'paid' || session.status === 'complete';
    if (!isPaid) {
      return {
        success: false,
        paymentStatus: session.payment_status,
        message: 'Payment has not been completed yet.',
        session,
      };
    }

    // Check if this session was already fulfilled
    const existingTxn = await this.txnRepo.findOne({
      where: { paymentMethod: `Stripe Checkout (${sessionId})` },
    });
    if (existingTxn) {
      const currentSub = await this.subscriptionsService.getCurrentSubscription(existingTxn.tenantId);
      return {
        success: true,
        alreadyFulfilled: true,
        message: 'Subscription was already activated for this Stripe session.',
        transaction: existingTxn,
        subscription: currentSub,
      };
    }

    // 2. Fulfill based on session metadata
    const metadata = session.metadata || {};
    let tenantId = metadata.tenantId || session.client_reference_id;
    try {
      const resolvedTenant = await this.subscriptionsService.resolveTenant(tenantId);
      if (resolvedTenant?.id) {
        tenantId = resolvedTenant.id;
      }
    } catch {
      tenantId = '895c2926-0596-4115-a3e5-03a9d8fe042d';
    }
    const type = metadata.type || 'SUBSCRIPTION';
    const paymentLabel = `Stripe Checkout (${sessionId})`;

    if (type === 'QUOTA_TOPUP') {
      const topupType = metadata.topupType || 'RESUME_50';
      const result = await this.subscriptionsService.purchaseTopup(tenantId, topupType, paymentLabel);
      return {
        success: true,
        message: 'Stripe quota purchase fulfilled successfully!',
        transaction: result.transaction,
        subscription: result.subscription,
      };
    } else {
      const planCodeOrId = metadata.planCode || metadata.planId || 'PRO';
      const billingCycle = (metadata.billingCycle as 'monthly' | 'yearly') || 'monthly';
      const result = await this.subscriptionsService.upgradePlan(tenantId, planCodeOrId, billingCycle, paymentLabel);
      return {
        success: true,
        message: 'Stripe subscription upgrade fulfilled successfully!',
        transaction: result.transaction,
        subscription: result.subscription,
      };
    }
  }

  async handleWebhookEvent(event: { type: string; data: any }) {
    this.logger.log(`Received Stripe Webhook Event: ${event.type}`);
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data?.object;
        if (session?.id) {
          try {
            await this.verifyAndFulfillSession(session.id);
            this.logger.log(`Successfully fulfilled checkout session ${session.id} from webhook`);
          } catch (e: any) {
            this.logger.error(`Error fulfilling webhook checkout session: ${e.message}`);
          }
        }
        return { status: 'session_fulfilled' };

      case 'invoice.payment_succeeded':
        this.logger.log('Stripe Recurring Invoice Payment Succeeded:', event.data?.object?.id);
        return { status: 'subscription_renewed' };

      case 'customer.subscription.deleted':
        this.logger.log('Stripe Subscription Canceled:', event.data?.object?.id);
        return { status: 'subscription_canceled' };

      default:
        return { status: 'event_ignored' };
    }
  }
}
