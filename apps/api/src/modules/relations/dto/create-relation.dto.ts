export class CreateRelationDto {
  relationTypeId: string;
  sourceEntityId: string;
  targetEntityId: string;
  direction?: 'forward' | 'backward' | 'bidirectional';
  summary?: string;
  description?: string;
  status?: 'active' | 'inactive';
  visibility?: 'public' | 'internal' | 'draft';
  verificationStatus?: 'unverified' | 'verified' | 'needs_review';
  confidenceLevel?: 'high' | 'medium' | 'low' | 'unverified';
  validFrom?: Date;
  validUntil?: Date;
  observedAt?: Date;
}
