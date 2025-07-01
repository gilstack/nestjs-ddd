import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * TypeORM CLI DataSource - INDEPENDENTE
 *
 * Este arquivo é usado especificamente para operações CLI do TypeORM.
 * É mantido SEPARADO da configuração da aplicação por estas razões:
 *
 * PORQUÊ SEPARADO?
 * ================
 * 1. ✅ CLI completamente independente do NestJS
 * 2. ✅ Sem problemas de imports/dependencies circulares
 * 3. ✅ Mais rápido para executar comandos
 * 4. ✅ Padrão recomendado pela comunidade TypeORM
 * 5. ✅ Menos surface area para bugs
 *
 * FUNCIONALIDADE:
 * ===============
 * 1. MIGRATIONS:
 *    - npm run db:migration:generate [name] -> Gera nova migration
 *    - npm run db:migration:run -> Executa migrations pendentes
 *    - npm run db:migration:revert -> Desfaz última migration
 *
 * 2. SCHEMA OPERATIONS:
 *    - npm run db:schema:sync -> Sincroniza schema (PERIGOSO em produção!)
 *    - npm run db:schema:drop -> Remove todo o schema (MUITO PERIGOSO!)
 *
 * IMPORTANTE: Mantenha esta configuração SINCRONIZADA com:
 * src/infrastructure/config/database/database.config.ts
 */

// Validate database type
const validDbTypes = ['postgres', 'mysql', 'mariadb', 'sqlite'] as const;
type DatabaseType = (typeof validDbTypes)[number];

function validateDbType(type: string): DatabaseType {
  if (!validDbTypes.includes(type as DatabaseType)) {
    throw new Error(
      `❌ Invalid DB_TYPE: ${type}. Valid: ${validDbTypes.join(', ')}`,
    );
  }
  return type as DatabaseType;
}

// Environment variables with validation
const dbType = validateDbType(process.env.DB_TYPE || 'postgres');
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(
  process.env.DB_PORT || (dbType === 'postgres' ? '5432' : '3306'),
  10,
);
const dbUsername = process.env.DB_USERNAME || 'storagie_user';
const dbPassword = process.env.DB_PASSWORD || 'storagie_password';
const dbName =
  process.env.DB_DATABASE ||
  (dbType === 'sqlite' ? './storage/database.sqlite' : 'storagie');
const isProduction = process.env.NODE_ENV === 'production';

// Validate port
if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error(`❌ Invalid DB_PORT: ${process.env.DB_PORT}`);
}

// Paths for CLI operations
const rootDir = process.cwd();
const srcEntities = join(
  rootDir,
  'src/infrastructure/database/entities/**/*.entity{.ts,.js}',
);
const distEntities = join(
  rootDir,
  'dist/infrastructure/database/entities/**/*.entity{.ts,.js}',
);
const srcMigrations = join(
  rootDir,
  'src/infrastructure/database/migrations/*{.ts,.js}',
);
const distMigrations = join(
  rootDir,
  'dist/infrastructure/database/migrations/*{.ts,.js}',
);

// Base configuration
const baseConfig = {
  entities: [srcEntities, distEntities],
  migrations: [srcMigrations, distMigrations],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false, // Always false for CLI
  migrationsRun: false, // CLI controls this
  logging:
    process.env.DB_LOGGING === 'true'
      ? (['query', 'error', 'schema', 'warn'] as const)
      : (['error'] as const),
};

// Database-specific configuration
let dbConfig: any = { ...baseConfig };

switch (dbType) {
  case 'postgres':
    dbConfig = {
      ...dbConfig,
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: dbName,
      schema: process.env.DB_SCHEMA || 'public',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };
    break;

  case 'mysql':
  case 'mariadb':
    dbConfig = {
      ...dbConfig,
      type: dbType,
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: dbName,
      charset: 'utf8mb4',
    };
    break;

  case 'sqlite':
    dbConfig = {
      ...dbConfig,
      type: 'sqlite',
      database: dbName,
    };
    break;
}

/**
 * TypeORM DataSource for CLI operations
 */
const AppDataSource = new DataSource(dbConfig);
export default AppDataSource;

// Log configuration for debugging
console.info(`🔧 TypeORM CLI configured for ${dbType}`);
if (dbType !== 'sqlite') {
  console.info(`   Connection: ${dbHost}:${dbPort}/${dbName}`);
}
