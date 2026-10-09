import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

export enum EmploymentType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
  REMOTE = 'Remote',
}

export enum ExperienceLevel {
  ENTRY = 'Entry',
  MID = 'Mid',
  SENIOR = 'Senior',
  LEAD = 'Lead',
  EXECUTIVE = 'Executive',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'posted_by_user_id' })
  postedByUser: User;

  @Column({ name: 'posted_by_user_id' })
  postedByUserId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Column({ type: 'enum', enum: ExperienceLevel, default: ExperienceLevel.MID })
  experienceLevel: ExperienceLevel;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ default: true })
  isSalaryVisible: boolean;

  @Column({ length: 100 })
  locationCountry: string;

  @Column({ length: 100 })
  locationCity: string;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ length: 20, default: 'INTERNAL' })
  applyType: 'INTERNAL' | 'EXTERNAL';

  @Column({ length: 500, nullable: true })
  applyUrl: string;

  @Column({ type: 'json', nullable: true })
  screeningQuestions: Array<{
    id: string;
    questionText: string;
    questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
    options?: string[];
    isRequired?: boolean;
  }>;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PUBLISHED })
  status: JobStatus;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @Column({ type: 'int', default: 0 })
  applicationsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
