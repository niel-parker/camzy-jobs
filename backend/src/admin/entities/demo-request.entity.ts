import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DemoRequestStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  DISQUALIFIED = 'DISQUALIFIED',
}

@Entity('demo_requests')
export class DemoRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 200 })
  companyName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  hiresCount: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 50, default: 'REQUEST_A_DEMO' })
  source: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: DemoRequestStatus.PENDING,
  })
  status: DemoRequestStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
