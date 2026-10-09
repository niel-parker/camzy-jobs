export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COMPANY_ADMIN' 
  | 'RECRUITER' 
  | 'CONSULTANCY_ADMIN' 
  | 'AGENCY_AGENT' 
  | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  tenantType?: 'COMPANY' | 'CONSULTANCY';
  candidateId?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ThemeConfig {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;     // e.g. #3b82f6 or #6366f1
  primaryHover: string;
  secondaryColor: string;   // e.g. #8b5cf6
  accentColor: string;      // e.g. #06b6d4
  backgroundColor: string;  // e.g. #090d16 (dark) or #f8fafc (light)
  surfaceColor: string;     // e.g. #111827 (dark) or #ffffff (light)
  textColor: string;        // e.g. #f9fafb (dark) or #0f172a (light)
  borderRadius: string;     // e.g. '0.75rem'
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Roboto' | 'Poppins';
  headerStyle: 'solid' | 'glassmorphism' | 'gradient';
  isDefault: boolean;
  customCssVars?: Record<string, string>;
  updatedAt: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: Omit<ThemeConfig, 'id' | 'updatedAt'>;
}

export interface AppConfig {
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

export interface ScreeningQuestion {
  id: string;
  questionText: string;
  questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
  options?: string[];
  isRequired?: boolean;
}

export interface ScreeningAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface JobListing {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  isConsultancy: boolean;
  consultancyName?: string;
  clientCompanyName?: string;
  location: string;
  isRemote: boolean;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  isSalaryVisible: boolean;
  category: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  description: string;
  isFeatured: boolean;
  applyType?: 'INTERNAL' | 'EXTERNAL';
  applyUrl?: string;
  screeningQuestions?: ScreeningQuestion[];
  createdAt: string;
}

export interface DashboardMetrics {
  totalJobs: number;
  totalCompanies: number;
  totalConsultancies: number;
  totalCandidates: number;
  totalApplications: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}
