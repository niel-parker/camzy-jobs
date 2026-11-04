export declare enum GovtJobCategory {
    CENTRAL = "CENTRAL",
    STATE = "STATE"
}
export declare class GovtJob {
    id: string;
    category: GovtJobCategory;
    state: string;
    sector: string;
    titleEn: string;
    titleHi: string;
    departmentEn: string;
    departmentHi: string;
    totalVacancies: string;
    qualificationEn: string;
    qualificationHi: string;
    ageLimit: string;
    salaryScale: string;
    startDate: string;
    lastDate: string;
    applyUrl: string;
    notificationUrl: string;
    officialWebsiteUrl: string;
    descriptionEn: string;
    descriptionHi: string;
    isActive: boolean;
    isFeatured: boolean;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
}
