import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TimelineEventRepository } from './repositories/timeline-event.repository';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [PrismaModule],
  controllers: [TimelineController],
  providers: [TimelineService, TimelineEventRepository],
  exports: [TimelineService, TimelineEventRepository],
})
export class TimelineModule {}
