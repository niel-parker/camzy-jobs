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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginActivity = exports.LoginMethod = exports.LoginStatus = void 0;
const typeorm_1 = require("typeorm");
var LoginStatus;
(function (LoginStatus) {
    LoginStatus["SUCCESS"] = "SUCCESS";
    LoginStatus["FAILED"] = "FAILED";
})(LoginStatus || (exports.LoginStatus = LoginStatus = {}));
var LoginMethod;
(function (LoginMethod) {
    LoginMethod["PASSWORD"] = "PASSWORD";
    LoginMethod["OTP"] = "OTP";
    LoginMethod["GOOGLE"] = "GOOGLE";
    LoginMethod["MAGIC_LINK"] = "MAGIC_LINK";
})(LoginMethod || (exports.LoginMethod = LoginMethod = {}));
let LoginActivity = class LoginActivity {
};
exports.LoginActivity = LoginActivity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoginActivity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], LoginActivity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, default: '127.0.0.1' }),
    __metadata("design:type", String)
], LoginActivity.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'Desktop' }),
    __metadata("design:type", String)
], LoginActivity.prototype, "deviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "browser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "os", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: LoginStatus.SUCCESS }),
    __metadata("design:type", String)
], LoginActivity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: LoginMethod.PASSWORD }),
    __metadata("design:type", String)
], LoginActivity.prototype, "loginMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], LoginActivity.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LoginActivity.prototype, "createdAt", void 0);
exports.LoginActivity = LoginActivity = __decorate([
    (0, typeorm_1.Entity)('login_activities'),
    (0, typeorm_1.Index)(['email', 'createdAt']),
    (0, typeorm_1.Index)(['status', 'createdAt'])
], LoginActivity);
//# sourceMappingURL=login-activity.entity.js.map