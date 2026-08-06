import {
  IsString,
  IsOptional,
  IsISO8601,
  IsEnum,
  IsObject,
} from 'class-validator';

export class UpdateTimelineEventDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Occurred at must be a valid ISO 8601 date' })
  occurredAt?: Date;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Ended at must be a valid ISO 8601 date' })
  endedAt?: Date;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'], {
    message: 'Status must be one of: active, inactive, archived',
  })
  status?: 'active' | 'inactive' | 'archived';

  @IsOptional()
  @IsEnum(['verified', 'unverified', 'disputed'], {
    message: 'Verification status must be one of: verified, unverified, disputed',
  })
  verificationStatus?: 'verified' | 'unverified' | 'disputed';

  @IsOptional()
  @IsString({ message: 'Source must be a string' })
  source?: string;

  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadataJson?: Record<string, any>;
}
