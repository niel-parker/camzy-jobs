import { ThemeConfig, ThemePreset } from './types';
export declare const DEFAULT_THEME_PRESETS: ThemePreset[];
export declare function applyThemeToCssVariables(theme: Partial<ThemeConfig>, targetElement?: HTMLElement): void;
