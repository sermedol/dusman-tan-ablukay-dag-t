import { Body, Controller, ForbiddenException, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { ImportRowStatus } from '@prisma/client';

import { CurrentUser, type CurrentUser as CurrentUserType } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { DataSourcesService } from './data-sources.service';
import { TriggerSyncDto } from './dto';

function requireImportPermission(user: CurrentUserType): void {
  if (!user.permissions?.includes('import:import')) {
    throw new ForbiddenException('Missing required permission: import:import');
  }
}

@Controller('data-sources')
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getStatus() {
    return this.dataSourcesService.getStatus();
  }

  @UseGuards(JwtAuthGuard)
  @Get('holdings')
  listHoldings() {
    return this.dataSourcesService.listHoldings();
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-registry')
  async refreshRegistry(@CurrentUser() user: CurrentUserType) {
    requireImportPermission(user);
    return this.dataSourcesService.refreshMasterRegistry();
  }

  @UseGuards(JwtAuthGuard)
  @Post('preview/:holdingId')
  async previewSync(@Param('holdingId') holdingId: string, @CurrentUser() user: CurrentUserType) {
    requireImportPermission(user);
    return this.dataSourcesService.syncHolding(holdingId, user.userId, true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync/:holdingId')
  async syncHolding(
    @Param('holdingId') holdingId: string,
    @Body() dto: TriggerSyncDto,
    @CurrentUser() user: CurrentUserType
  ) {
    requireImportPermission(user);
    return this.dataSourcesService.syncHolding(holdingId, user.userId, dto.dryRun ?? false);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-all')
  async syncAll(@Body() dto: TriggerSyncDto, @CurrentUser() user: CurrentUserType) {
    requireImportPermission(user);
    return this.dataSourcesService.syncAll(user.userId, dto.dryRun ?? false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('imports/:id')
  async getImportBatch(@Param('id') id: string) {
    return this.dataSourcesService.getImportBatch(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('imports/:id/rows')
  async getImportBatchRows(
    @Param('id') id: string,
    @Query('status') status?: ImportRowStatus,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.dataSourcesService.getImportBatchRows(id, {
      status,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('imports/:id/errors')
  async getImportBatchErrors(@Param('id') id: string) {
    return this.dataSourcesService.getImportBatchRows(id, { status: 'invalid', take: 500 });
  }
}
