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
exports.Auth0RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class Auth0RegisterDto {
    full_name;
    last_name;
    email;
    password;
    phone;
    birth_date;
    gender;
    nationality_type;
    document_type;
    document_number;
    selected_role;
    accepted_terms;
    accepted_privacy_policy;
    wants_course_notifications;
    document_type_peruano;
}
exports.Auth0RegisterDto = Auth0RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 8 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "birth_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['masculino', 'femenino', 'otro'] }),
    (0, class_validator_1.IsIn)(['masculino', 'femenino', 'otro']),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['peruano', 'extranjero'] }),
    (0, class_validator_1.IsIn)(['peruano', 'extranjero']),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "nationality_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['dni', 'pasaporte', 'carnet_extranjeria', 'otro'] }),
    (0, class_validator_1.IsIn)(['dni', 'pasaporte', 'carnet_extranjeria', 'otro']),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "document_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "document_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['super_admin', 'owner', 'coach', 'athlete'] }),
    (0, class_validator_1.IsIn)(['super_admin', 'owner', 'coach', 'athlete']),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "selected_role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Auth0RegisterDto.prototype, "accepted_terms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Auth0RegisterDto.prototype, "accepted_privacy_policy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Auth0RegisterDto.prototype, "wants_course_notifications", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.nationality_type === 'peruano'),
    (0, class_validator_1.IsIn)(['dni']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Auth0RegisterDto.prototype, "document_type_peruano", void 0);
//# sourceMappingURL=auth0-register.dto.js.map