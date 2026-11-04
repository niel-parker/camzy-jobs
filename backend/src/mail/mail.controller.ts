import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiTags('Mail & SMTP Services')
@Controller('api/v1/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check SMTP server connection handshake and authentication status' })
  async checkSmtpStatus() {
    return await this.mailService.verifyConnection();
  }

  @Post('test')
  @ApiOperation({ summary: 'Dispatch a test email to verify transactional delivery' })
  async sendTestEmail(@Body() body: { toEmail: string }) {
    if (!body?.toEmail || !body.toEmail.includes('@')) {
      throw new BadRequestException('A valid recipient email address (toEmail) is required');
    }
    return await this.mailService.sendTestEmail(body.toEmail.trim().toLowerCase());
  }
}
