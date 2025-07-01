import { User } from '@/domain/entities/user.entity';
import { UserEntity } from './user.entity';

export class UserMapper {
  /**
   * Map from TypeORM entity to domain entity
   */
  static toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      status: entity.status,
      provider: entity.provider,
      verifiedAt: entity.verifiedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Map from domain entity to TypeORM entity
   */
  static toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.name = domain.name;
    entity.role = domain.role;
    entity.status = domain.status;
    entity.provider = domain.provider;
    entity.verifiedAt = domain.verifiedAt ?? null;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Map array of TypeORM entities to domain entities
   */
  static toDomainList(entities: UserEntity[]): User[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Map from create data to TypeORM entity
   */
  static toCreateEntity(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<UserEntity> {
    return {
      email: data.email,
      name: data.name,
      role: data.role,
      status: data.status,
      provider: data.provider,
      verifiedAt: data.verifiedAt ?? null,
    };
  }
}
