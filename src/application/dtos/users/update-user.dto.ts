import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

import { Role, Status, AuthProvider } from '@/shared/types/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;

  @IsOptional()
  @IsDateString()
  verifiedAt?: Date;
}
