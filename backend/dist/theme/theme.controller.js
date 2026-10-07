"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const theme_service_1 = require("./theme.service");
let ThemeController = class ThemeController {
    constructor(themeService) {
        this.themeService = themeService;
    }
    getActiveTheme() {
        return this.themeService.getActiveTheme();
    }
    updateActiveTheme(body) {
        return this.themeService.updateActiveTheme(body);
    }
    getPresets() {
        return this.themeService.getPresets();
    }
    resetToPreset(presetId) {
        return this.themeService.resetToPreset(presetId);
    }
};
exports.ThemeController = ThemeController;
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active theme configuration for website' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active theme config details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ThemeController.prototype, "getActiveTheme", null);
__decorate([
    (0, common_1.Put)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Update active theme configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated theme config details' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ThemeController.prototype, "updateActiveTheme", null);
__decorate([
    (0, common_1.Get)('presets'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of available theme presets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ThemeController.prototype, "getPresets", null);
__decorate([
    (0, common_1.Post)('reset/:presetId'),
    (0, swagger_1.ApiOperation)({ summary: 'Super Admin: Reset active theme to specified preset' }),
    __param(0, (0, common_1.Param)('presetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ThemeController.prototype, "resetToPreset", null);
exports.ThemeController = ThemeController = __decorate([
    (0, swagger_1.ApiTags)('Theme Management'),
    (0, common_1.Controller)('api/v1/theme'),
    __metadata("design:paramtypes", [theme_service_1.ThemeService])
], ThemeController);
//# sourceMappingURL=theme.controller.js.map