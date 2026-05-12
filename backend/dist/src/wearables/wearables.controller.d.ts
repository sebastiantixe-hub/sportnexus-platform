import { WearablesService } from './wearables.service';
import { GoogleHealthService } from './google-health.service';
export declare class WearablesController {
    private readonly wearablesService;
    private readonly googleHealthService;
    constructor(wearablesService: WearablesService, googleHealthService: GoogleHealthService);
    syncData(req: any, data: any): Promise<{
        id: string;
        userId: string;
        deviceType: string;
        steps: number;
        heartRateAvg: number | null;
        calories: number;
        date: Date;
        createdAt: Date;
    }>;
    getMetrics(req: any): Promise<{
        id: string;
        userId: string;
        deviceType: string;
        steps: number;
        heartRateAvg: number | null;
        calories: number;
        date: Date;
        createdAt: Date;
    }[]>;
    getConnections(req: any): Promise<{
        connected: boolean;
        provider: string;
        isExpired?: undefined;
    } | {
        connected: boolean;
        provider: string;
        isExpired: boolean;
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
            heartRateAvg: number;
            deviceType: string;
            date: string;
        };
    }>;
    getFitbitStatus(req: any): Promise<{
        connected: boolean;
        provider: string;
        isExpired?: undefined;
    } | {
        connected: boolean;
        provider: string;
        isExpired: boolean;
    }>;
    disconnectFitbit(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
