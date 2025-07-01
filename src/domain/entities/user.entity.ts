import { Role, Status, AuthProvider } from '@/shared/types/enums';
import { DomainBaseEntity } from '@/shared/entities/base.entity';

/**
 * User Domain Entity
 *
 * Pure domain entity without any infrastructure dependencies.
 * Represents the core business concept of a User.
 */
export interface User extends DomainBaseEntity {
  readonly email: string;
  readonly name: string;
  readonly role: Role;
  readonly status: Status;
  readonly provider: AuthProvider;
  readonly verifiedAt?: Date | null;
}

/**
 * User Domain Methods
 *
 * Business logic methods for User entity.
 * These methods contain pure domain logic without infrastructure concerns.
 */
export class UserDomainService {
  /**
   * Check if user is active
   */
  static isActive(user: User): boolean {
    return user.status === Status.ACTIVE;
  }

  /**
   * Check if user is verified
   */
  static isVerified(user: User): boolean {
    return user.verifiedAt !== null && user.verifiedAt !== undefined;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User): boolean {
    return user.role === Role.ADMIN;
  }

  /**
   * Check if user can perform admin actions
   */
  static canPerformAdminActions(user: User): boolean {
    return this.isActive(user) && this.isAdmin(user);
  }

  /**
   * Get user display name
   */
  static getDisplayName(user: User): string {
    return user.name || user.email.split('@')[0] || '';
  }

  /**
   * Check if user needs verification
   */
  static needsVerification(user: User): boolean {
    return !this.isVerified(user) && user.status === Status.PENDING;
  }
}
