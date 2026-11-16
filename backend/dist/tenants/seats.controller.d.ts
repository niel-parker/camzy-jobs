import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';
import { MailService } from '../mail/mail.service';
export interface RecruiterMemberDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: 'ACTIVE' | 'PENDING_INVITE';
    invitedAt: string;
}
export declare class SeatsController {
    private readonly userRepo;
    private readonly tenantRepo;
    private readonly subRepo;
    private readonly mailService;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>, subRepo: Repository<TenantSubscription>, mailService: MailService);
    private resolveTenant;
    getTeamMembers(tenantId?: string): Promise<{
        usedSeats: number;
        maxSeats: number;
        remainingSeats: number;
        members: RecruiterMemberDto[];
    }>;
    inviteMember(body: {
        email: string;
        firstName: string;
        lastName: string;
        role?: UserRole;
        tenantId?: string;
    }): Promise<{
        message: string;
        member: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            status: string;
            invitedAt: string;
        };
        usedSeats: number;
        maxSeats: number;
    }>;
}
