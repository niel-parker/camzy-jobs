import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password?: string;
        password_hash?: string;
        passwordHash?: string;
    }): Promise<{
        accessToken: string;
        user: import("./auth.service").UserDto;
    }>;
    registerCompany(body: any): Promise<{
        accessToken: string;
        user: import("./auth.service").UserDto;
        tenant: import("../tenants/entities/tenant.entity").Tenant;
    }>;
    registerCandidate(body: any): Promise<{
        accessToken: string;
        user: import("./auth.service").UserDto;
    }>;
    requestOtp(body: {
        identifier?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        message: string;
        expiresInSeconds: number;
        isEmail: boolean;
        otpCode: string;
    }>;
    verifyOtp(body: {
        identifier?: string;
        email?: string;
        phone?: string;
        otp: string;
    }): Promise<{
        accessToken: string;
        user: import("./auth.service").UserDto;
        isNewAccount: boolean;
        message: string;
    }>;
    shareJob(body: {
        toEmail: string;
        senderName?: string;
        jobTitle: string;
        companyName?: string;
        jobUrl: string;
        personalNote?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentUser(authHeader?: string): Promise<import("./auth.service").UserDto>;
}
