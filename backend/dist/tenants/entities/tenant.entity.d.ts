import { User } from '../../users/entities/user.entity';
import { JobPosting } from '../../jobs/entities/job-posting.entity';
import { TenantSubscription } from '../../subscriptions/entities/tenant-subscription.entity';
export declare enum TenantType {
    COMPANY = "COMPANY",
    CONSULTANCY = "CONSULTANCY"
}
export declare enum TenantStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class Tenant {
    id: string;
    name: string;
    type: TenantType;
    slug: string;
    logoUrl: string;
    website: string;
    taxId: string;
    industry: string;
    description: string;
    status: TenantStatus;
    users: User[];
    jobs: JobPosting[];
    subscriptions: TenantSubscription[];
    createdAt: Date;
    updatedAt: Date;
}
