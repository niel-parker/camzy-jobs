import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
export interface UserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CONSULTANCY_ADMIN' | 'AGENCY_AGENT' | 'CANDIDATE';
    tenantId?: string;
    tenantName?: string;
    tenantType?: 'COMPANY' | 'CONSULTANCY';
    avatarUrl?: string;
}
export declare class AuthService {
    private readonly userRepo;
    private readonly tenantRepo;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>);
    login(email: string, password_hash: string): Promise<{
        accessToken: string;
        user: UserDto;
    }>;
    getCurrentUser(token?: string): Promise<UserDto>;
    private mapToDto;
}
