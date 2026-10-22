export declare enum LoginStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}
export declare enum LoginMethod {
    PASSWORD = "PASSWORD",
    OTP = "OTP",
    GOOGLE = "GOOGLE",
    MAGIC_LINK = "MAGIC_LINK"
}
export declare class LoginActivity {
    id: string;
    userId: string | null;
    email: string;
    userName: string | null;
    role: string | null;
    ipAddress: string;
    userAgent: string | null;
    deviceType: string;
    browser: string | null;
    os: string | null;
    status: string;
    failureReason: string | null;
    loginMethod: string;
    location: string | null;
    createdAt: Date;
}
