import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';
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

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const batch = await this.importsService.createBatch(file.originalname, user.userId);

    return {
      batchId: batch.id,
      filename: batch.filename,
      status: batch.status,
      message: 'File uploaded successfully. Processing will begin shortly.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.importsService.findAllBatches();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':batchId')
  async findBatch(@Param('batchId') batchId: string) {
    return this.importsService.findBatchById(batchId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':batchId/rows')
  async getBatchRows(
    @Param('batchId') batchId: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.importsService.getBatchRows(batchId, {
      status,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }
}
