"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
const https = __importStar(require("https"));
let Auth0JwtStrategy = class Auth0JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'auth0') {
    config;
    authService;
    constructor(config, authService) {
        const domain = config.get('AUTH0_DOMAIN');
        const audience = config.get('AUTH0_AUDIENCE');
        super({
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${domain}/.well-known/jwks.json`,
            }),
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: audience,
            issuer: [`https://${domain}/`, `https://${domain}`],
            algorithms: ['RS256'],
            passReqToCallback: true,
        });
        this.config = config;
        this.authService = authService;
    }
    fetchUserInfo(domain, token) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                path: '/userinfo',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(body));
                        }
                        catch (e) {
                            reject(new Error('Invalid JSON from userinfo'));
                        }
                    }
                    else {
                        reject(new Error(`Userinfo status code: ${res.statusCode}`));
                    }
                });
            });
            req.on('error', (err) => reject(err));
            req.end();
        });
    }
    async validate(req, payload) {
        console.log('Validando Payload de Auth0:', JSON.stringify(payload, null, 2));
        const { sub, picture } = payload;
        let email = payload.email;
        let name = payload.name;
        if (!sub) {
            throw new common_1.UnauthorizedException('Token inválido: falta sub');
        }
        if (!email) {
            const authHeader = req.headers?.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const domain = this.config.get('AUTH0_DOMAIN');
                try {
                    console.log(`Fetching userinfo from Auth0 to retrieve real email for ${sub}...`);
                    const userInfo = await this.fetchUserInfo(domain, token);
                    if (userInfo && userInfo.email) {
                        email = userInfo.email;
                        name = userInfo.name || name;
                        console.log(`Retrieved real email from userinfo: ${email}`);
                    }
                }
                catch (err) {
                    console.error('Error fetching userinfo from Auth0:', err.message);
                }
            }
        }
        const user = await this.authService.findOrCreateAuth0User({
            auth0Id: sub,
            email: email ?? `${sub}@auth0.user`,
            name: name ?? 'Usuario',
            avatarUrl: picture,
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Usuario inactivo o no encontrado');
        }
        return user;
    }
};
exports.Auth0JwtStrategy = Auth0JwtStrategy;
exports.Auth0JwtStrategy = Auth0JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService])
], Auth0JwtStrategy);
//# sourceMappingURL=auth0-jwt.strategy.js.map