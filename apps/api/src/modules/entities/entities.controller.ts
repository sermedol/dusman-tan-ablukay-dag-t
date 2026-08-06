import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

interface User {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Controller('entities')
export class EntitiesController {
  constructor(private entitiesService: EntitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateEntityDto, @CurrentUser() user: User) {
    return this.entitiesService.create(dto, user.userId);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEntityDto,
    @CurrentUser() user: User,
  ) {
    return this.entitiesService.update(id, dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.entitiesService.delete(id);
  }
}
