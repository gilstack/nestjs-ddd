import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface';
import { User } from '@/domain/entities/user.entity';
import { UserEntity } from '@/infrastructure/database/entities/users/user.entity';
import { UserMapper } from '@/infrastructure/database/entities/users/user.mapper';
import { RedisCacheService } from '@/infrastructure/cache/redis-cache.service';

import {
  Id,
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/base.types';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryInterface {
  private readonly logger = new Logger(TypeOrmUserRepository.name);
  private readonly cachePrefix = 'user';
  private readonly cacheTtl = {
    user: 300, // 5 minutes
    userList: 60, // 1 minute
    userExists: 600, // 10 minutes
  };

  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly cacheService: RedisCacheService,
  ) {}

  async findById(id: Id): Promise<User | null> {
    const cacheKey = `${this.cachePrefix}:id:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Cache miss for user ID: ${id}`);
        const entity = await this.repository.findOne({
          where: { id },
          select: [
            'id',
            'email',
            'name',
            'role',
            'status',
            'provider',
            'verifiedAt',
            'createdAt',
            'updatedAt',
          ],
        });
        return entity ? UserMapper.toDomain(entity) : null;
      },
      { ttl: this.cacheTtl.user, prefix: this.cachePrefix },
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `${this.cachePrefix}:email:${email}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Cache miss for user email: ${email}`);
        const entity = await this.repository.findOne({
          where: { email },
          select: [
            'id',
            'email',
            'name',
            'role',
            'status',
            'provider',
            'verifiedAt',
            'createdAt',
            'updatedAt',
          ],
        });
        return entity ? UserMapper.toDomain(entity) : null;
      },
      { ttl: this.cacheTtl.user, prefix: this.cachePrefix },
    );
  }

  async findAll(pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 10, 100); // Max 100 items per page
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'DESC';

    const cacheKey = `${this.cachePrefix}:list:${page}:${limit}:${sortBy}:${sortOrder}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Cache miss for user list page: ${page}`);
        const skip = (page - 1) * limit;

        const [entities, totalItems] = await this.repository.findAndCount({
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
          select: [
            'id',
            'email',
            'name',
            'role',
            'status',
            'provider',
            'verifiedAt',
            'createdAt',
            'updatedAt',
          ],
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
          data: UserMapper.toDomainList(entities),
          meta: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      { ttl: this.cacheTtl.userList, prefix: this.cachePrefix },
    );
  }

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    try {
      const entityData = UserMapper.toCreateEntity(userData);
      const entity = this.repository.create(entityData);
      const savedEntity = await this.repository.save(entity);
      const user = UserMapper.toDomain(savedEntity);

      // Cache the newly created user
      await this.cacheUser(user);

      // Invalidate list caches
      await this.invalidateListCaches();

      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create user: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async update(id: Id, userData: Partial<User>): Promise<User> {
    try {
      // Remove computed fields that shouldn't be updated
      const { createdAt, updatedAt, ...updateData } = userData;

      const updateResult = await this.repository.update(id, updateData);

      if (updateResult.affected === 0) {
        throw new Error(`User with ID ${id} not found`);
      }

      const updatedEntity = await this.repository.findOne({
        where: { id },
        select: [
          'id',
          'email',
          'name',
          'role',
          'status',
          'provider',
          'verifiedAt',
          'createdAt',
          'updatedAt',
        ],
      });

      if (!updatedEntity) {
        throw new Error(`User with ID ${id} not found after update`);
      }

      const user = UserMapper.toDomain(updatedEntity);

      // Update cache
      await this.cacheUser(user);

      // Invalidate list caches
      await this.invalidateListCaches();

      this.logger.log(`User updated successfully: ${id}`);
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update user ${id}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async delete(id: Id): Promise<void> {
    try {
      const deleteResult = await this.repository.delete(id);

      if (deleteResult.affected === 0) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Remove from cache
      await this.removeCacheForUser(id);

      // Invalidate list caches
      await this.invalidateListCaches();

      this.logger.log(`User deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to delete user ${id}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async exists(id: Id): Promise<boolean> {
    const cacheKey = `${this.cachePrefix}:exists:id:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Cache miss for user exists check: ${id}`);
        const count = await this.repository.count({ where: { id } });
        return count > 0;
      },
      { ttl: this.cacheTtl.userExists, prefix: this.cachePrefix },
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const cacheKey = `${this.cachePrefix}:exists:email:${email}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Cache miss for user email exists check: ${email}`);
        const count = await this.repository.count({ where: { email } });
        return count > 0;
      },
      { ttl: this.cacheTtl.userExists, prefix: this.cachePrefix },
    );
  }

  /**
   * Cache a user by ID and email
   */
  private async cacheUser(user: User): Promise<void> {
    try {
      const promises = [
        this.cacheService.set(`${this.cachePrefix}:id:${user.id}`, user, {
          ttl: this.cacheTtl.user,
        }),
        this.cacheService.set(`${this.cachePrefix}:email:${user.email}`, user, {
          ttl: this.cacheTtl.user,
        }),
        this.cacheService.set(
          `${this.cachePrefix}:exists:id:${user.id}`,
          true,
          { ttl: this.cacheTtl.userExists },
        ),
        this.cacheService.set(
          `${this.cachePrefix}:exists:email:${user.email}`,
          true,
          { ttl: this.cacheTtl.userExists },
        ),
      ];

      await Promise.all(promises);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to cache user ${user.id}: ${errorMessage}`);
    }
  }

  /**
   * Remove user from cache
   */
  private async removeCacheForUser(id: Id): Promise<void> {
    try {
      // First get the user to get the email for cache invalidation
      const userCacheKey = `${this.cachePrefix}:id:${id}`;
      const cachedUser = await this.cacheService.get<User>(userCacheKey);

      const promises = [
        this.cacheService.del(`${this.cachePrefix}:id:${id}`),
        this.cacheService.del(`${this.cachePrefix}:exists:id:${id}`),
      ];

      if (cachedUser?.email) {
        promises.push(
          this.cacheService.del(
            `${this.cachePrefix}:email:${cachedUser.email}`,
          ),
          this.cacheService.del(
            `${this.cachePrefix}:exists:email:${cachedUser.email}`,
          ),
        );
      }

      await Promise.all(promises);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to remove user cache ${id}: ${errorMessage}`);
    }
  }

  /**
   * Invalidate all list caches
   */
  private async invalidateListCaches(): Promise<void> {
    try {
      await this.cacheService.delPattern(`${this.cachePrefix}:list:*`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to invalidate list caches: ${errorMessage}`);
    }
  }
}
