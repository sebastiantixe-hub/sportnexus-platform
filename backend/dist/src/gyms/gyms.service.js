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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let GymsService = class GymsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async geocodeAddress(address, city, district, province) {
        try {
            const queryParts = [address, district, province, city].filter(Boolean);
            const query = queryParts.join(', ');
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'HercixPlatform/1.0 (contact@hercix.com)',
                },
            });
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                };
            }
        }
        catch (error) {
            console.error('Error during Nominatim geocoding:', error);
        }
        return this.getDistrictCoordsFallback(district || city || '');
    }
    getDistrictCoordsFallback(name) {
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
    }
    async create(ownerId, createGymDto) {
        let latitude = null;
        let longitude = null;
        if (createGymDto.latitude !== undefined && createGymDto.longitude !== undefined) {
            latitude = createGymDto.latitude;
            longitude = createGymDto.longitude;
        }
        else if (createGymDto.address) {
            const coords = await this.geocodeAddress(createGymDto.address, createGymDto.city, createGymDto.district, createGymDto.province);
            if (coords) {
                latitude = coords.latitude;
                longitude = coords.longitude;
            }
        }
        return this.prisma.gym.create({
            data: {
                ...createGymDto,
                ownerId,
                latitude,
                longitude,
            },
        });
    }
    async findAll(ownerId) {
        const where = { status: client_1.GymStatus.ACTIVE };
        if (ownerId)
            where.ownerId = ownerId;
        return this.prisma.gym.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async findNearby(lat, lng, radiusKm) {
        const gyms = await this.findAll();
        const R = 6371;
        const dLat = (lat2, lat1) => ((lat2 - lat1) * Math.PI) / 180;
        const dLon = (lon2, lon1) => ((lon2 - lon1) * Math.PI) / 180;
        return gyms.filter((gym) => {
            if (!gym.latitude || !gym.longitude)
                return false;
            const dlat = dLat(gym.latitude, lat);
            const dlon = dLon(gym.longitude, lng);
            const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
                Math.cos((lat * Math.PI) / 180) *
                    Math.cos((gym.latitude * Math.PI) / 180) *
                    Math.sin(dlon / 2) *
                    Math.sin(dlon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance <= radiusKm;
        });
    }
    async findOne(id) {
        const gym = await this.prisma.gym.findUnique({
            where: { id },
            include: {
                gymTrainers: {
                    include: {
                        trainer: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
                membershipPlans: true,
            },
        });
        if (!gym) {
            throw new common_1.NotFoundException(`Gimnasio con ID ${id} no encontrado`);
        }
        return gym;
    }
    async update(id, currentUserId, updateGymDto, isAdmin) {
        const gym = await this.findOne(id);
        if (!isAdmin && gym.ownerId !== currentUserId) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar este gimnasio');
        }
        const updatedData = { ...updateGymDto };
        if (updateGymDto.latitude !== undefined && updateGymDto.longitude !== undefined) {
            updatedData.latitude = updateGymDto.latitude;
            updatedData.longitude = updateGymDto.longitude;
        }
        else {
            const hasAddressChanged = (updateGymDto.address && updateGymDto.address !== gym.address) ||
                (updateGymDto.district && updateGymDto.district !== gym.district) ||
                (updateGymDto.city && updateGymDto.city !== gym.city);
            if (hasAddressChanged) {
                const coords = await this.geocodeAddress(updateGymDto.address || gym.address || '', updateGymDto.city || gym.city || undefined, updateGymDto.district || gym.district || undefined, updateGymDto.province || gym.province || undefined);
                if (coords) {
                    updatedData.latitude = coords.latitude;
                    updatedData.longitude = coords.longitude;
                }
            }
        }
        return this.prisma.gym.update({
            where: { id },
            data: updatedData,
        });
    }
    async remove(id, currentUserId, isAdmin) {
        const gym = await this.findOne(id);
        if (gym.ownerId !== currentUserId && !isAdmin) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este gimnasio');
        }
        return this.prisma.gym.update({
            where: { id },
            data: { status: client_1.GymStatus.INACTIVE },
        });
    }
    async findMembers(gymId) {
        return this.prisma.user.findMany({
            where: {
                userMemberships: {
                    some: {
                        plan: { gymId },
                        status: 'ACTIVE'
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true
            }
        });
    }
    async validateOwnership(gymId, ownerId) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
            select: { ownerId: true }
        });
        if (!gym)
            throw new common_1.NotFoundException('Gimnasio no encontrado');
        if (gym.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('No tienes permiso sobre este gimnasio');
        }
        return true;
    }
};
exports.GymsService = GymsService;
exports.GymsService = GymsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GymsService);
//# sourceMappingURL=gyms.service.js.map