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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let HealthService = class HealthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrUpdate(userId, dto) {
        const date = new Date(dto.date);
        date.setUTCHours(0, 0, 0, 0);
        if (dto.type === client_1.HealthMetricType.WEIGHT) {
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
    async findAll(userId) {
        return this.prisma.healthMetric.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
    }
    async findMETs() {
        return this.prisma.activityMET.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async createOrUpdateMET(dto) {
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
    async deleteMET(id) {
        const met = await this.prisma.activityMET.findUnique({ where: { id } });
        if (!met)
            throw new common_1.NotFoundException('Configuración MET no encontrada');
        return this.prisma.activityMET.delete({ where: { id } });
    }
    async findGoal(userId) {
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
    async createOrUpdateGoal(userId, dto) {
        return this.prisma.userGoal.upsert({
            where: { userId },
            update: dto,
            create: { userId, ...dto },
        });
    }
    async createRecommendation(coachId, athleteId, observation) {
        return this.prisma.coachRecommendation.create({
            data: {
                coachId,
                athleteId,
                observation,
            },
        });
    }
    async findRecommendations(athleteId) {
        return this.prisma.coachRecommendation.findMany({
            where: { athleteId },
            orderBy: { createdAt: 'desc' },
            include: {
                coach: { select: { name: true } },
            },
        });
    }
    async getCoachAthletes(coachId) {
        const trainerProfile = await this.prisma.trainerProfile.findUnique({
            where: { userId: coachId },
            include: {
                gymTrainers: { select: { gymId: true } },
            },
        });
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        let athletes;
        if (trainerProfile && trainerProfile.gymTrainers.length > 0) {
            const gymIds = trainerProfile.gymTrainers.map((g) => g.gymId);
            const memberships = await this.prisma.userMembership.findMany({
                where: {
                    status: 'ACTIVE',
                    plan: { gymId: { in: gymIds } },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            weight: true,
                            avatarUrl: true,
                            healthMetrics: {
                                orderBy: { date: 'desc' },
                                take: 60,
                            },
                            coachRecommendations: {
                                orderBy: { createdAt: 'desc' },
                                take: 1,
                                include: { coach: { select: { name: true } } },
                            },
                        },
                    },
                },
            });
            const seen = new Set();
            athletes = memberships
                .map((m) => m.user)
                .filter((u) => {
                if (seen.has(u.id))
                    return false;
                seen.add(u.id);
                return true;
            });
        }
        else {
            athletes = await this.prisma.user.findMany({
                where: { role: client_1.UserRole.USER },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    weight: true,
                    avatarUrl: true,
                    healthMetrics: {
                        orderBy: { date: 'desc' },
                        take: 60,
                    },
                    coachRecommendations: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: { coach: { select: { name: true } } },
                    },
                },
            });
        }
        const todayStr = today.toISOString().split('T')[0];
        return athletes.map((ath) => {
            const metrics = ath.healthMetrics || [];
            const todayMetrics = metrics.filter((m) => {
                const d = m.date instanceof Date ? m.date.toISOString() : String(m.date);
                return d.startsWith(todayStr);
            });
            const todaySteps = todayMetrics.find((m) => m.type === client_1.HealthMetricType.STEPS)?.value || 0;
            const todayCalories = todayMetrics.find((m) => m.type === client_1.HealthMetricType.CALORIES_BURNED)?.value || 0;
            const todayWater = todayMetrics.find((m) => m.type === client_1.HealthMetricType.WATER)?.value || 0;
            const trainedToday = todayMetrics.length > 0;
            const allCalories = metrics.filter((m) => m.type === client_1.HealthMetricType.CALORIES_BURNED);
            const allSteps = metrics.filter((m) => m.type === client_1.HealthMetricType.STEPS);
            const totalCaloriesBurned = allCalories.reduce((sum, c) => sum + c.value, 0);
            const averageSteps = allSteps.length > 0
                ? Math.round(allSteps.reduce((sum, s) => sum + s.value, 0) / allSteps.length)
                : 0;
            const lastWeight = metrics.find((m) => m.type === client_1.HealthMetricType.WEIGHT)?.value || ath.weight || 70;
            return {
                id: ath.id,
                name: ath.name,
                email: ath.email,
                weight: lastWeight,
                avatarUrl: ath.avatarUrl,
                totalCaloriesBurned,
                averageSteps,
                lastObservation: ath.coachRecommendations?.[0]?.observation || 'Sin observaciones registradas',
                trainedToday,
                todaySteps,
                todayCalories: parseFloat(todayCalories.toFixed(1)),
                todayWater,
                lastActivityDate: metrics[0]?.date || null,
            };
        });
    }
    async getOwnerStats(ownerId) {
        const gyms = await this.prisma.gym.findMany({
            where: { ownerId },
            select: { id: true },
        });
        const gymIds = gyms.map(g => g.id);
        const classes = await this.prisma.class.findMany({
            where: { gymId: { in: gymIds } },
            select: { id: true, title: true, durationMin: true },
        });
        const classIds = classes.map(c => c.id);
        const reservations = await this.prisma.reservation.findMany({
            where: { classId: { in: classIds }, status: 'CONFIRMED' },
            select: { userId: true, class: { select: { title: true, durationMin: true } } },
        });
        let totalGymCalories = 0;
        const athleteIds = Array.from(new Set(reservations.map(r => r.userId)));
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
    async calculateCaloriesFromClass(userId, classTitle, durationMin) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return null;
        const weight = user.weight || 70;
        const metConfigs = await this.findMETs();
        const matchedMET = metConfigs.find(m => classTitle.toLowerCase().includes(m.name.toLowerCase()));
        const met = matchedMET ? matchedMET.metValue : 6.0;
        const calories = met * weight * (durationMin / 60);
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        const existing = await this.prisma.healthMetric.findUnique({
            where: { userId_date_type: { userId, date, type: client_1.HealthMetricType.CALORIES_BURNED } }
        });
        const newValue = (existing?.value || 0) + calories;
        return this.prisma.healthMetric.upsert({
            where: { userId_date_type: { userId, date, type: client_1.HealthMetricType.CALORIES_BURNED } },
            update: { value: newValue },
            create: {
                userId,
                type: client_1.HealthMetricType.CALORIES_BURNED,
                value: newValue,
                unit: 'kcal',
                date
            }
        });
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthService);
//# sourceMappingURL=health.service.js.map