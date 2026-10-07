import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThemeConfigDto, ThemeService } from './theme.service';

@ApiTags('Theme Management')
@Controller('api/v1/theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get current active theme configuration for website' })
  @ApiResponse({ status: 200, description: 'Active theme config details' })
  getActiveTheme(): ThemeConfigDto {
    return this.themeService.getActiveTheme();
  }

  @Put('active')
  @ApiOperation({ summary: 'Super Admin: Update active theme configuration' })
  @ApiResponse({ status: 200, description: 'Updated theme config details' })
  updateActiveTheme(@Body() body: Partial<ThemeConfigDto>): ThemeConfigDto {
    return this.themeService.updateActiveTheme(body);
  }

  @Get('presets')
  @ApiOperation({ summary: 'Get list of available theme presets' })
  getPresets(): ThemeConfigDto[] {
    return this.themeService.getPresets();
  }

  @Post('reset/:presetId')
  @ApiOperation({ summary: 'Super Admin: Reset active theme to specified preset' })
  resetToPreset(@Param('presetId') presetId: string): ThemeConfigDto {
    return this.themeService.resetToPreset(presetId);
  }
}
