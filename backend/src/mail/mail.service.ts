import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
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
      secure: isSecure, // true for 465, false for 587
      auth: user && pass ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: false, // Prevents certificate chain verification failures on custom SMTP servers
      },
      connectionTimeout: 15000, // 15s timeout
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  /**
   * Diagnostic method to test SMTP server handshake and authentication
   */
  async verifyConnection(): Promise<{ success: boolean; message: string; host?: string; port?: number; user?: string; error?: any }> {
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
    } catch (err: any) {
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

  /**
   * Diagnostic method to send a test email to any recipient
   */
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string; info?: any; error?: any }> {
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
    } catch (err: any) {
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

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
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
    } catch (err: any) {
      this.logger.error(`Failed to send OTP Email to ${toEmail}: ${err?.message || err}`);
      return false;
    }
  }

  async sendJobShareEmail(
    toEmail: string,
    senderName: string,
    jobTitle: string,
    companyName: string,
    jobUrl: string,
    personalNote?: string,
  ): Promise<boolean> {
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
    } catch (err: any) {
      this.logger.error(`Failed to send Share Job Email to ${toEmail}: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Super Admin: Dispatch broadcast marketing / engagement email
   */
  async sendBroadcastEmail(options: {
    toEmail: string;
    recipientName?: string;
    subject: string;
    htmlBody: string;
    campaignName?: string;
  }): Promise<boolean> {
    const defaultFrom =
      process.env.MAIL_FROM ||
      (process.env.MAIL_USERNAME
        ? `"Camzy Jobs" <${process.env.MAIL_USERNAME}>`
        : '"Camzy Jobs" <info@camzyjobs.com>');

    const firstName = options.recipientName?.split(' ')[0] || 'Valued Member';
    let formattedBody = (options.htmlBody || '')
      .replace(/\{\{firstName\}\}/gi, firstName)
      .replace(/\{\{name\}\}/gi, options.recipientName || 'Member')
      .replace(/\{\{email\}\}/gi, options.toEmail);

    if (!formattedBody.includes('<p>') && !formattedBody.includes('<div>') && !formattedBody.includes('<h')) {
      formattedBody = formattedBody.replace(/\n/g, '<br/>');
    }

    const personalizedSubject = (options.subject || 'Camzy Jobs Platform Update')
      .replace(/\{\{firstName\}\}/gi, firstName)
      .replace(/\{\{name\}\}/gi, options.recipientName || 'Member');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${personalizedSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Camzy Jobs</h1>
            <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">India's Premier Talent & Hiring Ecosystem</p>
          </div>
          
          <div style="padding: 36px 40px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            ${formattedBody}
          </div>
          
          <div style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0 0 6px 0;">This communication was sent to <strong>${options.toEmail}</strong> from Camzy Jobs Platform Administration.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Camzy Jobs (A Unit of Camzy Infotech Pvt Ltd). All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: defaultFrom,
        to: options.toEmail,
        subject: personalizedSubject,
        html: htmlContent,
      });
      this.logger.log(`Broadcast email sent to ${options.toEmail}. Message ID: ${info.messageId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send broadcast email to ${options.toEmail}: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Employer / Recruiter: Send candidate invite to job opening
   */
  async sendCandidateInviteEmail(options: {
    toEmail: string;
    candidateName: string;
    recruiterName: string;
    companyName: string;
    jobTitle: string;
    jobUrl?: string;
    message?: string;
    location?: string;
    salary?: string;
  }): Promise<boolean> {
    const defaultFrom =
      process.env.MAIL_FROM ||
      (process.env.MAIL_USERNAME
        ? `"Camzy Jobs" <${process.env.MAIL_USERNAME}>`
        : '"Camzy Jobs" <info@camzyjobs.com>');
    const siteUrl = process.env.FRONTEND_URL || 'https://jobs.camzytech.com';
    const directJobUrl = options.jobUrl || `${siteUrl}/jobs`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Opportunity Invitation: ${options.jobTitle}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 36px 16px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); padding: 32px 36px; text-align: left;">
            <span style="display: inline-block; background: rgba(255,255,255,0.18); color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">Candidate Opportunity Invitation</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">${options.companyName} is inviting you to apply!</h1>
          </div>
          
          <!-- Body Content -->
          <div style="padding: 36px;">
            <p style="font-size: 15px; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
              Dear <strong>${options.candidateName || 'Candidate'}</strong>,
            </p>
            
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
              <strong>${options.recruiterName || 'A recruiter'}</strong> from <strong>${options.companyName}</strong> reviewed your profile in the Camzy Jobs talent network and is inviting you to consider this exclusive opening:
            </p>
            
            <!-- Job Card Snapshot -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #4f46e5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #0f172a; font-weight: 800;">${options.jobTitle}</h3>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #4338ca; font-weight: 700;">${options.companyName}</p>
              
              <table style="font-size: 12px; color: #475569; width: 100%;">
                ${options.location ? `<tr><td style="padding: 2px 0; width: 90px; color: #64748b;">Location:</td><td style="font-weight: 600; color: #1e293b;">${options.location}</td></tr>` : ''}
                ${options.salary ? `<tr><td style="padding: 2px 0; width: 90px; color: #64748b;">CTC / Salary:</td><td style="font-weight: 600; color: #1e293b;">${options.salary}</td></tr>` : ''}
              </table>
            </div>

            <!-- Custom Recruiter Note -->
            ${options.message ? `
              <div style="background: #eef2ff; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; border: 1px dashed #a5b4fc;">
                <p style="font-size: 11px; font-weight: 700; color: #4338ca; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px;">Message from Recruiter:</p>
                <p style="font-size: 13px; color: #1e293b; margin: 0; line-height: 1.5; font-style: italic;">
                  "${options.message}"
                </p>
              </div>
            ` : ''}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0 20px 0;">
              <a href="${directJobUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
                View Job & Apply on Camzy Jobs &rarr;
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b; text-align: center; margin: 16px 0 0 0;">
              Or visit <a href="${siteUrl}" style="color: #4f46e5; text-decoration: underline;">jobs.camzytech.com</a> to view your applications and invitations.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0 0 4px 0;">You received this email because you are a registered candidate on Camzy Jobs.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Camzy Jobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: defaultFrom,
        to: options.toEmail,
        subject: `Job Opportunity Invitation: ${options.jobTitle} at ${options.companyName}`,
        html: htmlContent,
      });
      this.logger.log(`Candidate invite sent to ${options.toEmail}. Message ID: ${info.messageId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send candidate invite to ${options.toEmail}: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Employer: Send team recruiter seat invite email
   */
  async sendTeamInviteEmail(options: {
    toEmail: string;
    inviteeName: string;
    inviterName: string;
    companyName: string;
    role: string;
    loginUrl: string;
    tempPassword?: string;
  }): Promise<boolean> {
    const defaultFrom =
      process.env.MAIL_FROM ||
      (process.env.MAIL_USERNAME
        ? `"Camzy Jobs" <${process.env.MAIL_USERNAME}>`
        : '"Camzy Jobs" <info@camzyjobs.com>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; padding: 36px;">
          <h2 style="color: #4f46e5; margin-top: 0;">You're Invited to Join ${options.companyName}</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Hello <strong>${options.inviteeName}</strong>,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            <strong>${options.inviterName}</strong> has invited you to join the recruitment team for <strong>${options.companyName}</strong> on <strong>Camzy Jobs</strong> as a <strong>${options.role}</strong>.
          </p>
          ${options.tempPassword ? `
            <div style="background: #f1f5f9; padding: 16px; border-radius: 10px; margin: 20px 0; font-size: 13px; color: #1e293b;">
              <p style="margin: 0 0 6px 0; font-weight: bold;">Your Login Credentials:</p>
              <div>Email: <strong>${options.toEmail}</strong></div>
              <div>Temporary Password: <code>${options.tempPassword}</code></div>
            </div>
          ` : ''}
          <div style="margin-top: 24px; text-align: center;">
            <a href="${options.loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Access Recruiter Dashboard &rarr;
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: defaultFrom,
        to: options.toEmail,
        subject: `You're invited to join ${options.companyName} on Camzy Jobs`,
        html: htmlContent,
      });
      this.logger.log(`Team invite email sent to ${options.toEmail}. Message ID: ${info.messageId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send team invite email: ${err?.message || err}`);
      return false;
    }
  }
}
