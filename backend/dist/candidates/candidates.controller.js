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
exports.CandidatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
const candidates_service_1 = require("./candidates.service");
let CandidatesController = class CandidatesController {
    constructor(candidatesService) {
        this.candidatesService = candidatesService;
    }
    async uploadResume(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded or invalid file format.');
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
    async getResumeFile(filename, res) {
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), 'uploads', 'resumes', safeFilename);
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('Requested resume file not found on server.');
        }
        return res.sendFile(filePath);
    }
    async uploadAvatar(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No image file uploaded or invalid file format.');
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
    async getAvatarFile(filename, res) {
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), 'uploads', 'avatars', safeFilename);
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('Requested avatar file not found on server.');
        }
        return res.sendFile(filePath);
    }
    async findAll(skill, noticePeriod, city, minExp, maxSalary) {
        return await this.candidatesService.findAll({
            skill,
            noticePeriod,
            city,
            minExp: minExp ? Number(minExp) : undefined,
            maxSalary: maxSalary ? Number(maxSalary) : undefined,
        });
    }
    async findOne(id) {
        return await this.candidatesService.findOne(id);
    }
    async updateProfile(id, body) {
        return await this.candidatesService.updateProfile(id, body);
    }
    async toggleSaveJob(id, jobId) {
        return await this.candidatesService.toggleSaveJob(id, jobId);
    }
    async getSavedJobs(id) {
        return await this.candidatesService.getSavedJobs(id);
    }
};
exports.CandidatesController = CandidatesController;
__decorate([
    (0, common_1.Post)('upload-resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload candidate resume document (PDF, DOC, DOCX) to server storage' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
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
        limits: { fileSize: 15 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "uploadResume", null);
__decorate([
    (0, common_1.Get)('resumes/:filename'),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream uploaded candidate resume PDF' }),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getResumeFile", null);
__decorate([
    (0, common_1.Post)('upload-avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload candidate profile avatar picture (JPG, PNG, WEBP)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
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
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)('avatars/:filename'),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream uploaded candidate avatar image' }),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getAvatarFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search candidate talent database (Guarded by Company Resume Access Plan)' }),
    (0, swagger_1.ApiQuery)({ name: 'skill', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'noticePeriod', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'minExp', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxSalary', required: false }),
    __param(0, (0, common_1.Query)('skill')),
    __param(1, (0, common_1.Query)('noticePeriod')),
    __param(2, (0, common_1.Query)('city')),
    __param(3, (0, common_1.Query)('minExp')),
    __param(4, (0, common_1.Query)('maxSalary')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get candidate profile details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Candidate: Update profile details & resume' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)(':id/saved-jobs/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle save/bookmark job for candidate' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "toggleSaveJob", null);
__decorate([
    (0, common_1.Get)(':id/saved-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookmarked/saved jobs for candidate' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getSavedJobs", null);
exports.CandidatesController = CandidatesController = __decorate([
    (0, swagger_1.ApiTags)('Candidate Profiles & Talent Database Sourcing'),
    (0, common_1.Controller)('api/v1/candidates'),
    __metadata("design:paramtypes", [candidates_service_1.CandidatesService])
], CandidatesController);
//# sourceMappingURL=candidates.controller.js.map