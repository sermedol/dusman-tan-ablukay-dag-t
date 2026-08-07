/**
 * Central place for reading Google Drive/Sheets related environment
 * configuration. Nothing in this module ever logs credential contents.
 */
export interface GoogleServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

export function isGoogleDriveEnabled(): boolean {
  return process.env.GOOGLE_DRIVE_ENABLED === 'true';
}

export function getMasterSpreadsheetId(): string | undefined {
  return process.env.GOOGLE_MASTER_SPREADSHEET_ID || undefined;
}

export function getDriveRootFolderId(): string | undefined {
  return process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || undefined;
}

/**
 * Parses GOOGLE_SERVICE_ACCOUNT_JSON. Accepts either the raw JSON object as a
 * string, or the same JSON base64-encoded (convenient for platforms that
 * mangle multi-line env values). Returns null (not a throw) when unset, so
 * callers can distinguish "not configured" from "configured but invalid".
 */
export function parseServiceAccountCredentials(): GoogleServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  const candidates = [raw];
  try {
    candidates.push(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    // ignore - not valid base64, we'll just try the raw string
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed?.client_email && parsed?.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key,
          project_id: parsed.project_id,
        };
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}
