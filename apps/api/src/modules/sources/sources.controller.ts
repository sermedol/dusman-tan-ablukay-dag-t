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
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateSourceDto, UpdateSourceDto, LinkToEntityDto } from './dto';
import { SourcesService } from './sources.service';

interface User {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Controller('sources')
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateSourceDto, @CurrentUser() user: User) {
    return this.sourcesService.create(dto, user.userId);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSourceDto,
    @CurrentUser() user: User,
  ) {
    return this.sourcesService.update(id, dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/link-to-entity')
  async linkToEntity(
    @Param('id') sourceId: string,
    @Body() dto: LinkToEntityDto,
    @CurrentUser() _user: User,
  ) {
    return this.sourcesService.linkToEntity(sourceId, dto.entityId, dto.evidenceType);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/link-to-relation/:relationId')
  async linkToRelation(
    @Param('id') sourceId: string,
    @Param('relationId') relationId: string,
    @CurrentUser() _user: User,
  ) {
    return this.sourcesService.linkToRelation(sourceId, relationId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sourcesService.delete(id);
  }
}
