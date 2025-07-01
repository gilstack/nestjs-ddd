import {
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DatabaseType } from './database.types';

/**
 * Database environment variables validation class
 * Following the same pattern as the API project
 */
export class DatabaseEnvValidation {
  @IsString()
  @IsNotEmpty()
  @IsIn(['postgres', 'mysql', 'mariadb', 'sqlite', 'better-sqlite3'])
  DB_TYPE!: DatabaseType;

  @IsOptional()
  @IsString()
  DB_HOST?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT?: number;

  @IsOptional()
  @IsString()
  DB_USERNAME?: string;

  @IsOptional()
  @IsString()
  DB_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE!: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  DB_SYNCHRONIZE!: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  DB_LOGGING!: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  DB_MIGRATIONS_RUN!: boolean;
}
