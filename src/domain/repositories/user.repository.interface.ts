import { User } from '@/domain/entities/user.entity';

import {
  Id,
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/base.types';

export interface UserRepositoryInterface {
  findById(id: Id): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<User>>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: Id, userData: Partial<User>): Promise<User>;
  delete(id: Id): Promise<void>;
  exists(id: Id): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
