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
import { TimelineService } from './timeline.service';
import {
  CreateTimelineEventDto,
  UpdateTimelineEventDto,
} from './dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

interface User {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Controller('events')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateTimelineEventDto, @CurrentUser() user: User) {
    return this.timelineService.create(dto, user.userId);
  }

  @Get()
  async findAll(
    @Query('entityId') entityId?: string,
    @Query('eventType') eventType?: string,
    @Query('status') status?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.timelineService.findAll({
      entityId,
      eventType,
      status,
      verificationStatus,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('stats')
  async getStats() {
    return this.timelineService.getStats();
  }

  @Get('by-type/:eventType')
  async findByType(
    @Param('eventType') eventType: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.timelineService.findByType(
      eventType,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('date-range')
  async findByDateRange(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.timelineService.findByDateRange(
      new Date(from),
      new Date(to),
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('verified')
  async findVerified(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.timelineService.findVerified(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('pending-verification')
  async findPendingVerification(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.timelineService.findPendingVerification(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('related/:relationId')
  async findRelatedToRelation(@Param('relationId') relationId: string) {
    return this.timelineService.findRelatedToRelation(relationId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.timelineService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTimelineEventDto,
    @CurrentUser() user: User,
  ) {
    return this.timelineService.update(id, dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/verify')
  async verify(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.timelineService.verifyEvent(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.timelineService.delete(id);
  }
}
