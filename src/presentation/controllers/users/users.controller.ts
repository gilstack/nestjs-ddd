import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

// Use Cases
import {
  CreateUserUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from '@/application/use-cases/users';

// DTOs
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@/application/dtos/users';

// Domain Types
import { User } from '@/domain/entities/user.entity';

// Shared Types
import { Id, SuccessResponse } from '@/shared/types/base.types';
import { UuidValidationPipe } from '@/shared/pipes';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return {
      success: true,
      data: this.transformToResponse(user),
      message: 'User created successfully',
    };
  }

  @Get(':id')
  async findById(
    @Param('id', UuidValidationPipe) id: Id,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.findUserByIdUseCase.execute(id);
    return {
      success: true,
      data: this.transformToResponse(user),
    };
  }

  @Put(':id')
  async update(
    @Param('id', UuidValidationPipe) id: Id,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    return {
      success: true,
      data: this.transformToResponse(user),
      message: 'User updated successfully',
    };
  }

  /**
   * Transform domain entity to response DTO
   * Centralized transformation logic to eliminate redundancy
   */
  private transformToResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
