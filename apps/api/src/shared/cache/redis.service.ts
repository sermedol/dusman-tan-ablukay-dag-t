import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('RedisService');
  private client: Redis;
  private readonly ttlMap = {
    entitySearch: 3600,
    relationGraph: 1800,
    entityStats: 900,
    importStats: 300,
    geoCluster: 1800,
    timelineEvents: 600,
  };

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.warn(`Cache get error for ${key}: ${error}`);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlType?: keyof typeof this.ttlMap
  ): Promise<boolean> {
    try {
      const ttl = ttlType ? this.ttlMap[ttlType] : 3600;
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.warn(`Cache set error for ${key}: ${error}`);
      return false;
    }
  }

  async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(`Cache delete error: ${error}`);
      return 0;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(`Cache invalidate pattern error: ${error}`);
      return 0;
    }
  }

  async hget(key: string, field: string): Promise<any | null> {
    try {
      const data = await this.client.hget(key, field);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.warn(`Cache hget error for ${key}:${field}: ${error}`);
      return null;
    }
  }

  async hset(key: string, field: string, value: any): Promise<number> {
    try {
      return await this.client.hset(key, field, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`Cache hset error for ${key}:${field}: ${error}`);
      return 0;
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    try {
      const data = await this.client.hgetall(key);
      const result: Record<string, any> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value as string);
      }
      return result;
    } catch (error) {
      this.logger.warn(`Cache hgetall error for ${key}: ${error}`);
      return {};
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.warn(`Cache expire error for ${key}: ${error}`);
      return 0;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.warn(`Cache incr error for ${key}: ${error}`);
      return 0;
    }
  }
}
