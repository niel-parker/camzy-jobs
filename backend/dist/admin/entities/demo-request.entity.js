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
exports.DemoRequest = exports.DemoRequestStatus = void 0;
const typeorm_1 = require("typeorm");
var DemoRequestStatus;
(function (DemoRequestStatus) {
    DemoRequestStatus["PENDING"] = "PENDING";
    DemoRequestStatus["CONTACTED"] = "CONTACTED";
    DemoRequestStatus["SCHEDULED"] = "SCHEDULED";
    DemoRequestStatus["COMPLETED"] = "COMPLETED";
    DemoRequestStatus["DISQUALIFIED"] = "DISQUALIFIED";
})(DemoRequestStatus || (exports.DemoRequestStatus = DemoRequestStatus = {}));
let DemoRequest = class DemoRequest {
};
exports.DemoRequest = DemoRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DemoRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], DemoRequest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], DemoRequest.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], DemoRequest.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], DemoRequest.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], DemoRequest.prototype, "hiresCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], DemoRequest.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'REQUEST_A_DEMO' }),
    __metadata("design:type", String)
], DemoRequest.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: DemoRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], DemoRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DemoRequest.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DemoRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DemoRequest.prototype, "updatedAt", void 0);
exports.DemoRequest = DemoRequest = __decorate([
    (0, typeorm_1.Entity)('demo_requests')
], DemoRequest);
//# sourceMappingURL=demo-request.entity.js.map