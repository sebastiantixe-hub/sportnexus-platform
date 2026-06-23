// Quick test: verify prod backend health + gyms response
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
