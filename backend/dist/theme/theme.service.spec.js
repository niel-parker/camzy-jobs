"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const theme_service_1 = require("./theme.service");
const common_1 = require("@nestjs/common");
describe('ThemeService', () => {
    let themeService;
    beforeEach(() => {
        themeService = new theme_service_1.ThemeService();
    });
    it('should return active default theme', () => {
        const active = themeService.getActiveTheme();
        expect(active).toBeDefined();
        expect(active.id).toBe('modern-slate');
    });
    it('should update active theme properties', () => {
        const updated = themeService.updateActiveTheme({ primaryColor: '#ff0000', mode: 'light' });
        expect(updated.primaryColor).toBe('#ff0000');
        expect(updated.mode).toBe('light');
    });
    it('should reset theme to a valid preset', () => {
        const preset = themeService.resetToPreset('corporate-navy');
        expect(preset.id).toBe('corporate-navy');
        expect(preset.mode).toBe('light');
    });
    it('should throw NotFoundException for unknown preset', () => {
        expect(() => themeService.resetToPreset('non-existent')).toThrow(common_1.NotFoundException);
    });
    it('should return list of presets', () => {
        const presets = themeService.getPresets();
        expect(presets.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=theme.service.spec.js.map