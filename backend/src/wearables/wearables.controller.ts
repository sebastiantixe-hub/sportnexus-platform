import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
  Redirect,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { WearablesService } from './wearables.service';
import { FitbitOAuthService } from './fitbit-oauth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wearables')
@UseGuards(JwtAuthGuard)
export class WearablesController {
  constructor(
    private readonly wearablesService: WearablesService,
    private readonly fitbitOAuthService: FitbitOAuthService,
  ) {}

  // ── Manual sync (BLE / webhook) ────────────────────────────────────────────
  @Post('sync')
  async syncData(@Request() req, @Body() data: any) {
    return this.wearablesService.syncData(req.user.id, data);
  }

  // ── Get stored metrics ─────────────────────────────────────────────────────
  @Get('metrics')
  async getMetrics(@Request() req) {
    return this.wearablesService.getMetrics(req.user.id);
  }

  // ── Get all wearable connections ───────────────────────────────────────────
  @Get('connections')
  async getConnections(@Request() req) {
    return this.fitbitOAuthService.getConnectionStatus(req.user.id);
  }

  // ── FITBIT OAUTH2 FLOW ─────────────────────────────────────────────────────

  /**
   * Step 1: Get the Fitbit authorization URL
   * Frontend redirects user to this URL
   */
  @Get('fitbit/auth-url')
  async getFitbitAuthUrl(@Request() req, @Query('redirect_uri') redirectUri?: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const callbackUri = redirectUri || `${frontendUrl}/dashboard/wearables/fitbit-callback`;

    const url = this.fitbitOAuthService.getAuthorizationUrl(callbackUri);
    return { url, callbackUri };
  }

  /**
   * Step 2: Exchange code for tokens (called by frontend after Fitbit redirects back)
   */
  @Post('fitbit/callback')
  async fitbitCallback(
    @Request() req,
    @Body() body: { code: string; redirect_uri: string },
  ) {
    if (!body.code) {
      return { success: false, message: 'Código de autorización faltante' };
    }

    const tokens = await this.fitbitOAuthService.exchangeCodeForTokens(
      req.user.id,
      body.code,
      body.redirect_uri,
    );

    return {
      success: true,
      message: '¡Fitbit conectado exitosamente! Sincronizando datos...',
      expiresIn: tokens.expiresIn,
    };
  }

  /**
   * Step 3: Force sync Fitbit data now
   */
  @Post('fitbit/sync')
  async syncFitbitData(@Request() req) {
    const data = await this.fitbitOAuthService.syncFitbitData(req.user.id);
    return {
      success: true,
      message: 'Datos de Fitbit sincronizados desde la API oficial',
      data,
    };
  }

  /**
   * Step 4: Get Fitbit connection status
   */
  @Get('fitbit/status')
  async getFitbitStatus(@Request() req) {
    return this.fitbitOAuthService.getConnectionStatus(req.user.id);
  }

  /**
   * Step 5: Disconnect Fitbit (revoke tokens)
   */
  @Delete('fitbit/disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnectFitbit(@Request() req) {
    await this.fitbitOAuthService.disconnect(req.user.id);
    return { success: true, message: 'Fitbit desconectado correctamente' };
  }
}
