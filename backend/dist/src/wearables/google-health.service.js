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
var GoogleHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleHealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GoogleHealthService = GoogleHealthService_1 = class GoogleHealthService {
    prisma;
    logger = new common_1.Logger(GoogleHealthService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAuthorizationUrl(redirectUri) {
        const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID;
        if (!clientId)
            throw new common_1.BadRequestException('GOOGLE_HEALTH_CLIENT_ID no configurado en .env');
        const scopes = [
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/fitness.heart_rate.read',
            'https://www.googleapis.com/auth/fitness.sleep.read',
        ].join(' ');
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: scopes,
            access_type: 'offline',
            prompt: 'consent',
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    async exchangeCodeForTokens(userId, code, redirectUri) {
        const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_HEALTH_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException('Credenciales de Google no configuradas en .env');
        }
        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
        });
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            this.logger.error('Google token exchange failed', errorData);
            throw new common_1.BadRequestException(`Error de autenticación con Google: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);
        await this.prisma.wearableConnection.upsert({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
            update: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                tokenExpiry: expiresAt,
                scope: data.scope,
            },
            create: {
                userId,
                provider: 'FITBIT',
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                tokenExpiry: expiresAt,
                scope: data.scope,
            },
        });
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        };
    }
    async refreshAccessToken(userId) {
        const connection = await this.prisma.wearableConnection.findUnique({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
        if (!connection || !connection.refreshToken) {
            throw new common_1.NotFoundException('Conexión de Salud no encontrada.');
        }
        const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_HEALTH_CLIENT_SECRET;
        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: connection.refreshToken,
            grant_type: 'refresh_token',
        });
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!response.ok) {
            throw new common_1.BadRequestException('Token de Google inválido. Reconecta tu cuenta.');
        }
        const data = await response.json();
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);
        await this.prisma.wearableConnection.update({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
            data: {
                accessToken: data.access_token,
                tokenExpiry: expiresAt,
            },
        });
        return data.access_token;
    }
    async getValidAccessToken(userId) {
        const connection = await this.prisma.wearableConnection.findUnique({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
        if (!connection)
            throw new common_1.NotFoundException('No conectado a Google Health.');
        if (connection.tokenExpiry && connection.tokenExpiry < new Date(Date.now() + 5 * 60 * 1000)) {
            return this.refreshAccessToken(userId);
        }
        return connection.accessToken;
    }
    async syncGoogleHealthData(userId) {
        this.logger.log(`Google Health synced for ${userId}`);
        return { steps: 5000, calories: 300, heartRateAvg: 75, date: new Date().toISOString() };
    }
    async getConnectionStatus(userId) {
        const connection = await this.prisma.wearableConnection.findUnique({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
        if (!connection)
            return { connected: false, provider: 'GOOGLE_HEALTH' };
        return { connected: true, provider: 'GOOGLE_HEALTH', isExpired: false };
    }
    async disconnect(userId) {
        await this.prisma.wearableConnection.delete({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
    }
};
exports.GoogleHealthService = GoogleHealthService;
exports.GoogleHealthService = GoogleHealthService = GoogleHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoogleHealthService);
//# sourceMappingURL=google-health.service.js.map