import { ThemeConfig, ThemePreset } from './types';

export const DEFAULT_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'modern-slate',
    name: 'Modern Slate & Indigo (Light)',
    description: 'Enterprise light mode with vibrant indigo accents and crisp slate backgrounds',
    config: {
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
    }
  },
  {
    id: 'clean-light',
    name: 'Pure Minimalist (Light)',
    description: 'Sleek, high-contrast light theme optimized for readability and clean corporate branding',
    config: {
      name: 'Pure Minimalist (Light)',
      mode: 'light',
      primaryColor: '#2563eb',
      primaryHover: '#1d4ed8',
      secondaryColor: '#4f46e5',
      accentColor: '#0d9488',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '0.75rem',
      fontFamily: 'Inter',
      headerStyle: 'solid',
      isDefault: false,
    }
  },
  {
    id: 'emerald-light',
    name: 'Emerald Mint (Light)',
    description: 'Refreshing light mint theme tailored for recruitment & modern talent growth',
    config: {
      name: 'Emerald Mint (Light)',
      mode: 'light',
      primaryColor: '#059669',
      primaryHover: '#047857',
      secondaryColor: '#0d9488',
      accentColor: '#2563eb',
      backgroundColor: '#f0fdf4',
      surfaceColor: '#ffffff',
      textColor: '#064e3b',
      borderRadius: '0.5rem',
      fontFamily: 'Plus Jakarta Sans',
      headerStyle: 'solid',
      isDefault: false,
    }
  },
  {
    id: 'corporate-navy',
    name: 'Executive Navy (Light)',
    description: 'Authoritative executive light theme for enterprise job portals & corporate clients',
    config: {
      name: 'Executive Navy (Light)',
      mode: 'light',
      primaryColor: '#1e40af',
      primaryHover: '#1e3a8a',
      secondaryColor: '#0284c7',
      accentColor: '#d97706',
      backgroundColor: '#f1f5f9',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '0.375rem',
      fontFamily: 'Inter',
      headerStyle: 'solid',
      isDefault: false,
    }
  },
  {
    id: 'cyberpunk-purple',
    name: 'Cyber Neon Purple (Dark)',
    description: 'Futuristic purple & neon cyan high-contrast theme',
    config: {
      name: 'Cyber Neon Purple (Dark)',
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
    }
  }
];

export function applyThemeToCssVariables(theme: Partial<ThemeConfig>, targetElement?: HTMLElement): void {
  if (typeof window === 'undefined') return;
  const root = targetElement || document.documentElement;

  if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor);
  if (theme.primaryHover) root.style.setProperty('--color-primary-hover', theme.primaryHover);
  if (theme.secondaryColor) root.style.setProperty('--color-secondary', theme.secondaryColor);
  if (theme.accentColor) root.style.setProperty('--color-accent', theme.accentColor);
  if (theme.backgroundColor) root.style.setProperty('--color-bg', theme.backgroundColor);
  if (theme.surfaceColor) root.style.setProperty('--color-surface', theme.surfaceColor);
  if (theme.textColor) root.style.setProperty('--color-text', theme.textColor);
  if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);
  if (theme.fontFamily) root.style.setProperty('--font-main', `'${theme.fontFamily}', sans-serif`);

  // Synchronize 'dark' / 'light' class on <html> for Tailwind CSS
  if (theme.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else if (theme.mode === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  // Apply custom CSS Variables if provided
  if (theme.customCssVars) {
    Object.entries(theme.customCssVars).forEach(([key, value]) => {
      root.style.setProperty(key.startsWith('--') ? key : `--${key}`, value);
    });
  }
}
