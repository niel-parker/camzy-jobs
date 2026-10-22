import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum TransactionType {
    SUBSCRIPTION = "SUBSCRIPTION",
    QUOTA_TOPUP = "QUOTA_TOPUP",
    SEAT_ADDON = "SEAT_ADDON"
}
export declare enum TransactionStatus {
    PAID = "PAID",
    PENDING = "PENDING",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class BillingTransaction {
    id: string;
    invoiceNumber: string;
    tenant: Tenant;
    tenantId: string;
    tenantName: string;
    description: string;
    amount: number;
    currency: string;
    type: TransactionType;
    status: TransactionStatus;
    paymentMethod: string;
    planCode: string;
    quotaDetails: {
        activeJobs?: number;
        resumeDownloads?: number;
        teamSeats?: number;
    };
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
}
