import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum TransactionType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  QUOTA_TOPUP = 'QUOTA_TOPUP',
  SEAT_ADDON = 'SEAT_ADDON',
}

export enum TransactionStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('billing_transactions')
export class BillingTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  invoiceNumber: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ length: 255 })
  tenantName: string;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: TransactionType, default: TransactionType.SUBSCRIPTION })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PAID })
  status: TransactionStatus;

  @Column({ length: 100, default: 'Stripe Card (•••• 4242)' })
  paymentMethod: string;

  @Column({ nullable: true, length: 100 })
  planCode: string;

  @Column({ nullable: true, type: 'json' })
  quotaDetails: {
    activeJobs?: number;
    resumeDownloads?: number;
    teamSeats?: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;
}
