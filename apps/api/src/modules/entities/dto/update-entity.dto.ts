import { IsString, IsOptional, IsUrl, IsEnum, IsISO8601, IsObject } from 'class-validator';

export class UpdateEntityDto {
  @IsOptional()
  @IsString({ message: 'Canonical name must be a string' })
  canonicalName?: string;

  @IsOptional()
  @IsString({ message: 'Short name must be a string' })
  shortName?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Summary must be a string' })
  summary?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'dissolved', 'defunct'], {
    message: 'Status must be one of: active, inactive, dissolved, defunct',
  })
  status?: 'active' | 'inactive' | 'dissolved' | 'defunct';

  @IsOptional()
  @IsEnum(['public', 'internal', 'draft'], {
    message: 'Visibility must be one of: public, internal, draft',
  })
  visibility?: 'public' | 'internal' | 'draft';

  @IsOptional()
  @IsEnum(['unverified', 'verified', 'needs_review', 'source_required'], {
    message: 'Verification status must be one of: unverified, verified, needs_review, source_required',
  })
  verificationStatus?: 'unverified' | 'verified' | 'needs_review' | 'source_required';

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Founded date must be a valid ISO 8601 date' })
  foundedAt?: Date;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Closed date must be a valid ISO 8601 date' })
  closedAt?: Date;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Active from date must be a valid ISO 8601 date' })
  activeFrom?: Date;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Active until date must be a valid ISO 8601 date' })
  activeUntil?: Date;

  @IsOptional()
  @IsUrl({}, { message: 'Website URL must be a valid URL' })
  websiteUrl?: string;

  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadataJson?: Record<string, unknown>;
}
