"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let MailService = MailService_1 = class MailService {
    constructor() {
        this.logger = new common_1.Logger(MailService_1.name);
        this.initTransporter();
    }
    initTransporter() {
        const host = process.env.MAIL_HOST || 'smtp.mailgun.org';
        const port = Number(process.env.MAIL_PORT) || 587;
        const user = process.env.MAIL_USERNAME;
        const pass = process.env.MAIL_PASSWORD;
        const isSecure = port === 465;
        if (!user || !pass) {
            this.logger.warn('Mail credentials (MAIL_USERNAME / MAIL_PASSWORD) are not set in environment.');
        }
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: isSecure,
            auth: user && pass ? { user, pass } : undefined,
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 20000,
        });
    }
    async verifyConnection() {
        const host = process.env.MAIL_HOST || 'smtp.mailgun.org';
        const port = Number(process.env.MAIL_PORT) || 587;
        const user = process.env.MAIL_USERNAME;
        try {
            await this.transporter.verify();
            this.logger.log(`SMTP Connection verified successfully with ${host}:${port}`);
            return {
                success: true,
                message: 'SMTP server connection and authentication verified successfully!',
                host,
                port,
                user: user ? `${user.slice(0, 4)}***` : undefined,
            };
        }
        catch (err) {
            this.logger.error(`SMTP Verification Failed: ${err?.message || err}`);
            return {
                success: false,
                message: `SMTP connection failed: ${err?.message || 'Unknown error'}`,
                host,
                port,
                user: user ? `${user.slice(0, 4)}***` : undefined,
                error: {
                    code: err?.code,
                    command: err?.command,
                    response: err?.response,
                    responseCode: err?.responseCode,
                    stack: err?.stack,
                },
            };
        }
    }
    async sendTestEmail(toEmail) {
        const defaultFrom = process.env.MAIL_FROM || (process.env.MAIL_USERNAME ? `"Camzy Jobs" <${process.env.MAIL_USERNAME}>` : '"Camzy Jobs" <no-reply@camzyjobs.com>');
        try {
            const info = await this.transporter.sendMail({
                from: defaultFrom,
                to: toEmail,
                subject: 'Camzy Jobs - SMTP Test Email',
                text: 'Hello! This is a test email sent from Camzy Jobs to verify your SMTP configuration.',
                html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 20px auto;">
            <h2 style="color: #4f46e5; margin-top: 0;">Camzy Jobs SMTP Test</h2>
            <p style="color: #334155; font-size: 14px;">This test confirms that your transactional email server is configured properly and ready to deliver emails.</p>
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #64748b; margin: 16px 0;">
              <div><strong>From:</strong> ${defaultFrom}</div>
              <div><strong>To:</strong> ${toEmail}</div>
              <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
            </div>
            <p style="color: #16a34a; font-weight: bold; font-size: 13px;">✓ SMTP Connection & Transmission Successful</p>
          </div>
        `,
            });
            this.logger.log(`Test email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
            return {
                success: true,
                message: `Test email successfully dispatched to ${toEmail}!`,
                info: {
                    messageId: info.messageId,
                    response: info.response,
                    accepted: info.accepted,
                    rejected: info.rejected,
                },
            };
        }
        catch (err) {
            this.logger.error(`Failed to send test email to ${toEmail}: ${err?.message || err}`);
            return {
                success: false,
                message: `Failed to deliver test email: ${err?.message || 'Unknown error'}`,
                error: {
                    code: err?.code,
                    command: err?.command,
                    response: err?.response,
                    responseCode: err?.responseCode,
                },
            };
        }
    }
    async sendOtpEmail(toEmail, otpCode) {
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code - Camzy Jobs</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Camzy Jobs</h1>
            <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Enterprise Talent Acquisition Platform</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">Authentication Code</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 28px;">
              Use the single-use verification code below to log in or verify your account on <strong>Camzy Jobs</strong>. This code is valid for <strong>3 minutes</strong>.
            </p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
              <span style="font-family: monospace, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; display: inline-block;">${otpCode}</span>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
              If you did not request this verification code, please ignore this email. Do not share this code with anyone.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Camzy Jobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const defaultFrom = process.env.MAIL_FROM || (process.env.MAIL_USERNAME ? `"Camzy Jobs" <${process.env.MAIL_USERNAME}>` : '"Camzy Jobs" <no-reply@camzyjobs.com>');
        try {
            const info = await this.transporter.sendMail({
                from: defaultFrom,
                to: toEmail,
                subject: `${otpCode} is your Camzy Jobs OTP verification code`,
                html: htmlContent,
            });
            this.logger.log(`OTP Email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to send OTP Email to ${toEmail}: ${err?.message || err}`);
            return false;
        }
    }
    async sendJobShareEmail(toEmail, senderName, jobTitle, companyName, jobUrl, personalNote) {
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px;">
          <h2 style="color: #4f46e5; margin-top: 0;">Job Recommendation from ${senderName}</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            Hey there! <strong>${senderName}</strong> thought you might be a great fit for this job opportunity on <strong>Camzy Jobs</strong>:
          </p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="margin: 0 0 6px 0; color: #0f172a;">${jobTitle}</h3>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Company: <strong>${companyName}</strong></p>
          </div>

          ${personalNote ? `<p style="font-style: italic; color: #475569; border-left: 3px solid #4f46e5; padding-left: 12px; margin: 16px 0;">"${personalNote}"</p>` : ''}

          <div style="margin-top: 24px;">
            <a href="${jobUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View Job Opening & Apply</a>
          </div>
        </div>
      </body>
      </html>
    `;
        const defaultFrom = process.env.MAIL_FROM || (process.env.MAIL_USERNAME ? `"Camzy Jobs" <${process.env.MAIL_USERNAME}>` : '"Camzy Jobs" <no-reply@camzyjobs.com>');
        try {
            await this.transporter.sendMail({
                from: defaultFrom,
                to: toEmail,
                subject: `${senderName} shared a job with you: ${jobTitle} at ${companyName}`,
                html: htmlContent,
            });
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to send Share Job Email to ${toEmail}: ${err?.message || err}`);
            return false;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map