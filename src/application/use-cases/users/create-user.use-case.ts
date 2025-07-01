import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface';
import { User } from '@/domain/entities/user.entity';
import { CreateUserDto } from '@/application/dtos/users';
import { Role, Status, AuthProvider } from '@/shared/types/enums';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user with default values
    const userData = {
      email: createUserDto.email,
      name:
        createUserDto.name || this.extractNameFromEmail(createUserDto.email),
      role: createUserDto.role ?? Role.GUEST,
      status: createUserDto.status ?? Status.PENDING,
      provider: createUserDto.provider ?? AuthProvider.PASSPORT,
    };

    return await this.userRepository.create(userData);
  }

  private extractNameFromEmail(email: string): string {
    const username = email.split('@')[0];
    if (!username) {
      return 'Anonymous';
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
}
