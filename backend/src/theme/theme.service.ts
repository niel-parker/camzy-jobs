import { Injectable, NotFoundException } from '@nestjs/common';

export interface ThemeConfigDto {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  primaryHover: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Roboto' | 'Poppins';
  headerStyle: 'solid' | 'glassmorphism' | 'gradient';
  isDefault: boolean;
  updatedAt: string;
}

const PRESET_THEMES: Record<string, ThemeConfigDto> = {
  'modern-slate': {
    id: 'modern-slate',
    name: 'Modern Slate & Indigo (Light)',
    mode: 'light',
    primaryColor: '#4f46e5',
    primaryHover: '#4338ca',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    borderRadius: '0.75rem',
    fontFamily: 'Inter',
    headerStyle: 'glassmorphism',
    isDefault: true,
    updatedAt: new Date().toISOString(),
  },
  'emerald-talent': {
    id: 'emerald-talent',
    name: 'Emerald Talent',
    mode: 'dark',
    primaryColor: '#10b981',
    primaryHover: '#059669',
    secondaryColor: '#14b8a6',
    accentColor: '#3b82f6',
    backgroundColor: '#061712',
    surfaceColor: '#0d2820',
    textColor: '#f0fdf4',
    borderRadius: '0.5rem',
    fontFamily: 'Plus Jakarta Sans',
    headerStyle: 'solid',
    isDefault: false,
    updatedAt: new Date().toISOString(),
  },
  'cyberpunk-purple': {
    id: 'cyberpunk-purple',
    name: 'Cyber Neon Purple',
    mode: 'dark',
    primaryColor: '#a855f7',
    primaryHover: '#9333ea',
    secondaryColor: '#ec4899',
    accentColor: '#22d3ee',
    backgroundColor: '#0c0714',
    surfaceColor: '#170d29',
    textColor: '#faf5ff',
    borderRadius: '1rem',
    fontFamily: 'Outfit',
    headerStyle: 'gradient',
    isDefault: false,
    updatedAt: new Date().toISOString(),
  },
  'corporate-navy': {
    id: 'corporate-navy',
    name: 'Corporate Executive Navy',
    mode: 'light',
    primaryColor: '#1e40af',
    primaryHover: '#1e3a8a',
    secondaryColor: '#0284c7',
    accentColor: '#f59e0b',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    borderRadius: '0.375rem',
    fontFamily: 'Inter',
    headerStyle: 'solid',
    isDefault: false,
    updatedAt: new Date().toISOString(),
  }
};

@Injectable()
export class ThemeService {
  private activeTheme: ThemeConfigDto = { ...PRESET_THEMES['modern-slate'] };

  getActiveTheme(): ThemeConfigDto {
    return this.activeTheme;
  }

  updateActiveTheme(partial: Partial<ThemeConfigDto>): ThemeConfigDto {
    this.activeTheme = {
      ...this.activeTheme,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    return this.activeTheme;
  }

  resetToPreset(presetId: string): ThemeConfigDto {
    const preset = PRESET_THEMES[presetId];
    if (!preset) {
      throw new NotFoundException(`Preset '${presetId}' not found`);
    }
    this.activeTheme = {
      ...preset,
      updatedAt: new Date().toISOString(),
    };
    return this.activeTheme;
  }

  getPresets(): ThemeConfigDto[] {
    return Object.values(PRESET_THEMES);
  }
}
