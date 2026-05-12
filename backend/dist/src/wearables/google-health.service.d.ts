import { PrismaService } from '../prisma/prisma.service';
export declare class GoogleHealthService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAuthorizationUrl(redirectUri: string): string;
    exchangeCodeForTokens(userId: string, code: string, redirectUri: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    refreshAccessToken(userId: string): Promise<string>;
    getValidAccessToken(userId: string): Promise<string>;
    syncGoogleHealthData(userId: string): Promise<{
        steps: number;
        calories: number;
        heartRateAvg: number;
        deviceType: string;
        date: string;
    }>;
    getConnectionStatus(userId: string): Promise<{
        connected: boolean;
        provider: string;
        isExpired?: undefined;
    } | {
        connected: boolean;
        provider: string;
        isExpired: boolean;
    }>;
    disconnect(userId: string): Promise<void>;
}
