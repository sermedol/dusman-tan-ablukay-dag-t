import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';

@Controller('entities')
export class EntitiesController {
  constructor(private entitiesService: EntitiesService) {}

  @Post()
  async create(@Body() dto: CreateEntityDto) {
    // TODO: Add @CurrentUser() to extract userId from JWT
    const userId = 'demo-user';
    return this.entitiesService.create(dto, userId);
  }

  @Get()
  async findAll(
    @Query('entityTypeId') entityTypeId?: string,
    @Query('visibility') visibility?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.entitiesService.findAll({
      entityTypeId,
      visibility,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.entitiesService.findBySlug(slug);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.entitiesService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEntityDto) {
    // TODO: Add @CurrentUser() to extract userId from JWT
    const userId = 'demo-user';
    return this.entitiesService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.entitiesService.delete(id);
  }
}
