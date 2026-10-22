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
exports.BillingTransaction = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["SUBSCRIPTION"] = "SUBSCRIPTION";
    TransactionType["QUOTA_TOPUP"] = "QUOTA_TOPUP";
    TransactionType["SEAT_ADDON"] = "SEAT_ADDON";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PAID"] = "PAID";
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let BillingTransaction = class BillingTransaction {
};
exports.BillingTransaction = BillingTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BillingTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 100 }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], BillingTransaction.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: true }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "tenantName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BillingTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: 'USD' }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionType, default: TransactionType.SUBSCRIPTION }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PAID }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'Stripe Card (•••• 4242)' }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], BillingTransaction.prototype, "planCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Object)
], BillingTransaction.prototype, "quotaDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BillingTransaction.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BillingTransaction.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BillingTransaction.prototype, "createdAt", void 0);
exports.BillingTransaction = BillingTransaction = __decorate([
    (0, typeorm_1.Entity)('billing_transactions')
], BillingTransaction);
//# sourceMappingURL=billing-transaction.entity.js.map