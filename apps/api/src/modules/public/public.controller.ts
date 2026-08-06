import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.publicService.search(
      query,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('entities')
  async getEntities(@Query('limit') limit?: string) {
    return this.publicService.getPublicEntities(
      limit ? parseInt(limit, 10) : 100,
    );
  }

  @Get('entities/:id')
  async getEntity(@Param('id') id: string) {
    return this.publicService.getPublicEntity(id);
  }

  @Get('relations')
  async getRelations(
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicService.getPublicRelations(
      entityId,
      limit ? parseInt(limit, 10) : 100,
    );
  }

  @Get('locations')
  async getLocations() {
    return this.publicService.getPublicLocations();
  }
}
