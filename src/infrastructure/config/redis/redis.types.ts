/**
 * Redis configuration types and interfaces
 * Provides strongly typed configuration for Redis connections
 */

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface RedisConfigHelpers extends RedisConfig {
  connectionString: string;
  isLocal: boolean;
}
