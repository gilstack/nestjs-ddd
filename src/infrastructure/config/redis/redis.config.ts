import { registerAs } from '@nestjs/config';
import { RedisConfig } from './redis.types';
import { RedisEnvValidation } from './redis.validation';
import { validateConfig } from '@/shared/utils';

/**
 * Get the Redis configuration from environment variables
 * @returns The Redis configuration
 */
export function getRedisConfig(): RedisConfig {
  const config: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    db: Number(process.env.REDIS_DB) || 0,
  };

  // Only add password if it exists
  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }

  return config;
}

/**
 * Register the Redis configuration
 * Following the same pattern as the API project
 */
export default registerAs<RedisConfig>('redis', () => {
  console.info('Registering RedisConfig from environment variables');

  // Validate environment variables first
  validateConfig(process.env, RedisEnvValidation);

  // Get validated configuration
  const config = getRedisConfig();

  console.info(
    `✅ Redis Config loaded: ${config.host}:${config.port}/${config.db}`,
  );

  return config;
});
