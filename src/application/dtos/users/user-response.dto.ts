import { Exclude, Expose, Transform } from 'class-transformer';
import { Role, Status, AuthProvider } from '@/shared/types/enums';
import { Id } from '@/shared/types/base.types';

export class UserResponseDto {
  @Expose()
  id!: Id;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: Role;

  @Expose()
  status!: Status;

  @Expose()
  provider!: AuthProvider;

  @Expose()
  @Transform(({ value }) => value || null)
  verifiedAt!: Date | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
