import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/prisma/prisma.module';
import { DataSourcesController } from './data-sources.controller';
import { DataSourcesService } from './data-sources.service';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import { HoldingSyncService } from './services/holding-sync.service';
import { MasterRegistryService } from './services/master-registry.service';

@Module({
  imports: [PrismaModule],
  controllers: [DataSourcesController],
  providers: [DataSourcesService, GoogleAuthService, GoogleSheetsService, MasterRegistryService, HoldingSyncService],
  exports: [DataSourcesService, MasterRegistryService, HoldingSyncService],
})
export class DataSourcesModule {}
