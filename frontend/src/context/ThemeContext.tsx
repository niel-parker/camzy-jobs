'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfig, applyThemeToCssVariables, DEFAULT_THEME_PRESETS, JobPortalSdk, ThemeConfig, ThemePreset, User } from '@job-portal/sdk';

interface ThemeContextType {
  theme: ThemeConfig;
  presets: ThemePreset[];
  appConfig: AppConfig;
  sdk: JobPortalSdk;
  user: User | null;
  isLoadingTheme: boolean;
  updateTheme: (partial: Partial<ThemeConfig>) => Promise<void>;
  applyPreset: (presetId: string) => Promise<void>;
  updateAppConfig: (partial: Partial<AppConfig>) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  loginAsCandidate: () => Promise<void>;
  loginAsEmployer: () => Promise<void>;
  loginAsSuperAdmin: () => Promise<void>;
  logout: () => void;
}

const defaultThemeConfig: ThemeConfig = {
  id: 'modern-slate-light',
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
};

const defaultAppConfig: AppConfig = {
  id: 'cfg-default-1',
  siteName: 'Camzy Jobs',
  siteTagline: 'Enterprise Multi-Tenant Job Portal for Companies & Employers',
  siteDescription: 'Enterprise talent acquisition platform built for companies to post jobs, manage applicants, and source top talent.',
  supportEmail: 'support@camzyjobs.com',
  defaultCurrency: 'USD',
  enableConsultancies: false,
  enableFreeJobPosting: true,
  enableResumeDownloads: true,
  requireEmailVerification: false,
  requireCompanyTaxVerification: true,
  maintenanceMode: false,
  defaultPlanId: 'starter',
  updatedAt: new Date().toISOString(),
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sdk] = useState(() => new JobPortalSdk());
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemeConfig);
  const [appConfig, setAppConfig] = useState<AppConfig>(defaultAppConfig);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);

  // Load active theme & app config from NestJS Backend or fallback
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [activeTheme, activeAppConfig] = await Promise.all([
          sdk.getActiveTheme().catch(() => defaultThemeConfig),
          sdk.getAppConfig().catch(() => defaultAppConfig),
        ]);
        setTheme(activeTheme);
        setAppConfig(activeAppConfig);
        applyThemeToCssVariables(activeTheme);
      } catch (err) {
        console.warn('Backend API offline, using local default configs.');
        applyThemeToCssVariables(defaultThemeConfig);
      } finally {
        setIsLoadingTheme(false);
      }

      // Check user session
      const savedToken = sdk.getToken();
      if (savedToken) {
        try {
          const currentUser = await sdk.getCurrentUser();
          setUser(currentUser);
        } catch {
          sdk.setToken(null);
        }
      }
    }

    loadInitialData();
  }, [sdk]);

  const updateTheme = async (partial: Partial<ThemeConfig>) => {
    const updated = { ...theme, ...partial };
    setTheme(updated);
    applyThemeToCssVariables(updated);

    try {
      await sdk.updateActiveTheme(partial);
    } catch (err) {
      console.warn('Could not sync theme to backend server:', err);
    }
  };

  const applyPreset = async (presetId: string) => {
    const targetPreset = DEFAULT_THEME_PRESETS.find(p => p.id === presetId);
    if (targetPreset) {
      const newConfig = { ...targetPreset.config, id: presetId, updatedAt: new Date().toISOString() };
      setTheme(newConfig);
      applyThemeToCssVariables(newConfig);

      try {
        await sdk.resetThemeToPreset(presetId);
      } catch (err) {
        console.warn('Could not sync preset reset to backend server:', err);
      }
    }
  };

  const updateAppConfig = async (partial: Partial<AppConfig>) => {
    const updated = { ...appConfig, ...partial };
    setAppConfig(updated);

    try {
      await sdk.updateAppConfig(partial);
    } catch (err) {
      console.warn('Could not sync app config to backend server:', err);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await sdk.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const loginAsCandidate = async () => {
    try {
      const res = await sdk.login('alex.candidate@example.com', 'password123');
      setUser(res.user);
    } catch {
      const mockUser: User = {
        id: 'usr-cand-1',
        email: 'alex.candidate@example.com',
        firstName: 'Alex',
        lastName: 'Morgan',
        role: 'CANDIDATE',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      };
      setUser(mockUser);
    }
  };

  const loginAsEmployer = async () => {
    try {
      const res = await sdk.login('recruiter@techcorp.com', 'password123');
      setUser(res.user);
    } catch {
      const mockUser: User = {
        id: 'usr-emp-1',
        email: 'recruiter@techcorp.com',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        role: 'RECRUITER',
        tenantId: 'tnt-techcorp',
        tenantName: 'TechCorp Global',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      };
      setUser(mockUser);
    }
  };

  const loginAsSuperAdmin = async () => {
    try {
      const res = await sdk.login('admin@camzyjobs.com', 'admin123');
      setUser(res.user);
    } catch {
      const mockUser: User = {
        id: 'usr-admin-1',
        email: 'admin@camzyjobs.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      };
      setUser(mockUser);
    }
  };

  const logout = () => {
    sdk.setToken(null);
    setUser(null);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        presets: DEFAULT_THEME_PRESETS,
        appConfig,
        sdk,
        user,
        isLoadingTheme,
        updateTheme,
        applyPreset,
        updateAppConfig,
        login,
        loginAsCandidate,
        loginAsEmployer,
        loginAsSuperAdmin,
        logout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
