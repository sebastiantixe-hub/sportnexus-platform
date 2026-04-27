import { WearablesService } from './wearables.service';
import { FitbitOAuthService } from './fitbit-oauth.service';
export declare class WearablesController {
    private readonly wearablesService;
    private readonly fitbitOAuthService;
    constructor(wearablesService: WearablesService, fitbitOAuthService: FitbitOAuthService);
    syncData(req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        deviceType: string;
        steps: number;
        heartRateAvg: number | null;
        calories: number;
    }>;
    getMetrics(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        deviceType: string;
        steps: number;
        heartRateAvg: number | null;
        calories: number;
    }[]>;
    getConnections(req: any): Promise<{
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
    getFitbitAuthUrl(req: any, redirectUri?: string): Promise<{
        url: string;
        callbackUri: string;
    }>;
    fitbitCallback(req: any, body: {
        code: string;
        redirect_uri: string;
    }): Promise<{
        success: boolean;
        message: string;
        expiresIn?: undefined;
    } | {
        success: boolean;
        message: string;
        expiresIn: number;
    }>;
    syncFitbitData(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            steps: number;
            calories: number;
            heartRateAvg: number | null;
            distance: number;
            activeMinutes: number;
            sleepMinutes: number | null;
            date: string;
        };
    }>;
    getFitbitStatus(req: any): Promise<{
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
    disconnectFitbit(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
