import { Injectable } from '@nestjs/common';

export interface AppConfigDto {
  id: string;
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  supportEmail: string;
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'INR';
  enableConsultancies: boolean;
  enableFreeJobPosting: boolean;
  enableResumeDownloads: boolean;
  requireEmailVerification: boolean;
  requireCompanyTaxVerification: boolean;
  maintenanceMode: boolean;
  defaultPlanId: string;
  updatedAt: string;
}

@Injectable()
export class AppConfigService {
  private config: AppConfigDto = {
    id: 'cfg-default-1',
    siteName: 'Camzy Jobs',
    siteTagline: 'Enterprise Multi-Tenant Job Portal for Companies & Employers',
    siteDescription: 'Enterprise talent acquisition platform built for companies to post jobs, manage applicants, and source top talent.',
    supportEmail: 'support@camzyjobs.com',
    defaultCurrency: 'USD',
    enableConsultancies: false,
    enableFreeJobPosting: true,
    enableResumeDownloads: true,
    requireEmailVerification: false,
    requireCompanyTaxVerification: true,
    maintenanceMode: false,
    defaultPlanId: 'starter',
    updatedAt: new Date().toISOString(),
  };

  getAppConfig(): AppConfigDto {
    return this.config;
  }

  updateAppConfig(partial: Partial<AppConfigDto>): AppConfigDto {
    this.config = {
      ...this.config,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    return this.config;
  }
}
