import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { UserEntity } from '@/infrastructure/database/entities/users/user.entity';
import { TypeOrmUserRepository } from '@/infrastructure/database/repositories/users/typeorm-user.repository';

// Domain
import { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface';

// Application Use Cases
import {
  CreateUserUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from '@/application/use-cases/users';

// Presentation
import { UsersController } from '@/presentation/controllers/users/users.controller';

// Repository Token for Dependency Injection
export const USER_REPOSITORY_TOKEN = 'UserRepositoryInterface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    // Repository Implementation
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
    // Use Cases with Repository Injection
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: UserRepositoryInterface) =>
        new CreateUserUseCase(userRepository),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: FindUserByIdUseCase,
      useFactory: (userRepository: UserRepositoryInterface) =>
        new FindUserByIdUseCase(userRepository),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepository: UserRepositoryInterface) =>
        new UpdateUserUseCase(userRepository),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    CreateUserUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
  ],
})
export class UsersModule {}
