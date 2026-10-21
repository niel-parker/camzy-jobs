import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_broadcasts')
export class EmailBroadcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  campaignName: string;

  @Column({ type: 'varchar', length: 80 })
  targetSegment: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'longtext' })
  htmlBody: string;

  @Column({ type: 'int', default: 0 })
  recipientCount: number;

  @Column({ type: 'varchar', length: 30, default: 'SENT' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
