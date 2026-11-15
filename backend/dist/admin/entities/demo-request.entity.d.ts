export declare enum DemoRequestStatus {
    PENDING = "PENDING",
    CONTACTED = "CONTACTED",
    SCHEDULED = "SCHEDULED",
    COMPLETED = "COMPLETED",
    DISQUALIFIED = "DISQUALIFIED"
}
export declare class DemoRequest {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    companyName: string;
    hiresCount: string | null;
    city: string | null;
    source: string;
    status: DemoRequestStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
