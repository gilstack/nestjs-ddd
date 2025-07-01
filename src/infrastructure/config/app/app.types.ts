export type Environment = 'development' | 'production' | 'test' | 'staging';

export interface AppConfig {
  env: Environment;
  port: number;
  prefix: string;
  name: string;
  version: string;
  allowedOrigins: string[];
  security: SecurityConfig;
  features: FeatureFlags;
  monitoring: MonitoringConfig;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  isStaging: boolean;
}

export interface SecurityConfig {
  cookieSecret: string;
  jwtSecret: string;
  bcryptRounds: number;
  rateLimitEnabled: boolean;
  corsEnabled: boolean;
  helmetEnabled: boolean;
}

export interface FeatureFlags {
  cacheEnabled: boolean;
  performanceLogging: boolean;
  detailedErrors: boolean;
  swaggerEnabled: boolean;
  healthChecksEnabled: boolean;
  asyncTasksEnabled: boolean;
}

export interface MonitoringConfig {
  slowQueryThreshold: number;
  performanceLogging: boolean;
  errorTracking: boolean;
  metricsEnabled: boolean;
}
