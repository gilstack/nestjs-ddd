import {
  ValidationPipe,
  UnprocessableEntityException,
  VersioningType,
  RequestMethod,
} from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

// Configuration types
import { AppConfig } from '@/infrastructure/config';

// Interceptors & Filters
import {
  ResponseInterceptor,
  PerformanceInterceptor,
} from '@/shared/interceptors';
import { GlobalExceptionFilter } from '@/shared/filters';

// Fastify plugins
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';

/**
 * Bootstrap the application with Fastify optimizations
 * @param app - The NestFastifyApplication instance
 */
export const bootstrap = async (app: NestFastifyApplication): Promise<void> => {
  // Get configuration service
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;

  // Reflector for dependency injection
  const reflector = app.get(Reflector);

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: appConfig.env === 'production',
  });

  // CORS configuration
  await app.register(cors, {
    origin: appConfig.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Compression for better performance
  await app.register(compression, {
    encodings: ['gzip', 'deflate'],
    global: true,
    threshold: 1024, // Only compress responses > 1KB
  });

  // Cookie support
  await app.register(cookie, {
    secret: appConfig.security.cookieSecret,
    parseOptions: {
      httpOnly: true,
      secure: appConfig.isProduction,
      sameSite: appConfig.isProduction ? 'strict' : 'lax',
    },
  });

  // Multipart support for file uploads
  await app.register(multipart, {
    attachFieldsToBody: 'keyValues',
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 10, // Max 10 files per request
      fields: 20, // Max 20 form fields
    },
  });

  // Global prefix - exclude health endpoints from API prefix
  app.setGlobalPrefix(appConfig.prefix, {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global interceptors (order matters)
  app.useGlobalInterceptors(
    new PerformanceInterceptor(configService),
    new ResponseInterceptor(),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
      disableErrorMessages: appConfig.env === 'production',
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
          message: 'Validation failed',
          errors: appConfig.env === 'production' ? undefined : errors,
        });
      },
    }),
  );

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  // Start the server
  await app.listen(appConfig.port, '0.0.0.0');

  // Enhanced startup logs
  const environment = appConfig.env;
  const isProduction = environment === 'production';

  console.log(`📋 Environment: ${environment.toUpperCase()}`);
  console.log(`🌐 Server: http://localhost:${appConfig.port}`);
  console.log(`🔒 Security: ${isProduction ? 'Production' : 'Development'}`);

  if (!isProduction) {
    console.log(`📊 Health: http://localhost:${appConfig.port}/health`);
    console.log(`📈 Docs: http://localhost:${appConfig.port}/docs`);
  }
};
