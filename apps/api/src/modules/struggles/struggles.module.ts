import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { StrugglesController } from './struggles.controller';
import { StrugglesService } from './struggles.service';

@Module({
  imports: [PrismaModule],
  controllers: [StrugglesController],
  providers: [StrugglesService],
  exports: [StrugglesService],
})
export class StrugglesModule {}
