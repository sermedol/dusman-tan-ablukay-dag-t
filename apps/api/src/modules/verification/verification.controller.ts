import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  // Entity workflow
  @Post('entities/:id/submit')
  async submitEntity(@Param('id') entityId: string) {
    // TODO: Add @CurrentUser()
    const userId = 'demo-user';
    return this.verificationService.submitEntity(entityId, userId);
  }

  @Post('entities/:id/verify')
  async verifyEntity(
    @Param('id') entityId: string,
    @Body() dto: { approve: boolean; reason?: string },
  ) {
    // TODO: Add @CurrentUser()
    const userId = 'demo-user';
    return this.verificationService.verifyEntity(entityId, dto.approve, userId, dto.reason);
  }

  @Post('entities/:id/publish')
  async publishEntity(@Param('id') entityId: string) {
    // TODO: Add @CurrentUser()
    const userId = 'demo-user';
    return this.verificationService.publishEntity(entityId, userId);
  }

  @Get('entities/pending')
  async getPendingEntities(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.verificationService.getPendingEntities({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  // Relation workflow
  @Post('relations/:id/submit')
  async submitRelation(@Param('id') relationId: string) {
    // TODO: Add @CurrentUser()
    const userId = 'demo-user';
    return this.verificationService.submitRelation(relationId, userId);
  }

  @Post('relations/:id/verify')
  async verifyRelation(@Param('id') relationId: string, @Body() dto: { approve: boolean }) {
    // TODO: Add @CurrentUser()
    const userId = 'demo-user';
    return this.verificationService.verifyRelation(relationId, dto.approve, userId);
  }

  @Post('relations/:id/publish')
  async publishRelation(@Param('id') relationId: string) {
    // TODO: Add @CurrentUser()
    const userId = 'demo-user';
    return this.verificationService.publishRelation(relationId, userId);
  }

  @Get('relations/pending')
  async getPendingRelations(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.verificationService.getPendingRelations({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }
}
