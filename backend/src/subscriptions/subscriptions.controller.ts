import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { PlanCode } from './entities/subscription-plan.entity';

@ApiTags('Subscriptions & Company Monetization')
@Controller('api/v1/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available company subscription plans & quota packages' })
  async findAllPlans() {
    return await this.subscriptionsService.findAllPlans();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get live subscription status, limits, and real-time quota consumption for tenant' })
  async getCurrentSubscription(@Query('tenantId') tenantId?: string) {
    return await this.subscriptionsService.getCurrentSubscription(tenantId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Fetch billing transaction history and invoices for tenant or platform' })
  async getTransactions(@Query('tenantId') tenantId?: string) {
    return await this.subscriptionsService.getTransactions(tenantId);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade company subscription plan and generate paid invoice' })
  async upgradePlan(
    @Body() body: { tenantId?: string; planCode: PlanCode; billingCycle?: 'monthly' | 'yearly' },
  ) {
    return await this.subscriptionsService.upgradePlan(
      body.tenantId || 'techcorp-global',
      body.planCode,
      body.billingCycle || 'monthly',
    );
  }

  @Post('topup')
  @ApiOperation({ summary: 'Purchase extra quota pack (resumes, job slots, recruiter seats) and generate invoice' })
  async purchaseTopup(
    @Body() body: { tenantId?: string; topupType: 'RESUME_50' | 'RESUME_150' | 'JOBS_5' | 'SEATS_2' },
  ) {
    return await this.subscriptionsService.purchaseTopup(
      body.tenantId || 'techcorp-global',
      body.topupType,
    );
  }

  @Post('consume-download')
  @ApiOperation({ summary: 'Record and decrement resume download from company monthly quota' })
  async trackResumeDownload(
    @Body() body: { tenantId?: string; candidateId?: string },
  ) {
    return await this.subscriptionsService.trackResumeDownload(
      body.tenantId || 'techcorp-global',
      body.candidateId,
    );
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe Checkout Session for company plan upgrade' })
  @ApiResponse({ status: 201, description: 'Hosted Stripe Checkout session URL generated' })
  createCheckoutSession(@Body() body: { tenantId: string; planId: string }) {
    return this.stripeService.createCheckoutSession(body.tenantId, body.planId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook Listener for automated billing & quota resets' })
  handleStripeWebhook(@Body() body: { type: string; data: any }) {
    return this.stripeService.handleWebhookEvent(body);
  }
}
