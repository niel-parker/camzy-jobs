import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApplicationDto, ApplicationsService } from './applications.service';
import { ApplicationStage } from './entities/job-application.entity';
import { AuthService } from '../auth/auth.service';

@ApiTags('Job Applications & Recruiter ATS Pipeline')
@Controller('api/v1/applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Fetch applications pipeline for jobs / candidates with strict tenant & candidate isolation' })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'candidateId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(
    @Query('jobId') jobId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('candidateId') candidateId?: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<ApplicationDto[]> {
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
    const currentUser = token ? await this.authService.getCurrentUser(token).catch(() => null) : null;

    return await this.applicationsService.findAll({
      jobId,
      tenantId,
      candidateId,
      userId,
      currentUser,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Candidate: Submit 1-Click application to a job posting' })
  async submitApplication(
    @Body() body: Partial<ApplicationDto> & { answersJson?: Record<string, any> },
    @Headers('authorization') authHeader?: string,
  ): Promise<ApplicationDto> {
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
    const currentUser = token ? await this.authService.getCurrentUser(token).catch(() => null) : null;

    return await this.applicationsService.submitApplication(body, currentUser);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Recruiter ATS: Update applicant Kanban stage & scorecard rating' })
  async updateStage(
    @Param('id') id: string,
    @Body() body: { stage: ApplicationStage; rating?: number },
    @Headers('authorization') authHeader?: string,
  ): Promise<ApplicationDto> {
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
    const currentUser = token ? await this.authService.getCurrentUser(token).catch(() => null) : null;

    return await this.applicationsService.updateStage(id, body.stage, body.rating, currentUser);
  }
}
