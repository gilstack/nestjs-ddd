import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface';
import { User } from '@/domain/entities/user.entity';
import { UpdateUserDto } from '@/application/dtos/users';
import { Id } from '@/shared/types/base.types';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(id: Id, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.existsByEmail(
        updateUserDto.email,
      );
      if (emailExists) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    // Update user
    return await this.userRepository.update(id, updateUserDto);
  }
}
