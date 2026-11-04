import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('govt_commission_portals')
export class GovtCommissionPortal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string; // e.g. 'UPSC Online'

  @Column({ type: 'varchar', length: 150, nullable: true })
  nameHi: string;

  @Column({ type: 'varchar', length: 500 })
  url: string; // e.g. 'https://upsconline.nic.in'

  @Column({ type: 'varchar', length: 255 })
  desc: string; // e.g. 'Civil Services & NDA'

  @Column({ type: 'varchar', length: 255, nullable: true })
  descHi: string;

  @Column({ type: 'varchar', length: 100, default: '.gov.in / .nic.in' })
  badgeText: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
