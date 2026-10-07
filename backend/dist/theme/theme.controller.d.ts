import { ThemeConfigDto, ThemeService } from './theme.service';
export declare class ThemeController {
    private readonly themeService;
    constructor(themeService: ThemeService);
    getActiveTheme(): ThemeConfigDto;
    updateActiveTheme(body: Partial<ThemeConfigDto>): ThemeConfigDto;
    getPresets(): ThemeConfigDto[];
    resetToPreset(presetId: string): ThemeConfigDto;
}
