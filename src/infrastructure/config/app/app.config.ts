import { registerAs } from '@nestjs/config';
import { AppConfig, Environment } from './app.types';
import { AppEnvValidation } from './app.validation';
import { validateConfig } from '@/shared/utils';

/**
 * Get the application configuration from environment variables
 * @returns The application configuration
 */
export function getAppConfig(): AppConfig {
  const env = (process.env.APP_ENV as Environment) || 'development';

  return {
    env,
    port: Number(process.env.APP_PORT) || 3000,
    prefix: process.env.APP_PREFIX || 'api',
    name: process.env.APP_NAME || 'Storagie Backend',
    version: process.env.APP_VERSION || '1.0.0',
    allowedOrigins: (
      process.env.ALLOWED_ORIGINS ||
      'http://localhost:3000,http://localhost:5173'
    )
      .split(',')
      .map((origin) => origin.trim()),

    // Environment flags
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    isTest: env === 'test',
    isStaging: env === 'staging',

    // Security configuration
    security: {
      cookieSecret:
        process.env.COOKIE_SECRET ||
        (() => {
          if (env === 'production') {
            throw new Error('COOKIE_SECRET is required in production');
          }
          return 'dev-cookie-secret-change-in-production';
        })(),
      jwtSecret:
        process.env.JWT_SECRET ||
        (() => {
          if (env === 'production') {
            throw new Error('JWT_SECRET is required in production');
          }
          return 'dev-jwt-secret-change-in-production';
        })(),
      bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      corsEnabled: process.env.CORS_ENABLED !== 'false',
      helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    },

    // Feature flags
    features: {
      cacheEnabled: process.env.CACHE_ENABLED !== 'false',
      performanceLogging:
        env !== 'production' && process.env.PERFORMANCE_LOGGING !== 'false',
      detailedErrors: env !== 'production',
      swaggerEnabled:
        env !== 'production' && process.env.SWAGGER_ENABLED !== 'false',
      healthChecksEnabled: process.env.HEALTH_CHECKS_ENABLED !== 'false',
      asyncTasksEnabled: process.env.ASYNC_TASKS_ENABLED !== 'false',
    },

    // Monitoring configuration
    monitoring: {
      slowQueryThreshold: Number(process.env.SLOW_QUERY_THRESHOLD) || 1000,
      performanceLogging:
        env !== 'production' && process.env.PERFORMANCE_LOGGING !== 'false',
      errorTracking: process.env.ERROR_TRACKING_ENABLED !== 'false',
      metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    },
  };
}

/**
 * Register the application configuration
 * Following the same pattern as the API project
 */
export default registerAs<AppConfig>('app', () => {
  console.info('Registering AppConfig from environment variables');

  // Validate environment variables first
  validateConfig(process.env, AppEnvValidation);

  // Get validated configuration
  const config = getAppConfig();

  console.info(`✅ App Config loaded: ${config.name} on port ${config.port}`);

  return config;
});
