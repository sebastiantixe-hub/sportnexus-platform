import { ConfigService } from '@nestjs/config';
import { Auth0RegisterDto } from './dto/auth0-register.dto';
export declare class Auth0ManagementService {
    private readonly config;
    private readonly logger;
    private cachedToken;
    constructor(config: ConfigService);
    isConfigured(): boolean;
    validateRegistration(dto: Auth0RegisterDto): void;
    buildUserMetadata(dto: Auth0RegisterDto): {
        full_name: string;
        last_name: string;
        phone: string;
        birth_date: string;
        gender: "masculino" | "femenino" | "otro";
        nationality_type: "peruano" | "extranjero";
        document_type: "dni" | "otro" | "pasaporte" | "carnet_extranjeria";
        document_number: string;
        selected_role: "owner" | "super_admin" | "coach" | "athlete";
        accepted_terms: boolean;
        accepted_privacy_policy: boolean;
        wants_course_notifications: boolean;
    };
    createUser(dto: Auth0RegisterDto): Promise<{
        auth0Id: string;
    }>;
    private getManagementToken;
}
