export class UpdateSourceDto {
  title?: string;
  publisher?: string;
  author?: string;
  publicationDate?: Date;
  accessedAt?: Date;
  originalUrl?: string;
  archivedUrl?: string;
  language?: string;
  pageReference?: string;
  quoteExcerpt?: string;
  notes?: string;
  reliabilityLevel?: 'primary' | 'secondary' | 'tertiary' | 'unreliable';
  verificationStatus?: 'unverified' | 'verified' | 'disputed';
  metadataJson?: Record<string, unknown>;
}
