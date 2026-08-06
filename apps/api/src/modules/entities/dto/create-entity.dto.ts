export class CreateEntityDto {
  entityTypeId: string;
  canonicalName: string;
  shortName?: string;
  description?: string;
  summary?: string;
  status?: 'active' | 'inactive' | 'dissolved' | 'defunct';
  visibility?: 'public' | 'internal' | 'draft';
  verificationStatus?: 'unverified' | 'verified' | 'needs_review' | 'source_required';
  foundedAt?: Date;
  closedAt?: Date;
  activeFrom?: Date;
  activeUntil?: Date;
  websiteUrl?: string;
  metadataJson?: Record<string, unknown>;
}
