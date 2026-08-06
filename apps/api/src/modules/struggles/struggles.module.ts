import { Module } from '@nestjs/common';
import { StrugglesController } from './struggles.controller';
import { StrugglesService } from './struggles.service';
import { DatabaseModule } from '@umut-sen/database';

@Module({
  imports: [DatabaseModule],
  controllers: [StrugglesController],
  providers: [StrugglesService],
  exports: [StrugglesService],
})
export class StrugglesModule {}
