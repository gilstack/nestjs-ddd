/**
 * Database configuration types and interfaces
 * Provides strongly typed configuration for TypeORM with autocomplete support
 */

export type DatabaseType =
  | 'postgres'
  | 'mysql'
  | 'mariadb'
  | 'sqlite'
  | 'better-sqlite3';

export interface DatabaseConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  migrationsRun: boolean;
}

export interface DatabaseConfigHelpers extends DatabaseConfig {
  isSQLite: boolean;
  isPostgreSQL: boolean;
  isMySQL: boolean;
  isMariaDB: boolean;
  connectionString?: string;
}

/**
 * Environment variables for database configuration
 */
export interface DatabaseEnvironmentVariables {
  DB_TYPE: DatabaseType;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_DATABASE: string;
  DB_SYNCHRONIZE?: string;
  DB_LOGGING?: string;
  DB_MIGRATIONS_RUN?: string;
  DB_SSL?: string;
  DB_SSL_REJECT_UNAUTHORIZED?: string;
}

/**
 * SSL configuration for database connections
 */
export interface DatabaseSSLConfig {
  rejectUnauthorized: boolean;
  ca?: string;
  cert?: string;
  key?: string;
}
