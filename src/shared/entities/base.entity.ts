import { Id, Timestamps } from '@/shared/types/base.types';

/**
 * Domain Base Entity Interface
 *
 * Pure domain interface without any ORM dependencies.
 * This ensures complete ORM independence for domain entities.
 */
export interface DomainBaseEntity extends Timestamps {
  readonly id: Id;
}

/**
 * Domain Entity Helper
 *
 * Provides utility methods for domain entities without ORM coupling.
 * This class can be extended by domain value objects and entities.
 */
export abstract class DomainEntityHelper {
  /**
   * Helper method to convert entity to plain object
   * Useful for API responses and domain separation
   */
  static toPlainObject<T extends DomainBaseEntity>(
    entity: T,
  ): Record<string, unknown> {
    return {
      ...entity,
    } as Record<string, unknown>;
  }

  /**
   * Check if entity was created recently
   * @param entity - The entity to check
   * @param hours - Number of hours to check (default: 24)
   */
  static isRecentlyCreated(
    entity: DomainBaseEntity,
    hours: number = 24,
  ): boolean {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    return entity.createdAt > hoursAgo;
  }

  /**
   * Check if entity was updated recently
   * @param entity - The entity to check
   * @param hours - Number of hours to check (default: 1)
   */
  static isRecentlyUpdated(
    entity: DomainBaseEntity,
    hours: number = 1,
  ): boolean {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    return entity.updatedAt > hoursAgo;
  }

  /**
   * Compare two entities by ID
   */
  static equals(a: DomainBaseEntity, b: DomainBaseEntity): boolean {
    return a.id === b.id;
  }

  /**
   * Clone entity (shallow copy)
   */
  static clone<T extends DomainBaseEntity>(entity: T): T {
    return { ...entity };
  }
}
