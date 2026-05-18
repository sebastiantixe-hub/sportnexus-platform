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
    async calculateCaloriesFromClass(userId, classTitle, durationMin) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.weight)
            return null;
        const MET_MAP = {
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
        const activity = Object.keys(MET_MAP).find(key => classTitle.toLowerCase().includes(key.toLowerCase()));
        const met = activity ? MET_MAP[activity] : 5.0;
        const calories = met * user.weight * (durationMin / 60);
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