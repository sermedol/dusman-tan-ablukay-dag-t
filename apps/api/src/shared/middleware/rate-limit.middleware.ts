import { Injectable, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter middleware
 * Production: Consider using Redis-based rate limiter for distributed systems
 */
@Injectable()
export class RateLimitMiddleware {
  private readonly logger = new Logger('RateLimitMiddleware');
  private store = new Map<string, ClientRecord>();
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.config.windowMs);
  }

  /**
   * Middleware handler
   */
  use = (req: Request, res: Response, next: NextFunction) => {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(req)
      : this.getClientKey(req);

    const now = Date.now();
    const record = this.store.get(key);

    // Check if rate limit exceeded
    if (record && now < record.resetTime) {
      if (record.count >= this.config.maxRequests) {
        this.logger.warn(`Rate limit exceeded for ${key}`);
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later',
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          },
        });
      }

      record.count++;
    } else {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
    }

    // Track response status for conditional skipping
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      const statusCode = res.statusCode;

      if (
        (this.config.skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
        (this.config.skipFailedRequests && statusCode >= 400)
      ) {
        // Don't count this request against the limit
        const record = this.store.get(key);
        if (record) {
          record.count--;
        }
      }

      return originalJson.call(res, data);
    }.bind(this);

    next();
  };

  /**
   * Get client identifier (IP address)
   */
  private getClientKey(req: Request): string {
    // Check for various proxy headers
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }

    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  /**
   * Reset rate limit for a specific key (useful for testing)
   */
  reset(key?: string) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(key: string) {
    return this.store.get(key);
  }
}

/**
 * Factory function for creating rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return new RateLimitMiddleware(config).use;
}
