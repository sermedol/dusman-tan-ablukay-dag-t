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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';
import { CreateImportDto, UpdateImportDto } from './dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

interface User {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Controller('imports')
export class ImportsController {
  constructor(private importsService: ImportsService) {}

  /**
   * Create import job
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateImportDto, @CurrentUser() user: User) {
    return this.importsService.create(dto, user.userId);
  }

  /**
   * Upload file for import
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: User
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Create import from uploaded file
    const importJob = await this.importsService.create(
      {
        name: body.name || file.originalname,
        sourceType: body.sourceType || this.detectFileType(file.originalname),
        sourceUrl: `file://${file.filename}`, // Would store in S3/storage
        config: body.config,
        description: body.description,
      } as CreateImportDto,
      user.userId
    );

    return {
      importId: importJob.id,
      filename: file.originalname,
      status: importJob.status,
      message: 'File uploaded successfully. Processing will begin shortly.',
    };
  }

  /**
   * List all imports
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.importsService.findAll(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20
    );
  }

  /**
   * Get import statistics
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.importsService.getStats();
  }

  /**
   * Get imports by status
   */
  @UseGuards(JwtAuthGuard)
  @Get('by-status/:status')
  async getByStatus(
    @Param('status') status: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.importsService.getByStatus(
      status,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20
    );
  }

  /**
   * Get pending imports
   */
  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPending() {
    return this.importsService.getPending();
  }

  /**
   * Get specific import
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.importsService.findById(id);
  }

  /**
   * Get import results
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/results')
  async getResults(@Param('id') id: string) {
    return this.importsService.getImportResults(id);
  }

  /**
   * Update import
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateImportDto,
    @CurrentUser() user: User
  ) {
    return this.importsService.update(id, dto, user.userId);
  }

  /**
   * Process import
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/process')
  async process(@Param('id') id: string) {
    return this.importsService.processImport(id);
  }

  /**
   * Cancel import
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.importsService.cancelImport(id);
  }

  /**
   * Delete import
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.importsService.delete(id);
  }

  /**
   * Detect file type from extension
   */
  private detectFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      csv: 'csv',
      xlsx: 'excel',
      xls: 'excel',
      json: 'json',
    };
    return typeMap[ext || ''] || 'csv';
  }
}
