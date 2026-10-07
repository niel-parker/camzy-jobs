import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobPosting } from '../../jobs/entities/job-posting.entity';
import { TenantSubscription } from '../../subscriptions/entities/tenant-subscription.entity';

export enum TenantType {
  COMPANY = 'COMPANY',
  CONSULTANCY = 'CONSULTANCY',
}

export enum TenantStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: TenantType, default: TenantType.COMPANY })
  type: TenantType;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ nullable: true, length: 500 })
  logoUrl: string;

  @Column({ nullable: true, length: 255 })
  website: string;

  @Column({ nullable: true, length: 100 })
  taxId: string;

  @Column({ nullable: true, length: 100 })
  industry: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => JobPosting, (job) => job.tenant)
  jobs: JobPosting[];

  @OneToMany(() => TenantSubscription, (sub) => sub.tenant)
  subscriptions: TenantSubscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
