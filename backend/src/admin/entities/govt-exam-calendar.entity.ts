import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('govt_exam_calendar')
export class GovtExamCalendarItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  day: string; // e.g. '14'

  @Column({ type: 'varchar', length: 10 })
  month: string; // e.g. 'MAR'

  @Column({ type: 'varchar', length: 10, default: '2026' })
  year: string;

  @Column({ type: 'varchar', length: 300 })
  titleEn: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  titleHi: string;

  @Column({ type: 'varchar', length: 150 })
  board: string; // e.g. 'Indian Navy', 'SSC Portal', 'UPSC Online'

  @Column({ type: 'varchar', length: 150, default: 'Computer Based Exam' })
  stage: string;

  @Column({ type: 'varchar', length: 500 })
  link: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
