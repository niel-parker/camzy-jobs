import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user & retrieve JWT access token' })
  async login(@Body() body: { email: string; password?: string; password_hash?: string; passwordHash?: string }) {
    const pwd = body.password || body.password_hash || body.passwordHash;
    return await this.authService.login(body.email, pwd);
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
  async verifyOtp(@Body() body: { identifier?: string; email?: string; phone?: string; otp: string }) {
    const target = body.identifier || body.email || body.phone || '';
    return await this.authService.verifyOtp(target, body.otp);
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
