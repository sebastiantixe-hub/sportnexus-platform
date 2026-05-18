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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const health_service_1 = require("./health.service");
const create_health_metric_dto_1 = require("./dto/create-health-metric.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let HealthController = class HealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    async create(req, dto) {
        return this.healthService.createOrUpdate(req.user.userId, dto);
    }
    async findAll(req) {
        return this.healthService.findAll(req.user.userId);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Post)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update a health metric' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_health_metric_dto_1.CreateHealthMetricDto]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all health metrics for current user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "findAll", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map