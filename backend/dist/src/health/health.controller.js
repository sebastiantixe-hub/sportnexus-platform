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
        return this.healthService.createOrUpdate(req.user.id, dto);
    }
    async findAll(req) {
        return this.healthService.findAll(req.user.id);
    }
    async findUserMetrics(userId) {
        return this.healthService.findAll(userId);
    }
    async findGoal(req) {
        return this.healthService.findGoal(req.user.id);
    }
    async findUserGoal(userId) {
        return this.healthService.findGoal(userId);
    }
    async updateGoal(req, dto) {
        return this.healthService.createOrUpdateGoal(req.user.id, dto);
    }
    async getMETs() {
        return this.healthService.findMETs();
    }
    async upsertMET(dto) {
        return this.healthService.createOrUpdateMET(dto);
    }
    async deleteMET(id) {
        return this.healthService.deleteMET(id);
    }
    async addRecommendation(req, dto) {
        return this.healthService.createRecommendation(req.user.id, dto.athleteId, dto.observation);
    }
    async getRecommendations(athleteId) {
        return this.healthService.findRecommendations(athleteId);
    }
    async getCoachAthletes(req) {
        return this.healthService.getCoachAthletes(req.user.id);
    }
    async getOwnerStats(req) {
        return this.healthService.getOwnerStats(req.user.id);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Post)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar o actualizar una métrica de salud' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_health_metric_dto_1.CreateHealthMetricDto]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las métricas del usuario actual' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('metrics/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las métricas de un usuario específico' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "findUserMetrics", null);
__decorate([
    (0, common_1.Get)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener las metas de salud del usuario' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "findGoal", null);
__decorate([
    (0, common_1.Get)('goals/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener las metas de salud de un usuario específico' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "findUserGoal", null);
__decorate([
    (0, common_1.Post)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear o actualizar metas de salud' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "updateGoal", null);
__decorate([
    (0, common_1.Get)('admin/met'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista maestra de valores MET' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getMETs", null);
__decorate([
    (0, common_1.Post)('admin/met'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear o actualizar valor MET de actividad' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "upsertMET", null);
__decorate([
    (0, common_1.Delete)('admin/met/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar configuración MET de actividad' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "deleteMET", null);
__decorate([
    (0, common_1.Post)('recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar recomendación/observación de coach para un atleta' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "addRecommendation", null);
__decorate([
    (0, common_1.Get)('recommendations/:athleteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener recomendaciones de coach de un atleta' }),
    __param(0, (0, common_1.Param)('athleteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('coach/athletes'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener listado y rendimiento de atletas del coach' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getCoachAthletes", null);
__decorate([
    (0, common_1.Get)('owner/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener analíticas del gimnasio para dueños' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getOwnerStats", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map