import { Injectable, Logger } from '@nestjs/common';
import { sheets_v4, google } from 'googleapis';

import { GoogleAuthService } from './google-auth.service';
import type { IGoogleSheetsClient, SheetTabValues } from './google-sheets-client.interface';
import { withRetry } from './retry.util';

/**
 * Real Google Sheets API v4 client. Read-only: this service never writes to
 * a spreadsheet (see docs/GOOGLE_DRIVE_DATA_PIPELINE.md - the integration is
 * intentionally one-directional, Sheets -> Postgres).
 */
@Injectable()
export class GoogleSheetsService implements IGoogleSheetsClient {
  private readonly logger = new Logger('GoogleSheetsService');

  constructor(private readonly googleAuth: GoogleAuthService) {}

  private async client(): Promise<sheets_v4.Sheets> {
    const auth = await this.googleAuth.getAuthorizedClient();
    return google.sheets({ version: 'v4', auth });
  }

  async listTabNames(spreadsheetId: string): Promise<string[]> {
    const sheets = await this.client();
    const start = Date.now();

    const response = await withRetry(() =>
      sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      })
    );

    const titles = (response.data.sheets ?? [])
      .map((s) => s.properties?.title)
      .filter((title): title is string => Boolean(title));

    this.logger.log(
      `Listed ${titles.length} tabs for spreadsheet ${spreadsheetId} in ${Date.now() - start}ms`
    );
    return titles;
  }

  async batchGetTabValues(
    spreadsheetId: string,
    sheetNames: string[]
  ): Promise<SheetTabValues[]> {
    if (sheetNames.length === 0) return [];

    const sheets = await this.client();
    const availableTabs = new Set(await this.listTabNames(spreadsheetId));
    const requestedRanges = sheetNames.filter((name) => availableTabs.has(name));

    if (requestedRanges.length === 0) {
      return [];
    }

    const start = Date.now();
    const response = await withRetry(() =>
      sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: requestedRanges,
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      })
    );

    this.logger.log(
      `Batch-read ${requestedRanges.length} tabs from spreadsheet ${spreadsheetId} in ${Date.now() - start}ms`
    );

    const valueRanges = response.data.valueRanges ?? [];
    return requestedRanges.map((sheetName, index) => {
      const raw = valueRanges[index]?.values ?? [];
      return {
        sheetName,
        values: raw.map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell)))),
      };
    });
  }
}
