import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateImportDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(['csv', 'excel', 'json', 'google-sheets', 'api'], {
    message: 'Source type must be one of: csv, excel, json, google-sheets, api',
  })
  sourceType: 'csv' | 'excel' | 'json' | 'google-sheets' | 'api';

  @IsString({ message: 'Source URL must be a string' })
  @IsNotEmpty({ message: 'Source URL is required' })
  sourceUrl: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsObject({ message: 'Config must be an object' })
  config?: {
    sheetName?: string;          // For Google Sheets
    encoding?: string;           // For CSV/Excel
    delimiter?: string;          // For CSV
    headerRow?: number;          // Row number for headers
    mappings?: Record<string, string>;  // Column mappings
    duplicateStrategy?: 'skip' | 'update' | 'merge';
    skipValidation?: boolean;
    batchSize?: number;
  };

  @IsOptional()
  @IsEnum(['entities', 'relations', 'timeline', 'all'], {
    message: 'Data types must be one of: entities, relations, timeline, all',
  })
  dataTypes?: 'entities' | 'relations' | 'timeline' | 'all';

  @IsOptional()
  @IsEnum(['manual', 'automatic'], {
    message: 'Verification must be one of: manual, automatic',
  })
  verificationMode?: 'manual' | 'automatic';

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  tags?: string[];
}
