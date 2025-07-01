import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  RedisConfig,
  ThrottleConfig,
  CONFIG_KEYS,
  ConfigKey,
} from '@/infrastructure/config';

/**
 * Type-safe configuration service with autocomplete support
 * Provides strongly typed access to all configuration values with lazy loading
 */
@Injectable()
export class TypedConfigService {
  private readonly _configs = new Map<
    ConfigKey,
    AppConfig | DatabaseConfig | JwtConfig | RedisConfig | ThrottleConfig
  >();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get app configuration with full type safety and autocomplete
   * Uses lazy loading with cache for performance
   */
  get app(): AppConfig {
    if (!this._configs.has(CONFIG_KEYS.APP)) {
      const config = this.configService.get<AppConfig>(CONFIG_KEYS.APP);
      if (!config) {
        throw new Error('App configuration not found');
      }
      this._configs.set(CONFIG_KEYS.APP, config);
    }
    const config = this._configs.get(CONFIG_KEYS.APP);
    if (!config) {
      throw new Error('App configuration not found in cache');
    }
    return config as AppConfig;
  }

  /**
   * Get database configuration with full type safety and autocomplete
   */
  get database(): DatabaseConfig {
    if (!this._configs.has(CONFIG_KEYS.DATABASE)) {
      const config = this.configService.get<DatabaseConfig>(
        CONFIG_KEYS.DATABASE,
      );
      if (!config) {
        throw new Error('Database configuration not found');
      }
      this._configs.set(CONFIG_KEYS.DATABASE, config);
    }
    const config = this._configs.get(CONFIG_KEYS.DATABASE);
    if (!config) {
      throw new Error('Database configuration not found in cache');
    }
    return config as DatabaseConfig;
  }

  /**
   * Get JWT configuration with full type safety and autocomplete
   */
  get jwt(): JwtConfig {
    if (!this._configs.has(CONFIG_KEYS.JWT)) {
      const config = this.configService.get<JwtConfig>(CONFIG_KEYS.JWT);
      if (!config) {
        throw new Error('JWT configuration not found');
      }
      this._configs.set(CONFIG_KEYS.JWT, config);
    }
    const config = this._configs.get(CONFIG_KEYS.JWT);
    if (!config) {
      throw new Error('JWT configuration not found in cache');
    }
    return config as JwtConfig;
  }

  /**
   * Get Redis configuration with full type safety and autocomplete
   */
  get redis(): RedisConfig {
    if (!this._configs.has(CONFIG_KEYS.REDIS)) {
      const config = this.configService.get<RedisConfig>(CONFIG_KEYS.REDIS);
      if (!config) {
        throw new Error('Redis configuration not found');
      }
      this._configs.set(CONFIG_KEYS.REDIS, config);
    }
    const config = this._configs.get(CONFIG_KEYS.REDIS);
    if (!config) {
      throw new Error('Redis configuration not found in cache');
    }
    return config as RedisConfig;
  }

  /**
   * Get throttling configuration with full type safety and autocomplete
   */
  get throttle(): ThrottleConfig {
    if (!this._configs.has(CONFIG_KEYS.THROTTLE)) {
      const config = this.configService.get<ThrottleConfig>(
        CONFIG_KEYS.THROTTLE,
      );
      if (!config) {
        throw new Error('Throttle configuration not found');
      }
      this._configs.set(CONFIG_KEYS.THROTTLE, config);
    }
    const config = this._configs.get(CONFIG_KEYS.THROTTLE);
    if (!config) {
      throw new Error('Throttle configuration not found in cache');
    }
    return config as ThrottleConfig;
  }

  /**
   * Generic method to get any configuration by key
   */
  get<T>(key: ConfigKey): T | undefined {
    return this.configService.get<T>(key);
  }

  /**
   * Get configuration value by path (for nested access)
   */
  getByPath<T>(path: string): T | undefined {
    return this.configService.get<T>(path);
  }

  /**
   * Generic method to get required configuration by key
   */
  getRequired<T>(key: ConfigKey): T {
    const value = this.configService.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Required configuration key '${key}' is missing`);
    }
    return value;
  }

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this.app.env === 'production';
  }

  /**
   * Check if running in development
   */
  get isDevelopment(): boolean {
    return this.app.env === 'development';
  }

  /**
   * Check if running in test
   */
  get isTest(): boolean {
    return this.app.env === 'test';
  }
}
