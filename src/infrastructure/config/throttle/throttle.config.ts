import { registerAs } from '@nestjs/config';
import { ThrottleConfig } from './throttle.types';
import { ThrottleEnvValidation } from './throttle.validation';
import { validateConfig } from '@/shared/utils';

/**
 * Get the throttling configuration from environment variables
 * @returns The throttling configuration
 */
export function getThrottleConfig(): ThrottleConfig {
  return {
    global: {
      ttl: Number(process.env.THROTTLE_TTL) || 60000, // 1 minute
      limit: Number(process.env.THROTTLE_LIMIT) || 100,
    },
    api: {
      ttl: Number(process.env.API_THROTTLE_TTL) || 60000, // 1 minute
      limit: Number(process.env.API_THROTTLE_LIMIT) || 60,
    },
    auth: {
      ttl: Number(process.env.AUTH_THROTTLE_TTL) || 900000, // 15 minutes
      limit: Number(process.env.AUTH_THROTTLE_LIMIT) || 5,
    },
    upload: {
      ttl: Number(process.env.UPLOAD_THROTTLE_TTL) || 60000, // 1 minute
      limit: Number(process.env.UPLOAD_THROTTLE_LIMIT) || 10,
    },
    heavy: {
      ttl: Number(process.env.HEAVY_THROTTLE_TTL) || 300000, // 5 minutes
      limit: Number(process.env.HEAVY_THROTTLE_LIMIT) || 3,
    },
  };
}

/**
 * Register the throttling configuration
 * Following the same pattern as the API project
 */
export default registerAs<ThrottleConfig>('throttle', () => {
  console.info('Registering ThrottleConfig from environment variables');

  // Validate environment variables first
  validateConfig(process.env, ThrottleEnvValidation);

  // Get validated configuration
  const config = getThrottleConfig();

  console.info('✅ Throttle Config loaded successfully');

  return config;
});
