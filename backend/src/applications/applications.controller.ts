import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApplicationDto, ApplicationsService } from './applications.service';
import { ApplicationStage } from './entities/job-application.entity';

@ApiTags('Job Applications & Recruiter ATS Pipeline')
@Controller('api/v1/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Recruiter ATS: Fetch applications pipeline for jobs' })
  @ApiQuery({ name: 'jobId', required: false })
  async findAllByJob(@Query('jobId') jobId?: string): Promise<ApplicationDto[]> {
    return await this.applicationsService.findAllByJob(jobId);
  }

  @Post()
  @ApiOperation({ summary: 'Candidate: Submit 1-Click application to a job posting' })
  async submitApplication(@Body() body: Partial<ApplicationDto>): Promise<ApplicationDto> {
    return await this.applicationsService.submitApplication(body);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Recruiter ATS: Update applicant Kanban stage & scorecard rating' })
  async updateStage(
    @Param('id') id: string,
    @Body() body: { stage: ApplicationStage; rating?: number },
  ): Promise<ApplicationDto> {
    return await this.applicationsService.updateStage(id, body.stage, body.rating);
  }
}
