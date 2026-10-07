import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';

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
