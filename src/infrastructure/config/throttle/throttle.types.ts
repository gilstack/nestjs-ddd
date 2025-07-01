/**
 * Throttling configuration types and interfaces
 * Provides strongly typed configuration for rate limiting
 */

export interface ThrottleConfig {
  global: {
    ttl: number;
    limit: number;
  };
  api: {
    ttl: number;
    limit: number;
  };
  auth: {
    ttl: number;
    limit: number;
  };
  upload: {
    ttl: number;
    limit: number;
  };
  heavy: {
    ttl: number;
    limit: number;
  };
}

export interface ThrottleConfigHelpers extends ThrottleConfig {
  isStrictMode: boolean;
  isProductionMode: boolean;
}
