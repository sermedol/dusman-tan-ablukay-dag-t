import {
  IsString,
  IsOptional,
  IsISO8601,
  IsNotEmpty,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateTimelineEventDto {
  @IsString({ message: 'Entity ID must be a string' })
  @IsNotEmpty({ message: 'Entity ID is required' })
  entityId: string;

  @IsString({ message: 'Event type must be a string' })
  @IsNotEmpty({ message: 'Event type is required' })
  eventType: string;

  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsISO8601({ strict: true }, { message: 'Occurred at must be a valid ISO 8601 date' })
  @IsNotEmpty({ message: 'Occurred at is required' })
  occurredAt: Date;

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

  @IsOptional()
  @IsString({ message: 'Related relation ID must be a string' })
  relatedRelationId?: string;
}
