import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';

export class UpdateImportDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'], {
    message: 'Status must be one of: pending, processing, completed, failed, cancelled',
  })
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @IsOptional()
  @IsObject({ message: 'Config must be an object' })
  config?: Record<string, any>;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  tags?: string[];
}

export class ImportDataMappingDto {
  @IsString({ message: 'Source column must be a string' })
  sourceColumn: string;

  @IsString({ message: 'Target field must be a string' })
  targetField: string;

  @IsOptional()
  @IsString({ message: 'Transform function must be a string' })
  transform?: string;  // JavaScript function as string
}
