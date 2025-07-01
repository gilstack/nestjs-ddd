/**
 * Infrastructure Configuration Module
 * Centralized configuration management for the entire application
 *
 * This module provides:
 * - Environment variable validation
 * - Type-safe configuration objects
 * - Autocomplete support for all config values
 * - Centralized configuration management
 */

// App Configuration
export * from './app';

// Database Configuration
export * from './database';

// JWT Configuration
export * from './jwt';

// Redis Configuration
export * from './redis';

// Throttling Configuration
export * from './throttle';

// Configuration utilities
export * from '@/shared/utils/validate-config';

/**
 * All configuration loaders for easy import in app.module.ts
 */
import { appConfig } from './app';
import { databaseConfig } from './database';
import { jwtConfig } from './jwt';
import { redisConfig } from './redis';
import { throttleConfig } from './throttle';

export const allConfigs = [
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  throttleConfig,
];

/**
 * Configuration keys for type-safe access via ConfigService
 */
export const CONFIG_KEYS = {
  APP: 'app',
  DATABASE: 'database',
  JWT: 'jwt',
  REDIS: 'redis',
  THROTTLE: 'throttle',
} as const;

export type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];
