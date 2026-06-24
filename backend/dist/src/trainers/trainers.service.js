"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let TrainersService = class TrainersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    filepath = path.join(process.cwd(), 'pending-requests.json');
    readPendingRequests() {
        try {
            if (!fs.existsSync(this.filepath)) {
                fs.writeFileSync(this.filepath, JSON.stringify([]));
                return [];
            }
            const data = fs.readFileSync(this.filepath, 'utf-8');
            return JSON.parse(data || '[]');
        }
        catch (err) {
            console.error('Error reading pending requests file:', err);
            return [];
        }
    }
    writePendingRequests(requests) {
        try {
            fs.writeFileSync(this.filepath, JSON.stringify(requests, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Error writing pending requests file:', err);
        }
    }
    async upsertProfile(userId, dto) {
        return this.prisma.trainerProfile.upsert({
            where: { userId },
            update: dto,
            create: {
                userId,
                ...dto,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.trainerProfile.findMany({
            include: {
                user: {
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
    async assignToGym(gymId, currentOwnerId, trainerUserId, canCreateClasses) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });
        if (!gym)
            throw new common_1.NotFoundException('Gimnasio no encontrado');
        if (gym.ownerId !== currentOwnerId) {
            throw new common_1.ForbiddenException('No eres el dueño de este gimnasio');
        }
        const trainerProfile = await this.prisma.trainerProfile.findUnique({
            where: { userId: trainerUserId },
        });
        if (!trainerProfile) {
            throw new common_1.NotFoundException('El usuario no tiene un perfil de entrenador activo');
        }
        return this.prisma.gymTrainer.upsert({
            where: {
                gymId_trainerId: {
                    gymId,
                    trainerId: trainerProfile.id,
                },
            },
            update: { canCreateClasses },
            create: {
                gymId,
                trainerId: trainerProfile.id,
                canCreateClasses,
            },
        });
    }
    async getGymTrainers(gymId) {
        return this.prisma.gymTrainer.findMany({
            where: { gymId },
            include: {
                trainer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async unassignTrainer(gymId, currentOwnerId, trainerId) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });
        if (!gym)
            throw new common_1.NotFoundException('Gimnasio no encontrado');
        if (gym.ownerId !== currentOwnerId) {
            throw new common_1.ForbiddenException('No eres el dueño de este gimnasio');
        }
        return this.prisma.gymTrainer.delete({
            where: {
                gymId_trainerId: {
                    gymId,
                    trainerId,
                },
            },
        });
    }
    async requestLinkToGym(gymId, trainerUserId) {
        const trainerProfile = await this.prisma.trainerProfile.findUnique({
            where: { userId: trainerUserId },
            include: { user: true },
        });
        if (!trainerProfile) {
            throw new common_1.NotFoundException('El usuario no tiene un perfil de entrenador activo');
        }
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });
        if (!gym) {
            throw new common_1.NotFoundException('Gimnasio no encontrado');
        }
        const existingLink = await this.prisma.gymTrainer.findUnique({
            where: {
                gymId_trainerId: {
                    gymId,
                    trainerId: trainerProfile.id,
                },
            },
        });
        if (existingLink) {
            throw new common_1.BadRequestException('Ya estás vinculado a esta sede');
        }
        const requests = this.readPendingRequests();
        const existingRequest = requests.find((r) => r.gymId === gymId && r.trainerUserId === trainerUserId);
        if (existingRequest) {
            throw new common_1.BadRequestException('Ya tienes una postulación pendiente para esta sede');
        }
        const newRequest = {
            id: Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
            gymId,
            gymName: gym.name,
            trainerUserId,
            trainerName: trainerProfile.user.name,
            trainerEmail: trainerProfile.user.email,
            createdAt: new Date().toISOString(),
        };
        requests.push(newRequest);
        this.writePendingRequests(requests);
        return newRequest;
    }
    async getPendingRequestsForOwner(ownerUserId) {
        const ownerGyms = await this.prisma.gym.findMany({
            where: { ownerId: ownerUserId },
            select: { id: true },
        });
        const gymIds = ownerGyms.map((g) => g.id);
        const requests = this.readPendingRequests();
        return requests.filter((r) => gymIds.includes(r.gymId));
    }
    async getPendingRequestsForTrainer(trainerUserId) {
        const requests = this.readPendingRequests();
        return requests.filter((r) => r.trainerUserId === trainerUserId);
    }
    async respondToRequest(requestId, ownerUserId, approve) {
        const requests = this.readPendingRequests();
        const reqIndex = requests.findIndex((r) => r.id === requestId);
        if (reqIndex === -1) {
            throw new common_1.NotFoundException('Solicitud no encontrada');
        }
        const request = requests[reqIndex];
        const gym = await this.prisma.gym.findUnique({
            where: { id: request.gymId },
        });
        if (!gym || gym.ownerId !== ownerUserId) {
            throw new common_1.ForbiddenException('No tienes permiso para gestionar solicitudes de este gimnasio');
        }
        if (approve) {
            await this.assignToGym(request.gymId, ownerUserId, request.trainerUserId, true);
        }
        requests.splice(reqIndex, 1);
        this.writePendingRequests(requests);
        return { success: true, message: approve ? 'Solicitud aprobada y entrenador vinculado' : 'Solicitud rechazada' };
    }
};
exports.TrainersService = TrainersService;
exports.TrainersService = TrainersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainersService);
//# sourceMappingURL=trainers.service.js.map