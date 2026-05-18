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
exports.CreateHealthMetricDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateHealthMetricDto {
    type;
    value;
    unit;
    date;
}
exports.CreateHealthMetricDto = CreateHealthMetricDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.HealthMetricType),
    __metadata("design:type", String)
], CreateHealthMetricDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateHealthMetricDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHealthMetricDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateHealthMetricDto.prototype, "date", void 0);
//# sourceMappingURL=create-health-metric.dto.js.map