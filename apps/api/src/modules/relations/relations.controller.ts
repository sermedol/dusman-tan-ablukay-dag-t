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
import { RelationsService } from './relations.service';
import { CreateRelationDto, UpdateRelationDto } from './dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

interface User {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Controller('relations')
export class RelationsController {
  constructor(private relationsService: RelationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateRelationDto, @CurrentUser() user: User) {
    return this.relationsService.create(dto, user.userId);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRelationDto,
    @CurrentUser() user: User,
  ) {
    return this.relationsService.update(id, dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.relationsService.delete(id);
  }
}
