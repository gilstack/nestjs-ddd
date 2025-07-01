import { registerAs } from '@nestjs/config';
import { JwtConfig } from './jwt.types';
import { JwtEnvValidation } from './jwt.validation';
import { validateConfig } from '@/shared/utils';

/**
 * Get the JWT configuration from environment variables
 * @returns The JWT configuration
 */
export function getJwtConfig(): JwtConfig {
  return {
    secret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'your-super-secret-refresh-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
}

/**
 * Register the JWT configuration
 * Following the same pattern as the API project
 */
export default registerAs<JwtConfig>('jwt', () => {
  console.info('Registering JwtConfig from environment variables');

  // Validate environment variables first
  validateConfig(process.env, JwtEnvValidation);

  // Get validated configuration
  const config = getJwtConfig();

  console.info('✅ JWT Config loaded successfully');

  return config;
});
