import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { CacheModule } from '../../shared/cache/cache.module';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
