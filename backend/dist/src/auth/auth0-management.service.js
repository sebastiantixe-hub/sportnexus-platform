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
var Auth0ManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0ManagementService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const validators_1 = require("./utils/validators");
let Auth0ManagementService = Auth0ManagementService_1 = class Auth0ManagementService {
    config;
    logger = new common_1.Logger(Auth0ManagementService_1.name);
    cachedToken = null;
    constructor(config) {
        this.config = config;
    }
    isConfigured() {
        return Boolean(this.config.get('AUTH0_DOMAIN') &&
            this.config.get('AUTH0_M2M_CLIENT_ID') &&
            this.config.get('AUTH0_M2M_CLIENT_SECRET'));
    }
    validateRegistration(dto) {
        if (!(0, validators_1.isValidEmail)(dto.email)) {
            throw new common_1.BadRequestException('Correo electrónico inválido');
        }
        if (!(0, validators_1.isStrongPassword)(dto.password)) {
            throw new common_1.BadRequestException('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo');
        }
        if (!(0, validators_1.isValidPhonePeru)(dto.phone)) {
            throw new common_1.BadRequestException('Teléfono inválido. Use un número móvil peruano de 9 dígitos (ej. 987654321)');
        }
        if (!dto.accepted_terms || !dto.accepted_privacy_policy) {
            throw new common_1.BadRequestException('Debe aceptar los términos y condiciones y la política de privacidad');
        }
        if (dto.nationality_type === 'peruano') {
            if (dto.document_type !== 'dni') {
                throw new common_1.BadRequestException('Los usuarios peruanos deben registrarse con DNI');
            }
            if (!(0, validators_1.isValidDni)(dto.document_number)) {
                throw new common_1.BadRequestException('DNI inválido. Debe tener 8 dígitos');
            }
        }
        else if (!dto.document_number?.trim()) {
            throw new common_1.BadRequestException('Número de documento obligatorio');
        }
        if (dto.selected_role !== 'athlete') {
            throw new common_1.BadRequestException('El registro público solo está disponible para atletas. Los demás perfiles requieren invitación.');
        }
    }
    buildUserMetadata(dto) {
        return {
            full_name: dto.full_name.trim(),
            last_name: dto.last_name.trim(),
            phone: (0, validators_1.normalizePhone)(dto.phone),
            birth_date: dto.birth_date,
            gender: dto.gender,
            nationality_type: dto.nationality_type,
            document_type: dto.document_type,
            document_number: dto.document_number.trim(),
            selected_role: dto.selected_role,
            accepted_terms: dto.accepted_terms,
            accepted_privacy_policy: dto.accepted_privacy_policy,
            wants_course_notifications: dto.wants_course_notifications ?? false,
        };
    }
    async createUser(dto) {
        this.validateRegistration(dto);
        if (!this.isConfigured()) {
            throw new common_1.ServiceUnavailableException('Registro programático no configurado. Configure AUTH0_M2M_CLIENT_ID y AUTH0_M2M_CLIENT_SECRET, o use Universal Login.');
        }
        const domain = this.config.get('AUTH0_DOMAIN');
        const token = await this.getManagementToken();
        const metadata = this.buildUserMetadata(dto);
        const connection = this.config.get('AUTH0_DB_CONNECTION') ?? 'Username-Password-Authentication';
        const res = await fetch(`https://${domain}/api/v2/users`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: dto.email.toLowerCase().trim(),
                password: dto.password,
                connection,
                name: `${dto.full_name} ${dto.last_name}`.trim(),
                user_metadata: metadata,
                app_metadata: {
                    role: 'athlete',
                },
                verify_email: false,
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const message = err.message ??
                err.description ??
                'Error al crear usuario en Auth0';
            if (res.status === 409) {
                throw new common_1.BadRequestException('El correo electrónico ya está registrado');
            }
            this.logger.error('Auth0 create user failed', err);
            throw new common_1.BadRequestException(message);
        }
        const user = (await res.json());
        return { auth0Id: user.user_id };
    }
    async getManagementToken() {
        if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 60_000) {
            return this.cachedToken.token;
        }
        const domain = this.config.get('AUTH0_DOMAIN');
        const clientId = this.config.get('AUTH0_M2M_CLIENT_ID');
        const clientSecret = this.config.get('AUTH0_M2M_CLIENT_SECRET');
        const res = await fetch(`https://${domain}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                audience: `https://${domain}/api/v2/`,
                grant_type: 'client_credentials',
            }),
        });
        if (!res.ok) {
            throw new common_1.ServiceUnavailableException('No se pudo obtener token de Management API de Auth0');
        }
        const data = (await res.json());
        this.cachedToken = {
            token: data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };
        return data.access_token;
    }
};
exports.Auth0ManagementService = Auth0ManagementService;
exports.Auth0ManagementService = Auth0ManagementService = Auth0ManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], Auth0ManagementService);
//# sourceMappingURL=auth0-management.service.js.map