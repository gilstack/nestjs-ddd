import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Redis environment variables validation class
 * Following the same pattern as the API project
 */
export class RedisEnvValidation {
  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_PORT!: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_DB!: number;
}
