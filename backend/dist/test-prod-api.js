"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function test() {
    const base = 'https://saas-marketplace-deporte-gimnnasios.onrender.com';
    const endpoints = ['/api/health', '/api/health/db-debug', '/api/gyms'];
    for (const ep of endpoints) {
        const r = await fetch(`${base}${ep}`);
        const t = await r.text();
        console.log(`${ep} -> ${r.status}: ${t.substring(0, 200)}`);
    }
}
test();
//# sourceMappingURL=test-prod-api.js.map