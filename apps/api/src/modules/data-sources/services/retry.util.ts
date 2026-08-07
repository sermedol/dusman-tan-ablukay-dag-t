export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
}

function getStatusCode(error: unknown): number | undefined {
  const err = error as { code?: number; response?: { status?: number }; status?: number };
  return err?.response?.status ?? err?.code ?? err?.status;
}

export function defaultIsRetryable(error: unknown): boolean {
  const status = getStatusCode(error);
  if (status === 429) return true; // rate limited
  if (status !== undefined && status >= 500) return true; // upstream/server error
  const err = error as { message?: string };
  if (err?.message?.includes('ETIMEDOUT') || err?.message?.includes('ECONNRESET')) return true;
  return false;
}

/**
 * Exponential backoff with full jitter, bounded to a finite number of
 * attempts - never retries forever. Used for all outbound Google API calls.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 8000;
  const isRetryable = options.isRetryable ?? defaultIsRetryable;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !isRetryable(error)) {
        throw error;
      }
      const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const jitter = Math.random() * exponential * 0.5;
      const delay = exponential / 2 + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
