import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';
import { Id } from '@/shared/types/base.types';

/**
 * Abstract Infrastructure Base Entity
 *
 * TypeORM-specific base entity for infrastructure layer.
 * This is separate from domain entities to maintain ORM independence.
 *
 * @abstract
 */
export abstract class InfrastructureBaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: Id;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;

  /**
   * Soft delete functionality
   * Can be enabled per entity if needed
   */
  // @DeleteDateColumn({
  //   type: 'timestamp',
  //   nullable: true,
  // })
  // deletedAt?: Date;

  /**
   * Helper method to convert entity to plain object
   * Useful for mapping to domain entities
   */
  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.getEntitySpecificFields(),
    };
  }

  /**
   * Abstract method for entity-specific field serialization
   * Must be implemented by each concrete infrastructure entity
   */
  protected abstract getEntitySpecificFields(): Record<string, unknown>;

  /**
   * Check if entity was created recently
   * @param hours - Number of hours to check (default: 24)
   */
  isRecentlyCreated(hours: number = 24): boolean {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    return this.createdAt > hoursAgo;
  }

  /**
   * Check if entity was updated recently
   * @param hours - Number of hours to check (default: 1)
   */
  isRecentlyUpdated(hours: number = 1): boolean {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    return this.updatedAt > hoursAgo;
  }
}
