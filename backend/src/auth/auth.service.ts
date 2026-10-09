import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { Tenant, TenantType, TenantStatus } from '../tenants/entities/tenant.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { TenantSubscription, SubscriptionStatus } from '../subscriptions/entities/tenant-subscription.entity';
import { SubscriptionPlan, PlanCode } from '../subscriptions/entities/subscription-plan.entity';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CONSULTANCY_ADMIN' | 'AGENCY_AGENT' | 'CANDIDATE';
  tenantId?: string;
  tenantName?: string;
  tenantType?: 'COMPANY' | 'CONSULTANCY';
  candidateId?: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(TenantSubscription)
    private readonly subRepo: Repository<TenantSubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async login(email: string, rawPassword?: string) {
    if (!email || !rawPassword) {
      throw new BadRequestException('Email address and password are required.');
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query user strictly by email from database
    const user = await this.userRepo.findOne({
      where: { email: cleanEmail },
      relations: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Verify Password (bcrypt match or exact string match fallback)
    let isValidPassword = false;
    if (user.passwordHash) {
      if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
        isValidPassword = bcrypt.compareSync(rawPassword, user.passwordHash);
      } else {
        isValidPassword = user.passwordHash === rawPassword;
      }
    }

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status === UserStatus.BANNED || user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Your account has been disabled or suspended.');
    }

    const dto = await this.mapToDto(user);

    return {
      accessToken: `jwt-user-token-${user.id}-${Date.now()}`,
      user: dto,
    };
  }

  async registerCompany(body: {
    companyName: string;
    industry?: string;
    website?: string;
    taxId?: string;
    adminName?: string;
    adminEmail: string;
    adminPassword?: string;
    logoUrl?: string;
    description?: string;
    selectedPlan?: string;
  }) {
    if (!body.adminEmail) {
      throw new BadRequestException('Admin email address is required.');
    }

    const cleanEmail = body.adminEmail.toLowerCase().trim();

    const existingUser = await this.userRepo.findOne({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    // 1. Create Tenant in MySQL database
    const slug = (body.companyName || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const newTenant = this.tenantRepo.create({
      name: body.companyName || 'New Company',
      slug,
      type: TenantType.COMPANY,
      industry: body.industry || 'Software & SaaS',
      website: body.website || 'https://example.com',
      taxId: body.taxId || 'TAX-VERIFIED',
      description: body.description || 'Registered hiring company.',
      logoUrl: body.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
      status: TenantStatus.ACTIVE,
    });
    const savedTenant = await this.tenantRepo.save(newTenant);

    // 2. Create Company Admin User in MySQL database
    const nameParts = (body.adminName || 'Company Admin').trim().split(' ');
    const firstName = nameParts[0] || 'Company';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    const plainPassword = body.adminPassword || 'password123';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    const newUser = this.userRepo.create({
      email: cleanEmail,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role: UserRole.COMPANY_ADMIN,
      tenantId: savedTenant.id,
      status: UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepo.save(newUser);

    // 3. Link Subscription Plan
    const planCode = body.selectedPlan === 'STARTER' ? PlanCode.FREE : body.selectedPlan === 'ENTERPRISE' ? PlanCode.ENTERPRISE : PlanCode.PRO;
    let plan = await this.planRepo.findOne({ where: { code: planCode } });
    if (!plan) {
      plan = await this.planRepo.findOne({ where: {} });
    }
    if (plan) {
      const newSub = this.subRepo.create({
        tenantId: savedTenant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      });
      await this.subRepo.save(newSub);
    }

    const dto = await this.mapToDto(savedUser);

    return {
      accessToken: `jwt-user-token-${savedUser.id}-${Date.now()}`,
      user: dto,
      tenant: savedTenant,
    };
  }

  async registerCandidate(body: {
    fullName: string;
    email: string;
    password?: string;
    headline?: string;
    experienceLevel?: string;
    expectedSalary?: string;
    skills?: string;
  }) {
    if (!body.email) {
      throw new BadRequestException('Email address is required.');
    }

    const cleanEmail = body.email.toLowerCase().trim();

    const existingUser = await this.userRepo.findOne({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    const nameParts = (body.fullName || 'Candidate User').trim().split(' ');
    const firstName = nameParts[0] || 'Candidate';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const plainPassword = body.password || 'password123';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    const newUser = this.userRepo.create({
      email: cleanEmail,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role: UserRole.CANDIDATE,
      status: UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepo.save(newUser);

    const newCandidate = this.candidateRepo.create({
      userId: savedUser.id,
      headline: body.headline || 'Software Developer',
      skills: body.skills ? body.skills.split(',').map((s) => s.trim()) : ['TypeScript', 'React'],
      experienceYears: 3,
      expectedSalary: 130000,
    });
    await this.candidateRepo.save(newCandidate);

    const dto = await this.mapToDto(savedUser);

    return {
      accessToken: `jwt-user-token-${savedUser.id}-${Date.now()}`,
      user: dto,
    };
  }

  async getCurrentUser(token?: string): Promise<UserDto> {
    if (!token) {
      throw new UnauthorizedException('Authentication token required.');
    }

    let foundUser: User | null = null;

    // Extract UUID/ID from token format: "jwt-user-token-<UUID>-<timestamp>"
    const uuidMatch = token.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
    if (uuidMatch && uuidMatch[1]) {
      const targetUserId = uuidMatch[1];
      foundUser = await this.userRepo.findOne({
        where: { id: targetUserId },
        relations: { tenant: true },
      });
    }

    // Support legacy seed tokens specifically for dev tests
    if (!foundUser) {
      if (token.includes('jwt-super-admin-token')) {
        foundUser = await this.userRepo.findOne({
          where: { role: UserRole.SUPER_ADMIN },
          relations: { tenant: true },
        });
      } else if (token.includes('jwt-company-token')) {
        foundUser = await this.userRepo.findOne({
          where: { role: UserRole.COMPANY_ADMIN },
          relations: { tenant: true },
        });
      } else if (token.includes('jwt-candidate-token')) {
        foundUser = await this.userRepo.findOne({
          where: { role: UserRole.CANDIDATE },
          relations: { tenant: true },
        });
      }
    }

    if (!foundUser) {
      throw new UnauthorizedException('Invalid or expired authentication session.');
    }

    return await this.mapToDto(foundUser);
  }

  private async mapToDto(u: User): Promise<UserDto> {
    let candidateId: string | undefined = undefined;
    if (u.role === UserRole.CANDIDATE) {
      const cand = await this.candidateRepo.findOne({ where: { userId: u.id } });
      if (cand) candidateId = cand.id;
    }

    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role as any,
      tenantId: u.tenantId || undefined,
      tenantName: u.tenant ? u.tenant.name : undefined,
      tenantType: u.tenant ? (u.tenant.type as any) : undefined,
      candidateId,
      avatarUrl: u.avatarUrl || undefined,
    };
  }
}
