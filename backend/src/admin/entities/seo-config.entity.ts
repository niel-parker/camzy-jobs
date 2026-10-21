import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('seo_configs')
export class SeoConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  pageKey: string;

  @Column({ type: 'varchar', length: 150 })
  pageName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaKeywords: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonicalUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ogImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
