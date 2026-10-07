import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    findAll(): Promise<import("./entities/tenant.entity").Tenant[]>;
    findOne(id: string): Promise<import("./entities/tenant.entity").Tenant>;
}
