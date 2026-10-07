import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CandidatesService, CandidateProfileDto } from './candidates.service';

@ApiTags('Candidate Profiles & Talent Database Sourcing')
@Controller('api/v1/candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'Search candidate talent database (Guarded by Company Resume Access Plan)' })
  @ApiQuery({ name: 'skill', required: false })
  async findAll(@Query('skill') skill?: string): Promise<CandidateProfileDto[]> {
    return await this.candidatesService.findAll(skill);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate profile details' })
  async findOne(@Param('id') id: string): Promise<CandidateProfileDto> {
    return await this.candidatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Candidate: Update profile details & resume' })
  async updateProfile(
    @Param('id') id: string,
    @Body() body: Partial<CandidateProfileDto>,
  ): Promise<CandidateProfileDto> {
    return await this.candidatesService.updateProfile(id, body);
  }
}
