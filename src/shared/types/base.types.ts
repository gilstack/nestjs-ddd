/**
 * Base Types for Domain Driven Design Architecture
 *
 * Strongly typed, DDD-compliant type definitions that eliminate any usage
 * and provide type safety across the entire application.
 */

// === CORE IDENTITY TYPES ===

/** Strongly typed identifier for domain entities */
export type Id = string;

/** Brand type for creating distinct ID types */
export type Brand<T, U> = T & { readonly __brand: U };

/** Specific ID types for type safety */
export type UserId = Brand<Id, 'UserId'>;
export type EntityId = Brand<Id, 'EntityId'>;

// === TIMESTAMP TYPES ===

/** Required timestamps for all entities */
export interface Timestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Optional timestamps for creation DTOs */
export interface OptionalTimestamps {
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// === PAGINATION TYPES ===

/** Strongly typed sort directions */
export type SortDirection = 'ASC' | 'DESC';

/** Generic pagination parameters */
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: SortDirection;
}

/** Pagination metadata */
export interface PaginationMeta {
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/** Paginated result container */
export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

// === FILTER AND SEARCH TYPES ===

/** Type-safe filter values */
export type FilterValue = string | number | boolean | Date | null | undefined;

/** Filter operation types */
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in'
  | 'nin';

/** Advanced filter operations */
export interface FilterOperation<TValue = FilterValue> {
  readonly operator: FilterOperator;
  readonly value: TValue;
}

/** Generic filter parameters using Record for better compatibility */
export type FilterParams = Record<string, FilterValue | FilterValue[]>;

/** Advanced filter with operations */
export type AdvancedFilter = Record<
  string,
  FilterValue | FilterOperation | FilterOperation[]
>;

/** Search parameters */
export interface SearchParams {
  readonly query?: string;
  readonly filters?: FilterParams | AdvancedFilter;
  readonly pagination?: PaginationParams;
}

// === API RESPONSE TYPES ===

/** Base API response without data */
export interface BaseApiResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly timestamp?: string;
  readonly path?: string;
}

/** Generic API response with strongly typed data */
export interface ApiResponse<TData = unknown> extends BaseApiResponse {
  readonly data?: TData;
  readonly errors?: readonly string[];
  readonly meta?: PaginationMeta | Record<string, unknown>;
}

/** Error response type */
export interface ErrorResponse extends BaseApiResponse {
  readonly success: false;
  readonly message: string;
  readonly errors?: readonly string[];
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;
}

/** Success response type */
export interface SuccessResponse<TData = unknown> extends BaseApiResponse {
  readonly success: true;
  readonly data: TData;
  readonly message?: string;
  readonly meta?: PaginationMeta | Record<string, unknown>;
}

// === UTILITY TYPES ===

/** Deep readonly type */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends Record<string, unknown>
      ? DeepReadonly<T[P]>
      : T[P];
};

/** Optional except for specified keys */
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Required specific keys */
export type RequiredOnly<T, K extends keyof T> = Required<Pick<T, K>>;

/** Omit multiple keys helper */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

/** Extract function return type */
export type ExtractReturnType<T> = T extends (...args: unknown[]) => infer R
  ? R
  : never;

/** Extract async function return type */
export type ExtractAsyncReturnType<T> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : never;

// === DOMAIN TYPES ===

/** Base entity interface for domain entities */
export interface BaseEntity {
  readonly id: Id;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Create input type helper - removes readonly and computed fields */
export type CreateInput<T extends BaseEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>;

/** Update input type helper - makes all fields optional except ID */
export type UpdateInput<T extends BaseEntity> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>
>;

/** Query options for repository operations */
export interface QueryOptions {
  readonly select?: readonly string[];
  readonly include?: readonly string[];
  readonly orderBy?: Record<string, SortDirection>;
  readonly limit?: number;
  readonly offset?: number;
}
