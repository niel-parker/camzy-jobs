import { Response } from 'express';
import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    findAll(): Promise<import("./entities/tenant.entity").Tenant[]>;
    getLogoFile(filename: string, res: Response): Promise<void>;
    findOne(id: string): Promise<import("./entities/tenant.entity").Tenant>;
    update(id: string, updateData: any): Promise<import("./entities/tenant.entity").Tenant>;
    uploadLogo(id: string, file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        filename: string;
        originalName: string;
        size: number;
        mimeType: string;
        url: string;
        fullUrl: string;
    }>;
}
