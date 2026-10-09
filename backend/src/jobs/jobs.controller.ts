import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JobListingDto, JobsService } from './jobs.service';
import { JobQuotaGuard } from '../guards/job-quota.guard';

@ApiTags('Jobs Engine (Company Postings & Search)')
@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter active job postings' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'query', required: false })
  async findAll(
    @Query('category') category?: string,
    @Query('query') query?: string,
  ): Promise<JobListingDto[]> {
    return await this.jobsService.findAll(category, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific job posting' })
  @ApiResponse({ status: 200, description: 'Job posting details' })
  async findOne(@Param('id') id: string): Promise<JobListingDto> {
    return await this.jobsService.findOne(id);
  }

  @Post()
  @UseGuards(JobQuotaGuard)
  @ApiOperation({ summary: 'Create new company job posting (Guarded by Active Jobs Quota)' })
  @ApiResponse({ status: 201, description: 'Job posting created successfully' })
  @ApiResponse({ status: 403, description: 'Active job posting quota exceeded for company plan' })
  async createJob(@Body() body: Partial<JobListingDto>): Promise<JobListingDto> {
    return await this.jobsService.createJob(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing job posting' })
  async updateJob(@Param('id') id: string, @Body() body: Partial<JobListingDto>): Promise<JobListingDto> {
    return await this.jobsService.updateJob(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job posting' })
  async deleteJob(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.jobsService.deleteJob(id);
  }

  @Post(':id/feature')
  @ApiOperation({ summary: 'Promote job posting to Featured status (Consumes Featured Job Credit)' })
  async featureJob(@Param('id') id: string): Promise<JobListingDto> {
    return await this.jobsService.featureJob(id);
  }
}

