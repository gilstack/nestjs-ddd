import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseConfig, DatabaseType } from './database.types';
import { DatabaseEnvValidation } from './database.validation';
import { validateConfig } from '@/shared/utils';

// Entities
import { UserEntity } from '@/infrastructure/database/entities/users/user.entity';

/**
 * Validate database type with proper error handling
 */
function validateDatabaseType(type: string): DatabaseType {
  const validTypes: DatabaseType[] = [
    'postgres',
    'mysql',
    'mariadb',
    'sqlite',
    'better-sqlite3',
  ];

  if (!validTypes.includes(type as DatabaseType)) {
    throw new Error(
      `❌ Invalid database type: '${type}'. Valid types: ${validTypes.join(', ')}`,
    );
  }

  return type as DatabaseType;
}

/**
 * Get the database configuration from environment variables with validation
 * @returns The database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const dbType = validateDatabaseType(process.env.DB_TYPE || 'postgres');
  const dbPort =
    Number(process.env.DB_PORT) || (dbType === 'postgres' ? 5432 : 3306);

  // Validate port range
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error(
      `❌ Invalid database port: ${process.env.DB_PORT}. Must be between 1-65535`,
    );
  }

  const config: DatabaseConfig = {
    type: dbType,
    host: process.env.DB_HOST || 'localhost',
    port: dbPort,
    username: process.env.DB_USERNAME || 'storagie_user',
    password: process.env.DB_PASSWORD || 'storagie_password',
    database:
      process.env.DB_DATABASE ||
      (dbType === 'sqlite' ? './storage/database.sqlite' : 'storagie'),
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  };

  // SQLite doesn't need host/port/username/password
  if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
    delete config.host;
    delete config.port;
    delete config.username;
    delete config.password;
  }

  return config;
}

/**
 * Register the database configuration
 * Following the same pattern as the API project
 */
export default registerAs<TypeOrmModuleOptions>('database', () => {
  console.info('Registering DatabaseConfig from environment variables');

  // Validate environment variables first
  validateConfig(process.env, DatabaseEnvValidation);

  // Get validated configuration
  const config = getDatabaseConfig();

  console.info(
    `✅ Database Config loaded: ${config.type}://${config.host}:${config.port}/${config.database}`,
  );

  // Return TypeORM configuration
  const typeormConfig: TypeOrmModuleOptions = {
    type: config.type as any,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    synchronize: config.synchronize,
    logging: config.logging,
    migrationsRun: config.migrationsRun,
    entities: [UserEntity],
    migrations: ['dist/infrastructure/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };

  return typeormConfig;
});
