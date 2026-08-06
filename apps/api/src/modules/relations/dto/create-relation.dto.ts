import {
  IsString,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateRelationDto {
  @IsString({ message: 'Relation type ID must be a string' })
  @IsNotEmpty({ message: 'Relation type ID is required' })
  relationTypeId: string;

  @IsString({ message: 'Source entity ID must be a string' })
  @IsNotEmpty({ message: 'Source entity ID is required' })
  sourceEntityId: string;

  @IsString({ message: 'Target entity ID must be a string' })
  @IsNotEmpty({ message: 'Target entity ID is required' })
  targetEntityId: string;

  @IsOptional()
  @IsEnum(['forward', 'backward', 'bidirectional'], {
    message: 'Direction must be one of: forward, backward, bidirectional',
  })
  direction?: 'forward' | 'backward' | 'bidirectional';

  @IsOptional()
  @IsString({ message: 'Summary must be a string' })
  summary?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Status must be one of: active, inactive',
  })
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsEnum(['public', 'internal', 'draft'], {
    message: 'Visibility must be one of: public, internal, draft',
  })
  visibility?: 'public' | 'internal' | 'draft';

  @IsOptional()
  @IsEnum(['unverified', 'verified', 'needs_review'], {
    message: 'Verification status must be one of: unverified, verified, needs_review',
  })
  verificationStatus?: 'unverified' | 'verified' | 'needs_review';

  @IsOptional()
  @IsEnum(['high', 'medium', 'low', 'unverified'], {
    message: 'Confidence level must be one of: high, medium, low, unverified',
  })
  confidenceLevel?: 'high' | 'medium' | 'low' | 'unverified';

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Valid from must be a valid ISO 8601 date' })
  validFrom?: Date;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Valid until must be a valid ISO 8601 date' })
  validUntil?: Date;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Observed at must be a valid ISO 8601 date' })
  observedAt?: Date;
}
