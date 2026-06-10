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
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const any_auth_guard_1 = require("./guards/any-auth.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const roles_decorator_1 = require("./decorators/roles.decorator");
const roles_guard_1 = require("./guards/roles.guard");
const client_1 = require("@prisma/client");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    login(dto) {
        return this.authService.login(dto);
    }
    refresh(dto) {
        if (!dto.userId || !dto.refreshToken) {
            throw new Error('Missing userId or refreshToken');
        }
        return this.authService.refreshTokens(dto.userId, dto.refreshToken);
    }
    getMe(user) {
        return this.authService.getMe(user.id);
    }
    updateProfile(user, dto) {
        return this.authService.updateProfile(user.id, dto);
    }
    switchRole(user, dto) {
        return this.authService.switchRole(user.id, dto.role);
    }
    getDashboardStats(user) {
        return this.authService.getDashboardStats(user.id, user.role);
    }
    invite(user, dto) {
        return this.authService.inviteUser(user, dto.email, dto.role, dto.gymId);
    }
    async seed70AthletesSecret(key) {
        if (key !== 'Hercix2026') {
            return { success: false, message: 'Invalid secret key' };
        }
        const { exec } = require('child_process');
        exec('node seed-70-athletes-auth0.js', (err, stdout, stderr) => {
            if (err) {
                console.error('Seed athletes error:', err);
            }
            else {
                console.log('Seed athletes stdout:', stdout);
            }
        });
        return {
            success: true,
            message: 'Sembrado de 70 atletas iniciado en segundo plano. Monitorea el progreso en /api/auth/seed-status'
        };
    }
    async seedMarioDbSecret(key) {
        if (key !== 'Hercix2026') {
            return { success: false, message: 'Invalid secret key' };
        }
        const { exec } = require('child_process');
        exec('node seed-mario.js', (err, stdout, stderr) => {
            if (err) {
                console.error('Seed background error:', err);
            }
            else {
                console.log('Seed background stdout:', stdout);
            }
        });
        return {
            success: true,
            message: 'Sembrado de base de datos iniciado en segundo plano. Monitorea el progreso en /api/auth/seed-status'
        };
    }
    async seedStatus() {
        const fs = require('fs');
        try {
            if (fs.existsSync('seed-progress.json')) {
                const data = fs.readFileSync('seed-progress.json', 'utf8');
                return JSON.parse(data);
            }
            return { status: 'No iniciado o en espera', percent: 0 };
        }
        catch (err) {
            return { status: 'Error al leer el estado', error: err.message };
        }
    }
    async purgeProductionDataSecure(key) {
        if (key !== 'Hercix2026') {
            return { success: false, message: 'Invalid secret key' };
        }
        const { exec } = require('child_process');
        exec('node cleanup-demo-data.js', (err, stdout, stderr) => {
            if (err) {
                console.error('Purge background error:', err);
            }
            else {
                console.log('Purge background stdout:', stdout);
            }
        });
        return {
            success: true,
            message: 'Limpieza de base de datos iniciada en segundo plano.'
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login and receive JWT tokens' }),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Refresh JWT tokens' }),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile (JWT or Auth0)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(any_auth_guard_1.AnyAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile (JWT or Auth0)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(any_auth_guard_1.AnyAuthGuard),
    (0, common_1.Patch)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Switch active user profile role' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(any_auth_guard_1.AnyAuthGuard),
    (0, common_1.Post)('switch-role'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "switchRole", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(any_auth_guard_1.AnyAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getDashboardStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Invite a new gym owner or coach' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('invite'),
    (0, common_1.UseGuards)(any_auth_guard_1.AnyAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.GYM_OWNER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "invite", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Secret seed for 70 athletes' }),
    (0, common_1.Get)('seed-70-athletes-secret'),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "seed70AthletesSecret", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Secret seed for Mario DB' }),
    (0, common_1.Get)('seed-mario-db-secret'),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "seedMarioDbSecret", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Check status of secret seed' }),
    (0, common_1.Get)('seed-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "seedStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Secret purge for Mario DB' }),
    (0, common_1.Get)('purge-production-data-secure'),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "purgeProductionDataSecure", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map