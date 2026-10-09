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
    getCurrentUser(authHeader?: string): Promise<import("./auth.service").UserDto>;
}
