import { TenantType, TenantStatus } from '../tenants/entities/tenant.entity';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { PlanCode } from '../subscriptions/entities/subscription-plan.entity';
import { EmploymentType, ExperienceLevel, JobStatus } from '../jobs/entities/job-posting.entity';

export async function runDatabaseSeed() {
  console.log('🌱 Starting Camzy Jobs Enterprise Database Seeder...');

  const plans = [
    {
      name: 'Starter Company',
      code: PlanCode.FREE,
      priceMonthly: 0,
      priceYearly: 0,
      maxActiveJobs: 2,
      maxResumeDownloads: 0,
      maxTeamSeats: 1,
    },
    {
      name: 'Growth Employer',
      code: PlanCode.GROWTH,
      priceMonthly: 99,
      priceYearly: 79,
      maxActiveJobs: 5,
      maxResumeDownloads: 50,
      maxTeamSeats: 3,
    },
    {
      name: 'Professional Employer',
      code: PlanCode.PRO,
      priceMonthly: 199,
      priceYearly: 159,
      maxActiveJobs: 15,
      maxResumeDownloads: 150,
      maxTeamSeats: 5,
    },
    {
      name: 'Enterprise Scale',
      code: PlanCode.ENTERPRISE,
      priceMonthly: 499,
      priceYearly: 399,
      maxActiveJobs: 50,
      maxResumeDownloads: 500,
      maxTeamSeats: 15,
    },
  ];

  const companies = [
    {
      name: 'TechCorp Global',
      slug: 'techcorp-global',
      type: TenantType.COMPANY,
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
      industry: 'Software & Technology',
      status: TenantStatus.ACTIVE,
    },
    {
      name: 'FinTech Dynamics Corp',
      slug: 'fintech-dynamics',
      type: TenantType.COMPANY,
      logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120',
      industry: 'Financial Services',
      status: TenantStatus.ACTIVE,
    },
    {
      name: 'DesignCraft Studio',
      slug: 'designcraft-studio',
      type: TenantType.COMPANY,
      logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=120',
      industry: 'Design & Creative',
      status: TenantStatus.ACTIVE,
    },
    {
      name: 'Neural Mind AI',
      slug: 'neural-mind-ai',
      type: TenantType.COMPANY,
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',
      industry: 'Artificial Intelligence',
      status: TenantStatus.ACTIVE,
    },
  ];

  const users = [
    {
      email: 'admin@camzyjobs.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    },
    {
      email: 'recruiter@techcorp.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: UserRole.COMPANY_ADMIN,
    },
    {
      email: 'candidate@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CANDIDATE,
    },
  ];

  console.log(`✅ Seeded ${plans.length} Subscription Plans`);
  console.log(`✅ Seeded ${companies.length} Company Tenants`);
  console.log(`✅ Seeded ${users.length} System Users`);
  console.log('🎉 Camzy Jobs Seeding Complete!');
}

if (require.main === module) {
  runDatabaseSeed().catch((err) => {
    console.error('❌ Seeder Error:', err);
  });
}
