import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';
import { HealthMetricType } from '@prisma/client';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(userId: string, dto: CreateHealthMetricDto) {
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    return this.prisma.healthMetric.upsert({
      where: {
        userId_date_type: {
          userId,
          date,
          type: dto.type,
        },
      },
      update: {
        value: dto.value,
        unit: dto.unit,
      },
      create: {
        userId,
        type: dto.type,
        value: dto.value,
        unit: dto.unit,
        date,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async calculateCaloriesFromClass(userId: string, classTitle: string, durationMin: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.weight) return null;

    // MET Table
    const MET_MAP: Record<string, number> = {
      'CrossFit': 9.0,
      'Fútbol': 7.0,
      'Gimnasio': 6.0,
      'Pesas': 6.0,
      'Yoga': 3.0,
      'Box': 8.0,
      'Natación': 8.0,
      'Vóley': 4.0,
      'Básquetbol': 6.5,
      'Tenis': 7.0,
      'Atletismo': 9.0,
    };

    // Find best match for activity
    const activity = Object.keys(MET_MAP).find(key => classTitle.toLowerCase().includes(key.toLowerCase()));
    const met = activity ? MET_MAP[activity] : 5.0; // Default 5.0

    const calories = met * user.weight * (durationMin / 60);
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    // Upsert (Sum if already exists? No, standard MET is per session. 
    // But since we use unique date+type, we might want to SUM if it's calories.
    // For now, let's just add to existing if it exists on the same day.
    
    const existing = await this.prisma.healthMetric.findUnique({
      where: { userId_date_type: { userId, date, type: HealthMetricType.CALORIES_BURNED } }
    });

    const newValue = (existing?.value || 0) + calories;

    return this.prisma.healthMetric.upsert({
      where: { userId_date_type: { userId, date, type: HealthMetricType.CALORIES_BURNED } },
      update: { value: newValue },
      create: { 
        userId, 
        type: HealthMetricType.CALORIES_BURNED, 
        value: newValue, 
        unit: 'kcal', 
        date 
      }
    });
  }
}
