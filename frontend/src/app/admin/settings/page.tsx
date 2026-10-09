'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Settings, Save, Check, Globe, Shield, DollarSign, Mail, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function SuperAdminSettingsPage() {
  const { sdk } = useTheme();
  const [appName, setAppName] = useState('Camzy Jobs');
  const [supportEmail, setSupportEmail] = useState('support@camzyjobs.com');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');
  const [enableConsultancies, setEnableConsultancies] = useState(false);
  const [enableFreeJobPosting, setEnableFreeJobPosting] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const config = await sdk.getAppConfig();
        if (config) {
          setAppName(config.siteName || 'Camzy Jobs');
          setSupportEmail(config.supportEmail || 'support@camzyjobs.com');
          setCurrency(config.defaultCurrency || 'USD');
          setEnableConsultancies(config.enableConsultancies ?? false);
          setEnableFreeJobPosting(config.enableFreeJobPosting ?? true);
        }
      } catch (err) {
        console.error('Error loading app config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [sdk]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sdk.updateAppConfig({
        siteName: appName,
        supportEmail,
        defaultCurrency: currency,
        enableConsultancies,
        enableFreeJobPosting,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving platform settings:', err);
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight theme-text flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-500" /> Global Platform Settings
          </h1>
          <p className="mt-1 text-xs theme-muted">
            Super Admin governance settings for application metadata, features, and payment controls.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center">
            <Check className="h-4 w-4 mr-2" /> Global platform settings saved and synchronized with MySQL backend!
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center theme-muted text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading platform settings from database...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Branding & Basics */}
            <div className="p-6 rounded-xl border theme-border theme-surface space-y-4 shadow-sm">
              <h3 className="text-sm font-bold theme-text border-b theme-border pb-3">
                Branding & Metadata
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1">
                    Application Name
                  </label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1">
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="p-6 rounded-xl border theme-border theme-surface space-y-4 shadow-sm">
              <h3 className="text-sm font-bold theme-text border-b theme-border pb-3">
                Feature Toggles & Business Audience Rules
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold theme-text">Enable Placement Consultancies & Agencies</h4>
                    <p className="text-[11px] theme-muted">
                      Keep disabled to restrict platform exclusively to direct hiring companies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableConsultancies(!enableConsultancies)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      enableConsultancies ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        enableConsultancies ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t theme-border pt-4">
                  <div>
                    <h4 className="text-xs font-bold theme-text">Enable Free Tier Job Postings</h4>
                    <p className="text-[11px] theme-muted">
                      Allow newly registered companies to post 2 free jobs on Starter Plan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableFreeJobPosting(!enableFreeJobPosting)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      enableFreeJobPosting ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        enableFreeJobPosting ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Configuration Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
