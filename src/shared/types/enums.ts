/**
 * Domain Enums for Users Module
 */

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}

export enum AuthProvider {
  PASSPORT = 'PASSPORT',
  GOOGLE = 'GOOGLE',
}
