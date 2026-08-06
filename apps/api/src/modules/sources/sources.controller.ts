import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto, LinkToEntityDto } from './dto';

@Controller('sources')
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  @Post()
  async create(@Body() dto: CreateSourceDto) {
    // TODO: Add @CurrentUser() to extract userId from JWT
    const userId = 'demo-user';
    return this.sourcesService.create(dto, userId);
  }

  @Get()
  async findAll(
    @Query('sourceTypeId') sourceTypeId?: string,
    @Query('reliabilityLevel') reliabilityLevel?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.sourcesService.findAll({
      sourceTypeId,
      reliabilityLevel,
      verificationStatus,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('by-checksum/:checksum')
  async findByChecksum(@Param('checksum') checksum: string) {
    const source = await this.sourcesService.findByChecksum(checksum);
    if (!source) {
      return { isDuplicate: false };
    }
    return { isDuplicate: true, source };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sourcesService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSourceDto) {
    // TODO: Add @CurrentUser() to extract userId from JWT
    const userId = 'demo-user';
    return this.sourcesService.update(id, dto, userId);
  }

  @Post(':id/link-to-entity')
  async linkToEntity(@Param('id') sourceId: string, @Body() dto: LinkToEntityDto) {
    return this.sourcesService.linkToEntity(sourceId, dto.entityId, dto.evidenceType);
  }

  @Post(':id/link-to-relation/:relationId')
  async linkToRelation(@Param('id') sourceId: string, @Param('relationId') relationId: string) {
    return this.sourcesService.linkToRelation(sourceId, relationId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sourcesService.delete(id);
  }
}
