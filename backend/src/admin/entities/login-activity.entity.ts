import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum LoginMethod {
  PASSWORD = 'PASSWORD',
  OTP = 'OTP',
  GOOGLE = 'GOOGLE',
  MAGIC_LINK = 'MAGIC_LINK',
}

@Entity('login_activities')
@Index(['email', 'createdAt'])
@Index(['status', 'createdAt'])
export class LoginActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, default: '127.0.0.1' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Desktop' })
  deviceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os: string | null;

  @Column({ type: 'varchar', length: 20, default: LoginStatus.SUCCESS })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason: string | null;

  @Column({ type: 'varchar', length: 50, default: LoginMethod.PASSWORD })
  loginMethod: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
