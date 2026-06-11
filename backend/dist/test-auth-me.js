"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("@nestjs/jwt");
const jwtService = new jwt_1.JwtService({
    secret: 'sports_saas_super_secret_jwt_key_change_in_production_000000',
});
async function main() {
    const payload = { sub: '5dea10d6-6cf1-4291-8079-bc4f7a7237d6', email: 'st@gmail.com', role: 'GYM_OWNER' };
    const token = await jwtService.signAsync(payload, { expiresIn: '7d' });
    console.log('Sending request to /api/auth/me with local JWT token...');
    try {
        const res = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    }
    catch (err) {
        console.error('Fetch error:', err.message);
    }
}
main();
//# sourceMappingURL=test-auth-me.js.map