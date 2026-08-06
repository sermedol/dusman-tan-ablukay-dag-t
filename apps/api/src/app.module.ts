import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { RelationsModule } from './modules/relations/relations.module';

@Module({
  imports: [PrismaModule, HealthModule, EntitiesModule, RelationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
