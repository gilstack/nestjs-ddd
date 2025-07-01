import { IsString, IsNotEmpty } from 'class-validator';

/**
 * JWT environment variables validation class
 * Following the same pattern as the API project
 */
export class JwtEnvValidation {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN!: string;
}
