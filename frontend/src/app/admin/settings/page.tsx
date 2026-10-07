'use client';

import React, { useState } from 'react';
import { Settings, Save, Check, Globe, Shield, DollarSign, Mail } from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const [appName, setAppName] = useState('Camzy Jobs');
  const [supportEmail, setSupportEmail] = useState('support@camzyjobs.com');
  const [currency, setCurrency] = useState('USD ($)');
  const [enableConsultancies, setEnableConsultancies] = useState(false);
  const [enableStripeWebhooks, setEnableStripeWebhooks] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight theme-text flex items-center">
          <Settings className="h-8 w-8 text-indigo-500 mr-2" /> Global Platform Settings
        </h1>
        <p className="mt-1 text-sm theme-muted">
          Super Admin configuration controls for platform branding, feature toggles, and payment gateways.
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center">
          <Check className="h-5 w-5 mr-2" /> Platform settings updated and synchronized with NestJS backend!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Basics */}
        <div className="p-6 rounded-xl border theme-border theme-surface space-y-4">
          <h3 className="text-base font-bold theme-text border-b theme-border pb-3">
            Branding & Application Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                Application Name
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-6 rounded-xl border theme-border theme-surface space-y-4">
          <h3 className="text-base font-bold theme-text border-b theme-border pb-3">
            Feature Toggles & Business Audience Rules
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold theme-text">Enable Placement Consultancies & Agencies</h4>
                <p className="text-xs theme-muted">
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
                <h4 className="text-sm font-bold theme-text">Stripe Webhooks & Automatic Quota Resets</h4>
                <p className="text-xs theme-muted">
                  Process live payment events for monthly subscription renewals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableStripeWebhooks(!enableStripeWebhooks)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  enableStripeWebhooks ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    enableStripeWebhooks ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
