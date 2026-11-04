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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
const tenants_service_1 = require("./tenants.service");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async findAll() {
        return await this.tenantsService.findAll();
    }
    async getLogoFile(filename, res) {
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), 'uploads', 'logos', safeFilename);
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('Requested company logo file not found.');
        }
        return res.sendFile(filePath);
    }
    async findOne(id) {
        return await this.tenantsService.findOne(id);
    }
    async update(id, updateData) {
        return await this.tenantsService.update(id, updateData);
    }
    async uploadLogo(id, file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No image file uploaded or invalid format.');
        }
        const relativeUrl = `/uploads/logos/${file.filename}`;
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const fullUrl = `${protocol}://${host}${relativeUrl}`;
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
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of active company tenants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('logos/:filename'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream uploaded company logo image' }),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getLogoFile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific company tenant details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update company tenant profile (Company name cannot be modified)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/upload-logo'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload company logo image (Max 5MB)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
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
                return cb(new common_1.BadRequestException('Only image files (PNG, JPG, JPEG, WEBP, SVG) are allowed for company logo.'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "uploadLogo", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Companies & Tenants'),
    (0, common_1.Controller)('api/v1/tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map