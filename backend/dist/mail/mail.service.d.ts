export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    private initTransporter;
    verifyConnection(): Promise<{
        success: boolean;
        message: string;
        host?: string;
        port?: number;
        user?: string;
        error?: any;
    }>;
    sendTestEmail(toEmail: string): Promise<{
        success: boolean;
        message: string;
        info?: any;
        error?: any;
    }>;
    sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean>;
    sendJobShareEmail(toEmail: string, senderName: string, jobTitle: string, companyName: string, jobUrl: string, personalNote?: string): Promise<boolean>;
}
