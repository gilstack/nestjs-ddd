import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { AppConfig } from '@/infrastructure/config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalOperations: number;
}

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private redis: Redis | null = null;
  private readonly defaultTtl: number = 300; // 5 minutes
  private readonly defaultPrefix: string = 'storagie:';

  // Cache statistics
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalOperations: 0,
  };

  constructor(private readonly configService: ConfigService) {
    const appConfig = this.configService.get<AppConfig>('app');
    const redisConfig = this.configService.get('redis');

    if (!appConfig?.features.cacheEnabled) {
      this.logger.warn('Cache is disabled via feature flag');
      // redis stays null when cache is disabled
      return;
    }

    const redisOptions: RedisOptions = {
      host: redisConfig?.host || 'localhost',
      port: redisConfig?.port || 6379,
      password: redisConfig?.password,
      db: redisConfig?.db || 0,
      // retryDelayOnFailover: 100, // Option removed - not valid in current Redis version
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      commandTimeout: 5000,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      keyPrefix: this.defaultPrefix,
    };

    this.redis = new Redis(redisOptions);

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('ready', () => {
      this.logger.log('Redis is ready to receive commands');
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      if (!this.redis) return null;

      const prefixedKey = this.buildKey(key, options?.prefix);
      const value = await this.redis.get(prefixedKey);

      if (value) {
        this.updateStats('hit');
        return this.deserialize<T>(value, options?.compress);
      }

      this.updateStats('miss');
      return null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      this.updateStats('miss');
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const prefixedKey = this.buildKey(key, options?.prefix);
      const serializedValue = this.serialize(value, options?.compress);
      const ttl = options?.ttl || this.defaultTtl;

      if (ttl > 0) {
        await this.redis.setex(prefixedKey, ttl, serializedValue);
      } else {
        await this.redis.set(prefixedKey, serializedValue);
      }

      return true;
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string, prefix?: string): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const prefixedKey = this.buildKey(key, prefix);
      const result = await this.redis.del(prefixedKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const prefixedKey = this.buildKey(key, prefix);
      const result = await this.redis.exists(prefixedKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string, prefix?: string): Promise<number> {
    try {
      if (!this.redis) return 0;

      const searchPattern = this.buildKey(pattern, prefix);
      const keys = await this.redis.keys(searchPattern);

      if (keys.length === 0) return 0;

      // Remove prefix from keys since Redis.del expects keys without prefix
      const unprefixedKeys = keys.map((key) =>
        key.startsWith(this.defaultPrefix)
          ? key.substring(this.defaultPrefix.length)
          : key,
      );

      return await this.redis.del(...unprefixedKeys);
    } catch (error) {
      this.logger.error(
        `Cache DELETE PATTERN error for pattern ${pattern}:`,
        error,
      );
      return 0;
    }
  }

  /**
   * Set TTL for existing key
   */
  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const prefixedKey = this.buildKey(key, prefix);
      const result = await this.redis.expire(prefixedKey, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.stats.hitRate =
      this.stats.totalOperations > 0
        ? (this.stats.hits / this.stats.totalOperations) * 100
        : 0;

    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalOperations: 0,
    };
  }

  /**
   * Flush all cache data
   */
  async flush(): Promise<boolean> {
    try {
      if (!this.redis) return false;

      await this.redis.flushdb();
      this.logger.warn('Cache flushed completely');
      return true;
    } catch (error) {
      this.logger.error('Cache FLUSH error:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<string | null> {
    try {
      if (!this.redis) return null;

      const info = await this.redis.info();
      return info;
    } catch (error) {
      this.logger.error('Failed to get Redis info:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Build prefixed key
   */
  private buildKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || '';
    return finalPrefix ? `${finalPrefix}:${key}` : key;
  }

  /**
   * Serialize value for storage
   */
  private serialize<T>(value: T, compress?: boolean): string {
    const json = JSON.stringify(value);

    if (compress && json.length > 1024) {
      // TODO: Implement compression if needed
      // For now, just return JSON
      return json;
    }

    return json;
  }

  /**
   * Deserialize value from storage
   */
  private deserialize<T>(value: string, compressed?: boolean): T {
    try {
      if (compressed) {
        // TODO: Implement decompression if needed
        // For now, just parse JSON
        return JSON.parse(value);
      }

      return JSON.parse(value);
    } catch (error) {
      this.logger.error('Failed to deserialize cached value:', error);
      throw error;
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(type: 'hit' | 'miss'): void {
    if (type === 'hit') {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    this.stats.totalOperations++;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
