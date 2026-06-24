import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';
import { GymStatus } from '@prisma/client';

@Injectable()
export class GymsService {
  private readonly logger = new Logger(GymsService.name);
  constructor(private prisma: PrismaService) {}

  private async geocodeAddress(
    address: string,
    city?: string,
    district?: string,
    province?: string,
  ): Promise<{ latitude: number; longitude: number } | null> {
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
    } catch (error) {
      console.error('Error during Nominatim geocoding:', error);
    }
    
    return this.getDistrictCoordsFallback(district || city || '');
  }

  private getDistrictCoordsFallback(name: string): { latitude: number; longitude: number } {
    const normalized = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalized.includes('olivos')) return { latitude: -11.9614, longitude: -77.0708 };
    if (normalized.includes('isidro')) return { latitude: -12.085, longitude: -77.03 };
    if (normalized.includes('miraflores')) return { latitude: -12.1225, longitude: -77.0292 };
    if (normalized.includes('chorrillos')) return { latitude: -12.1811, longitude: -77.0142 };
    if (normalized.includes('callao')) return { latitude: -12.0566, longitude: -77.1181 };
    if (normalized.includes('surco')) return { latitude: -12.1383, longitude: -76.9917 };
    if (normalized.includes('molina')) return { latitude: -12.0883, longitude: -76.9383 };
    if (normalized.includes('borja')) return { latitude: -12.0889, longitude: -77.0017 };
    if (normalized.includes('miguel')) return { latitude: -12.0764, longitude: -77.0944 };
    if (normalized.includes('ate')) return { latitude: -12.0267, longitude: -76.9167 };
    if (normalized.includes('barranco')) return { latitude: -12.1492, longitude: -77.0222 };
    if (normalized.includes('lince')) return { latitude: -12.0833, longitude: -77.0333 };
    if (normalized.includes('maria')) return { latitude: -12.075, longitude: -77.05 };
    if (normalized.includes('magdalena')) return { latitude: -12.0911, longitude: -77.0708 };
    if (normalized.includes('surquillo')) return { latitude: -12.1167, longitude: -77.0167 };
    if (normalized.includes('libre')) return { latitude: -12.0789, longitude: -77.0628 };
    if (normalized.includes('brena')) return { latitude: -12.0583, longitude: -77.0433 };
    if (normalized.includes('lima')) return { latitude: -12.0464, longitude: -77.0428 };
    if (normalized.includes('lurigancho')) return { latitude: -11.9833, longitude: -77.0167 };
    if (normalized.includes('comas')) return { latitude: -11.9333, longitude: -77.05 };
    if (normalized.includes('carabayllo')) return { latitude: -11.85, longitude: -77.0333 };
    if (normalized.includes('independencia')) return { latitude: -11.9833, longitude: -77.05 };
    if (normalized.includes('rimac')) return { latitude: -12.0292, longitude: -77.0278 };
    
    return { latitude: -12.085, longitude: -77.03 };
  }

  async create(ownerId: string, createGymDto: CreateGymDto) {
    let latitude: number | null = null;
    let longitude: number | null = null;
    
    if (createGymDto.latitude !== undefined && createGymDto.longitude !== undefined) {
      latitude = createGymDto.latitude;
      longitude = createGymDto.longitude;
    } else if (createGymDto.address) {
      const coords = await this.geocodeAddress(
        createGymDto.address,
        createGymDto.city,
        createGymDto.district,
        createGymDto.province,
      );
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

  async findAll(ownerId?: string, trainerUserId?: string) {
    try {
      const where: any = { status: GymStatus.ACTIVE };
      if (ownerId) where.ownerId = ownerId;
      if (trainerUserId) {
        where.gymTrainers = {
          some: {
            trainer: {
              userId: trainerUserId,
            },
          },
        };
      }

      return await this.prisma.gym.findMany({
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
          gymTrainers: {
            select: {
              trainerId: true,
              trainer: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in findAll gyms: ${err.message}`, err.stack);
      throw err;
    }
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const gyms = await this.findAll();
    
    // Haversine formula
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2, lat1) => ((lat2 - lat1) * Math.PI) / 180;
    const dLon = (lon2, lon1) => ((lon2 - lon1) * Math.PI) / 180;
    
    return gyms.filter((gym) => {
      if (!gym.latitude || !gym.longitude) return false;
      const dlat = dLat(gym.latitude, lat);
      const dlon = dLon(gym.longitude, lng);
      const a =
        Math.sin(dlat / 2) * Math.sin(dlat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((gym.latitude * Math.PI) / 180) *
          Math.sin(dlon / 2) *
          Math.sin(dlon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      
      return distance <= radiusKm;
    });
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Gimnasio con ID ${id} no encontrado`);
    }

    return gym;
  }

  async update(
    id: string,
    currentUserId: string,
    updateGymDto: UpdateGymDto,
    isAdmin: boolean,
  ) {
    const gym = await this.findOne(id);

    if (!isAdmin && gym.ownerId !== currentUserId) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este gimnasio',
      );
    }

    const updatedData: any = { ...updateGymDto };

    if (updateGymDto.latitude !== undefined && updateGymDto.longitude !== undefined) {
      updatedData.latitude = updateGymDto.latitude;
      updatedData.longitude = updateGymDto.longitude;
    } else {
      const hasAddressChanged = 
        (updateGymDto.address && updateGymDto.address !== gym.address) ||
        (updateGymDto.district && updateGymDto.district !== gym.district) ||
        (updateGymDto.city && updateGymDto.city !== gym.city);

      if (hasAddressChanged) {
        const coords = await this.geocodeAddress(
          updateGymDto.address || gym.address || '',
          updateGymDto.city || gym.city || undefined,
          updateGymDto.district || gym.district || undefined,
          updateGymDto.province || gym.province || undefined,
        );
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

  async remove(id: string, currentUserId: string, isAdmin: boolean) {
    const gym = await this.findOne(id);
    if (gym.ownerId !== currentUserId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este gimnasio');
    }
    return this.prisma.gym.update({
      where: { id },
      data: { status: GymStatus.INACTIVE },
    });
  }

  async findMembers(gymId: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            userMemberships: {
              some: {
                plan: { gymId },
                status: 'ACTIVE'
              }
            }
          },
          {
            reservations: {
              some: {
                class: { gymId },
                status: { in: ['CONFIRMED', 'ATTENDED'] }
              }
            }
          }
        ]
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

  async validateOwnership(gymId: string, ownerId: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id: gymId },
      select: { ownerId: true }
    });
    
    if (!gym) throw new NotFoundException('Gimnasio no encontrado');
    if (gym.ownerId !== ownerId) {
      throw new ForbiddenException('No tienes permiso sobre este gimnasio');
    }
    return true;
  }
}
