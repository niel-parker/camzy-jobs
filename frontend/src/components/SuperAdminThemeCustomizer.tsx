'use client';

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SearchableSelect } from './SearchableSelect';
import { X, Palette, Check, RefreshCw, Sun, Moon, Sparkles, Type, Sliders, Save, ShieldCheck, Settings, Globe, ToggleLeft, ToggleRight, DollarSign, Mail } from 'lucide-react';

interface SuperAdminThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIMARY_COLOR_SWATCHES = [
  { name: 'Indigo', hex: '#6366f1', hover: '#4f46e5' },
  { name: 'Royal Blue', hex: '#2563eb', hover: '#1d4ed8' },
  { name: 'Emerald Mint', hex: '#059669', hover: '#047857' },
  { name: 'Violet', hex: '#8b5cf6', hover: '#7c3aed' },
  { name: 'Cyan', hex: '#06b6d4', hover: '#0891b2' },
  { name: 'Rose', hex: '#f43f5e', hover: '#e11d48' },
  { name: 'Amber', hex: '#d97706', hover: '#b45309' },
];

const FONTS = ['Inter', 'Plus Jakarta Sans', 'Outfit', 'Roboto', 'Poppins'] as const;

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($) - United States Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro Currency' },
  { value: 'GBP', label: 'GBP (£) - British Pound Sterling' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
];

export const SuperAdminThemeCustomizer: React.FC<SuperAdminThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { theme, presets, appConfig, updateTheme, applyPreset, updateAppConfig } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'typography' | 'appConfig'>('presets');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTheme(theme);
      await updateAppConfig(appConfig);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl text-white shadow-md"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Super Admin Engine <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Control Center</span>
              </h3>
              <p className="text-xs text-slate-400">Theme customization & Job Portal platform settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'custom'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Colors & Mode
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'typography'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" /> Typography & Radius
          </button>
          <button
            onClick={() => setActiveTab('appConfig')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'appConfig'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" /> App Config
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PRESETS (Light & Dark) */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Curated Enterprise Presets (Light & Dark)
              </label>
              <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => {
                  const isSelected = theme.name === preset.config.name;
                  const isLight = preset.config.mode === 'light';
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-slate-800/90 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm flex items-center gap-2">
                          {preset.name}
                          {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                        </span>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                          isLight ? 'bg-amber-400/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {preset.config.mode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{preset.description}</p>
                      
                      {/* Color Palette Preview Dots */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: preset.config.primaryColor }} title="Primary" />
                        <div className="w-5 h-5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: preset.config.secondaryColor }} title="Secondary" />
                        <div className="w-5 h-5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: preset.config.accentColor }} title="Accent" />
                        <div className="w-5 h-5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: preset.config.backgroundColor }} title="Background" />
                        <span className="text-[10px] text-slate-500 font-mono ml-auto">{preset.config.fontFamily}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM COLOR & MODE */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Mode Toggle (Dark / Light) */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Global Color Theme Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateTheme({
                      mode: 'light',
                      backgroundColor: '#f8fafc',
                      surfaceColor: '#ffffff',
                      textColor: '#0f172a'
                    })}
                    className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      theme.mode === 'light'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" /> Light Mode
                  </button>
                  <button
                    onClick={() => updateTheme({
                      mode: 'dark',
                      backgroundColor: '#090d16',
                      surfaceColor: '#111827',
                      textColor: '#f9fafb'
                    })}
                    className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      theme.mode === 'dark'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-lg'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                  </button>
                </div>
              </div>

              {/* Primary Color Palette Swatches */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Primary Brand Color
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {PRIMARY_COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      onClick={() => updateTheme({ primaryColor: swatch.hex, primaryHover: swatch.hover })}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                        theme.primaryColor === swatch.hex
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                    >
                      {theme.primaryColor === swatch.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Hex Color Pickers */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Custom Primary Hex</label>
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Secondary Accent Hex</label>
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Highlight Accent Hex</label>
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY & RADIUS */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {/* Font Family Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Typography Font Family
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => updateTheme({ fontFamily: font })}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        theme.fontFamily === font
                          ? 'border-indigo-500 bg-slate-800 text-white font-bold'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span style={{ fontFamily: font }}>{font}</span>
                      {theme.fontFamily === font && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Corner Border Radius
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Sharp', val: '0.25rem' },
                    { label: 'Medium', val: '0.5rem' },
                    { label: 'Soft', val: '0.75rem' },
                    { label: 'Pill', val: '1.25rem' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      onClick={() => updateTheme({ borderRadius: r.val })}
                      className={`p-2 rounded-lg border text-center text-xs transition-all ${
                        theme.borderRadius === r.val
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APP CONFIG (SUPER ADMIN JOB PORTAL CONFIGURATION) */}
          {activeTab === 'appConfig' && (
            <div className="space-y-6">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span>Job Portal Global Platform Configuration Settings</span>
              </div>

              {/* General Portal Info */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Portal Identity & Branding
                </label>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-300 block mb-1">Portal Platform Title</span>
                    <input
                      type="text"
                      value={appConfig.siteName}
                      onChange={(e) => updateAppConfig({ siteName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-300 block mb-1">Tagline</span>
                    <input
                      type="text"
                      value={appConfig.siteTagline}
                      onChange={(e) => updateAppConfig({ siteTagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-300 block mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Support Contact Email
                    </span>
                    <input
                      type="email"
                      value={appConfig.supportEmail}
                      onChange={(e) => updateAppConfig({ supportEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-300 block mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Default Platform Currency
                    </span>
                    <SearchableSelect
                      options={CURRENCY_OPTIONS}
                      value={appConfig.defaultCurrency}
                      onChange={(val) => updateAppConfig({ defaultCurrency: val as any })}
                      searchPlaceholder="Search currency..."
                    />
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Platform Module Feature Toggles
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-200">Enable Placement Consultancies</span>
                    <button
                      onClick={() => updateAppConfig({ enableConsultancies: !appConfig.enableConsultancies })}
                      className="text-amber-400"
                    >
                      {appConfig.enableConsultancies ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-200">Allow Free Tier Job Posting</span>
                    <button
                      onClick={() => updateAppConfig({ enableFreeJobPosting: !appConfig.enableFreeJobPosting })}
                    >
                      {appConfig.enableFreeJobPosting ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-200">Enable Resume DB Downloads</span>
                    <button
                      onClick={() => updateAppConfig({ enableResumeDownloads: !appConfig.enableResumeDownloads })}
                    >
                      {appConfig.enableResumeDownloads ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-200">Require Company Tax/ID Verification</span>
                    <button
                      onClick={() => updateAppConfig({ requireCompanyTaxVerification: !appConfig.requireCompanyTaxVerification })}
                    >
                      {appConfig.requireCompanyTaxVerification ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-rose-400 font-bold">Platform Maintenance Mode</span>
                    <button
                      onClick={() => updateAppConfig({ maintenanceMode: !appConfig.maintenanceMode })}
                    >
                      {appConfig.maintenanceMode ? <ToggleRight className="w-6 h-6 text-rose-500" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Synced with NestJS</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-lg flex items-center gap-2 theme-transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
