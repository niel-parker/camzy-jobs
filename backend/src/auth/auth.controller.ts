import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user & retrieve JWT access token' })
  async login(@Body() body: { email: string; password_hash: string }) {
    return await this.authService.login(body.email, body.password_hash);
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

  @Get('me')
  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  async getCurrentUser(@Headers('authorization') authHeader?: string) {
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    return await this.authService.getCurrentUser(token);
  }
}
