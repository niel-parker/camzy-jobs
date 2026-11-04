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
exports.GovtExamCalendarItem = void 0;
const typeorm_1 = require("typeorm");
let GovtExamCalendarItem = class GovtExamCalendarItem {
};
exports.GovtExamCalendarItem = GovtExamCalendarItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "day", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: '2026' }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300 }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "titleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "titleHi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "board", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, default: 'Computer Based Exam' }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], GovtExamCalendarItem.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GovtExamCalendarItem.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], GovtExamCalendarItem.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GovtExamCalendarItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GovtExamCalendarItem.prototype, "updatedAt", void 0);
exports.GovtExamCalendarItem = GovtExamCalendarItem = __decorate([
    (0, typeorm_1.Entity)('govt_exam_calendar')
], GovtExamCalendarItem);
//# sourceMappingURL=govt-exam-calendar.entity.js.map