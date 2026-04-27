import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AnyAuthGuard } from './guards/any-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: { userId: string; refreshToken: string }) {
    if (!dto.userId || !dto.refreshToken) {
      throw new Error('Missing userId or refreshToken');
    }
    return this.authService.refreshTokens(dto.userId, dto.refreshToken);
  }

  @ApiOperation({ summary: 'Get current user profile (JWT or Auth0)' })
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(AnyAuthGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiBearerAuth()
  @Get('stats')
  @UseGuards(AnyAuthGuard)
  getDashboardStats(@CurrentUser() user: any) {
    return this.authService.getDashboardStats(user.id, user.role);
  }
}


