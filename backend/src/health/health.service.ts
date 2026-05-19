import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';
import { HealthMetricType, UserRole } from '@prisma/client';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  // ── Health Metrics Logging ────────────────────────────────────────────────

  async createOrUpdate(userId: string, dto: CreateHealthMetricDto) {
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    // Si es peso, también actualizamos el campo weight en la tabla User
    if (dto.type === HealthMetricType.WEIGHT) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { weight: dto.value },
      });
    }

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

  // ── Activity MET configs (Super Admin) ────────────────────────────────────

  async findMETs() {
    return this.prisma.activityMET.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createOrUpdateMET(dto: { name: string; metValue: number; intensity: string; defaultDuration?: number }) {
    return this.prisma.activityMET.upsert({
      where: { name: dto.name },
      update: {
        metValue: dto.metValue,
        intensity: dto.intensity,
        defaultDuration: dto.defaultDuration ?? 60,
      },
      create: {
        name: dto.name,
        metValue: dto.metValue,
        intensity: dto.intensity,
        defaultDuration: dto.defaultDuration ?? 60,
      },
    });
  }

  async deleteMET(id: string) {
    const met = await this.prisma.activityMET.findUnique({ where: { id } });
    if (!met) throw new NotFoundException('Configuración MET no encontrada');
    return this.prisma.activityMET.delete({ where: { id } });
  }

  // ── User Goals ────────────────────────────────────────────────────────────

  async findGoal(userId: string) {
    let goal = await this.prisma.userGoal.findUnique({ where: { userId } });
    if (!goal) {
      goal = await this.prisma.userGoal.create({
        data: {
          userId,
          targetCalories: 600,
          targetSteps: 10000,
          targetWater: 8,
          targetWeight: 70,
        },
      });
    }
    return goal;
  }

  async createOrUpdateGoal(userId: string, dto: { targetCalories: number; targetSteps: number; targetWater: number; targetWeight?: number }) {
    return this.prisma.userGoal.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  // ── Coach Recommendations ─────────────────────────────────────────────────

  async createRecommendation(coachId: string, athleteId: string, observation: string) {
    return this.prisma.coachRecommendation.create({
      data: {
        coachId,
        athleteId,
        observation,
      },
    });
  }

  async findRecommendations(athleteId: string) {
    return this.prisma.coachRecommendation.findMany({
      where: { athleteId },
      orderBy: { createdAt: 'desc' },
      include: {
        coach: { select: { name: true } },
      },
    });
  }

  // ── Coach View: All Athletes Performance ──────────────────────────────────

  async getCoachAthletes(coachId: string) {
    const athletes = await this.prisma.user.findMany({
      where: { role: UserRole.USER },
      select: {
        id: true,
        name: true,
        email: true,
        weight: true,
        avatarUrl: true,
        healthMetrics: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        coachRecommendations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return athletes.map(ath => {
      // Computar calorías totales quemadas, pasos promedio, etc.
      const caloriesList = ath.healthMetrics.filter(m => m.type === HealthMetricType.CALORIES_BURNED);
      const stepsList = ath.healthMetrics.filter(m => m.type === HealthMetricType.STEPS);

      const totalCalories = caloriesList.reduce((sum, c) => sum + c.value, 0);
      const avgSteps = stepsList.length > 0 ? Math.round(stepsList.reduce((sum, s) => sum + s.value, 0) / stepsList.length) : 0;
      const lastWeight = ath.healthMetrics.find(m => m.type === HealthMetricType.WEIGHT)?.value || ath.weight || 70;

      return {
        id: ath.id,
        name: ath.name,
        email: ath.email,
        weight: lastWeight,
        avatarUrl: ath.avatarUrl,
        totalCaloriesBurned: totalCalories,
        averageSteps: avgSteps,
        lastObservation: ath.coachRecommendations[0]?.observation || 'Sin observaciones registradas',
      };
    });
  }

  // ── Gym Owner View: Academy Performance ───────────────────────────────────

  async getOwnerStats(ownerId: string) {
    // 1. Obtener los gimnasios del dueño
    const gyms = await this.prisma.gym.findMany({
      where: { ownerId },
      select: { id: true },
    });
    const gymIds = gyms.map(g => g.id);

    // 2. Obtener total de reservaciones completadas en sus gimnasios
    const classes = await this.prisma.class.findMany({
      where: { gymId: { in: gymIds } },
      select: { id: true, title: true, durationMin: true },
    });
    const classIds = classes.map(c => c.id);

    const reservations = await this.prisma.reservation.findMany({
      where: { classId: { in: classIds }, status: 'CONFIRMED' },
      select: { userId: true, class: { select: { title: true, durationMin: true } } },
    });

    // 3. Calcular calorías quemadas totales en sus clases
    let totalGymCalories = 0;
    const athleteIds = Array.from(new Set(reservations.map(r => r.userId)));

    // Obtener pesos de atletas
    const athletes = await this.prisma.user.findMany({
      where: { id: { in: athleteIds } },
      select: { id: true, weight: true },
    });

    const metConfigs = await this.findMETs();

    for (const res of reservations) {
      const athlete = athletes.find(a => a.id === res.userId);
      const weight = athlete?.weight || 70;
      const classTitle = res.class.title;
      const durationMin = res.class.durationMin;

      const matchedMET = metConfigs.find(m => classTitle.toLowerCase().includes(m.name.toLowerCase()));
      const met = matchedMET ? matchedMET.metValue : 6.0;

      totalGymCalories += met * weight * (durationMin / 60);
    }

    return {
      gymCount: gymIds.length,
      activeAthletes: athleteIds.length,
      totalCaloriesBurnedInClasses: Math.round(totalGymCalories),
      averageClassDuration: classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + c.durationMin, 0) / classes.length) : 0,
    };
  }

  // ── Auto MET Calculation ──────────────────────────────────────────────────

  async calculateCaloriesFromClass(userId: string, classTitle: string, durationMin: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    const weight = user.weight || 70;

    // Buscar MET en base de datos
    const metConfigs = await this.findMETs();
    const matchedMET = metConfigs.find(m => classTitle.toLowerCase().includes(m.name.toLowerCase()));
    const met = matchedMET ? matchedMET.metValue : 6.0; // Default 6.0 si no coincide nada

    const calories = met * weight * (durationMin / 60);
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

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
