import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  ANONYMOUS = 'ANONYMOUS',
  PRIVATE = 'PRIVATE',
}

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ nullable: true, length: 255 })
  headline: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true, length: 150 })
  currentTitle: string;

  @Column({ type: 'int', default: 0 })
  experienceYears: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  expectedSalary: number;

  @Column({ nullable: true, length: 500 })
  resumeUrl: string;

  @Column({ type: 'longtext', nullable: true })
  resumeParsedText: string;

  @Column({ type: 'json', nullable: true })
  skills: string[]; // e.g. ["TypeScript", "Next.js", "NestJS", "MySQL"]

  @Column({ type: 'json', nullable: true })
  experience: Array<{
    id?: string;
    designation: string;
    companyName: string;
    isCurrentJob?: boolean;
    startDate?: string;
    endDate?: string;
    noticePeriod?: string;
    location?: string;
    jobSummary?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  education: Array<{
    id?: string;
    degree: string;
    fieldOfStudy?: string;
    institution: string;
    startYear?: string;
    endYear?: string;
    grade?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  certifications: Array<{
    id?: string;
    title: string;
    issuingOrganization: string;
    issueDate?: string;
    expiryDate?: string;
    credentialUrl?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  projects: Array<{
    id?: string;
    projectTitle: string;
    client?: string;
    role?: string;
    projectDescription?: string;
    technologies?: string[];
    projectUrl?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  languages: Array<{
    language: string;
    proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
  }>;

  @Column({ type: 'json', nullable: true })
  socialLinks: {
    github?: string;
    linkedin?: string;
    website?: string;
  };

  @Column({ type: 'enum', enum: ProfileVisibility, default: ProfileVisibility.PUBLIC })
  visibility: ProfileVisibility;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
