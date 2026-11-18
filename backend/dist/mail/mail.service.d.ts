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
    sendBroadcastEmail(options: {
        toEmail: string;
        recipientName?: string;
        subject: string;
        htmlBody: string;
        campaignName?: string;
    }): Promise<boolean>;
    sendCandidateInviteEmail(options: {
        toEmail: string;
        candidateName: string;
        recruiterName: string;
        companyName: string;
        jobTitle: string;
        jobUrl?: string;
        message?: string;
        location?: string;
        salary?: string;
        subject?: string;
        cc?: string | string[];
        bcc?: string | string[];
    }): Promise<boolean>;
    sendTeamInviteEmail(options: {
        toEmail: string;
        inviteeName: string;
        inviterName: string;
        companyName: string;
        role: string;
        loginUrl: string;
        tempPassword?: string;
    }): Promise<boolean>;
}
