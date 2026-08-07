import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { VerificationService } from './verification.service';

interface User {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('entities/:id/submit')
  async submitEntity(
    @Param('id') entityId: string,
    @CurrentUser() user: User,
  ) {
    return this.verificationService.submitEntity(entityId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('entities/:id/verify')
  async verifyEntity(
    @Param('id') entityId: string,
    @Body() dto: { approve: boolean; reason?: string },
    @CurrentUser() user: User,
  ) {
    return this.verificationService.verifyEntity(
      entityId,
      dto.approve,
      user.userId,
      dto.reason,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('entities/:id/publish')
  async publishEntity(
    @Param('id') entityId: string,
    @CurrentUser() user: User,
  ) {
    return this.verificationService.publishEntity(entityId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('entities/pending')
  async getPendingEntities(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.verificationService.getPendingEntities({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('relations/:id/submit')
  async submitRelation(
    @Param('id') relationId: string,
    @CurrentUser() user: User,
  ) {
    return this.verificationService.submitRelation(relationId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('relations/:id/verify')
  async verifyRelation(
    @Param('id') relationId: string,
    @Body() dto: { approve: boolean },
    @CurrentUser() user: User,
  ) {
    return this.verificationService.verifyRelation(
      relationId,
      dto.approve,
      user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('relations/:id/publish')
  async publishRelation(
    @Param('id') relationId: string,
    @CurrentUser() user: User,
  ) {
    return this.verificationService.publishRelation(relationId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('relations/pending')
  async getPendingRelations(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.verificationService.getPendingRelations({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }
}
