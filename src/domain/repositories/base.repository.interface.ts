import {
  Id,
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/base.types';

/**
 * Base Repository Interface
 *
 * Generic repository pattern that's completely ORM-agnostic.
 * Any ORM (TypeORM, Prisma, Sequelize, etc.) can implement this interface.
 */
export interface BaseRepositoryInterface<
  TEntity,
  TCreateInput = Partial<TEntity>,
  TUpdateInput = Partial<TEntity>,
> {
  // Basic CRUD operations
  findById(id: Id): Promise<TEntity | null>;
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<TEntity>>;
  create(data: TCreateInput): Promise<TEntity>;
  update(id: Id, data: TUpdateInput): Promise<TEntity>;
  delete(id: Id): Promise<void>;

  // Utility operations
  exists(id: Id): Promise<boolean>;
  count(): Promise<number>;

  // Batch operations
  createMany(data: TCreateInput[]): Promise<TEntity[]>;
  updateMany(ids: Id[], data: TUpdateInput): Promise<TEntity[]>;
  deleteMany(ids: Id[]): Promise<void>;

  // Query operations
  findWhere(conditions: Partial<TEntity>): Promise<TEntity[]>;
  findOneWhere(conditions: Partial<TEntity>): Promise<TEntity | null>;

  // Transaction support (ORM-agnostic)
  withTransaction<T>(operation: (repository: this) => Promise<T>): Promise<T>;
}

/**
 * Query Builder Interface
 *
 * Provides a fluent interface for building complex queries
 * without depending on specific ORM syntax.
 */
export interface QueryBuilderInterface<TEntity> {
  where<K extends keyof TEntity>(
    field: K,
    operator: QueryOperator,
    value: TEntity[K],
  ): this;
  whereIn<K extends keyof TEntity>(field: K, values: TEntity[K][]): this;
  whereBetween<K extends keyof TEntity>(
    field: K,
    min: TEntity[K],
    max: TEntity[K],
  ): this;
  whereNull(field: keyof TEntity): this;
  whereNotNull(field: keyof TEntity): this;
  orderBy(field: keyof TEntity, direction?: 'ASC' | 'DESC'): this;
  limit(count: number): this;
  offset(count: number): this;
  select(fields: (keyof TEntity)[]): this;
  join(relation: string, alias?: string): this;
  leftJoin(relation: string, alias?: string): this;

  // Execution methods
  getMany(): Promise<TEntity[]>;
  getOne(): Promise<TEntity | null>;
  getCount(): Promise<number>;
  getPaginated(pagination: PaginationParams): Promise<PaginatedResult<TEntity>>;
}

/**
 * Query operators supported by the abstraction layer
 */
export type QueryOperator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'LIKE'
  | 'ILIKE'
  | 'IN'
  | 'NOT IN';

/**
 * Transaction Interface
 *
 * Provides ORM-agnostic transaction management
 */
export interface TransactionInterface {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

/**
 * Migration Interface
 *
 * ORM-agnostic migration operations
 */
export interface MigrationInterface {
  up(): Promise<void>;
  down(): Promise<void>;
  name: string;
  timestamp: number;
}

/**
 * Schema Builder Interface
 *
 * For programmatic schema changes without ORM-specific syntax
 */
export interface SchemaBuilderInterface {
  createTable(name: string, definition: TableDefinition): Promise<void>;
  dropTable(name: string): Promise<void>;
  addColumn(table: string, column: ColumnDefinition): Promise<void>;
  dropColumn(table: string, columnName: string): Promise<void>;
  addIndex(
    table: string,
    columns: string[],
    options?: IndexOptions,
  ): Promise<void>;
  dropIndex(table: string, indexName: string): Promise<void>;
}

export interface TableDefinition {
  columns: ColumnDefinition[];
  primaryKey?: string[];
  indexes?: IndexDefinition[];
  foreignKeys?: ForeignKeyDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  nullable?: boolean;
  default?: any;
  unique?: boolean;
  autoIncrement?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

export interface ForeignKeyDefinition {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface IndexOptions {
  unique?: boolean;
  name?: string;
}

export type ColumnType =
  | 'string'
  | 'text'
  | 'integer'
  | 'bigint'
  | 'decimal'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'json'
  | 'uuid'
  | 'enum';
