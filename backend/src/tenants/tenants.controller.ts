import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';

@ApiTags('Companies & Tenants')
@Controller('api/v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of active company tenants' })
  async findAll() {
    return await this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific company tenant details' })
  async findOne(@Param('id') id: string) {
    return await this.tenantsService.findOne(id);
  }
}
