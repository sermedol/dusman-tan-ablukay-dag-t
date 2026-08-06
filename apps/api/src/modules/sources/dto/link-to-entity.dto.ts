export class LinkToEntityDto {
  entityId: string;
  evidenceType: string;
  excerpt?: string;
  pageNumber?: number;
  supportsFrom?: Date;
  supportsUntil?: Date;
  notes?: string;
}
