import { UserRole } from '../users/entities/user.entity';
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
    private teamMembers;
    private planMaxSeats;
    getTeamMembers(): {
        usedSeats: number;
        maxSeats: number;
        members: RecruiterMemberDto[];
    };
    inviteMember(body: {
        email: string;
        firstName: string;
        lastName: string;
    }): {
        message: string;
        member: RecruiterMemberDto;
        usedSeats: number;
        maxSeats: number;
    };
}
