import { 
  Body, Controller, Get, Param, Put, Post, Query, 
  UseInterceptors, UploadedFile, BadRequestException, Req, Res 
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { CandidatesService, CandidateProfileDto } from './candidates.service';

@ApiTags('Candidate Profiles & Talent Database Sourcing')
@Controller('api/v1/candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post('upload-resume')
  @ApiOperation({ summary: 'Upload candidate resume document (PDF, DOC, DOCX) to server storage' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'resumes');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
          const ext = path.extname(file.originalname);
          const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
          cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
    }),
  )
  async uploadResume(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid file format.');
    }
    const relativeUrl = `/uploads/resumes/${file.filename}`;
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

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

  @Get('resumes/:filename')
  @ApiOperation({ summary: 'Download or stream uploaded candidate resume PDF' })
  async getResumeFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', 'resumes', safeFilename);
    if (!fs.existsSync(filePath)) {
      const fallback = path.join(process.cwd(), 'uploads', 'resumes', 'sample-resume.pdf');
      if (fs.existsSync(fallback)) {
        return res.sendFile(fallback);
      }
      throw new BadRequestException('Requested resume file not found on server.');
    }
    return res.sendFile(filePath);
  }

  @Post('upload-avatar')
  @ApiOperation({ summary: 'Upload candidate profile avatar picture (JPG, PNG, WEBP)' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
          cb(null, `avatar_${cleanName}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No image file uploaded or invalid file format.');
    }
    const relativeUrl = `/uploads/avatars/${file.filename}`;
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

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

  @Get('avatars/:filename')
  @ApiOperation({ summary: 'Download or stream uploaded candidate avatar image' })
  async getAvatarFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', 'avatars', safeFilename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Requested avatar file not found on server.');
    }
    return res.sendFile(filePath);
  }

  @Get()
  @ApiOperation({ summary: 'Search candidate talent database (Guarded by Company Resume Access Plan)' })
  @ApiQuery({ name: 'skill', required: false })
  @ApiQuery({ name: 'noticePeriod', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'minExp', required: false })
  @ApiQuery({ name: 'maxSalary', required: false })
  async findAll(
    @Query('skill') skill?: string,
    @Query('noticePeriod') noticePeriod?: string,
    @Query('city') city?: string,
    @Query('minExp') minExp?: string,
    @Query('maxSalary') maxSalary?: string,
  ): Promise<CandidateProfileDto[]> {
    return await this.candidatesService.findAll({
      skill,
      noticePeriod,
      city,
      minExp: minExp ? Number(minExp) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate profile details' })
  async findOne(@Param('id') id: string): Promise<CandidateProfileDto> {
    return await this.candidatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Candidate: Update profile details & resume' })
  async updateProfile(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<CandidateProfileDto> {
    return await this.candidatesService.updateProfile(id, body);
  }

  @Post(':id/saved-jobs/:jobId')
  @ApiOperation({ summary: 'Toggle save/bookmark job for candidate' })
  async toggleSaveJob(
    @Param('id') id: string,
    @Param('jobId') jobId: string,
  ) {
    return await this.candidatesService.toggleSaveJob(id, jobId);
  }

  @Get(':id/saved-jobs')
  @ApiOperation({ summary: 'Get all bookmarked/saved jobs for candidate' })
  async getSavedJobs(@Param('id') id: string) {
    return await this.candidatesService.getSavedJobs(id);
  }
}
