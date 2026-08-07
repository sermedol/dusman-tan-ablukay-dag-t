export type SyncRowOperation = 'create' | 'update' | 'unchanged' | 'missing_from_source' | 'rejected';

export interface SyncRowOutcome {
  sheetName: string;
  rowNumber: number;
  externalId?: string;
  operation: SyncRowOperation;
  errors?: string[];
  warnings?: string[];
}

export interface SyncCounts {
  rowCount: number;
  createCount: number;
  updateCount: number;
  unchangedCount: number;
  missingFromSourceCount: number;
  rejectedCount: number;
  warningCount: number;
  unresolvedReferenceCount: number;
}

export interface SyncResult {
  importBatchId: string;
  dryRun: boolean;
  holdingId: string;
  spreadsheetId: string;
  status: 'preview_ready' | 'completed' | 'failed';
  startedAt: Date;
  completedAt: Date;
  counts: SyncCounts;
  rows: SyncRowOutcome[];
  tabsFound: string[];
  tabsMissing: string[];
}

export function emptyCounts(): SyncCounts {
  return {
    rowCount: 0,
    createCount: 0,
    updateCount: 0,
    unchangedCount: 0,
    missingFromSourceCount: 0,
    rejectedCount: 0,
    warningCount: 0,
    unresolvedReferenceCount: 0,
  };
}

/** Thrown by row handlers to signal a validation-layer rejection with a stable machine-readable code. */
export class RowRejectedError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'RowRejectedError';
  }
}
