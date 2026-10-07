import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TenantSubscription } from './tenant-subscription.entity';

export enum PlanCode {
  FREE = 'FREE',
  GROWTH = 'GROWTH',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: PlanCode, unique: true })
  code: PlanCode;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceMonthly: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceYearly: number;

  @Column({ type: 'int', default: 2 })
  maxActiveJobs: number;

  @Column({ type: 'int', default: 0 })
  maxResumeDownloads: number;

  @Column({ type: 'int', default: 0 })
  maxFeaturedJobs: number;

  @Column({ type: 'int', default: 1 })
  maxTeamSeats: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TenantSubscription, (sub) => sub.plan)
  subscriptions: TenantSubscription[];

  @CreateDateColumn()
  createdAt: Date;
}
