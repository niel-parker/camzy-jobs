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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getClientMeta(req) {
        const rawForwarded = req.headers['x-forwarded-for'];
        const forwarded = Array.isArray(rawForwarded) ? rawForwarded[0] : rawForwarded;
        const ipAddress = forwarded || req.socket?.remoteAddress || req.ip || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        return { ipAddress, userAgent };
    }
    async checkDomain(email, domain) {
        const target = email || domain || '';
        return await this.authService.checkDomainRestriction(target);
    }
    async login(body, req) {
        const pwd = body.password || body.password_hash || body.passwordHash;
        const meta = this.getClientMeta(req);
        return await this.authService.login(body.email, pwd, meta);
    }
    async registerCompany(body) {
        return await this.authService.registerCompany(body);
    }
    async registerCandidate(body) {
        return await this.authService.registerCandidate(body);
    }
    async requestOtp(body) {
        const target = body.identifier || body.email || body.phone || '';
        return await this.authService.requestOtp(target);
    }
    async verifyOtp(body, req) {
        const target = body.identifier || body.email || body.phone || '';
        const meta = this.getClientMeta(req);
        return await this.authService.verifyOtp(target, body.otp, meta);
    }
    async shareJob(body) {
        return await this.authService.sendJobShareEmail(body);
    }
    async getCurrentUser(authHeader) {
        const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
        return await this.authService.getCurrentUser(token);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('check-domain'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if an email domain is restricted for employer registration' }),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkDomain", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user & retrieve JWT access token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/company'),
    (0, swagger_1.ApiOperation)({ summary: 'Onboard new hiring company tenant & admin user into database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCompany", null);
__decorate([
    (0, common_1.Post)('register/candidate'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new job candidate account into database' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCandidate", null);
__decorate([
    (0, common_1.Post)('request-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Request OTP verification code for login/registration via Email or Phone' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP code and log in or register user' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('share-job'),
    (0, swagger_1.ApiOperation)({ summary: 'Share job recommendation with a friend via email' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "shareJob", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get profile of current authenticated user' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('api/v1/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map