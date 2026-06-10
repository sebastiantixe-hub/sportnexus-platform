"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDistrictCoordsFallback = (name) => {
    const normalized = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes('olivos'))
        return { latitude: -11.9614, longitude: -77.0708 };
    if (normalized.includes('isidro'))
        return { latitude: -12.085, longitude: -77.03 };
    if (normalized.includes('miraflores'))
        return { latitude: -12.1225, longitude: -77.0292 };
    if (normalized.includes('chorrillos'))
        return { latitude: -12.1811, longitude: -77.0142 };
    if (normalized.includes('callao'))
        return { latitude: -12.0566, longitude: -77.1181 };
    if (normalized.includes('surco'))
        return { latitude: -12.1383, longitude: -76.9917 };
    if (normalized.includes('molina'))
        return { latitude: -12.0883, longitude: -76.9383 };
    if (normalized.includes('borja'))
        return { latitude: -12.0889, longitude: -77.0017 };
    if (normalized.includes('miguel'))
        return { latitude: -12.0764, longitude: -77.0944 };
    if (normalized.includes('ate'))
        return { latitude: -12.0267, longitude: -76.9167 };
    if (normalized.includes('barranco'))
        return { latitude: -12.1492, longitude: -77.0222 };
    if (normalized.includes('lince'))
        return { latitude: -12.0833, longitude: -77.0333 };
    if (normalized.includes('maria'))
        return { latitude: -12.075, longitude: -77.05 };
    if (normalized.includes('magdalena'))
        return { latitude: -12.0911, longitude: -77.0708 };
    if (normalized.includes('surquillo'))
        return { latitude: -12.1167, longitude: -77.0167 };
    if (normalized.includes('libre'))
        return { latitude: -12.0789, longitude: -77.0628 };
    if (normalized.includes('brena'))
        return { latitude: -12.0583, longitude: -77.0433 };
    if (normalized.includes('lima'))
        return { latitude: -12.0464, longitude: -77.0428 };
    if (normalized.includes('lurigancho'))
        return { latitude: -11.9833, longitude: -77.0167 };
    if (normalized.includes('comas'))
        return { latitude: -11.9333, longitude: -77.05 };
    if (normalized.includes('carabayllo'))
        return { latitude: -11.85, longitude: -77.0333 };
    if (normalized.includes('independencia'))
        return { latitude: -11.9833, longitude: -77.05 };
    if (normalized.includes('rimac'))
        return { latitude: -12.0292, longitude: -77.0278 };
    return { latitude: -12.085, longitude: -77.03 };
};
const geocodeAddress = async (address, city, district, province) => {
    try {
        const queryParts = [address, district, province, city].filter(Boolean);
        const query = queryParts.join(', ');
        console.log(`Geocoding query: "${query}"`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HercixPlatform/1.0 (contact@hercix.com)',
            },
        });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            console.log(`Nominatim success: lat=${data[0].lat}, lon=${data[0].lon}`);
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
            };
        }
    }
    catch (error) {
        console.error('Error during Nominatim geocoding:', error);
    }
    const fallback = getDistrictCoordsFallback(district || city || '');
    console.log(`Using fallback: lat=${fallback.latitude}, lon=${fallback.longitude}`);
    return fallback;
};
async function main() {
    console.log('Connecting to database...');
    const gyms = await prisma.gym.findMany();
    console.log(`Found ${gyms.length} total gyms.`);
    for (const gym of gyms) {
        if (!gym.latitude || !gym.longitude) {
            console.log(`Gym "${gym.name}" (ID: ${gym.id}) has null/zero coordinates. Geocoding address: "${gym.address}"...`);
            const coords = await geocodeAddress(gym.address || '', gym.city || undefined, gym.district || undefined, gym.province || undefined);
            if (coords) {
                await prisma.gym.update({
                    where: { id: gym.id },
                    data: {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    },
                });
                console.log(`Updated Gym "${gym.name}" with coords: [${coords.latitude}, ${coords.longitude}]`);
            }
        }
        else {
            console.log(`Gym "${gym.name}" already has coordinates: [${gym.latitude}, ${gym.longitude}]`);
        }
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=geocode-existing-gyms.js.map