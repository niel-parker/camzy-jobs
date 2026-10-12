import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { Candidate } from './entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { JobPosting } from '../jobs/entities/job-posting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, User, JobPosting])],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
