import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { Role, Status, AuthProvider } from '@/shared/types/enums';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.GUEST;

  @IsOptional()
  @IsEnum(Status)
  status?: Status = Status.PENDING;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider = AuthProvider.PASSPORT;
}
