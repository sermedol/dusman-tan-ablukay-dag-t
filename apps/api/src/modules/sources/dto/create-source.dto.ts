export class CreateSourceDto {
  sourceTypeId: string;
  title: string;
  publisher?: string;
  author?: string;
  publicationDate?: Date;
  accessedAt?: Date;
  originalUrl?: string;
  archivedUrl?: string;
  fileId?: string;
  language?: string;
  pageReference?: string;
  quoteExcerpt?: string;
  notes?: string;
  reliabilityLevel?: 'primary' | 'secondary' | 'tertiary' | 'unreliable';
  verificationStatus?:
    | 'unverified'
    | 'verified'
    | 'needs_review'
    | 'source_required'
    | 'conflicting';
  metadataJson?: Record<string, unknown>;
}
