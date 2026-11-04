import { MailService } from './mail.service';
export declare class MailController {
    private readonly mailService;
    constructor(mailService: MailService);
    checkSmtpStatus(): Promise<{
        success: boolean;
        message: string;
        host?: string;
        port?: number;
        user?: string;
        error?: any;
    }>;
    sendTestEmail(body: {
        toEmail: string;
    }): Promise<{
        success: boolean;
        message: string;
        info?: any;
        error?: any;
    }>;
}
