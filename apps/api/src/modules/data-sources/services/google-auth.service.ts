import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

import { isGoogleDriveEnabled, parseServiceAccountCredentials } from '../google-config';

// Use googleapis' own bundled auth-library types rather than importing the
// `google-auth-library` package directly - that package is also a transitive
// dependency of googleapis and can resolve to a different version, which
// makes the two JWT types structurally incompatible under strict TS checks.
type JWT = InstanceType<typeof google.auth.JWT>;

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

export class GoogleIntegrationDisabledError extends Error {
  constructor(reason: string) {
    super(`Google Drive/Sheets integration is not available: ${reason}`);
    this.name = 'GoogleIntegrationDisabledError';
  }
}

/**
 * Builds and caches an authorized Google API client from a service-account
 * JSON credential. Never throws on module init when credentials are absent -
 * the app must start fine without Google configured; callers only see an
 * error the moment they actually try to use a Google-backed endpoint.
 */
@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger('GoogleAuthService');
  private cachedClient: JWT | null = null;

  isEnabled(): boolean {
    return isGoogleDriveEnabled() && parseServiceAccountCredentials() !== null;
  }

  /**
   * Returns a human-readable reason the integration is unavailable, or null
   * if it's properly configured. Useful for surfacing a clear error to admins
   * instead of a generic 500.
   */
  getDisabledReason(): string | null {
    if (!isGoogleDriveEnabled()) {
      return 'GOOGLE_DRIVE_ENABLED is not set to "true"';
    }
    if (!parseServiceAccountCredentials()) {
      return 'GOOGLE_SERVICE_ACCOUNT_JSON is missing or invalid';
    }
    return null;
  }

  async getAuthorizedClient(): Promise<JWT> {
    if (this.cachedClient) return this.cachedClient;

    const reason = this.getDisabledReason();
    if (reason) {
      throw new GoogleIntegrationDisabledError(reason);
    }

    const credentials = parseServiceAccountCredentials()!;
    const client = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
    });

    await client.authorize();
    this.logger.log(`Authorized Google service account (${credentials.client_email})`);
    this.cachedClient = client;
    return client;
  }
}
