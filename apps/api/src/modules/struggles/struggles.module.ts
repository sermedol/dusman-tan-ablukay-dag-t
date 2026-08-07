import { Module } from '@nestjs/common';
import { StrugglesController } from './struggles.controller';
import { StrugglesService } from './struggles.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StrugglesController],
  providers: [StrugglesService],
  exports: [StrugglesService],
})
export class StrugglesModule {}
