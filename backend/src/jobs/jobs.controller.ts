import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
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
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'experienceLevel', required: false })
  @ApiQuery({ name: 'minExp', required: false })
  @ApiQuery({ name: 'maxExp', required: false })
  @ApiQuery({ name: 'includeExpired', required: false })
  @ApiQuery({ name: 'skills', required: false })
  async findAll(
    @Query('category') category?: string,
    @Query('query') query?: string,
    @Query('tenantId') tenantId?: string,
    @Query('location') location?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('minExp') minExp?: string,
    @Query('maxExp') maxExp?: string,
    @Query('includeExpired') includeExpired?: string,
    @Query('skills') skills?: string,
  ): Promise<JobListingDto[]> {
    const min = minExp ? parseInt(minExp, 10) : undefined;
    const max = maxExp ? parseInt(maxExp, 10) : undefined;
    const incExp = includeExpired === 'true' || includeExpired === '1';
    return await this.jobsService.findAll(category, query, tenantId, location, experienceLevel, min, max, incExp, skills);
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
  async createJob(@Body() body: Partial<JobListingDto>, @Req() req: any): Promise<JobListingDto> {
    const isSuperAdmin = req?.user?.role === 'SUPER_ADMIN';
    return await this.jobsService.createJob(body, isSuperAdmin);
  }

  @Post(':id/repost')
  @UseGuards(JobQuotaGuard)
  @ApiOperation({ summary: 'Repost an existing job position with edits and a fresh 30-day timeline (-1 quota)' })
  @ApiResponse({ status: 201, description: 'Job position reposted successfully for 30 days' })
  @ApiResponse({ status: 403, description: 'Active job posting quota exceeded' })
  async repostJob(
    @Param('id') id: string,
    @Body() body: Partial<JobListingDto>,
    @Req() req: any,
  ): Promise<JobListingDto> {
    const user = req?.user || { role: 'COMPANY_ADMIN', tenantId: body.tenantId || '895c2926-0596-4115-a3e5-03a9d8fe042d' };
    return await this.jobsService.repostJob(id, body, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing job posting (only Super Admin can change expiry date)' })
  async updateJob(
    @Param('id') id: string,
    @Body() body: Partial<JobListingDto>,
    @Req() req: any,
  ): Promise<JobListingDto> {
    const isSuperAdmin = req?.user?.role === 'SUPER_ADMIN';
    return await this.jobsService.updateJob(id, body, isSuperAdmin);
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
