import { Module } from '@nestjs/common';
import { WearablesController } from './wearables.controller';
import { WearablesService } from './wearables.service';
import { GoogleHealthService } from './google-health.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WearablesController],
  providers: [WearablesService, GoogleHealthService],
  exports: [GoogleHealthService, WearablesService],
})
export class WearablesModule {}
