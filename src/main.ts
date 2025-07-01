import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';

/**
 * Main application entry point
 * Creates the NestJS application with Fastify adapter and starts it
 */
const main = async (): Promise<void> => {
  try {
    // Create Fastify adapter with optimized settings
    const fastifyAdapter = new FastifyAdapter({
      logger: {
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
        redact: ['req.headers.authorization'],
      },
      disableRequestLogging: process.env.NODE_ENV === 'production',
      trustProxy: true,
      bodyLimit: 10485760, // 10MB
      keepAliveTimeout: 61000,
      requestIdLogLabel: 'reqId',
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true,
    });

    // Create NestJS application
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      fastifyAdapter,
      {
        bufferLogs: true,
        abortOnError: false,
        cors: false, // We'll handle CORS in bootstrap
      },
    );

    // Bootstrap the application
    await bootstrap(app);
  } catch (error) {
    console.error('❌ Failed to start the application:', error);
    process.exit(1);
  }
};

// Start the application
main().catch((error) => {
  console.error('❌ Unhandled error in main:', error);
  process.exit(1);
});
