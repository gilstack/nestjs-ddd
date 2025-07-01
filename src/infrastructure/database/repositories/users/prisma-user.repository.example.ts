// EXEMPLO: Como implementar o UserRepository com Prisma
// Para usar este exemplo, você precisaria instalar o Prisma e configurar

/*
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Seria instalado separadamente

import { User } from '@/domain/entities/user.entity';
import { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface';
import {
  Id,
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/base.types';

@Injectable()
export class PrismaUserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: Id): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    return user ? this.mapToDomain(user) : null;
  }

  async findAll(pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};
    
    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      data: users.map(this.mapToDomain),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        provider: userData.provider,
        verifiedAt: userData.verifiedAt,
      },
    });

    return this.mapToDomain(user);
  }

  async update(id: Id, userData: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    return this.mapToDomain(user);
  }

  async delete(id: Id): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async exists(id: Id): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  // Método helper para mapear do Prisma para o domínio
  private mapToDomain(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      status: prismaUser.status,
      provider: prismaUser.provider,
      verifiedAt: prismaUser.verifiedAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}

// Para usar este repository, você só precisaria alterar o módulo:
// 
// @Module({
//   providers: [
//     {
//       provide: USER_REPOSITORY_TOKEN,
//       useClass: PrismaUserRepository, // ← Só trocar aqui!
//     },
//     // ... resto igual
//   ],
// })

*/

export const PRISMA_EXAMPLE = `
Para usar Prisma ao invés do TypeORM:

1. Instale o Prisma:
   pnpm add prisma @prisma/client

2. Configure o schema do Prisma

3. Implemente PrismaUserRepository (código acima)

4. No UsersModule, troque:
   useClass: TypeOrmUserRepository
   para:
   useClass: PrismaUserRepository

5. Pronto! Todo o resto da aplicação continua funcionando igual.
`;
