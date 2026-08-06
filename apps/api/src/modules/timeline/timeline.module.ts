import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { TimelineEventRepository } from './repositories/timeline-event.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TimelineController],
  providers: [TimelineService, TimelineEventRepository],
  exports: [TimelineService, TimelineEventRepository],
})
export class TimelineModule {}
