import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getClientMeta(req: Request) {
    const rawForwarded = req.headers['x-forwarded-for'];
    const forwarded = Array.isArray(rawForwarded) ? rawForwarded[0] : rawForwarded;
    const ipAddress = forwarded || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || '';
    return { ipAddress, userAgent };
  }

  @Get('check-domain')
  @ApiOperation({ summary: 'Check if an email domain is restricted for employer registration' })
  async checkDomain(@Query('email') email?: string, @Query('domain') domain?: string) {
    const target = email || domain || '';
    return await this.authService.checkDomainRestriction(target);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user & retrieve JWT access token' })
  async login(
    @Body() body: { email: string; password?: string; password_hash?: string; passwordHash?: string },
    @Req() req: Request,
  ) {
    const pwd = body.password || body.password_hash || body.passwordHash;
    const meta = this.getClientMeta(req);
    return await this.authService.login(body.email, pwd, meta);
  }

  @Post('register/company')
  @ApiOperation({ summary: 'Onboard new hiring company tenant & admin user into database' })
  async registerCompany(@Body() body: any) {
    return await this.authService.registerCompany(body);
  }

  @Post('register/candidate')
  @ApiOperation({ summary: 'Register new job candidate account into database' })
  async registerCandidate(@Body() body: any) {
    return await this.authService.registerCandidate(body);
  }

  @Post('request-otp')
  @ApiOperation({ summary: 'Request OTP verification code for login/registration via Email or Phone' })
  async requestOtp(@Body() body: { identifier?: string; email?: string; phone?: string }) {
    const target = body.identifier || body.email || body.phone || '';
    return await this.authService.requestOtp(target);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code and log in or register user' })
  async verifyOtp(
    @Body() body: { identifier?: string; email?: string; phone?: string; otp: string },
    @Req() req: Request,
  ) {
    const target = body.identifier || body.email || body.phone || '';
    const meta = this.getClientMeta(req);
    return await this.authService.verifyOtp(target, body.otp, meta);
  }

  @Post('share-job')
  @ApiOperation({ summary: 'Share job recommendation with a friend via email' })
  async shareJob(@Body() body: { toEmail: string; senderName?: string; jobTitle: string; companyName?: string; jobUrl: string; personalNote?: string }) {
    return await this.authService.sendJobShareEmail(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  async getCurrentUser(@Headers('authorization') authHeader?: string) {
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    return await this.authService.getCurrentUser(token);
  }
}
