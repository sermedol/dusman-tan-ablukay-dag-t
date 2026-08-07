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
import { StrugglesService } from './struggles.service';
import { JwtAuthGuard } from '@umutsensen/auth';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CurrentUserData } from '../../shared/types/current-user.types';
import { StruggleType, StruggleStatus } from '@prisma/client';

@Controller('struggles')
export class StrugglesController {
  constructor(private strugglesService: StrugglesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    body: {
      title: string;
      description?: string;
      type: StruggleType;
      status?: StruggleStatus;
      startDate?: string;
      endDate?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      participants?: string;
      outcome?: string;
      relatedEntities?: string;
      visibility?: string;
    },
    @CurrentUser() user: CurrentUserData
  ) {
    return this.strugglesService.create({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      createdBy: user.userId,
    });
  }

  @Get()
  async findAll(
    @Query('type') type?: StruggleType,
    @Query('status') status?: StruggleStatus,
    @Query('visibility') visibility?: string,
    @Query('search') search?: string
  ) {
    return this.strugglesService.findAll({
      type,
      status,
      visibility,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.strugglesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.strugglesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      type?: StruggleType;
      status?: StruggleStatus;
      startDate?: string;
      endDate?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      participants?: string;
      outcome?: string;
      relatedEntities?: string;
      visibility?: string;
    },
    @CurrentUser() user: CurrentUserData
  ) {
    return this.strugglesService.update(id, {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      updatedBy: user.userId,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.strugglesService.delete(id);
  }

  @Post(':id/sources')
  @UseGuards(JwtAuthGuard)
  async addSource(
    @Param('id') id: string,
    @Body()
    body: {
      sourceId: string;
      excerpt?: string;
      pageNumber?: number;
      notes?: string;
    }
  ) {
    return this.strugglesService.addSource(id, body.sourceId, {
      excerpt: body.excerpt,
      pageNumber: body.pageNumber,
      notes: body.notes,
    });
  }

  @Delete(':id/sources/:sourceId')
  @UseGuards(JwtAuthGuard)
  async removeSource(@Param('id') id: string, @Param('sourceId') sourceId: string) {
    return this.strugglesService.removeSource(id, sourceId);
  }

  @Post(':id/tags')
  @UseGuards(JwtAuthGuard)
  async addTag(
    @Param('id') id: string,
    @Body() body: { tag: string }
  ) {
    return this.strugglesService.addTag(id, body.tag);
  }

  @Delete(':id/tags/:tag')
  @UseGuards(JwtAuthGuard)
  async removeTag(@Param('id') id: string, @Param('tag') tag: string) {
    return this.strugglesService.removeTag(id, tag);
  }
}
