export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean>;
    sendJobShareEmail(toEmail: string, senderName: string, jobTitle: string, companyName: string, jobUrl: string, personalNote?: string): Promise<boolean>;
}
