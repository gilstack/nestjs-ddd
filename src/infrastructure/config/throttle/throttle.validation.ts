import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Throttling environment variables validation class
 * Following the same pattern as the API project
 */
export class ThrottleEnvValidation {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_LIMIT?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  API_THROTTLE_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  API_THROTTLE_LIMIT?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  AUTH_THROTTLE_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  AUTH_THROTTLE_LIMIT?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  UPLOAD_THROTTLE_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  UPLOAD_THROTTLE_LIMIT?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  HEAVY_THROTTLE_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  HEAVY_THROTTLE_LIMIT?: number;
}
