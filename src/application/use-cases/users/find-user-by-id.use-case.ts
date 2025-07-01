import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface';
import { User } from '@/domain/entities/user.entity';
import { Id } from '@/shared/types/base.types';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(id: Id): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
