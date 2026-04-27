import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FitbitOAuthService {
  private readonly logger = new Logger(FitbitOAuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Step 1: Generate the Fitbit OAuth2 Authorization URL ──────────────────
  getAuthorizationUrl(redirectUri: string): string {
    const clientId = process.env.FITBIT_CLIENT_ID;
    if (!clientId) throw new BadRequestException('FITBIT_CLIENT_ID no configurado en .env');

    const scopes = [
      'activity',
      'heartrate',
      'sleep',
      'profile',
      'nutrition',
      'weight',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: scopes,
      redirect_uri: redirectUri,
      expires_in: '604800', // 7 days
    });

    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  }

  // ── Step 2: Exchange authorization code for tokens ─────────────────────────
  async exchangeCodeForTokens(
    userId: string,
    code: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Credenciales de Fitbit no configuradas en .env');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.logger.error('Fitbit token exchange failed', errorData);
      throw new BadRequestException(`Error de autenticación con Fitbit: ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Save tokens in DB
    await this.prisma.wearableConnection.upsert({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiry: expiresAt,
        fitbitUserId: data.user_id,
        scope: data.scope,
      },
      create: {
        userId,
        provider: 'FITBIT',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiry: expiresAt,
        fitbitUserId: data.user_id,
        scope: data.scope,
      },
    });

    this.logger.log(`Fitbit OAuth2 tokens saved for user ${userId}`);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  // ── Step 3: Auto-refresh expired token ────────────────────────────────────
  async refreshAccessToken(userId: string): Promise<string> {
    const connection = await this.prisma.wearableConnection.findUnique({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
    });

    if (!connection || !connection.refreshToken) {
      throw new NotFoundException('Conexión Fitbit no encontrada. Conecta tu cuenta primero.');
    }

    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
    });

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      // Token is invalid - remove the connection
      await this.prisma.wearableConnection.delete({
        where: { userId_provider: { userId, provider: 'FITBIT' } },
      });
      throw new BadRequestException('Token Fitbit inválido. Reconecta tu cuenta.');
    }

    const data: any = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await this.prisma.wearableConnection.update({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? connection.refreshToken,
        tokenExpiry: expiresAt,
      },
    });

    this.logger.log(`Fitbit access token refreshed for user ${userId}`);
    return data.access_token;
  }

  // ── Step 4: Get a valid access token (auto-refresh if needed) ─────────────
  async getValidAccessToken(userId: string): Promise<string> {
    const connection = await this.prisma.wearableConnection.findUnique({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
    });

    if (!connection) {
      throw new NotFoundException('No tienes Fitbit conectado. Ve a Wearables → Conectar Fitbit.');
    }

    // If token expires in less than 5 minutes, refresh it
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (connection.tokenExpiry && connection.tokenExpiry < fiveMinutesFromNow) {
      this.logger.log(`Refreshing expired Fitbit token for user ${userId}`);
      return this.refreshAccessToken(userId);
    }

    return connection.accessToken;
  }

  // ── Step 5: Sync real Fitbit data into WearableMetric ─────────────────────
  async syncFitbitData(userId: string): Promise<{
    steps: number;
    calories: number;
    heartRateAvg: number | null;
    distance: number;
    activeMinutes: number;
    sleepMinutes: number | null;
    date: string;
  }> {
    const accessToken = await this.getValidAccessToken(userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch activity summary + heart rate in parallel
    const [activityRes, heartRateRes, sleepRes] = await Promise.allSettled([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    // Parse activity
    let steps = 0, calories = 0, distance = 0, activeMinutes = 0;
    if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
      const activity: any = await activityRes.value.json();
      const summary = activity.summary || {};
      steps = summary.steps ?? 0;
      calories = summary.caloriesOut ?? 0;
      distance = summary.distances?.find((d: any) => d.activity === 'total')?.distance ?? 0;
      activeMinutes = (summary.fairlyActiveMinutes ?? 0) + (summary.veryActiveMinutes ?? 0);
    }

    // Parse heart rate
    let heartRateAvg: number | null = null;
    if (heartRateRes.status === 'fulfilled' && heartRateRes.value.ok) {
      const hrData: any = await heartRateRes.value.json();
      const zones = hrData['activities-heart']?.[0]?.value?.heartRateZones ?? [];
      const restingHR = hrData['activities-heart']?.[0]?.value?.restingHeartRate;
      heartRateAvg = restingHR ?? null;

      // Calculate weighted average from zones if no resting HR
      if (!heartRateAvg && zones.length > 0) {
        const totalMinutes = zones.reduce((s: number, z: any) => s + (z.minutes ?? 0), 0);
        if (totalMinutes > 0) {
          const weightedSum = zones.reduce(
            (s: number, z: any) => s + ((z.min + z.max) / 2) * (z.minutes ?? 0),
            0,
          );
          heartRateAvg = Math.round(weightedSum / totalMinutes);
        }
      }
    }

    // Parse sleep
    let sleepMinutes: number | null = null;
    if (sleepRes.status === 'fulfilled' && sleepRes.value.ok) {
      const sleepData: any = await sleepRes.value.json();
      sleepMinutes = sleepData.summary?.totalMinutesAsleep ?? null;
    }

    // Save to WearableMetric (upsert per day)
    const dateObj = new Date(today + 'T00:00:00.000Z');
    await this.prisma.wearableMetric.upsert({
      where: { userId_date: { userId, date: dateObj } },
      update: {
        steps,
        calories,
        heartRateAvg,
        deviceType: 'FITBIT',
      },
      create: {
        userId,
        date: dateObj,
        steps,
        calories,
        heartRateAvg,
        deviceType: 'FITBIT',
      },
    });

    this.logger.log(`Fitbit data synced for user ${userId}: ${steps} steps, ${calories} cal, HR: ${heartRateAvg}`);

    return { steps, calories, heartRateAvg, distance, activeMinutes, sleepMinutes, date: today };
  }

  // ── Get connection status ──────────────────────────────────────────────────
  async getConnectionStatus(userId: string) {
    const connection = await this.prisma.wearableConnection.findUnique({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
      select: {
        provider: true,
        fitbitUserId: true,
        tokenExpiry: true,
        scope: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!connection) return { connected: false, provider: 'FITBIT' };

    const isExpired = connection.tokenExpiry ? connection.tokenExpiry < new Date() : false;

    return {
      connected: true,
      provider: 'FITBIT',
      fitbitUserId: connection.fitbitUserId,
      tokenExpiry: connection.tokenExpiry,
      isExpired,
      scope: connection.scope,
      connectedSince: connection.createdAt,
      lastSync: connection.updatedAt,
    };
  }

  // ── Disconnect / Revoke ────────────────────────────────────────────────────
  async disconnect(userId: string): Promise<void> {
    const connection = await this.prisma.wearableConnection.findUnique({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
    });

    if (!connection) return;

    // Attempt to revoke the token with Fitbit
    try {
      const clientId = process.env.FITBIT_CLIENT_ID;
      const clientSecret = process.env.FITBIT_CLIENT_SECRET;
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      await fetch('https://api.fitbit.com/oauth2/revoke', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${connection.accessToken}`,
      });
    } catch (err) {
      this.logger.warn('Could not revoke Fitbit token remotely', err);
    }

    // Always delete locally
    await this.prisma.wearableConnection.delete({
      where: { userId_provider: { userId, provider: 'FITBIT' } },
    });

    this.logger.log(`Fitbit disconnected for user ${userId}`);
  }
}
