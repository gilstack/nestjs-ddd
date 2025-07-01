/**
 * JWT configuration types and interfaces
 * Provides strongly typed configuration for JWT authentication
 */

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface JwtConfigHelpers extends JwtConfig {
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}
