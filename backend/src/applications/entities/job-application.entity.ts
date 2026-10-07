import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JobPosting } from '../../jobs/entities/job-posting.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';

export enum ApplicationStage {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  REJECTED = 'REJECTED',
}

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobPosting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: JobPosting;

  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ length: 500 })
  resumeUrlSnapshot: string;

  @Column({ type: 'json', nullable: true })
  answersJson: Record<string, any>;

  @Column({ type: 'enum', enum: ApplicationStage, default: ApplicationStage.APPLIED })
  stage: ApplicationStage;

  @Column({ type: 'int', default: 0 })
  rating: number; // 0 to 5 score

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
