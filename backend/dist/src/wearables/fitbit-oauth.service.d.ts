import { PrismaService } from '../prisma/prisma.service';
export declare class FitbitOAuthService {
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
    syncFitbitData(userId: string): Promise<{
        steps: number;
        calories: number;
        heartRateAvg: number | null;
        distance: number;
        activeMinutes: number;
        sleepMinutes: number | null;
        date: string;
    }>;
    getConnectionStatus(userId: string): Promise<{
        connected: boolean;
        provider: string;
        fitbitUserId?: undefined;
        tokenExpiry?: undefined;
        isExpired?: undefined;
        scope?: undefined;
        connectedSince?: undefined;
        lastSync?: undefined;
    } | {
        connected: boolean;
        provider: string;
        fitbitUserId: string | null;
        tokenExpiry: Date | null;
        isExpired: boolean;
        scope: string | null;
        connectedSince: Date;
        lastSync: Date;
    }>;
    disconnect(userId: string): Promise<void>;
}
