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
export declare class AppConfigService {
    private config;
    getAppConfig(): AppConfigDto;
    updateAppConfig(partial: Partial<AppConfigDto>): AppConfigDto;
}
