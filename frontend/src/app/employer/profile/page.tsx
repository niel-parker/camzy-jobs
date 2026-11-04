'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Building2, Lock, Save, Globe, FileText, Upload, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, ShieldCheck, Briefcase, Info, ExternalLink 
} from 'lucide-react';

interface CompanyProfileData {
  id: string;
  name: string;
  slug: string;
  type: 'COMPANY' | 'CONSULTANCY';
  logoUrl?: string;
  website?: string;
  taxId?: string;
  industry?: string;
  description?: string;
  isVerified?: boolean;
}

export default function EmployerCompanyProfilePage() {
  const { user, sdk } = useTheme();

  const [company, setCompany] = useState<CompanyProfileData>({
    id: '',
    name: 'TechCorp Global Ltd.',
    slug: 'techcorp-global',
    type: 'COMPANY',
    logoUrl: '',
    website: 'https://techcorp.example.com',
    taxId: '27AAPFU0939F1ZV',
    industry: 'Software & Technology',
    description: 'TechCorp Global is a premier enterprise technology and cloud solutions provider delivering next-generation digital transformation.',
    isVerified: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveTenantId = user?.tenantId || '5c88e4d2-4e38-4e15-817b-a19fe3090e8c';

  useEffect(() => {
    async function loadTenantProfile() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const tenant = await sdk.request<CompanyProfileData>(`/tenants/${effectiveTenantId}`);
        if (tenant) {
          setCompany({
            id: tenant.id || effectiveTenantId,
            name: tenant.name || 'Company Name',
            slug: tenant.slug || '',
            type: tenant.type || 'COMPANY',
            logoUrl: tenant.logoUrl || '',
            website: tenant.website || '',
            taxId: tenant.taxId || '',
            industry: tenant.industry || 'Software & Technology',
            description: tenant.description || '',
            isVerified: tenant.isVerified ?? true,
          });
        }
      } catch (err: any) {
        console.warn('Could not fetch tenant profile from backend, using current state:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (effectiveTenantId) {
      loadTenantProfile();
    }
  }, [sdk, effectiveTenantId]);

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo image exceeds the 5MB maximum limit. Please upload a smaller file.');
      return;
    }

    setIsUploadingLogo(true);
    setErrorMessage(null);

    try {
      const res = await sdk.uploadCompanyLogo(effectiveTenantId, file);
      const newLogoUrl = res.url || res.fullUrl;
      setCompany((prev) => ({ ...prev, logoUrl: newLogoUrl }));
      setSuccessMessage('Company logo uploaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Logo upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload company logo image.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // STRICT CONSTRAINT: Company Name is NEVER sent or editable
      const payload = {
        type: company.type,
        website: company.website,
        taxId: company.taxId,
        industry: company.industry,
        description: company.description,
        logoUrl: company.logoUrl,
      };

      await sdk.request(`/tenants/${effectiveTenantId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSuccessMessage('Company profile details saved and updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to update company profile:', err);
      setErrorMessage(err.message || 'Failed to update company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Employer Organization
              </span>
              {company.isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Employer
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight theme-text mt-1 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-500" /> Company Profile & Branding
            </h1>
            <p className="text-xs theme-muted">Manage your public company identity, official logo, industry, and contact details</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSaving || isLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs theme-muted font-bold">Loading company profile details...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* HERO / LOGO & IMMUTABLE NAME SECTION */}
            <div className="theme-surface border theme-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                
                {/* Logo with Building2 Fallback */}
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl border-2 border-indigo-500/30 bg-slate-100 dark:bg-slate-800/90 flex items-center justify-center overflow-hidden shadow-md">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl.startsWith('http') ? company.logoUrl : `http://localhost:4000${company.logoUrl}`}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-indigo-500" />
                    )}
                  </div>

                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}

                  <input
                    type="file"
                    id="company-logo-upload"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* Company Name & Logo Actions */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black theme-text tracking-tight flex items-center gap-2">
                      {company.name}
                    </h2>
                    <p className="text-xs theme-muted">Registered slug: <span className="font-mono text-indigo-500 font-bold">{company.slug}</span></p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="company-logo-upload"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{company.logoUrl ? 'Change Company Logo' : 'Upload Company Logo'}</span>
                    </label>
                    <span className="text-[11px] theme-muted font-medium">PNG, JPG, WEBP or SVG (Max 5MB)</span>
                  </div>
                </div>
              </div>

              {/* STRICT NOTICE: Company Name Is Locked */}
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <h4 className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    Company Legal Name is Permanent & Non-Editable
                  </h4>
                  <p className="text-amber-700 dark:text-amber-400/90 leading-relaxed text-[11px]">
                    To protect platform security, anti-spoofing verification, and candidate trust, company legal names cannot be modified directly by company administrators. If your organization has rebranded or undergone a legal name change, please contact CamzyJobs compliance support at <strong className="font-bold underline">support@camzyjobs.com</strong>.
                  </p>
                </div>
              </div>

              {/* Disabled Company Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold theme-text flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Legal Company Name (Permanent)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={company.name}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold text-xs cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3.5 top-2.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </div>
                </div>
              </div>
            </div>

            {/* EDITABLE COMPANY FIELDS */}
            <div className="theme-surface border theme-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-sm font-black theme-text uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Organization Profile & Industry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                
                {/* Organization Type */}
                <div>
                  <label className="block font-bold theme-text mb-1.5">Organization Category *</label>
                  <select
                    value={company.type}
                    onChange={(e) => setCompany({ ...company, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-surface theme-text font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="COMPANY">Direct Hiring Employer / Corporate</option>
                    <option value="CONSULTANCY">Placement Agency / Recruitment Consultancy</option>
                  </select>
                  <p className="text-[10px] theme-muted mt-1">Defines whether candidate applications are direct or on behalf of client firms.</p>
                </div>

                {/* Industry */}
                <div>
                  <label className="block font-bold theme-text mb-1.5">Industry Sector *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Information Technology & Software"
                    value={company.industry || ''}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-surface theme-text font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] theme-muted mt-1">Helps candidates discover your jobs in category and industry filters.</p>
                </div>

                {/* Official Website */}
                <div>
                  <label className="block font-bold theme-text mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Official Website URL</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={company.website || ''}
                      onChange={(e) => setCompany({ ...company, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-surface theme-text font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {company.website && (
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-3 top-2.5 text-indigo-500 hover:text-indigo-600"
                        title="Visit website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Tax ID / GSTIN */}
                <div>
                  <label className="block font-bold theme-text mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Company Tax ID / GSTIN</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAPFU0939F1ZV / EIN-123456"
                    value={company.taxId || ''}
                    onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-surface theme-text font-mono font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                  />
                  <p className="text-[10px] theme-muted mt-1">Used for B2B billing invoices and compliance badge verification.</p>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block font-bold theme-text mb-1.5">About Company / Organization Overview</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your company background, culture, mission, tech stack, and what makes working at your company exciting..."
                    value={company.description || ''}
                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border theme-border theme-surface theme-text font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] theme-muted mt-1">This overview is displayed on all your job postings and company public directory page.</p>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-4 border-t theme-border flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Company Profile
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

