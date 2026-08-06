import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RelationsService } from './relations.service';
import { CreateRelationDto, UpdateRelationDto } from './dto';

@Controller('relations')
export class RelationsController {
  constructor(private relationsService: RelationsService) {}

  @Post()
  async create(@Body() dto: CreateRelationDto) {
    // TODO: Add @CurrentUser() to extract userId from JWT
    const userId = 'demo-user';
    return this.relationsService.create(dto, userId);
  }

  @Get()
  async findAll(
    @Query('sourceEntityId') sourceEntityId?: string,
    @Query('targetEntityId') targetEntityId?: string,
    @Query('relationTypeId') relationTypeId?: string,
    @Query('visibility') visibility?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.relationsService.findAll({
      sourceEntityId,
      targetEntityId,
      relationTypeId,
      visibility,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.relationsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRelationDto) {
    // TODO: Add @CurrentUser() to extract userId from JWT
    const userId = 'demo-user';
    return this.relationsService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.relationsService.delete(id);
  }
}
