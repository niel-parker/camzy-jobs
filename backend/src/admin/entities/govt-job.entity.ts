import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum GovtJobCategory {
  CENTRAL = 'CENTRAL',
  STATE = 'STATE',
}

@Entity('govt_jobs')
export class GovtJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GovtJobCategory,
    default: GovtJobCategory.CENTRAL,
  })
  category: GovtJobCategory;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, default: 'General' })
  sector: string;

  @Column({ type: 'varchar', length: 300 })
  titleEn: string;

  @Column({ type: 'varchar', length: 300 })
  titleHi: string;

  @Column({ type: 'varchar', length: 255 })
  departmentEn: string;

  @Column({ type: 'varchar', length: 255 })
  departmentHi: string;

  @Column({ type: 'varchar', length: 100, default: 'Multiple' })
  totalVacancies: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  qualificationEn: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  qualificationHi: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ageLimit: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  salaryScale: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  startDate: string;

  @Column({ type: 'varchar', length: 50 })
  lastDate: string;

  @Column({ type: 'varchar', length: 500 })
  applyUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notificationUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  officialWebsiteUrl: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ type: 'text', nullable: true })
  descriptionHi: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

