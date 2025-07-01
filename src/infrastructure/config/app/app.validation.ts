import {
  IsString,
  IsNumber,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Environment } from './app.types';

/**
 * App environment variables validation class
 * Following the same pattern as the API project
 */
export class AppEnvValidation {
  @IsString()
  @IsNotEmpty()
  @IsIn(['development', 'production', 'test', 'staging'])
  APP_ENV!: Environment;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  APP_PORT!: number;

  @IsString()
  @IsNotEmpty()
  APP_PREFIX!: string;

  @IsString()
  @IsNotEmpty()
  APP_NAME!: string;

  @IsOptional()
  @IsString()
  APP_VERSION?: string;

  @IsString()
  @IsNotEmpty()
  ALLOWED_ORIGINS!: string;

  // Security variables (optional for development)
  @IsOptional()
  @IsString()
  COOKIE_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  BCRYPT_ROUNDS?: number;

  // Feature flags (optional, defaults will be used)
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  CACHE_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  PERFORMANCE_LOGGING?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  SWAGGER_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  HEALTH_CHECKS_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ASYNC_TASKS_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  RATE_LIMIT_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  CORS_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  HELMET_ENABLED?: boolean;

  // Monitoring variables (optional)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  SLOW_QUERY_THRESHOLD?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ERROR_TRACKING_ENABLED?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  METRICS_ENABLED?: boolean;
}
