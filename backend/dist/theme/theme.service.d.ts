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
export declare class ThemeService {
    private activeTheme;
    getActiveTheme(): ThemeConfigDto;
    updateActiveTheme(partial: Partial<ThemeConfigDto>): ThemeConfigDto;
    resetToPreset(presetId: string): ThemeConfigDto;
    getPresets(): ThemeConfigDto[];
}
