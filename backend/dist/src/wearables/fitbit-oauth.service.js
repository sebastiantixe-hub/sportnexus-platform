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
var FitbitOAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitbitOAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FitbitOAuthService = FitbitOAuthService_1 = class FitbitOAuthService {
    prisma;
    logger = new common_1.Logger(FitbitOAuthService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAuthorizationUrl(redirectUri) {
        const clientId = process.env.FITBIT_CLIENT_ID;
        if (!clientId)
            throw new common_1.BadRequestException('FITBIT_CLIENT_ID no configurado en .env');
        const scopes = [
            'activity',
            'heartrate',
            'sleep',
            'profile',
            'nutrition',
            'weight',
        ].join(' ');
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            scope: scopes,
            redirect_uri: redirectUri,
            expires_in: '604800',
        });
        return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
    }
    async exchangeCodeForTokens(userId, code, redirectUri) {
        const clientId = process.env.FITBIT_CLIENT_ID;
        const clientSecret = process.env.FITBIT_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException('Credenciales de Fitbit no configuradas en .env');
        }
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        });
        const response = await fetch('https://api.fitbit.com/oauth2/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            this.logger.error('Fitbit token exchange failed', errorData);
            throw new common_1.BadRequestException(`Error de autenticación con Fitbit: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);
        await this.prisma.wearableConnection.upsert({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
            update: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                tokenExpiry: expiresAt,
                fitbitUserId: data.user_id,
                scope: data.scope,
            },
            create: {
                userId,
                provider: 'FITBIT',
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                tokenExpiry: expiresAt,
                fitbitUserId: data.user_id,
                scope: data.scope,
            },
        });
        this.logger.log(`Fitbit OAuth2 tokens saved for user ${userId}`);
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
            throw new common_1.NotFoundException('Conexión Fitbit no encontrada. Conecta tu cuenta primero.');
        }
        const clientId = process.env.FITBIT_CLIENT_ID;
        const clientSecret = process.env.FITBIT_CLIENT_SECRET;
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: connection.refreshToken,
        });
        const response = await fetch('https://api.fitbit.com/oauth2/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            await this.prisma.wearableConnection.delete({
                where: { userId_provider: { userId, provider: 'FITBIT' } },
            });
            throw new common_1.BadRequestException('Token Fitbit inválido. Reconecta tu cuenta.');
        }
        const data = await response.json();
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);
        await this.prisma.wearableConnection.update({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
            data: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token ?? connection.refreshToken,
                tokenExpiry: expiresAt,
            },
        });
        this.logger.log(`Fitbit access token refreshed for user ${userId}`);
        return data.access_token;
    }
    async getValidAccessToken(userId) {
        const connection = await this.prisma.wearableConnection.findUnique({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
        if (!connection) {
            throw new common_1.NotFoundException('No tienes Fitbit conectado. Ve a Wearables → Conectar Fitbit.');
        }
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        if (connection.tokenExpiry && connection.tokenExpiry < fiveMinutesFromNow) {
            this.logger.log(`Refreshing expired Fitbit token for user ${userId}`);
            return this.refreshAccessToken(userId);
        }
        return connection.accessToken;
    }
    async syncFitbitData(userId) {
        const accessToken = await this.getValidAccessToken(userId);
        const today = new Date().toISOString().split('T')[0];
        const [activityRes, heartRateRes, sleepRes] = await Promise.allSettled([
            fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);
        let steps = 0, calories = 0, distance = 0, activeMinutes = 0;
        if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
            const activity = await activityRes.value.json();
            const summary = activity.summary || {};
            steps = summary.steps ?? 0;
            calories = summary.caloriesOut ?? 0;
            distance = summary.distances?.find((d) => d.activity === 'total')?.distance ?? 0;
            activeMinutes = (summary.fairlyActiveMinutes ?? 0) + (summary.veryActiveMinutes ?? 0);
        }
        let heartRateAvg = null;
        if (heartRateRes.status === 'fulfilled' && heartRateRes.value.ok) {
            const hrData = await heartRateRes.value.json();
            const zones = hrData['activities-heart']?.[0]?.value?.heartRateZones ?? [];
            const restingHR = hrData['activities-heart']?.[0]?.value?.restingHeartRate;
            heartRateAvg = restingHR ?? null;
            if (!heartRateAvg && zones.length > 0) {
                const totalMinutes = zones.reduce((s, z) => s + (z.minutes ?? 0), 0);
                if (totalMinutes > 0) {
                    const weightedSum = zones.reduce((s, z) => s + ((z.min + z.max) / 2) * (z.minutes ?? 0), 0);
                    heartRateAvg = Math.round(weightedSum / totalMinutes);
                }
            }
        }
        let sleepMinutes = null;
        if (sleepRes.status === 'fulfilled' && sleepRes.value.ok) {
            const sleepData = await sleepRes.value.json();
            sleepMinutes = sleepData.summary?.totalMinutesAsleep ?? null;
        }
        const dateObj = new Date(today + 'T00:00:00.000Z');
        await this.prisma.wearableMetric.upsert({
            where: { userId_date: { userId, date: dateObj } },
            update: {
                steps,
                calories,
                heartRateAvg,
                deviceType: 'FITBIT',
            },
            create: {
                userId,
                date: dateObj,
                steps,
                calories,
                heartRateAvg,
                deviceType: 'FITBIT',
            },
        });
        this.logger.log(`Fitbit data synced for user ${userId}: ${steps} steps, ${calories} cal, HR: ${heartRateAvg}`);
        return { steps, calories, heartRateAvg, distance, activeMinutes, sleepMinutes, date: today };
    }
    async getConnectionStatus(userId) {
        const connection = await this.prisma.wearableConnection.findUnique({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
            select: {
                provider: true,
                fitbitUserId: true,
                tokenExpiry: true,
                scope: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!connection)
            return { connected: false, provider: 'FITBIT' };
        const isExpired = connection.tokenExpiry ? connection.tokenExpiry < new Date() : false;
        return {
            connected: true,
            provider: 'FITBIT',
            fitbitUserId: connection.fitbitUserId,
            tokenExpiry: connection.tokenExpiry,
            isExpired,
            scope: connection.scope,
            connectedSince: connection.createdAt,
            lastSync: connection.updatedAt,
        };
    }
    async disconnect(userId) {
        const connection = await this.prisma.wearableConnection.findUnique({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
        if (!connection)
            return;
        try {
            const clientId = process.env.FITBIT_CLIENT_ID;
            const clientSecret = process.env.FITBIT_CLIENT_SECRET;
            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            await fetch('https://api.fitbit.com/oauth2/revoke', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `token=${connection.accessToken}`,
            });
        }
        catch (err) {
            this.logger.warn('Could not revoke Fitbit token remotely', err);
        }
        await this.prisma.wearableConnection.delete({
            where: { userId_provider: { userId, provider: 'FITBIT' } },
        });
        this.logger.log(`Fitbit disconnected for user ${userId}`);
    }
};
exports.FitbitOAuthService = FitbitOAuthService;
exports.FitbitOAuthService = FitbitOAuthService = FitbitOAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FitbitOAuthService);
//# sourceMappingURL=fitbit-oauth.service.js.map