import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return await this.tenantRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: [{ id }, { slug: id }],
    });
    if (!tenant) {
      throw new NotFoundException(`Company tenant with ID '${id}' not found`);
    }
    return tenant;
  }

  async update(id: string, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // CRITICAL: Company name and slug must NEVER be editable by company admins!
    delete (updateData as any).name;
    delete (updateData as any).slug;
    delete (updateData as any).id;
    delete (updateData as any).status;
    delete (updateData as any).isVerified;

    if (updateData.type !== undefined) tenant.type = updateData.type;
    if (updateData.website !== undefined) tenant.website = updateData.website;
    if (updateData.taxId !== undefined) tenant.taxId = updateData.taxId;
    if (updateData.industry !== undefined) tenant.industry = updateData.industry;
    if (updateData.description !== undefined) tenant.description = updateData.description;
    if (updateData.logoUrl !== undefined) tenant.logoUrl = updateData.logoUrl;

    return await this.tenantRepo.save(tenant);
  }
}
