import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { EmailService } from '../notifications/email.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Prevent duplicate emails
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    // Prevent direct ADMIN registration through the public endpoint
    const role: UserRole =
      dto.role === UserRole.ADMIN ? UserRole.USER : (dto.role ?? UserRole.USER);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role,
        phone: dto.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Send welcome email (non-blocking)
    this.emailService.sendWelcome(user.email, user.name).catch(() => {});

    return { user, ...tokens };
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const { passwordHash: _pw, ...safeUser } = user;

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user: safeUser, ...tokens };
  }

  // ── Refresh Tokens ────────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Acceso denegado o usuario inactivo');
    }

    // Find valid refresh token
    const savedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } }
    });

    let tokenValid = false;
    for (const token of savedTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isValid) {
        tokenValid = true;
        break;
      }
    }

    if (!tokenValid) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const { passwordHash: _pw, ...safeUser } = user;
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    
    return { user: safeUser, ...tokens };
  }

  // ── Get current user ──────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dni: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // Obtener roles adicionales de forma dinámica sin migraciones pesadas
    const roles: string[] = ['USER']; // Todos son atletas

    // Verificar si es administrador
    if (user.role === 'ADMIN') {
      roles.push('ADMIN');
    }

    // Verificar si es dueño (tiene gimnasios o su rol principal es GYM_OWNER)
    const gymCount = await this.prisma.gym.count({ where: { ownerId: userId } });
    if (gymCount > 0 || user.role === 'GYM_OWNER') {
      roles.push('GYM_OWNER');
    }

    // Verificar si es coach (tiene trainerProfile o su rol principal es TRAINER)
    const trainerProfile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    if (trainerProfile || user.role === 'TRAINER') {
      roles.push('TRAINER');
    }

    return {
      ...user,
      roles,
    };
  }

  async switchRole(userId: string, newRole: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Validar que el usuario sea elegible para este rol
    const eligibleRoles = ['USER'];
    if (user.role === 'ADMIN') eligibleRoles.push('ADMIN');

    const gymCount = await this.prisma.gym.count({ where: { ownerId: userId } });
    if (gymCount > 0 || user.role === 'GYM_OWNER') eligibleRoles.push('GYM_OWNER');

    const trainerProfile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    if (trainerProfile || user.role === 'TRAINER') eligibleRoles.push('TRAINER');

    if (!eligibleRoles.includes(newRole)) {
      throw new BadRequestException(`No eres elegible para el rol: ${newRole}`);
    }

    // Actualizar el rol activo en la base de datos
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dni: true,
        avatarUrl: true,
      }
    });
  }

  async updateProfile(userId: string, data: { name: string; phone?: string; dni?: string; role?: UserRole }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        dni: data.dni,
        ...(data.role ? { role: data.role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dni: true,
        avatarUrl: true,
      }
    });
  }

  async getDashboardStats(userId: string, role: string) {
    const userRole = role.toUpperCase();

    // ── ADMIN: show platform-wide statistics ──────────────────────────────
    if (userRole === 'ADMIN') {
      const [totalGyms, totalClasses, totalUsers, totalReservations, recentReservations] = await Promise.all([
        this.prisma.gym.count({ where: { status: 'ACTIVE' } }),
        this.prisma.class.count({ where: { isActive: true } }),
        this.prisma.user.count(),
        this.prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.reservation.findMany({
          where: { status: 'CONFIRMED' },
          orderBy: { bookedAt: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true } },
            class: { select: { title: true, gym: { select: { name: true } } } },
          },
        }),
      ]);

      const activities = recentReservations.map(res => ({
        id: res.id,
        type: 'RESERVATION',
        title: `Reserva: ${res.class.title}`,
        description: `${res.user.name} → ${res.class.gym.name}`,
        date: res.bookedAt,
      }));

      return {
        gyms: totalGyms,
        classes: totalClasses,
        members: totalUsers,
        revenue: totalReservations, // real confirmed reservations count, no simulation
        activities,
        isAdmin: true,
      };
    }

    // ── GYM_OWNER: show their own gyms ────────────────────────────────────
    if (userRole === 'GYM_OWNER') {
      const gyms = await this.prisma.gym.findMany({
        where: { ownerId: userId },
        include: {
          classes: {
            include: {
              _count: {
                select: { reservations: { where: { status: 'CONFIRMED' } } },
              },
              reservations: {
                where: { status: 'CONFIRMED' },
              },
            },
          },
        },
      });

      let totalRevenue = 0;
      const uniqueMembers = new Set();
      let activeClassesCount = 0;

      gyms.forEach((gym) => {
        gym.classes.forEach((cls) => {
          activeClassesCount++;
          const confirmedCount = Number(cls._count.reservations);
          totalRevenue += confirmedCount * Number(cls.price);
          cls.reservations.forEach((res) => uniqueMembers.add(res.userId));
        });
      });

      const recentActivities: any[] = [];
      gyms.forEach(gym => {
        gym.classes.forEach(cls => {
          cls.reservations.forEach(res => {
            recentActivities.push({
              id: res.id,
              type: 'RESERVATION',
              title: `Nueva reserva: ${cls.title}`,
              description: `El atleta ha reservado en ${gym.name}`,
              date: res.bookedAt,
            });
          });
        });
      });

      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      return {
        gyms: gyms.length,
        classes: activeClassesCount,
        members: uniqueMembers.size,
        revenue: totalRevenue,
        activities: sortedActivities,
      };
    } else {
      // For USER / TRAINEE
      const reservations = await this.prisma.reservation.findMany({
        where: { userId, status: 'CONFIRMED' },
        include: { class: { include: { gym: true } } },
        orderBy: { bookedAt: 'desc' },
        take: 5,
      });

      const activities = reservations.map(res => ({
        id: res.id,
        type: 'RESERVATION',
        title: `Clase reservada: ${res.class.title}`,
        description: `En el gimnasio ${res.class.gym.name}`,
        date: res.bookedAt,
      }));

      const profBookings = await this.prisma.professionalBooking.findMany({
        where: { userId, status: 'CONFIRMED' },
        include: { service: { include: { provider: true } } },
        orderBy: { bookedAt: 'desc' },
        take: 5,
      });

      const profActivities = profBookings.map(b => ({
        id: b.id,
        type: 'PROFESSIONAL_SERVICE',
        title: `Cita Profesional: ${b.service.title}`,
        description: `Con ${b.service.provider.name || 'Especialista'}`,
        date: b.bookedAt,
      }));

      const allActivities = [...activities, ...profActivities].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

      const gymsCount = await this.prisma.gym.count({
        where: { status: 'ACTIVE' },
      });

      return {
        reservations: reservations.length + profBookings.length,
        gyms: gymsCount,
        points: Math.floor((reservations.length + profBookings.length) * 125),
        months: 1,
        activities: allActivities,
      };
    }
  }


  // ── Auth0 — Find or Create ────────────────────────────────────────────────

  /**
   * Called by Auth0JwtStrategy after a valid Auth0 token is received.
   * Looks up user by auth0Id, then by email as fallback.
   * Creates a new user if none is found.
   */
  async findOrCreateAuth0User(params: {
    auth0Id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) {
    const { auth0Id, email, name, avatarUrl } = params;

    // 1. Try by auth0Id (fastest path after first login)
    let user = await this.prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
    });

    if (user) {
      // Bloquear accesos sociales (Google) para roles corporativos y administrativos
      if (auth0Id.startsWith('google-oauth2|') && (user.role === UserRole.ADMIN || user.role === UserRole.GYM_OWNER || user.role === UserRole.TRAINER)) {
        throw new UnauthorizedException('Por motivos de ciberseguridad corporativa, los perfiles de Administrador, Dueño y Coach de Hercix tienen estrictamente prohibido el ingreso con cuentas sociales (Google). Debe iniciar sesión utilizando sus credenciales locales seguras (Email y Contraseña).');
      }
      return user;
    }

    // 2. Try by email (user may have registered before Auth0 or pre-seeded/invited)
    const existing = await this.prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
    });

    if (existing) {
      // Bloquear vinculación de cuentas sociales (Google) para roles corporativos y administrativos
      if (auth0Id.startsWith('google-oauth2|') && (existing.role === UserRole.ADMIN || existing.role === UserRole.GYM_OWNER || existing.role === UserRole.TRAINER)) {
        throw new UnauthorizedException('Por motivos de ciberseguridad corporativa, los perfiles de Administrador, Dueño y Coach de Hercix tienen estrictamente prohibido el ingreso con cuentas sociales (Google). Debe iniciar sesión utilizando sus credenciales locales seguras (Email y Contraseña).');
      }

      console.log(`Encontrado usuario existente por email (case-insensitive): ${existing.email}. Vinculando a Auth0 ID: ${auth0Id}`);
      user = await this.prisma.user.update({
        where: { id: existing.id },
        data: { 
          auth0Id, 
          avatarUrl: avatarUrl ?? existing.avatarUrl,
        },
        select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
      });
      return user;
    }

    // 3. New User Flow: Check if there's a pending invitation
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        },
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      }
    });

    let assignedRole: UserRole = UserRole.USER;
    let gymIdToLink: string | null = null;

    if (invitation) {
      console.log(`Invitación encontrada para ${email}. Asignando rol: ${invitation.role}`);
      assignedRole = invitation.role;
      gymIdToLink = invitation.gymId;
    } else {
      console.log(`No hay invitación para ${email}. Creando atleta público (USER)`);
    }

    // Create the user in PostgreSQL
    const newUser = await this.prisma.user.create({
      data: {
        auth0Id,
        email: email.toLowerCase(),
        name,
        avatarUrl,
        role: assignedRole,
        emailVerified: true,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
    });

    // If invitation was accepted, handle updates
    if (invitation) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });

      // SaaS flow: If invited as a Trainer and gymId is present, create trainer profile and link
      if (assignedRole === UserRole.TRAINER && gymIdToLink) {
        const trainerProf = await this.prisma.trainerProfile.create({
          data: {
            userId: newUser.id,
            bio: 'Entrenador invitado',
            experienceYears: 1
          }
        });

        await this.prisma.gymTrainer.create({
          data: {
            gymId: gymIdToLink,
            trainerId: trainerProf.id,
            canCreateClasses: true
          }
        });
        console.log(`TrainerProfile creado y vinculado al gimnasio ${gymIdToLink}`);
      }
    }

    // Send welcome email to new Auth0 users (non-blocking)
    this.emailService.sendWelcome(email, name).catch(() => {});

    return newUser;
  }

  // ── Token helpers ─────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET')!,
        expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
        expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
      }),
    ]);

    // Store hashed refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  // ── Invitation Flow ──────────────────────────────────────────────────────

  async inviteUser(invitedBy: { id: string; role: UserRole }, email: string, role: UserRole, gymId?: string) {
    // 1. Validate that only ADMIN can invite other ADMINs or GYM_OWNERs
    if (role === UserRole.ADMIN || role === UserRole.GYM_OWNER) {
      if (invitedBy.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Solo los administradores de Hercix pueden invitar a dueños de gimnasios.');
      }
    }

    // 2. Prevent duplicate active invitations or existing users
    const userExists = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (userExists) {
      throw new ConflictException('Este correo electrónico ya está registrado como usuario activo.');
    }

    // Delete any old pending invitation for this email
    await this.prisma.invitation.deleteMany({
      where: { email: email.toLowerCase() },
    });

    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

    const invitation = await this.prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        role,
        gymId,
        token,
        invitedById: invitedBy.id,
        expiresAt,
      },
    });

    // Send invitation email using EmailService
    const invitationLink = `http://localhost:5173/login?inviteToken=${token}&email=${encodeURIComponent(email)}`;
    await this.emailService.sendInvitation(email.toLowerCase(), role, invitationLink).catch(() => {});

    return {
      message: 'Invitación creada y enviada con éxito',
      invitationId: invitation.id,
      expiresAt: invitation.expiresAt,
    };
  }
}
