import { Body, Controller, Get, Post, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
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

@ApiTags('Companies & Team Seats')
@Controller('api/v1/tenants/seats')
export class SeatsController {
  private teamMembers: RecruiterMemberDto[] = [
    {
      id: 'usr-company-1',
      email: 'recruiter@techcorp.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: UserRole.COMPANY_ADMIN,
      status: 'ACTIVE',
      invitedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr-company-2',
      email: 'hiring.manager@techcorp.com',
      firstName: 'Alex',
      lastName: 'Rivera',
      role: UserRole.RECRUITER,
      status: 'ACTIVE',
      invitedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ];

  private planMaxSeats = 5; // Pro Plan seat limit default

  @Get('members')
  @ApiOperation({ summary: 'List current company recruiter team sub-accounts & seat usage' })
  getTeamMembers() {
    return {
      usedSeats: this.teamMembers.length,
      maxSeats: this.planMaxSeats,
      members: this.teamMembers,
    };
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new recruiter sub-account to company hiring team (Guarded by PlanMaxSeats)' })
  @ApiResponse({ status: 201, description: 'Recruiter invitation dispatched' })
  @ApiResponse({ status: 403, description: 'Recruiter seat limit reached for company plan' })
  inviteMember(@Body() body: { email: string; firstName: string; lastName: string }) {
    if (this.teamMembers.length >= this.planMaxSeats) {
      throw new ForbiddenException(
        `Recruiter seat limit reached! Your plan allows a maximum of ${this.planMaxSeats} team seats. Upgrade to Enterprise for more seats.`
      );
    }

    const newMember: RecruiterMemberDto = {
      id: `usr-recruiter-${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: UserRole.RECRUITER,
      status: 'PENDING_INVITE',
      invitedAt: new Date().toISOString(),
    };

    this.teamMembers.push(newMember);

    return {
      message: `Invitation email sent to ${body.email}`,
      member: newMember,
      usedSeats: this.teamMembers.length,
      maxSeats: this.planMaxSeats,
    };
  }
}
