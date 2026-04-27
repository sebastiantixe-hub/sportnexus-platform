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
exports.WearablesController = void 0;
const common_1 = require("@nestjs/common");
const wearables_service_1 = require("./wearables.service");
const fitbit_oauth_service_1 = require("./fitbit-oauth.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WearablesController = class WearablesController {
    wearablesService;
    fitbitOAuthService;
    constructor(wearablesService, fitbitOAuthService) {
        this.wearablesService = wearablesService;
        this.fitbitOAuthService = fitbitOAuthService;
    }
    async syncData(req, data) {
        return this.wearablesService.syncData(req.user.id, data);
    }
    async getMetrics(req) {
        return this.wearablesService.getMetrics(req.user.id);
    }
    async getConnections(req) {
        return this.fitbitOAuthService.getConnectionStatus(req.user.id);
    }
    async getFitbitAuthUrl(req, redirectUri) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const callbackUri = redirectUri || `${frontendUrl}/dashboard/wearables/fitbit-callback`;
        const url = this.fitbitOAuthService.getAuthorizationUrl(callbackUri);
        return { url, callbackUri };
    }
    async fitbitCallback(req, body) {
        if (!body.code) {
            return { success: false, message: 'Código de autorización faltante' };
        }
        const tokens = await this.fitbitOAuthService.exchangeCodeForTokens(req.user.id, body.code, body.redirect_uri);
        return {
            success: true,
            message: '¡Fitbit conectado exitosamente! Sincronizando datos...',
            expiresIn: tokens.expiresIn,
        };
    }
    async syncFitbitData(req) {
        const data = await this.fitbitOAuthService.syncFitbitData(req.user.id);
        return {
            success: true,
            message: 'Datos de Fitbit sincronizados desde la API oficial',
            data,
        };
    }
    async getFitbitStatus(req) {
        return this.fitbitOAuthService.getConnectionStatus(req.user.id);
    }
    async disconnectFitbit(req) {
        await this.fitbitOAuthService.disconnect(req.user.id);
        return { success: true, message: 'Fitbit desconectado correctamente' };
    }
};
exports.WearablesController = WearablesController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "syncData", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('connections'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Get)('fitbit/auth-url'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('redirect_uri')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "getFitbitAuthUrl", null);
__decorate([
    (0, common_1.Post)('fitbit/callback'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "fitbitCallback", null);
__decorate([
    (0, common_1.Post)('fitbit/sync'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "syncFitbitData", null);
__decorate([
    (0, common_1.Get)('fitbit/status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "getFitbitStatus", null);
__decorate([
    (0, common_1.Delete)('fitbit/disconnect'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WearablesController.prototype, "disconnectFitbit", null);
exports.WearablesController = WearablesController = __decorate([
    (0, common_1.Controller)('wearables'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wearables_service_1.WearablesService,
        fitbit_oauth_service_1.FitbitOAuthService])
], WearablesController);
//# sourceMappingURL=wearables.controller.js.map