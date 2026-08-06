import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EntitiesModule } from './modules/entities/entities.module';

@Module({
  imports: [PrismaModule, HealthModule, EntitiesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
