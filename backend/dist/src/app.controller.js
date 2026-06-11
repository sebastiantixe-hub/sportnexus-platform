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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
let AppController = class AppController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    healthCheck() {
        return {
            status: 'ok',
            app: 'Sports SaaS Platform API',
            timestamp: new Date().toISOString(),
        };
    }
    async dbDebug() {
        try {
            const userCount = await this.prisma.user.count();
            return {
                status: 'ok',
                database: 'connected',
                userCount,
                dbUrlHidden: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 25)}...` : 'not-set',
            };
        }
        catch (err) {
            return {
                status: 'error',
                message: err.message,
                stack: err.stack,
                env: {
                    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
                    DATABASE_URL_VAL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 25)}...` : 'not-set',
                },
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('health/db-debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "dbDebug", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map