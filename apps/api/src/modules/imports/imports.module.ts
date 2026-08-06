import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { ImportRepository } from './repositories/import.repository';
import { DataProcessorService } from './services/data-processor.service';

@Module({
  imports: [PrismaModule],
  controllers: [ImportsController],
  providers: [ImportsService, ImportRepository, DataProcessorService],
  exports: [ImportsService, ImportRepository, DataProcessorService],
})
export class ImportsModule {}
