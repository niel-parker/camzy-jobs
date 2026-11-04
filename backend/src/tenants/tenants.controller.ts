import { 
  Body, Controller, Get, Param, Put, Post, Req, Res, 
  UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { TenantsService } from './tenants.service';

@ApiTags('Companies & Tenants')
@Controller('api/v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of active company tenants' })
  async findAll() {
    return await this.tenantsService.findAll();
  }

  @Get('logos/:filename')
  @ApiOperation({ summary: 'Stream uploaded company logo image' })
  async getLogoFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', 'logos', safeFilename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Requested company logo file not found.');
    }
    return res.sendFile(filePath);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific company tenant details' })
  async findOne(@Param('id') id: string) {
    return await this.tenantsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company tenant profile (Company name cannot be modified)' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return await this.tenantsService.update(id, updateData);
  }

  @Post(':id/upload-logo')
  @ApiOperation({ summary: 'Upload company logo image (Max 5MB)' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'logos');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
          const ext = path.extname(file.originalname).toLowerCase() || '.png';
          const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
          cb(null, `logo_${cleanName}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files (PNG, JPG, JPEG, WEBP, SVG) are allowed for company logo.'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file uploaded or invalid format.');
    }

    const relativeUrl = `/uploads/logos/${file.filename}`;
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    // Update tenant logoUrl directly in database
    await this.tenantsService.update(id, { logoUrl: relativeUrl });

    return {
      success: true,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      url: relativeUrl,
      fullUrl,
    };
  }
}
