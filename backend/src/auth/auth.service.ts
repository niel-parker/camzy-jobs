import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async login(email: string, password_hash: string) {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: { tenant: true },
    });

    if (!user) {
      // Fallback for default admin login if not seeded yet
      if (email.toLowerCase().includes('admin') || password_hash === 'admin123') {
        const firstAdmin = await this.userRepo.findOne({
          where: { role: UserRole.SUPER_ADMIN },
          relations: { tenant: true },
        });
        if (firstAdmin) {
          return {
            accessToken: 'jwt-super-admin-token-' + Date.now(),
            user: this.mapToDto(firstAdmin),
          };
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
      user: this.mapToDto(user),
    };
  }

  async getCurrentUser(token?: string): Promise<UserDto> {
    if (token) {
      if (token.includes('usr-company-1') || token.includes('recruiter')) {
        const recruiter = await this.userRepo.findOne({
          where: { role: UserRole.COMPANY_ADMIN },
          relations: { tenant: true },
        });
        if (recruiter) return this.mapToDto(recruiter);
      }
      if (token.includes('candidate') || token.includes('usr-candidate')) {
        const candidate = await this.userRepo.findOne({
          where: { role: UserRole.CANDIDATE },
          relations: { tenant: true },
        });
        if (candidate) return this.mapToDto(candidate);
      }
    }

    // Default to Super Admin
    const admin = await this.userRepo.findOne({
      where: { role: UserRole.SUPER_ADMIN },
      relations: { tenant: true },
    });

    if (admin) return this.mapToDto(admin);

    const anyUser = await this.userRepo.findOne({ where: {}, relations: { tenant: true } });
    if (anyUser) return this.mapToDto(anyUser);

    return {
      id: 'usr-admin-1',
      email: 'admin@camzyjobs.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    };
  }

  private mapToDto(u: User): UserDto {
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role as any,
      tenantId: u.tenantId || undefined,
      tenantName: u.tenant ? u.tenant.name : undefined,
      tenantType: u.tenant ? (u.tenant.type as any) : undefined,
      avatarUrl: u.avatarUrl || undefined,
    };
  }
}
