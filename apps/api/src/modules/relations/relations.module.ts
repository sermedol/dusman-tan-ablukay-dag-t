import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';
import { RelationsRepository } from './repositories/relations.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RelationsController],
  providers: [RelationsService, RelationsRepository],
  exports: [RelationsService, RelationsRepository],
})
export class RelationsModule {}
