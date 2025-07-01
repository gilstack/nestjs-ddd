import { SetMetadata } from '@nestjs/common';

export interface CacheConfig {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  keyGenerator?: (...args: unknown[]) => string;
  condition?: (...args: unknown[]) => boolean;
}

export const CACHE_KEY = Symbol('CACHE_KEY');

/**
 * Cache decorator for methods
 * @param config Cache configuration
 */
export function Cacheable(config?: CacheConfig) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    SetMetadata(CACHE_KEY, config || {})(target, propertyKey, descriptor);
    return descriptor;
  };
}

/**
 * Cache eviction decorator
 * @param patterns Cache key patterns to evict
 */
export function CacheEvict(_patterns: string | string[]) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args);

      // TODO: Implement cache eviction logic
      // This would require access to the cache service

      return result;
    };

    return descriptor;
  };
}

/**
 * Generate a cache key from method arguments
 */
export function generateCacheKey(
  className: string,
  methodName: string,
  args: unknown[],
  customGenerator?: (...args: unknown[]) => string,
): string {
  if (customGenerator) {
    return customGenerator(...args);
  }

  const argsKey =
    args.length > 0
      ? JSON.stringify(args).slice(0, 100) // Limit key length
      : 'no-args';

  return `${className}:${methodName}:${argsKey}`;
}
